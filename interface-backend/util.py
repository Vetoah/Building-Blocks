import pandas as pd
import time
import json
import requests
import time
import asyncio
import websockets
import numpy as np
import os.path
import httpx 
from django.urls import resolve
from django.apps import AppConfig
from django.http import Http404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync



trade_history = pd.DataFrame(columns=['timestamp', 'side', 'price', 'quantity'])
five_min = pd.DataFrame()

# gets live trades, passes it to ticker creation function, which is then POST'd (or PUT'd if object already exists) to a database.
# After each instance is saved, a message is sent over the websocket connection to a client (which is my React program) which contains
# the new or updated ticker
async def getTrades():
  global trade_history
  uri  = "wss://phemex.com/ws"
  
  async with websockets.connect(uri) as websocket:
      await websocket.send(json.dumps({
          "id": 1234,
          "method": "trade.subscribe",
          "params": [
              "BTCUSD",
          ]
      }))

      count = 0
      while (count < 100):
        msg = await websocket.recv()
        data = json.loads(msg)
        if 'trades' in data:
          trades = pd.DataFrame(data['trades'], columns=['timestamp', 'side', 'price', 'quantity'])
          trades['quantity'] = trades['quantity'].astype(float)
          trades['price'] = trades['price'].astype(float) / 10000
          trades['timestamp'] = pd.to_datetime(trades['timestamp'], unit='ns')
          trade_history = pd.concat([trade_history, trades])
          await five_min_ticker(count)
          
          count += 1

async def five_min_ticker(count):
  global five_min
  global trade_history

  cutoff = 0

  if(len(trade_history) == 1000):
    five_min = pd.DataFrame(trade_history.groupby(pd.Grouper(key='timestamp', freq='5min'))['price'].agg([('opening', 'first'),('high', 'max'),('low', 'min'), ('closing', 'last'), ('volume', 'sum')]))
    five_min.reset_index(drop=False, inplace=True)

  else:
    last = five_min['timestamp'].iloc[-1]
    current_period_data = pd.DataFrame(trade_history[trade_history['timestamp'] >= last]).sort_values(by='timestamp')

    current_candle = pd.DataFrame(current_period_data.groupby(pd.Grouper(key='timestamp', freq='5min'))['price'].agg([('opening', 'first'),('high', 'max'),('low', 'min'), ('closing', 'last'), ('volume', 'sum')]))
    current_candle.reset_index(drop=False, inplace=True)

    five_min = five_min[: -1]
    five_min = pd.concat([five_min, current_candle])

  five_min['json'] = five_min.to_json(orient='records', lines=True).splitlines()

  if (count >= 1):
    cutoff = -1

  for idx, data in enumerate(five_min['json'][cutoff:]):
    async with httpx.AsyncClient() as client:
      response = await client.post(f'http://127.0.0.1:8000/api/ticker5/', json=json.loads(data))
      if(response.status_code >= 300):
        response = await client.put(f'http://127.0.0.1:8000/api/ticker5/{response.status_code - 300}/', json=json.loads(data))

async def getKline(msg):
  trades = pd.DataFrame(msg['kline'], columns=['timestamp', 'interval', 'last_close', 'opening', 'high', 'low', 'closing', 'volume', 'turnover'])
  trades['timestamp'] = pd.to_datetime(trades['timestamp'], unit='s')
  trades['last_close'] = trades['last_close'].astype(float) / 10000
  trades['opening'] = trades['opening'].astype(float) / 10000
  trades['high'] = trades['high'].astype(float) / 10000
  trades['low'] = trades['low'].astype(float) / 10000
  trades['closing'] = trades['closing'].astype(float) / 10000

  trades = trades.drop(['interval', 'turnover','last_close'], axis=1)
  trades = trades.sort_values(by='timestamp')

  trades['json'] = trades.to_json(orient='records', lines=True).splitlines()

  for idx, data in enumerate(trades['json']):
    async with httpx.AsyncClient() as client:
      response = await client.post(f'http://127.0.0.1:8000/api/klinetrades', json=json.loads(data))

async def getOrderbook (msg):
  if 'book' in msg:
    asks = pd.DataFrame(msg['book']['asks'], columns=['price', 'quantity'])
    asks['price'] = asks['price'].astype(float) / 10000
    asks['side'] = 'asks'
    asks['json'] = asks.to_json(orient='records', lines=True).splitlines()

    bids = pd.DataFrame(msg['book']['bids'], columns=['price', 'quantity'])
    bids['price'] = bids['price'].astype(float) / 10000
    bids['side'] = 'bids'
    bids['json'] = bids.to_json(orient='records', lines=True).splitlines()

    for idx, data in enumerate(asks['json']):
      async with httpx.AsyncClient() as orderbook_client:
        if data:
          response = await orderbook_client.post(f'http://127.0.0.1:8000/api/orderbook', json=json.loads(data))
          
    for idx, data in enumerate(bids['json']):
      async with httpx.AsyncClient() as orderbook_client:
        if data:
          response = await orderbook_client.post(f'http://127.0.0.1:8000/api/orderbook', json=json.loads(data))

async def subscriptions(websocket, symbol, period):
  count = 0
  while True:
    await websocket.send(json.dumps({
        "id": 1234,
        "method": "kline.subscribe",
        "params": [
            symbol,
            period
        ]
    }))

    msg = await websocket.recv()
    data = json.loads(msg)
    if 'kline' in data:
      kline = asyncio.create_task(getKline(data))
      await kline
      break

  while True:
    await websocket.send(json.dumps({
        "id": 1234,
        "method": "orderbook.subscribe",
        "params": [
            symbol
        ]
    }))

    msg = await websocket.recv()
    data = json.loads(msg)
    if 'book' in data:
      orderbook = asyncio.create_task(getOrderbook(data))
      await orderbook
      break
  
  while count < 100:
    msg = await websocket.recv()
    data = json.loads(msg)
    if 'book' in data:
      orderbook = asyncio.create_task(getOrderbook(data))
      await orderbook
    if 'kline' in data:
      kline = asyncio.create_task(getKline(data))
      await kline
      print(count)
      count += 1

async def main():
  uri  = "wss://phemex.com/ws"
  async with websockets.connect(uri) as websocket:
    subscribe = asyncio.create_task(subscriptions(websocket, 'BTCUSD', 300))
    await subscribe
  return

if __name__=="__main__":
  asyncio.run(main())

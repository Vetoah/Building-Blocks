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
from django.http import Http404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from flask import Flask, request, jsonify, Response
app = Flask(__name__)

trade_history = pd.DataFrame(columns=['timestamp', 'side', 'price', 'quantity'])
five_min = pd.DataFrame()

async def sendData():
  channel_layer = get_channel_layer()
  group_name = "lobby"
  await (channel_layer.group_send)(
    group_name,
    {
      'type': 'ping_message',
      'message': "SENDIN MESSAGE!!!!!!!!!!"
    }
  )

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
      while (count < 50):
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
  local_ws = "ws://localhost:8000/ws/socket-server/"

  # async with websockets.connect(local_ws) as ping:
  if(len(trade_history) == 1000):
    five_min = pd.DataFrame(trade_history.groupby(pd.Grouper(key='timestamp', freq='5min'))['price'].agg([('opening', 'first'),('high', 'max'),('low', 'min'), ('closing', 'last'), ('volume', 'sum')]))
    five_min.reset_index(drop=False, inplace=True)

  else:
    last = five_min['timestamp'].iloc[-1]
    current_period_data = pd.DataFrame(trade_history[trade_history['timestamp'] >= last]).sort_values(by='timestamp')

    current_candle = pd.DataFrame(current_period_data.groupby(pd.Grouper(key='timestamp', freq='5min'))['price'].agg([('opening', 'first'),('high', 'max'),('low', 'min'), ('closing', 'last'), ('volume', 'sum')]))
    current_candle.reset_index(drop=False, inplace=True)
    # print(current_ticker)

    five_min = five_min[: -1]
    five_min = pd.concat([five_min, current_candle])

  # five_min['timestamp'] = five_min['timestamp'].astype(str)
  # await sendData()
  five_min['json'] = five_min.to_json(orient='records', lines=True).splitlines()

  if (count >= 1):
    cutoff = -1
    print('--------------------------------------------------')

  for idx, data in enumerate(five_min['json'][cutoff:]):
    async with httpx.AsyncClient() as client:
      response = await client.post(f'http://127.0.0.1:8000/api/ticker5/', json=json.loads(data))
      if(response.status_code >= 300):
        response = await client.put(f'http://127.0.0.1:8000/api/ticker5/{response.status_code - 300}/', json=json.loads(data))
  # ping.send(json.dumps ({
  #   'type': 'ping',
  #   'message' : 'hola motha trucka'
  # }))
async def main():
  return
  # async with websockets.connect("ws://localhost:8000/wserver")) as ping:
  #   ping.onmessage = (data) 
  # await retrieval

if __name__=="__main__":
  # queue = asyncio.Queue()
  # asyncio.run(getTrades(queue))
  # app.run(debug=True)
  asyncio.run(main())
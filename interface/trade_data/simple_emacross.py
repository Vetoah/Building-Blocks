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

from flask import Flask, request, jsonify, Response
app = Flask(__name__)

trade_history = pd.DataFrame(columns=['timestamp', 'side', 'price', 'quantity'])
five_min = pd.DataFrame()

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
      while (count < 3):
        msg = await websocket.recv()
        data = json.loads(msg)
        if 'trades' in data:
          trades = pd.DataFrame(data['trades'], columns=['timestamp', 'side', 'price', 'quantity'])
          trades['quantity'] = trades['quantity'].astype(float)
          trades['price'] = trades['price'].astype(float) / 10000
          trades['timestamp'] = pd.to_datetime(trades['timestamp'], unit='ns')
          # json_string = trades.to_json(orient='records')
          # if (count > 2):
          #   async with httpx.AsyncClient() as client:
          #     response = await client.post('http://127.0.0.1:8000/addTrade', json=json.loads(json_string))
                
          trade_history = pd.concat([trade_history, trades])
          await five_min_ticker()
          # print(trade_history)
          
          count += 1

async def five_min_ticker():
  global five_min
  global trade_history

  if(len(trade_history) == 1000):
    five_min = pd.DataFrame(trade_history.groupby(pd.Grouper(key='timestamp', freq='5min'))['price'].agg([('opening', 'first'), ('closing', 'last'),('high', 'max'),('low', 'min'), ('volume', 'sum')]))
    five_min.reset_index(drop=False, inplace=True)

  else:
    last = five_min['timestamp'].iloc[-1]
    current_period_data = pd.DataFrame(trade_history[trade_history['timestamp'] >= last]).sort_values(by='timestamp')

    current_ticker = pd.DataFrame(current_period_data.groupby(pd.Grouper(key='timestamp', freq='5min'))['price'].agg([('opening', 'first'), ('closing', 'last'),('high', 'max'),('low', 'min'), ('volume', 'sum')]))
    current_ticker.reset_index(drop=False, inplace=True)

    five_min.drop(five_min.tail(1).index, inplace=True)
    five_min = pd.concat([five_min, current_ticker], axis=0).reset_index(drop=True)

  five_min['timestamp'] = five_min['timestamp'].astype(str)
  five_min['json'] = five_min.to_json(orient='records', lines=True).splitlines()
  # json_data = five_min.to_json(orient='records')
  for idx, data in enumerate(five_min['json']):
    # print(json.loads(data))
    async with httpx.AsyncClient() as client:
      response = await client.put(f'http://127.0.0.1:8000/api/ticker5/{idx}/', json=json.loads(data))
  # print(five_min['json'])

async def main():
  TRADING_PERIOD = 3 #10 * 60 / 5

  retrieval = asyncio.create_task(getTrades())
  await retrieval

if __name__=="__main__":
  # queue = asyncio.Queue()
  # asyncio.run(getTrades(queue))
  # app.run(debug=True)
  asyncio.run(main())
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
      while(count < 3):
        msg = await websocket.recv()
        data = json.loads(msg)
        if 'trades' in data:
              trades = pd.DataFrame(data['trades'], columns=['timestamp', 'side', 'price', 'quantity'])
              trades['quantity'] = trades['quantity'].astype(float)
              trades['price'] = trades['price'].astype(float) / 10000
              trades['timestamp'] = (pd.to_datetime(trades['timestamp'], unit='ns')).astype(str)
              json_string = trades.to_json(orient='records')
              print('onward')
              async with httpx.AsyncClient() as client:
                response = await client.post('http://127.0.0.1:8000/addTrade', json=json.loads(json_string))
                    
              # trade_history = pd.concat([trade_history, trades], ignore_index=True)
              

        count += 1
      # json_string = trade_history.to_json(orient='records')
      # print(json_string)
      # return json_string;  
  
  


# @app.route("/")
# def home():
#   return Response(asyncio.gather(getTrades()),  content_type='text/event-stream') 


# from asgiref.wsgi import WsgiToAsgi

# asgi_app = WsgiToAsgi(app)

if __name__=="__main__":
  asyncio.run(getTrades())
  # app.run(debug=True)
    # main()
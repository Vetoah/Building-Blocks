import pandas as pd
import yfinance as yf
import hmac
import hashlib
import time
import json
import requests
import time
import asyncio
from arch import arch_model
import websockets
from arch.__future__ import reindexing
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import linregress
import os.path
from statsmodels.tsa.stattools import adfuller

# This function fills in 'results.csv' with calculated data that comes from hourly market data.
# The numpy least squared function does not output required constants to forecast the RV for the next day.
# The csv is created and read by Excel workbook, data from the workbook is read after calculations are done.
# The link from the Excel workbook may not automatically update, so I recommend refreshing it to get the latest data from result.csv

def forecast():
  RESOLUTION = 3600 # 1 hour
  COIN = "BTC"
  now = int(time.time())

  # number of klines should be less than 1000 according to phemex API github
  first = f"https://api.phemex.com/exchange/public/md/kline?symbol={COIN}USD&to={now}&from={now - (RESOLUTION * 999)}&resolution={RESOLUTION}"
  first_response = requests.get(first)

  second = f"https://api.phemex.com/exchange/public/md/kline?symbol={COIN}USD&to={now - (RESOLUTION * 999)}&from={now - ((RESOLUTION * 999) * 2)}&resolution={RESOLUTION}"
  second_response = requests.get(second)

  third = f"https://api.phemex.com/exchange/public/md/kline?symbol={COIN}USD&to={now - ((RESOLUTION * 999) * 2)}&from={now - ((RESOLUTION * 999) * 3)}&resolution={RESOLUTION}"
  third_response = requests.get(third)

  fourth = f"https://api.phemex.com/exchange/public/md/kline?symbol={COIN}USD&to={now - ((RESOLUTION * 999) * 3)}&from={now - ((RESOLUTION * 999) * 4)}&resolution={RESOLUTION}"
  fourth_response = requests.get(fourth)

  if first_response.status_code == 200 & second_response.status_code == 200:
    if second_response.status_code == 200:
      if third_response.status_code == 200:
        if fourth_response.status_code == 200:
          data = first_response.json()
          data2 = second_response.json()
          data3 = third_response.json()
          data4 = fourth_response.json()

          load_json = str(data4['data']['rows'])[:-1] + "," + str(data3['data']['rows'])[1:-1] + "," + str(data2['data']['rows'])[1:-1] + "," + str(data['data']['rows'])[1:]
          json_data = json.loads(load_json)
          
          # Scraping data from the hourly and seperating them by the day
          intraday_df = pd.DataFrame(json_data , columns=['timestamp', 'interval', 'last_close','open','high','low','close','volume','turnover'])
          intraday_df['last_close']=intraday_df['last_close']/10000
          intraday_df['close']=intraday_df['close']/10000
          intraday_df = intraday_df.drop(columns=['open', 'high','low', 'interval','volume','turnover'])  
          intraday_df.insert(3, 'return_percentage',(intraday_df["close"] / intraday_df['last_close']) * 100 - 100)
          intraday_df.insert(4, 'return^2',(intraday_df["return_percentage"]**2))
          intraday_df.insert(5, 'return^4',(intraday_df["return_percentage"]**4))
          intraday_df.insert(6, 'day', pd.to_datetime(intraday_df['timestamp'], unit="s").dt.date)
          adf_result1 = adfuller(intraday_df['last_close'])
          days_df = pd.DataFrame(intraday_df.day.unique(), columns=['days'])
          
          intraday_df.to_csv('intraday.csv', index=False)
          for x in range(len(days_df.days)):
            # Realized variance is the volitility of the price action over a period of time
            rv_total = intraday_df[intraday_df['day'] == days_df['days'][x]]['return^2'].sum()
            days_df.loc[x, 'realized_variance'] = rv_total
            # Realized quarticity is the measure of the fourth moment of the distribution of the price action over a period of time
            rq_total = (24/3)*(intraday_df[intraday_df['day'] == days_df['days'][x]]['return^4'].sum())
            days_df.loc[x, 'realized_quarticity'] = rq_total

            if(x > 0):
              days_df.loc[x, 'DailyRV'] = days_df['realized_variance'][x-1]
              days_df['SQRT(RQ(d))*RV(d)'] = (np.sqrt((days_df.realized_quarticity).shift(1)) * days_df.DailyRV)       
            if(x > 6):
              days_df['WeeklyRV'] = days_df['realized_variance'].rolling(window=7).mean()
              days_df['SQRT(RQ(w))*RV(w)'] = np.sqrt(days_df.realized_quarticity.rolling(window=7).sum( ))  * days_df.realized_variance.rolling(window=7).mean()
            if(x > 30):
              days_df['MonthlyRV'] = days_df['realized_variance'].rolling(window=30).mean()
              days_df['SQRT(RQ(m))*RV(m)'] = np.sqrt(days_df.realized_quarticity.rolling(window=30).sum() )  * days_df.realized_variance.rolling(window=30).mean()

      days_df = days_df.reindex(columns=['days', 'realized_variance', 'realized_quarticity','DailyRV','WeeklyRV','MonthlyRV','SQRT(RQ(d))*RV(d)','SQRT(RQ(w))*RV(w)','SQRT(RQ(m))*RV(m)'])

      
      filename = 'result_data.csv'
      # In the Excel Workbook, formula ranges must be dynamic, otherwise, the values will never change because the latest row will not be included.
      if os.path.isfile(filename):
        old_data = pd.read_csv(filename)
        new_data = days_df[days_df.isin(old_data)].dropna()
        # print(new_data)
        days_df.to_csv('result_data.csv', index=False)
      else:
        days_df.to_csv('result_data.csv', index=False)
      
      dfs = pd.read_excel('CalculationForHARQ.xlsx', sheet_name="Calculation")
      print("Volatility forecast: %.2f" % dfs['Predicted Volitility'][0],"%")
  else:
      print('Request failed with status code:', response.status_code)


async def volume_delta(uri):
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({
            "id": 1234,
            "method": "trade_p.subscribe",
            "params": [
                "BTCUSDT",
            ]
        }))

        msg = await websocket.recv()
        msg = await websocket.recv()
        data = json.loads(msg)

        if 'trades_p' in data:
            trades = pd.DataFrame(data['trades_p'], columns=['timestamp', 'side', 'price', 'quantity'])
            trades['quantity'] = trades['quantity'].astype(float)
            trades['price'] = trades['price'].astype(float)
            trades['timestamp'] = pd.to_datetime(trades['timestamp'], unit='ns')

            trades['buy_volume'] = np.where(trades['side'] == 'Buy', trades['quantity'], 0)
            trades['sell_volume'] = np.where(trades['side'] == 'Sell', trades['quantity'], 0)
            trades['delta_volume'] = trades['buy_volume'].cumsum() - trades['sell_volume'].cumsum()

            fig1, ax1 = plt.subplots()
            ax1.plot(trades['timestamp'], trades['delta_volume'])
            ax1.set_xlabel('Time')
            ax1.set_ylabel('Delta of Volume')
            ax1.set_title('Order Flow Cum. Volume Delta Chart')

            last_price = trades['price'].iloc[0]
            ax1.axvline(trades['timestamp'].iloc[0], color='orange', linestyle='--')

            plt.show()


async def get_levels(uri):
  orderbook = {'asks': pd.DataFrame(columns=['price', 'quantity']),
              'bids': pd.DataFrame(columns=['price', 'quantity'])}

  depth = 150
  support_threshold = 10
  resistance_threshold = 10
  support_levels = []
  resistance_levels = []

  async with websockets.connect(uri) as websocket:
      await websocket.send(json.dumps({
          "id": 1234,
          "method": "orderbook_p.subscribe",
          "params": [
              "BTCUSDT",
              True
          ]
      }))

      msg = await websocket.recv()
      msg = await websocket.recv()
      data = json.loads(msg)

      if 'orderbook_p' in data:
          book_data = data['orderbook_p']
          asks = pd.DataFrame(book_data['asks'], columns=['price', 'quantity'])
          bids = pd.DataFrame(book_data['bids'], columns=['price', 'quantity'])
          asks['price'] = asks['price'].astype(float)
          bids['price'] = bids['price'].astype(float)
          asks['quantity'] = asks['quantity'].astype(float)
          bids['quantity'] = bids['quantity'].astype(float)
          orderbook = {'asks': asks, 'bids': bids}

          bids = orderbook['bids'].groupby('price')['quantity'].sum()
          asks = orderbook['asks'].groupby('price')['quantity'].sum()

          buy_depth = bids.tail(depth)
          sell_depth = asks.head(depth)

          market_depth = pd.concat([buy_depth, sell_depth], axis=1, keys=['buy', 'sell'])
          market_depth.fillna(0, inplace=True)

          support_levels = market_depth[market_depth['buy'] >= support_threshold].index.tolist()

          resistance_levels = market_depth[market_depth['sell'] >= resistance_threshold].index.tolist()

          fig, ax = plt.subplots()
          market_depth.plot(kind='bar', stacked=True, ax=ax)
          ax.set_xlabel('Price')
          ax.set_ylabel('Market Depth')
          ax.set_title('Market Depth Chart')

          for support_level in support_levels:
            for i in range(len(buy_depth)):
              if(buy_depth.index[i] == support_level):
                ax.axvline(x=i, color='green', linestyle='--')

          for resistance_level in resistance_levels:
            for i in range(len(sell_depth)):
              if(sell_depth.index[i] == resistance_level):
                ax.axvline(x=i+depth, color='red', linestyle='--')

          plt.show()
          end_time = time.perf_counter()
  return support_levels, resistance_levels


def price_correlation():
  RESOLUTION = 60 
  PRICE_SCALE = 10000
  COIN1 = "BTC"
  COIN2 = "SOL"

  now = int(time.time())

  first = f"https://api.phemex.com/exchange/public/md/kline?symbol={COIN1}USD&to={now}&from={now - (RESOLUTION * 999)}&resolution={RESOLUTION}"
  first_response = requests.get(first)

  second = f"https://api.phemex.com/exchange/public/md/kline?symbol={COIN2}USD&to={now}&from={now - (RESOLUTION * 999)}&resolution={RESOLUTION}"
  second_response = requests.get(second)

  if first_response.status_code == 200 & second_response.status_code == 200:
    getFirst = first_response.json()
    getSecond = second_response.json()

    first_data = json.loads(str(getFirst['data']['rows']))
    second_data = json.loads(str(getSecond['data']['rows']))

    First_df = pd.DataFrame(first_data , columns=['timestamp', 'interval', 'last_close','open','high','low','close','volume','turnover'])
    Second_df = pd.DataFrame(second_data , columns=['timestamp', 'interval', 'last_close','open','high','low','close','volume','turnover'])

    First_df['last_close'] = First_df['last_close'] / PRICE_SCALE
    Second_df['last_close'] = Second_df['last_close'] / PRICE_SCALE

    correlation = First_df['last_close'].corr(Second_df['last_close'])
    return(correlation)


def get_rsi(prices, n = 14): 
    deltas = np.diff(prices)
    seed = deltas[:n + 1]
    up = seed[seed >= 0].sum() / n
    down = -seed[seed < 0].sum() / n
    rs = up / down
    rsi_values = np.zeros_like(prices)
    rsi_values[:n] = 100. - 100. / (1. + rs)

    for i in range(n, len(prices)):
        delta = deltas[i - 1]  # cause the diff is 1 shorter
        if delta > 0:
            upval = delta
            downval = 0.
        else:
            upval = 0.
            downval = -delta

        up = (up * (n - 1) + upval) / n
        down = (down * (n - 1) + downval) / n

        rs = up / down
        rsi_values[i] = 100. - 100. / (1. + rs)

    return pd.Series(rsi_values, index=prices.index)

def main():
  forecast()
  #asyncio.run(volume_delta("wss://phemex.com/ws"))
  #asyncio.run(get_levels("wss://phemex.com/ws"))
  # price_correlation()

if __name__=="__main__":
  main()
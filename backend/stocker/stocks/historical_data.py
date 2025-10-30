import requests
import datetime
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stocker.settings')
django.setup()

from models import IntradayStock, EODStock
from serializers import IntradayStockSerializer, EODStockSerializer



API_KEY = os.getenv("alpaca_api_key")
API_SECRET = os.getenv("alpaca_api_secret")


params = {
    "timeframe": "1Day",
    "start": "2022-01-01",
    "end": "2025-10-28"
}
headers = {
    "Apca-Api-Key-Id": API_KEY,
    "Apca-Api-Secret-Key": API_SECRET
}

STOCK_SYMBOLS = [
    "NVDA", "AAPL", "MSFT", "GOOG", "AMZN", "META", "AVGO", "TSLA", 
    "BRK.B", "WMT", "LLY", "JPM", "V", "NFLX", "MA", "XOM", "UNH",
    "JNJ", "COST", "ORCL", "HD", "ABBV", "BAC", "PG", "CRM", "CVX",
    "AMD", "KO", "CSCO", "QCOM", "MRK", "TMO", "PEP", "TMUS", "DIS",
    "ADBE", "GE", "CAT", "WFC", "INTU", "AXP", "GS", "BLK", "MU",
    "ABT", "MCD", "MS", "CMCSA", "TXN", "NOW"
]

'''
url = f"https://data.alpaca.markets/v2/stocks/AAPL/bars"
response = requests.get(url, headers=headers, params=params)
json_response = response.json()
'''

# Dont forget to cut off the decimals off of the time in epoch ms due to the interger model field

for symbol in STOCK_SYMBOLS:
    url = f"https://data.alpaca.markets/v2/stocks/{symbol}/bars"
    response = requests.get(url, headers=headers, params=params)
    json_response = response.json()
    for candle in json_response["bars"]:
        candle_time = candle["t"]
        time = datetime.datetime.strptime(candle_time, '%Y-%m-%dT%H:%M:%SZ')
        stocks = {}
        stocks[symbol] = {"symbol": symbol,
                    "close": response["c"],
                    "high": response["h"],
                    "low": response["l"],
                    "open": response["o"],
                    "time_epoch_ms": (time.timestamp()) * 1000}
        
        print(f"{symbol},{candle["c"]},{candle["h"]},{candle["l"]},{candle["o"]},{(time.timestamp()) * 1000}\n")

import requests
import datetime
import os

API_KEY = os.getenv("alpaca_api_key")
API_SECRET = os.getenv("alpaca_api_secret")
SYMBOL = "AAPL"


params = {
    "timeframe": "1Day",
    "start": "2020-01-01",
    "end": "2025-10-23"
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

    with open(f"market_data/{symbol}.csv", "w") as f:
        f.write("symbol,close,high,low,open,time_ms\n")
        print(json_response)
        for candle in json_response["bars"]:
            candle_time = candle["t"]
            time = datetime.datetime.strptime(candle_time, '%Y-%m-%dT%H:%M:%SZ')
            f.write(f"{symbol},{candle["c"]},{candle["h"]},{candle["l"]},{candle["o"]},{(time.timestamp()) * 1000}\n")

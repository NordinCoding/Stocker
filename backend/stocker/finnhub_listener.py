import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stocker.settings')
django.setup()

import asyncio
import json
import time
import websockets
from datetime import datetime
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from stocks.modules.helpers import format_trade_time

FINNHUB_TOKEN = "d3o9pjhr01qmj830dq40d3o9pjhr01qmj830dq4g"

# Top 50 US based stocks by market cap
STOCK_SYMBOLS = [
    "NVDA", "AAPL", "MSFT", "GOOG", "AMZN", "META", "AVGO", "TSLA", 
    "BRK-B", "WMT", "LLY", "JPM", "V", "NFLX", "MA", "XOM", "UNH",
    "JNJ", "COST", "ORCL", "HD", "ABBV", "BAC", "PG", "CRM", "CVX",
    "AMD", "KO", "CSCO", "QCOM", "MRK", "TMO", "PEP", "TMUS", "DIS",
    "ADBE", "GE", "CAT", "WFC", "INTU", "AXP", "GS", "BLK", "MU",
    "ABT", "MCD", "MS", "CMCSA", "TXN", "NOW"
]

# List of cryptos because the market is 24/7
CRYPTO_SYMBOLS = ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:ADAUSDT"]

SYMBOLS = STOCK_SYMBOLS

'''
Websocket listener connected to Finnhub's API for realtime US market data
'''

async def listen_to_finnhub():
    url = f"wss://ws.finnhub.io?token={FINNHUB_TOKEN}"
    
    latest_prices = {}
    last_broadcast = time.time()
    
    async with websockets.connect(url) as ws:
        # subscribe to all symbols
        for symbol in SYMBOLS:
            await ws.send(json.dumps({"type": "subscribe", "symbol": symbol}))
            print(f"Subscribed to {symbol}")

        layer = get_channel_layer()

        # Listening for messages and creating batches of responses
        async for message in ws:
            data = json.loads(message)
            if data.get("type") == "trade":
                for trade in data["data"]:
                    symbol = trade["s"]
                    price = trade["p"]
                    trade_time = format_trade_time(trade["t"])
                    latest_prices[symbol] = (price, trade_time)
                
                # throlling sending to consumer group 1 second at a time to not overwhelm frontend
                now = time.time()
                if now - last_broadcast >= 1.0 and latest_prices:
                    print(latest_prices)
                    for symbol, (price, trade_time) in latest_prices.items():
                        payload = {
                                "type": "stock_update",
                                "symbol": symbol,
                                "price": price,
                                "time": trade_time
                                }
                    
                        await layer.group_send("stocks", payload)
                        
                    latest_prices.clear()
                    last_broadcast = now
                    
if __name__ == "__main__":
    asyncio.run(listen_to_finnhub())
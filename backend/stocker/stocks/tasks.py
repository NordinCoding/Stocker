from celery import shared_task
from stocks.models import EODStock, IntradayStock
from stocks.serializers import IntradayStockSerializer, EODStockSerializer
from stocks.modules.helpers import is_market_open
import finnhub
from datetime import datetime
from time import strftime, localtime, sleep
from dotenv import load_dotenv
import os



load_dotenv(override=True)

'''
Celery task that request the Finnhub API for the qoute data of all 50 symbols
'''

@shared_task(queue='intraday')
def fetch_stocks_intraday():
    
    if is_market_open():
        finnhub_client = finnhub.Client(api_key=os.getenv("finnhub_api_key"))
        symbols = [
        "NVDA", "AAPL", "MSFT", "GOOG", "AMZN", "META", "AVGO", "TSLA", 
        "BRK.B", "WMT", "LLY", "JPM", "V", "NFLX", "MA", "XOM", "UNH",
        "JNJ", "COST", "ORCL", "HD", "ABBV", "BAC", "PG", "CRM", "CVX",
        "AMD", "KO", "CSCO", "QCOM", "MRK", "TMO", "PEP", "TMUS", "DIS",
        "ADBE", "GE", "CAT", "WFC", "INTU", "AXP", "GS", "BLK", "MU",
        "ABT", "MCD", "MS", "CMCSA", "TXN", "NOW"
        ]
        
        
        for symbol in symbols:
            try:
                response = finnhub_client.quote(symbol)
            except Exception as e:
                print(f"API request Error: {e}")
            
            stocks = {}
            stocks[symbol] = {"symbol": symbol,
                    "close": response["c"],
                    "high": response["h"],
                    "low": response["l"],
                    "change": response["d"],
                    "open": response["o"],
                    "time_epoch_ms": response["t"]}
            print(stocks)
            
            serializer = IntradayStockSerializer(data=stocks[symbol])
            if serializer.is_valid():
                serializer.save()
            sleep(0.2)
    else:
        print("Market is closed, skipping over API request")
        
'''     
Celery task that gets the EOD close data of each symbol 
after market close and stores it in the EODStocks table
'''

@shared_task(queue='EOD')
def fetch_stocks_eod():
    finnhub_client = finnhub.Client(api_key=os.getenv("finnhub_api_key"))
    symbols = [
    "NVDA", "AAPL", "MSFT", "GOOG", "AMZN", "META", "AVGO", "TSLA", 
    "BRK.B", "WMT", "LLY", "JPM", "V", "NFLX", "MA", "XOM", "UNH",
    "JNJ", "COST", "ORCL", "HD", "ABBV", "BAC", "PG", "CRM", "CVX",
    "AMD", "KO", "CSCO", "QCOM", "MRK", "TMO", "PEP", "TMUS", "DIS",
    "ADBE", "GE", "CAT", "WFC", "INTU", "AXP", "GS", "BLK", "MU",
    "ABT", "MCD", "MS", "CMCSA", "TXN", "NOW"
    ]
    
    for symbol in symbols:
        try:
            response = finnhub_client.quote(symbol)
        except Exception as e:
            print(f"API request Error: {e}")
        
        stocks = {}
        stocks[symbol] = {"symbol": symbol,
                "close": response["c"],
                "high": response["h"],
                "low": response["l"],
                "change": response["d"],
                "open": response["o"],
                "time_epoch_ms": response["t"]}
        print(stocks)
        
        serializer = EODStockSerializer(data=stocks[symbol])
        if serializer.is_valid():
            serializer.save()
        sleep(0.2)
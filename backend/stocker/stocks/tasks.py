from celery import shared_task
from stocks.models import EODStock, IntradayStock
from stocks.serializers import IntradayStockSerializer, EODStockSerializer
from stocks.modules.helpers import is_market_open
from stocks.modules.logger import logger
import finnhub
from datetime import datetime, date, timedelta
from time import strftime, localtime, sleep, gmtime
from dotenv import load_dotenv
import sys
import os


load_dotenv(override=True)

'''
Celery task that request the Finnhub API for the qoute data of all 50 symbols
'''

@shared_task(queue='intraday')
def fetch_stocks_intraday():
    
    if is_market_open():
        
        logger.info("Starting intraday fetch")
        
        finnhub_client = finnhub.Client(api_key=os.getenv("finnhub_api_key"))
        symbols = [
        "NVDA", "AAPL", "MSFT", "GOOG", "AMZN", "META", "AVGO", "TSLA", 
        "BRK.B", "WMT", "LLY", "JPM", "V", "NFLX", "MA", "XOM", "UNH",
        "JNJ", "COST", "ORCL", "HD", "ABBV", "BAC", "PG", "CRM", "CVX",
        "AMD", "KO", "CSCO", "QCOM", "MRK", "TMO", "PEP", "TMUS", "DIS",
        "ADBE", "GE", "CAT", "WFC", "INTU", "AXP", "GS", "BLK", "MU",
        "ABT", "MCD", "MS", "CMCSA", "TXN", "NOW"
        ]
        
        # Request current value of each symbol and serialize it
        for symbol in symbols:
            try:
                response = finnhub_client.quote(symbol)
            except Exception as e:
                logger.error(f"API request Error: {e}")
                continue
            
            stocks = {"symbol": symbol,
                    "close": response["c"],
                    "high": response["h"],
                    "low": response["l"],
                    "change": response["d"],
                    "open": response["o"],
                    "time_epoch_ms": (response["t"] * 1000)}
            
            serializer = IntradayStockSerializer(data=stocks)
            if serializer.is_valid():
                serializer.save()

            logger.info(f"saved to Intraday table: {stocks}")
            sleep(0.2)
        
        # Get the epoch in ms of last week and delete anything older than a week
        
        logger.info("Deleting week old intraday rows")
        week_ago = stocks["time_epoch_ms"] - 604800000
        try:
            IntradayStock.objects.filter(time_epoch_ms__lt=week_ago).delete()
        except Exception as e:
            logger.error(f"Failed to delete week old intraday rows: {e}")
        
    else:
        logger.info("Market is closed, skipping over API request")
        
    

        
'''     
Celery task that gets the EOD close data of each symbol 
after market close and stores it in the EODStocks table
'''

@shared_task(queue='EOD')
def fetch_stocks_eod():
    
    logger.info("Starting EOD fetch")
    
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
            logger.error(f"API request Error: {e}")
            continue
            
        stocks = {"symbol": symbol,
                "close": response["c"],
                "high": response["h"],
                "low": response["l"],
                "change": response["d"],
                "open": response["o"],
                "time_epoch_ms": (response["t"] * 1000)}
        
        
        
        serializer = EODStockSerializer(data=stocks)
        if serializer.is_valid():
            serializer.save()
            
        logger.info(f"saved to EOD table: {stocks}")
        sleep(0.2)
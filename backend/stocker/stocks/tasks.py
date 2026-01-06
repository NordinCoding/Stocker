from celery import shared_task
from stocks.models import EODStock, IntradayStock, NewsArticle
from stocks.serializers import IntradayStockSerializer, EODStockSerializer, NewsArticleSerializer
from stocks.modules.helpers import is_market_open
from stocks.modules.logger import logger
import finnhub
import datetime
from time import strftime, localtime, sleep, gmtime
from dotenv import load_dotenv
from django.utils import timezone
import pytz
import requests
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
        
        
'''
Celery tasks that fetch articles for relevant stocks/symbols.
Its split into 2 tasks in order to dodge rate limits by running them 30 minutes apart
'''
@shared_task(queue='news')
def fetch_articles_1():
    STOCK_SYMBOLS = [
        "NVDA", "AAPL", "MSFT", "GOOG", "AMZN", "META", "AVGO", "TSLA", 
        "BRK.B", "WMT", "LLY", "JPM", "V", "NFLX", "MA", "XOM", "UNH",
        "JNJ", "COST", "ORCL", "HD", "ABBV", "BAC", "PG", "CRM"
    ]    
    fetch_articles_logic(STOCK_SYMBOLS)
    
    
@shared_task(queue='news')
def fetch_articles_2():
    STOCK_SYMBOLS = [
        "CVX", "AMD", "KO", "CSCO", "QCOM", "MRK", "TMO", "PEP", "TMUS", 
        "DIS", "ADBE", "GE", "CAT", "WFC", "INTU", "AXP", "GS", "BLK", 
        "MU", "ABT", "MCD", "MS", "CMCSA", "TXN", "NOW"
    ]    
    fetch_articles_logic(STOCK_SYMBOLS)
        

def fetch_articles_logic(STOCK_SYMBOLS):
    for symbol in STOCK_SYMBOLS:
        url = f"https://newsdata.io/api/1/market?apikey={os.getenv("newsdata_api_key")}&symbol={symbol}&size=2&removeduplicate=1&image=1&prioritydomain=medium"
        
        try:
            response = requests.get(url)
        
            top_headlines = response.json()
            
            for headlines in top_headlines["results"]:
                
                try:
                    pub_date = datetime.datetime.strptime(headlines["pubDate"], "%Y-%m-%d %H:%M:%S")
                    pub_date = timezone.make_aware(pub_date, timezone=datetime.timezone.utc)
                    
                    fetched_at = datetime.datetime.now(pytz.timezone('UTC'))
                except Exception as e:
                    print(f"date conversion error: {e}")
                    print(top_headlines)
                
                article = {
                        "article_id": headlines["article_id"],
                        "link": headlines["link"],
                        "title": headlines["title"],
                        "symbol": symbol,
                        "pub_date": pub_date,
                        "image_url": headlines["image_url"],
                        "source_name": headlines["source_name"],
                        "source_url": headlines["source_url"],
                        "fetched_at": fetched_at
                        }
                
                try:
                    serializer = NewsArticleSerializer(data=article)
                    if serializer.is_valid():
                        serializer.save()
                        print(F"Saved article: {article['title']}, symbol: {symbol}")
                    else:
                        print(f"Serializing failed: {serializer.errors}, symbol: {symbol}")
                except Exception as e:
                    print(f"Error serializing: {e}, symbol: {symbol}")
        
                
        
        except Exception as e:
            logger.error(f"Error fetching news article: {e}, symbol: {symbol}")
            
        sleep(5)
    
    
    

from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from stocks.models import EODStock, IntradayStock, MockIntradayStock, NewsArticle
from stocks.serializers import IntradayStockSerializer, EODStockSerializer, MockIntradayStockSerializer, NewsArticleSerializer
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Window
from django.db.models.functions import RowNumber
from time import strftime, localtime, sleep
from stocks.modules.logger import logger
from datetime import timedelta
import zoneinfo
import datetime
import requests
import os

# Fetch all EOD rows or only for one symbol using query param
class EODStockViewSet(ModelViewSet):
    serializer_class = EODStockSerializer

    def get_queryset(self):
        queryset = EODStock.objects.all()
    
        symbol = self.request.query_params.get("symbol")
        
        if symbol:
            queryset = queryset.filter(symbol__iexact=symbol)
        
        return queryset

# Fetch all intraday rows or only the most recent ones using query param
class IntradayStockViewSet(ModelViewSet):
    serializer_class = IntradayStockSerializer

    def get_queryset(self):
        queryset = IntradayStock.objects.all()
        
        latest = self.request.query_params.get("latest")
        
        if latest:
            queryset = queryset.distinct("symbol").order_by("symbol", "-time_epoch_ms")
        
        return queryset

# Fetches the 2 most recent news articles for each symbol
class NewsArticlesViewSet(ModelViewSet):
    serializer_class = NewsArticleSerializer
    
    def get_queryset(self):
        queryset = NewsArticle.objects.all()
        
        
        latest = self.request.query_params.get("latest")
        
        if latest:
            try:
                queryset = NewsArticle.objects.annotate(
                    row_num=Window(
                        expression=RowNumber(),
                        partition_by='symbol',
                        order_by='-fetched_at'
                    )
                ).filter(row_num__lte=2).order_by('symbol', '-fetched_at')
            except Exception as e:
                print(f"error while fetching latest articles: {e}")
        
        return queryset


# Function based view for populating the historical database
def populate_EOD(request):
    API_KEY = os.getenv("alpaca_api_key")
    API_SECRET = os.getenv("alpaca_api_secret")


    params = {
        "timeframe": "1Day",
        "start": "2022-01-01",
        "end": "2025-11-25"
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

    for symbol in STOCK_SYMBOLS:
        url = f"https://data.alpaca.markets/v2/stocks/{symbol}/bars"
        response = requests.get(url, headers=headers, params=params)
        json_response = response.json()
        for candle in json_response["bars"]:
            print(candle)
            candle_time = candle["t"]
            time = datetime.datetime.strptime(candle_time, '%Y-%m-%dT%H:%M:%SZ')
            stocks = {"symbol": symbol,
                        "close": candle["c"],
                        "high": candle["h"],
                        "low": candle["l"],
                        "open": candle["o"],
                        "time_epoch_ms": (time.timestamp()) * 1000}
            
            serializer = EODStockSerializer(data=stocks)
            if serializer.is_valid():
                serializer.save()
            
    return HttpResponse("Historical data fetched and stored in EOD table")


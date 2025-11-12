from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from stocks.models import EODStock, IntradayStock, MockIntradayStock
from stocks.serializers import IntradayStockSerializer, EODStockSerializer, MockIntradayStockSerializer
from django.http import HttpResponse
from time import strftime, localtime
import finnhub
import datetime
import random
import requests
import os

# Fetch all EOD rows
class EODStockViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = EODStock.objects.all()
        serializer = EODStockSerializer(queryset, many=True)
        return Response(serializer.data)
   
# Fetch all intraday rows
class IntradayStockViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = IntradayStock.objects.all()
        serializer = IntradayStockSerializer(queryset, many=True)
        return Response(serializer.data)
    
# Fetch most recent entry for each symbol
class DisplayStockViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = IntradayStock.objects.distinct('symbol').order_by('symbol', 'time_epoch_ms')
        serializer = IntradayStockSerializer(queryset, many=True)
        return Response(serializer.data)
    
# Fetch all mock rows
class MockStockViewSet(viewsets.ViewSet):
    def list(self, request):
        queryset = MockIntradayStock.objects.all()
        serializer = MockIntradayStockSerializer(queryset, many=True)
        return Response(serializer.data)



# View for populating the mock dev intraday table for testing graphing in development
def populate_mock_intraday(request):
    times = [{"start_time": 1762353000000, "end_time": 1762376400000},
             {"start_time": 1762439400000, "end_time": 1762462800000},
             {"start_time": 1762525800000, "end_time": 1762549200000},
             {"start_time": 1762785000000, "end_time": 1762808400000},
             {"start_time": 1762871400000, "end_time": 1762894800000}]
    
    for time in times:
        start_time = time["start_time"]
        while start_time != time['end_time']:
            stocks = {"symbol": "NVDA",
                      "close": random.randint(185, 205),
                      "time_epoch_ms": start_time}
            
            serializer = MockIntradayStockSerializer(data=stocks)
            if serializer.is_valid():
                serializer.save()
            
            start_time = start_time + 900000
        
    return HttpResponse("Yea we populated")



# Function based view for populating the historical database
def populate_EOD(request):
    API_KEY = os.getenv("alpaca_api_key")
    API_SECRET = os.getenv("alpaca_api_secret")


    params = {
        "timeframe": "1Day",
        "start": "2022-01-01",
        "end": "2025-10-29"
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
        
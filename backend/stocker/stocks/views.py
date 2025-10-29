from django.shortcuts import render
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from stocks.models import EODStock, IntradayStock
from stocks.serializers import IntradayStockSerializer, EODStockSerializer
import finnhub
from datetime import datetime
from time import strftime, localtime
import requests


marketstack_url = "https://api.marketstack.com/v2/eod?access_key=5d7922eb7488d2543d97b8b98993fa13"

marketstack_querystring = {"symbols": "AAPL",
                "limit": 1}

finnhub_client = finnhub.Client(api_key="d3o9pjhr01qmj830dq40d3o9pjhr01qmj830dq4g")




# Create your views here.
class EODStockViewSet(viewsets.ViewSet):
    def list(self, request):
        print("Loading EOD stocks")
        queryset = EODStock.objects.all()
        serializer = EODStockSerializer(queryset, many=True)
        return Response(serializer.data)
    
class IntradayStockViewSet(viewsets.ViewSet):
    def list(self, request):
        print("Loading Intraday stocks")
        queryset = IntradayStock.objects.all()
        serializer = IntradayStockSerializer(queryset, many=True)
        return Response(serializer.data)
from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
import stocks.views as views

stock_router = DefaultRouter()
stock_router.register('eod_stocks', views.EODStockViewSet, basename="eod_stocks")
stock_router.register('intraday_stocks', views.IntradayStockViewSet, basename="intraday_stocks")

urlpatterns = [
    path('populate_EOD', views.populate_EOD, name="populate_EOD")
]
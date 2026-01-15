from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
import stocks.views as views

stock_router = DefaultRouter()
stock_router.register('eod_stocks', views.EODStockViewSet, basename="eod_stocks")
stock_router.register('intraday_stocks', views.IntradayStockViewSet, basename="intraday_stocks")
stock_router.register('news_articles', views.NewsArticlesViewSet, basename='news_articles')


# Routes for populating the mock database and historical database, uncomment to use
urlpatterns = [
    path('register', views.UserRegistrationView.as_view(), name="register")
    #path('populate_EOD', views.populate_EOD, name="populate_EOD"),
    #path('populate_mock_intraday', views.populate_mock_intraday, name="populate_mock_intraday")
]

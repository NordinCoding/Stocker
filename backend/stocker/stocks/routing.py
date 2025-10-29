from django.urls import re_path
from stocks import consumers

websocket_urlpatterns = [
    re_path(r'ws/stocks/$', consumers.StockConsumer.as_asgi()),
]
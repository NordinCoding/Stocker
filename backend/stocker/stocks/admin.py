from django.contrib import admin
from .models import EODStock, IntradayStock, MockIntradayStock, NewsArticle, WatchList

# Register your models here.
admin.site.register(IntradayStock)
admin.site.register(EODStock)
admin.site.register(MockIntradayStock)
admin.site.register(NewsArticle)
admin.site.register(WatchList)
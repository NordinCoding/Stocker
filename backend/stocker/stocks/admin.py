from django.contrib import admin
from .models import EODStock, IntradayStock, MockIntradayStock

# Register your models here.
admin.site.register(IntradayStock)
admin.site.register(EODStock)
admin.site.register(MockIntradayStock)
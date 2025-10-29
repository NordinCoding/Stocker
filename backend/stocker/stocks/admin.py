from django.contrib import admin
from .models import EODStock, IntradayStock

# Register your models here.
admin.site.register(IntradayStock)
admin.site.register(EODStock)
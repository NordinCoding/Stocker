from django.contrib import admin
from django.urls import path, include
from stocks.urls import stock_router
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.registry.extend(stock_router.registry)

urlpatterns = [
    path('', include(router.urls)),
    path('api/', include('stocks.urls')),
    path('admin/', admin.site.urls)
]
from stocks.models import EODStock, IntradayStock, MockIntradayStock
from rest_framework import serializers


class IntradayStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntradayStock
        fields = ('id', 'symbol', 'close', 'high', 'low', 'change', 'open', 'time_epoch_ms')
        
class EODStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = EODStock
        fields = ('id', 'symbol', 'close', 'high', 'low', 'change', 'open', 'time_epoch_ms')
        
class MockIntradayStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockIntradayStock
        fields = ('id', 'symbol', 'close', 'time_epoch_ms')
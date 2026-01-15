from stocks.models import EODStock, IntradayStock, MockIntradayStock, NewsArticle
from rest_framework import serializers
from django.contrib.auth.models import User


class IntradayStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntradayStock
        fields = (
            'id', 
            'symbol', 
            'close', 
            'high', 
            'low', 
            'change', 
            'open', 
            'time_epoch_ms'
            )
        
class EODStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = EODStock
        fields = (
            'id', 
            'symbol', 
            'close', 
            'high', 
            'low', 
            'change', 
            'open', 
            'time_epoch_ms'
            )
        
class MockIntradayStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockIntradayStock
        fields = (
            'id', 
            'symbol', 
            'close', 
            'time_epoch_ms'
            )
        
        
class NewsArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsArticle
        fields = (
            'id', 
            'article_id', 
            'link', 
            'title', 
            'symbol', 
            'pub_date',
            'image_url',
            'source_name',
            'source_url',
            'fetched_at'
            )
        

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
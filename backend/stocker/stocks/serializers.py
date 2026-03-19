from stocks.models import EODStock, IntradayStock, MockIntradayStock, NewsArticle, WatchList
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")


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


class WatchListSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = WatchList
        fields = (
            'id',
            'name',
            'symbols',
            'created_at'
            )
    def validate(self, data):
        
        user = self.context["request"].user
        name = data.get("name")
        # Check if watchlist name is empty
        if not name:
            raise serializers.ValidationError({"response": "Please enter a name"})
        
        
        # Check if symbols were selected
        if not data.get("symbols"):
            raise serializers.ValidationError({"response": "Please select atleast one symbol."})
        
        # Check for duplicate watchlist name
        qs = WatchList.objects.filter(user=user, name=name)
        
        # allow updating the same object
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError({
                "response": "You already have a watchlist with this name."
            })
        
        return data


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
    

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token
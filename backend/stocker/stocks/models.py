from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import User

# Create your models here.
class IntradayStock(models.Model):
    symbol = models.CharField(max_length=6, db_index=True)
    close = models.DecimalField(max_digits=12, decimal_places=4)
    high = models.DecimalField(max_digits=12, decimal_places=4)
    low = models.DecimalField(max_digits=12, decimal_places=4)
    change = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    open = models.DecimalField(max_digits=12, decimal_places=4)
    time_epoch_ms = models.BigIntegerField(db_index=True)
    
    class Meta:
        db_table = "intraday_stocks"
        db_table_comment = "Table used for intraday stocks, stores each minute"
        ordering = ["-time_epoch_ms"]
        unique_together = [["symbol", "time_epoch_ms"]]
    
    
    def __str__(self):
        return f"Stock: {self.symbol}, price: {self.close}"
    

class EODStock(models.Model):
    symbol = models.CharField(max_length=6, db_index=True)
    close = models.DecimalField(max_digits=12, decimal_places=4)
    high = models.DecimalField(max_digits=12, decimal_places=4)
    low = models.DecimalField(max_digits=12, decimal_places=4)
    change = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    open = models.DecimalField(max_digits=12, decimal_places=4)
    time_epoch_ms = models.BigIntegerField(db_index=True)
    
    class Meta:
        db_table = "EOD_stocks"
        db_table_comment = "Table used for EOD stocks, stores once a day at close"
        ordering = ["-time_epoch_ms"]
        unique_together = [["symbol", "time_epoch_ms"]]
    
    def __str__(self):
        return f"Stock: {self.symbol}, price: {self.close}"


class MockIntradayStock(models.Model):
    symbol = models.CharField(max_length=6, db_index=True)
    close = models.DecimalField(max_digits=12, decimal_places=4)
    time_epoch_ms = models.BigIntegerField(db_index=True)
    
    class Meta:
        db_table = "mock_intraday_stocks"
        db_table_comment = "Mock table used for intraday stocks, stores each minute"
        ordering = ["-time_epoch_ms"]
        unique_together = [["symbol", "time_epoch_ms"]]
    
    
    def __str__(self):
        return f"Stock: {self.symbol}, price: {self.close}"
    

class NewsArticle(models.Model):
    article_id = models.CharField(max_length=100, unique=True)
    link = models.URLField(max_length=500)
    title = models.CharField(max_length=500)
    symbol = models.CharField(max_length=6, db_index=True)
    pub_date = models.DateTimeField(db_index=True)
    image_url = models.URLField(max_length=500)
    source_name = models.CharField(max_length=100, db_index=True)
    source_url = models.URLField(max_length=200)
    fetched_at = models.DateTimeField(db_index=True)
    
    class Meta:
        db_table = "news_articles"
        db_table_comment = "table used to store news articles fetched from API"
        ordering = ["-pub_date"]
    
    def __str__(self):
        return f"Article: {self.title}, pub date: {self.pub_date}"
    

class WatchList(models.Model):
    name = models.CharField(max_length=32)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbols = ArrayField(models.CharField(max_length=8), blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = "watchlists"
        db_table_comment = "table used to store watchlists created by users"
        
    def __str__(self):
        return f"watchlist: {self.name}, user: {self.user}"
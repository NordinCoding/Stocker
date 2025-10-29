from django.db import models

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
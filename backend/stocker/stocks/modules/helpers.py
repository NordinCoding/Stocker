from datetime import datetime, timezone, time
from zoneinfo import ZoneInfo

# Function that takes epoch in MS as argument and translates it to properly formatted New York time
def format_trade_time(epoch_ms, zone="America/New_York"):
    utc = datetime.fromtimestamp(epoch_ms / 1000, tz=ZoneInfo("UTC"))
    return utc.astimezone(ZoneInfo(zone)).strftime("%Y-%m-%d %H:%M:%S")

# Simple function that returns True if market is open, False if market is closed
def is_market_open():
    now = datetime.now(timezone.utc)
    market_open = now.replace(hour=13, minute=30)   # 9:30 AM ET
    market_close = now.replace(hour=20, minute=0)   # 4:00 PM ET
    return market_open <= now <= market_close


# View for populating the mock dev intraday table for testing graphing in development
'''
def populate_mock_intraday(request):
    times = [{"start_time": 1762353000000, "end_time": 1762376400000},
             {"start_time": 1762439400000, "end_time": 1762462800000},
             {"start_time": 1762525800000, "end_time": 1762549200000},
             {"start_time": 1762785000000, "end_time": 1762808400000},
             {"start_time": 1762871400000, "end_time": 1762894800000}]
    
    for time in times:
        start_time = time["start_time"]
        while start_time != time['end_time']:
            stocks = {"symbol": "NVDA",
                      "close": random.randint(185, 205),
                      "time_epoch_ms": start_time}
            
            serializer = MockIntradayStockSerializer(data=stocks)
            if serializer.is_valid():
                serializer.save()
            
            start_time = start_time + 900000
        
    return HttpResponse("Yea we populated")
'''
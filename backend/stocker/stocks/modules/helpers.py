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
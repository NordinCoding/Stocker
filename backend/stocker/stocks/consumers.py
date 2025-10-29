from channels.generic.websocket import AsyncWebsocketConsumer
import json

class StockConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Attempting to connect")
        await self.accept()
        await self.channel_layer.group_add("stocks", self.channel_name)
        await self.send(text_data=json.dumps({"message": "connected"}))

    # handle incoming messages
    async def stock_update(self, event):
        # Receive updates from the group (sent from finnhub_listener)
        await self.send(json.dumps({
            "symbol": event["symbol"],
            "price": event["price"]
        }))
        
    async def disconnect(self, close_code):
        print(f"disconnected: {close_code}")
        await self.channel_layer.group_discard("stocks", self.channel_name)
        
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class TickerConsumer(WebsocketConsumer):
  def connect(self):
    self.accept()
    self.group_name = 'lobby'
    async_to_sync(self.channel_layer.group_add)(
      self.group_name,
      self.channel_name
    )
    

    self.send(text_data = json.dumps({
      'type': 'connection_established',
      'message' : 'Connected'
    }))

  def receive(self, text_data):
    text_data_json = json.loads(text_data)
    message = text_data_json['message']

    async_to_sync(self.channel_layer.group_send)(
      self.group_name,
      {
        'type': 'ping_message',
        'message': message
      }
    )

  
  def ping_message(self, event):
    message = event['message']

    self.send(text_data = json.dumps({
      'type': 'ping',
      'message' : message
    }))

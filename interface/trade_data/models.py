from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class Trade(models.Model):
  timestamp = models.CharField(max_length = 200)
  side = models.CharField(max_length = 200)
  price = models.CharField(max_length = 200)
  quantity = models.CharField(max_length = 200)

class Ticker(models.Model):
  timestamp = models.CharField(max_length = 200)
  opening = models.CharField(max_length = 200)
  high = models.CharField(max_length = 200)
  low = models.CharField(max_length = 200)
  closing = models.CharField(max_length = 200)
  volume = models.CharField(max_length = 200)

@receiver(post_save, sender=Ticker)
def model_post_save(sender, instance, *args, **kwargs):
  channel_layer = get_channel_layer()
  group_name = "lobby"
  async_to_sync(channel_layer.group_send)(
    group_name,
    {
      'type': 'ping_message',
      'message': "POST SAVE!"
    }
  )
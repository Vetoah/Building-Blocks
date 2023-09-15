from django.db import models
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from django.dispatch import receiver

class TradeModel(models.Model):
  timestamp = models.CharField(max_length = 200)
  side = models.CharField(max_length = 200)
  price = models.CharField(max_length = 200)
  quantity = models.CharField(max_length = 200)

class TickerModel(models.Model):
  timestamp = models.CharField(max_length = 200)
  opening = models.CharField(max_length = 200)
  high = models.CharField(max_length = 200)
  low = models.CharField(max_length = 200)
  closing = models.CharField(max_length = 200)
  volume = models.CharField(max_length = 200)

@receiver(post_save, sender=TickerModel)
def ticker_model_post_save(sender, instance, created, *args, **kwargs):
  channel_layer = get_channel_layer()
  group_name = "lobby"
  instance_values = [str(value) for fields, value in list(instance.__dict__.items())[2:]]
  if created:
    async_to_sync(channel_layer.group_send)(
      group_name,
      {
        'type': 'new_candle',
        'message': instance_values
      }
    )
  else:
    async_to_sync(channel_layer.group_send)(
      group_name,
      {
        'type': 'update_candle',
        'message': instance_values
      }
    )

class KlineTickerModel(models.Model):
  timestamp = models.CharField(max_length = 200)
  opening = models.CharField(max_length = 200)
  high = models.CharField(max_length = 200)
  low = models.CharField(max_length = 200)
  closing = models.CharField(max_length = 200)
  volume = models.CharField(max_length = 200)

@receiver(post_save, sender=KlineTickerModel)
def klineTrade_model_post_save(sender, instance, created, *args, **kwargs):
  instance_values = [str(value) for fields, value in list(instance.__dict__.items())[2:]]
  channel_layer = get_channel_layer()
  group_name = "lobby"

  if created:
    async_to_sync(channel_layer.group_send)(
      group_name,
      {
        'type': 'new_candle',
        'message': instance_values
      }
    )
  else:
    async_to_sync(channel_layer.group_send)(
      group_name,
      {
        'type': 'update_candle',
        'message': instance_values
      }
    )

class OrderbookModel(models.Model):
  price = models.CharField(max_length = 200)
  quantity = models.CharField(max_length = 200)
  side = models.CharField(max_length = 200)

@receiver(post_save, sender=OrderbookModel)
def order_model_post_save(sender, instance, created, *args, **kwargs):
  instances = OrderbookModel.objects.filter(quantity=0)
  instances.delete()
 
  


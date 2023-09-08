from django.db import models

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

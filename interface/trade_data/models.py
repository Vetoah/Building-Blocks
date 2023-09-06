from django.db import models

# Create your models here.

class Trade(models.Model):
  timestamp = models.CharField(max_length = 200)
  side = models.CharField(max_length = 200)
  price = models.CharField(max_length = 200)
  quantity = models.CharField(max_length = 200)
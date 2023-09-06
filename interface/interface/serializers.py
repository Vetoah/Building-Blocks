from rest_framework import serializers
from trade_data.models import Trade

class TradeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Trade
    fields = '__all__'

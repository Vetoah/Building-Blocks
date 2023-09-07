from rest_framework import serializers
from trade_data.models import Trade, Ticker

class TradeSerializer(serializers.ModelSerializer):
  class Meta:
    model = Trade
    fields = '__all__'


class TickerSerializer(serializers.ModelSerializer):
  class Meta:
    model = Ticker
    fields = fields = ['timestamp', 'opening', 'closing', 'high', 'low', 'volume']

  def update(self, instance, validated_data):
    instance_meta = instance.meta.copy()
    instance_meta.update(validated_data.get("meta", {}))
    validated_data["meta"] = instance_meta
    return super().update(instance, validated_data)

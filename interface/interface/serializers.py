from rest_framework import serializers
from trade_data.models import TickerModel, TradeModel, KlineTickerModel, OrderbookModel

class TradeSerializer(serializers.ModelSerializer):
  class Meta:
    model = TradeModel
    fields = '__all__'


class TickerSerializer(serializers.ModelSerializer):
  class Meta:
    model = TickerModel
    fields = ['timestamp', 'opening', 'high', 'low', 'closing', 'volume']

class KlineTickerSerializer(serializers.ModelSerializer):
  class Meta:
    model = KlineTickerModel
    fields = ['timestamp', 'opening', 'high', 'low', 'closing', 'volume']

class OrderbookSerializer(serializers.ModelSerializer):
  class Meta:
    model = OrderbookModel
    fields = ['price', 'quantity', 'side']

  # def update(self, instance, validated_data):
  #   instance_meta = instance.meta.copy()
  #   instance_meta.update(validated_data.get("meta", {}))
  #   validated_data["meta"] = instance_meta
  #   return super().update(instance, validated_data)



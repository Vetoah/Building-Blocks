from django.shortcuts import render, HttpResponse
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from .models import TradeModel, TickerModel, KlineTickerModel, OrderbookModel
from interface.serializers import TradeSerializer, TickerSerializer, OrderbookSerializer, KlineTickerSerializer
import asyncio
# Create your views here.
@api_view(['POST'])
def orderbook(request, **kwargs):
  serializer = OrderbookSerializer(data=request.data)
  if serializer.is_valid():
    price_val = request.data.get('price')
    qty_val = request.data.get('quantity')
    side_val = request.data.get('side')
    model, created = OrderbookModel.objects.update_or_create(price=price_val, defaults={'price':price_val, 'quantity':qty_val, 'side': side_val })
  return JsonResponse({'message': 'Object created successfully'})

@api_view(['GET'])
def getOrderbook(request):
  orders = OrderbookModel.objects.all().order_by('price').values()
  serializer = OrderbookSerializer(orders, many=True)

  return Response(serializer.data)

@api_view(['POST'])
def klineTrades(request, **kwargs):
  serializer = KlineTickerSerializer(data=request.data)
  if serializer.is_valid():
    timestamp_val = request.data.get('timestamp')
    opening_val = request.data.get('opening')
    high_val = request.data.get('high')
    low_val = request.data.get('low')
    closing_val = request.data.get('closing')
    volume_val = request.data.get('volume')
    model, created = KlineTickerModel.objects.update_or_create(timestamp=timestamp_val, defaults={'timestamp':timestamp_val, 'opening':opening_val, 'high':high_val, 'low': low_val ,'closing':closing_val, 'volume':volume_val, })
  return JsonResponse({'message': 'Object created successfully'})

@api_view(['GET'])
def getKlineTrades(request):
  orders = KlineTickerModel.objects.all()
  serializer = KlineTickerSerializer(orders, many=True)
  return Response(serializer.data)

@api_view(['GET'])
def trades(request):
  tickers = TickerModel.objects.all()
  serializer = TickerSerializer(tickers, many=True)
  return Response(serializer.data)

@api_view(['POST'])
def addTrade(request):
  serializer = TradeSerializer(data=request.data, many=True)
  if serializer.is_valid():
    serializer.save()
  return Response(serializer.data)

@api_view(['DELETE'])
def delTrades(request):
  Trade.objects.all().delete

@api_view(['POST'])
def create_ticker_5min(request, **kwargs):
  val_check = request.data.get('timestamp')
  obj = TickerModel.objects.filter(timestamp=val_check)
  if obj:
    print('redirect')
    return JsonResponse({'message': 'Object created successfully'}, status=300 + obj.first().id)
  else: 
    serializer = TickerSerializer(data=request.data)
    if serializer.is_valid():
      print(serializer)

      serializer.save()
    return Response(serializer.data)

class Ticker_5min(generics.UpdateAPIView):
  queryset = TickerModel.objects.all()
  serializer_class = TickerSerializer

def connection(request):
  return render(request, 'trade_data/lobby.html')
 



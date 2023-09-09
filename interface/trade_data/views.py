from django.shortcuts import render, HttpResponse
from django.http import JsonResponse, HttpResponseRedirect
from django.urls import reverse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from .simple_emacross import getTrades
from .models import TradeModel, TickerModel
from interface.serializers import TradeSerializer, TickerSerializer
import asyncio
# Create your views here.
@api_view(['GET'])
def home(request):
  asyncio.run(getTrades())
  tickers = TickerModel.objects.all()
  serializer = TickerSerializer(tickers, many=True)
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
      serializer.save()
    return Response(serializer.data)

class Ticker_5min(generics.UpdateAPIView):
  queryset = TickerModel.objects.all()
  serializer_class = TickerSerializer

def connection(request):
  return render(request, 'trade_data/lobby.html')
 



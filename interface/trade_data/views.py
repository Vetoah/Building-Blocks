from django.shortcuts import render, HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from .simple_emacross import getTrades
from .models import Trade, Ticker
from interface.serializers import TradeSerializer, TickerSerializer
import asyncio
# Create your views here.
@api_view(['GET'])
def home(request):
  asyncio.run(getTrades())
  tickers = Ticker.objects.all()
  serializer = TickerSerializer(tickers, many=True)
  return Response(serializer.data)

@api_view(['GET'])
def trades(request):
  tickers = Ticker.objects.all()
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

@api_view(['PUT'])
def create_ticker_5min(request, **kwargs):
  serializer = TickerSerializer(data=request.data)
  if serializer.is_valid():
    serializer.save()
  return Response(serializer.data)

class Ticker_5min(generics.UpdateAPIView):
  queryset = Ticker.objects.all()
  serializer_class = TickerSerializer
 



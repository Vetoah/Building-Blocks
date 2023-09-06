from django.shortcuts import render, HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .simple_emacross import getTrades
from .models import Trade
from interface.serializers import TradeSerializer
import asyncio
# Create your views here.
@api_view(['GET'])
def home(request):
  return Response(asyncio.run(getTrades()))

@api_view(['GET'])
def trades(request):
  trades_history = Trade.objects.all()
  serializer = TradeSerializer(trades_history, many=True)
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


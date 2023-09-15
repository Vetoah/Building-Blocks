from django.urls import path
from . import views 

urlpatterns = [
  path("addTrade", views.addTrade),
  path("trades", views.trades),
  path("del", views.delTrades),
  path('api/ticker5/', views.create_ticker_5min),
  path('api/ticker5/<int:pk>/', views.Ticker_5min.as_view(), name='ticker-update'),
  path('api/orderbook', views.orderbook),
  path('api/orderbook/get', views.getOrderbook),
  path('api/klinetrades', views.klineTrades),
  path('api/klinetrades/get', views.getKlineTrades),
  path('ws_con', views.connection)
]


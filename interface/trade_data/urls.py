from django.urls import path
from . import views 

urlpatterns = [
  # path("", views.home, name="home"),
  path("addTrade", views.addTrade),
  path("trades", views.trades),
  path("del", views.delTrades),
  path('api/ticker5/', views.create_ticker_5min),
  path('api/ticker5/<int:pk>/', views.Ticker_5min.as_view(), name='ticker-update'),
  path('ws_con', views.connection)
]


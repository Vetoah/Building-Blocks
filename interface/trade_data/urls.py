from django.urls import path
from . import views 

urlpatterns = [
  path("", views.home, name="home"),
  path("addTrade", views.addTrade),
  path("trades", views.trades),
  path("del", views.delTrades),
]


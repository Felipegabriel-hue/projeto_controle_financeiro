from django.urls import path
from . import views

urlpatterns = [
    path('', views.setor, name='setor'),
    path('gastos/', views.gastos, name='gastos'),
    path('categorias/', views.categorias, name='categorias'),
    path('relatorios/', views.relatorios, name='relatorios'),
]
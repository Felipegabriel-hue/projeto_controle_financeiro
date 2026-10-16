from django.urls import path
from . import views


urlpatterns = [
    path("", views.login, name="login"),
    path("cadastro/", views.cadastro, name="cadastro"),
    path("cadastro-confirmacao/",views.cadastro_confirmacao,name="cadastro_confirmacao"),
    path("resumo/", views.resumo, name="resumo"),
    path("gastos/", views.gastos, name="gastos"),
    path("categorias/", views.categorias, name="categorias"),
    path("relatorios/", views.relatorios, name="relatorios"),
    
    ]
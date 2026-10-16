from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

# Tela de Login
def login(request):
    if request.method == "POST":
        usuario = request.POST.get("usuario")
        senha = request.POST.get("senha")
        
        # 1. Verifica se o usuário existe no banco
        if not User.objects.filter(username=usuario).exists():
            return render(request, "setorfinanceiro/login.html", {
                "erro": "Usuário não cadastrado. Por favor, crie uma conta antes de entrar."
            })
        
        # 2. Se existe, verifica se a senha está correta
        user = authenticate(request, username=usuario, password=senha)
        if user is not None:
            auth_login(request, user)
            return redirect("resumo")
        else:
            return render(request, "setorfinanceiro/login.html", {
                "erro": "Senha incorreta. Tente novamente."
            })

    return render(request, "setorfinanceiro/login.html")


# Tela de Cadastro
def cadastro(request):
    if request.method == "POST":
        usuario = request.POST.get("usuario")
        email = request.POST.get("email")
        senha = request.POST.get("senha")
        confirmar_senha = request.POST.get("confirmar_senha")

        if senha != confirmar_senha:
            usuarios_cadastrados = User.objects.all().order_by('-date_joined')
            return render(request, "setorfinanceiro/cadastro.html", {
                "erro": "As senhas não coincidem.",
                "usuarios": usuarios_cadastrados
            })

        if User.objects.filter(username=usuario).exists():
            usuarios_cadastrados = User.objects.all().order_by('-date_joined')
            return render(request, "setorfinanceiro/cadastro.html", {
                "erro": "Este nome de usuário já existe.",
                "usuarios": usuarios_cadastrados
            })

        # Cria o novo usuário
        user = User.objects.create_user(username=usuario, email=email, password=senha)
        user.save()

        return redirect("cadastro_confirmacao")

    # Busca todos os usuários para listar no final da página
    usuarios_cadastrados = User.objects.all().order_by('-date_joined')
    return render(request, "setorfinanceiro/cadastro.html", {"usuarios": usuarios_cadastrados})

def cadastro_confirmacao(request):
    return render(request, "setorfinanceiro/cadastro_confirmacao.html")

# Encerrar sessão
def sair(request):
    auth_logout(request)
    return redirect("login")

# Páginas Protegidas
@login_required
def setor(request):
    return render(request, "setorfinanceiro/setor.html")

@login_required
def resumo(request):
    return render(request, "setorfinanceiro/resumo.html")

@login_required
def gastos(request):
    return render(request, "setorfinanceiro/gastos.html")

@login_required
def categorias(request):
    return render(request, "setorfinanceiro/categorias.html")

@login_required
def relatorios(request):
    return render(request, "setorfinanceiro/relatorios.html")
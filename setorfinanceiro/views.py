
from django.shortcuts import render

# Página inicial
def setor(request):
    return render(request, 'setorfinanceiro/setor.html')

# Página de gastos
def gastos(request):
    return render(request, 'setorfinanceiro/gastos.html')

# Página de categorias
def categorias(request):
    return render(request, 'setorfinanceiro/categorias.html')

# Página de relatórios
def relatorios(request):
    return render(request, 'setorfinanceiro/relatorios.html')
#pagina de resumo
def resumo(request):
    return render(request,'setorfinanceiro/resumo.html')
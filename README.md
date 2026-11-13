[README.md](https://github.com/user-attachments/files/34803508/README.md)
# Meu Bolso

## Descrição

Meu Bolso é uma aplicação web de controle financeiro mensal, desenvolvida para ajudar usuários a organizar despesas por categoria e acompanhar suas finanças.

O projeto está em desenvolvimento. O cadastro, o login e as páginas principais foram implementados nos arquivos apresentados pela equipe. As rotas da API ainda não foram configuradas; portanto, as operações financeiras pelo JavaScript ainda não estão disponíveis.

## Objetivos

- Facilitar a organização das despesas pessoais.
- Permitir o registro e a classificação de gastos por categoria.
- Acompanhar limites mensais por categoria.
- Apresentar resumos e relatórios financeiros.
- Disponibilizar acesso individual por meio de autenticação.

Os objetivos financeiros dependem da conclusão da integração com o servidor.

## Funcionalidades e estado atual

### Implementadas

- Cadastro de usuários com nome de usuário, e-mail e senha.
- Verificação da confirmação de senha.
- Verificação de nome de usuário já cadastrado.
- Login com autenticação do Django.
- Proteção das páginas internas para usuários autenticados.
- Rotas e templates de Resumo, Gastos, Categorias e Relatórios.
- Interface de gastos com formulário, histórico e controles de filtro.
- Scripts JavaScript preparados para integração com uma API.

### Ainda não disponíveis

- API de categorias e gastos: nenhuma rota da API foi configurada até o momento.
- Cadastro, consulta e exclusão de categorias pelo JavaScript.
- Cadastro, consulta e exclusão de gastos pelo JavaScript.
- Preenchimento dos filtros com dados fornecidos pela API.
- Acompanhamento de limites por categoria com dados reais.
- Resumos e relatórios integrados aos registros financeiros.

### Pontos a verificar durante o desenvolvimento

- Criação e aplicação dos modelos e migrações de categorias e gastos.
- Carregamento dos arquivos JavaScript pelo Django.
- Ligação do botão Sair à função de encerramento de sessão.

A existência de uma tela ou de um script não significa que a funcionalidade esteja integrada ao banco de dados.

## Tecnologias utilizadas

- Python: linguagem utilizada no servidor.
- Django: framework web, autenticação e renderização de templates.
- HTML: estrutura das páginas.
- CSS: estilização das interfaces.
- JavaScript: interação com formulários, filtros e preparação de requisições à API.
- Fetch API: utilizada nos scripts para comunicação HTTP com o servidor.
- SQLite: arquivo `db.sqlite3` presente na estrutura apresentada; a configuração deve ser conferida em `setup/settings.py`.
- Git e GitHub: versionamento e hospedagem do repositório.
- Visual Studio Code: editor utilizado no desenvolvimento.
- Google Fonts: fontes Inter e Fraunces.

As versões das dependências devem ser conferidas no arquivo `requirements.txt`. Utilize uma versão de Python compatível com a versão de Django definida pelo projeto.

## Pré-requisitos

- Python instalado e disponível no terminal.
- pip disponível no ambiente Python.
- Git, caso o projeto seja obtido por clonagem.
- Navegador atualizado.
- Acesso à internet para instalar dependências e carregar fontes externas.

## Instalação e execução

### 1. Obter o projeto

Clone o repositório usando o endereço disponível no GitHub ou baixe e extraia o ZIP. Abra o terminal na pasta raiz do projeto, onde está o arquivo `manage.py`.

### 2. Criar o ambiente virtual

Windows:

```bash
python -m venv .venv
```

Linux/macOS:

```bash
python3 -m venv .venv
```

### 3. Ativar o ambiente virtual

Windows — PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Windows — Prompt de Comando:

```bat
.venv\Scripts\activate.bat
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Execute os próximos comandos com o ambiente virtual ativo.

### 4. Instalar as dependências

```bash
python -m pip install -r requirements.txt
```

O arquivo `requirements.txt` deve conter as dependências e versões utilizadas pela equipe.

### 5. Aplicar as migrações existentes

```bash
python manage.py migrate
```

Esse comando prepara o banco conforme as migrações incluídas no repositório. Ele não cria as rotas da API.

Durante o desenvolvimento, após criar ou alterar modelos, a equipe deve gerar as migrações correspondentes e aplicá-las:

```bash
python manage.py makemigrations setorfinanceiro
python manage.py migrate
```

Quem apenas instala o projeto normalmente deve aplicar as migrações já fornecidas, sem gerar novas.

### 6. Iniciar o servidor local

```bash
python manage.py runserver
```

Acesse no navegador:

```text
http://127.0.0.1:8000/
```

Para encerrar o servidor, pressione `Ctrl + C` no terminal. O servidor acima é destinado ao desenvolvimento local, não à publicação em produção.

## Como utilizar

1. Acesse a página inicial.
2. Selecione a opção para criar uma conta.
3. Informe nome de usuário, e-mail, senha e confirmação de senha.
4. Após a confirmação do cadastro, acesse a tela de login.
5. Entre com nome de usuário e senha.
6. Navegue pelas páginas Resumo, Gastos, Categorias e Relatórios.

As operações financeiras ainda não estão disponíveis porque a API não foi implementada. No JavaScript atual, consultas com resposta 404 são convertidas em listas vazias; portanto, uma tela sem registros pode indicar a ausência da rota, e não uma consulta bem-sucedida ao banco.

## Estrutura do projeto

Organização principal e disposição esperada dos arquivos estáticos:

```text
projeto_controle_financeiro/
├── manage.py
├── requirements.txt
├── README.md
├── setup/
│   ├── settings.py
│   └── urls.py
├── setorfinanceiro/
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── admin.py
├── templates/
│   └── setorfinanceiro/
│       ├── setor.html
│       ├── login.html
│       ├── cadastro.html
│       ├── cadastro_confirmacao.html
│       ├── resumo.html
│       ├── gastos.html
│       ├── categorias.html
│       └── relatorios.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        ├── common.js
        ├── resumo.js
        ├── gastos.js
        ├── categorias.js
        └── relatorios.js
```

O `common.js` define o objeto `MeuBolso` e deve ser carregado antes dos scripts específicos de cada página. A pasta `static` precisa estar configurada entre os diretórios de arquivos estáticos do projeto.

## API prevista — ainda não implementada

Nenhuma rota da API foi configurada até o momento. Os scripts estão preparados para utilizar os seguintes endpoints, mas eles ainda não estão disponíveis no servidor:

| Método | Endpoint | Finalidade prevista |
| --- | --- | --- |
| GET | `/api/categorias/` | Listar categorias |
| POST | `/api/categorias/` | Cadastrar categoria |
| DELETE | `/api/categorias/<id>/` | Excluir categoria |
| GET | `/api/gastos/` | Listar gastos |
| POST | `/api/gastos/` | Cadastrar gasto |
| DELETE | `/api/gastos/<id>/` | Excluir gasto |

A implementação deverá incluir validação dos dados, autenticação, proteção CSRF nas alterações e restrição de acesso aos registros do usuário responsável.

## Limitações e cuidados

- Atualize esta documentação conforme as funcionalidades forem concluídas e testadas.
- Nos arquivos apresentados, a tela de cadastro lista nomes e e-mails dos usuários. Remova essa exposição ou restrinja o acesso antes de uma publicação pública.
- Não publique senhas, chaves secretas, dados pessoais ou bancos com dados reais no repositório.
- A publicação em produção exige revisão das configurações de segurança e implantação.

## Equipe

- Otavio Augusto
- Antonio Phelippe
- Felipe Gabriel

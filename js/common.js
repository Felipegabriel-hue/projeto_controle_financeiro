/* Meu Bolso — utilitários compartilhados entre as páginas.
 *
 * Carregue este arquivo no <head> do setor.html, ANTES dos scripts de cada página:
 *   <script src="{% static 'js/common.js' %}"></script>
 *
 * Ajuste CONFIG se as rotas da sua API forem diferentes.
 */
(function () {
  'use strict';

  const CONFIG = {
    urls: {
      categorias: '/api/categorias/',
      gastos: '/api/gastos/',
    },
    loginUrl: '/', // rota "login" do projeto
    // Enquanto a API não existe, leituras (GET) que dão 404 viram lista vazia
    // e gravações mostram um aviso simples. Quando a API for criada, nada muda aqui.
    semApiMensagem: 'Este recurso ficará disponível quando a API for adicionada.',
  };

  /* ---------- Requisições ---------- */

  function lerCookie(nome) {
    const par = document.cookie.split('; ').find((c) => c.startsWith(nome + '='));
    return par ? decodeURIComponent(par.split('=').slice(1).join('=')) : '';
  }

  function tokenCsrf() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return lerCookie('csrftoken') || (meta ? meta.content : '');
  }

  function mensagemDeErro(dados) {
    if (!dados) return '';
    if (typeof dados === 'string') return dados;
    if (dados.detail) return String(dados.detail);
    if (dados.erro) return String(dados.erro);
    if (dados.error) return String(dados.error);
    const primeiro = Object.values(dados)[0];
    if (Array.isArray(primeiro)) return String(primeiro[0]);
    return primeiro ? String(primeiro) : '';
  }

  async function api(url, { method = 'GET', body } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (method !== 'GET') headers['X-CSRFToken'] = tokenCsrf();

    let resp;
    try {
      resp = await fetch(url, {
        method,
        headers,
        credentials: 'same-origin',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new Error('Não foi possível falar com o servidor.');
    }

    if (resp.status === 401) {
      window.location.href = CONFIG.loginUrl;
      throw new Error('Sessão expirada.');
    }
    if (resp.status === 204) return null;

    let dados = null;
    try {
      dados = await resp.json();
    } catch (e) {
      /* resposta sem JSON */
    }
    if (!resp.ok) {
      const msg =
        resp.status === 404 ? CONFIG.semApiMensagem : mensagemDeErro(dados) || 'Erro ' + resp.status + '.';
      const erro = new Error(msg);
      erro.status = resp.status;
      throw erro;
    }
    return dados;
  }

  /* Aceita lista simples ou resposta paginada ({ results: [...] }).
     Se a API ainda não existir (404), devolve lista vazia. */
  async function listar(url) {
    let dados;
    try {
      dados = await api(url);
    } catch (e) {
      if (e.status === 404) return [];
      throw e;
    }
    if (Array.isArray(dados)) return dados;
    return (dados && dados.results) || [];
  }

  /* ---------- Formatação ---------- */

  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarMoeda = (v) => moeda.format(Number(v) || 0);

  function formatarData(iso) {
    const [a, m, d] = String(iso || '').slice(0, 10).split('-');
    return a && m && d ? d + '/' + m + '/' + a : '';
  }

  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  /* "2026-10-16" -> "2026-10" */
  const mesDe = (iso) => String(iso || '').slice(0, 7);

  /* "2026-10" -> "out/2026" */
  function nomeMes(chave) {
    const [a, m] = String(chave).split('-');
    return (MESES[Number(m) - 1] || '?') + '/' + a;
  }

  function hojeISO() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function escapar(texto) {
    const el = document.createElement('div');
    el.textContent = texto == null ? '' : String(texto);
    return el.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- Dados ---------- */

  const categoriaId = (g) =>
    g.categoria && typeof g.categoria === 'object' ? g.categoria.id : g.categoria;

  const mapaCategorias = (lista) => new Map(lista.map((c) => [String(c.id), c]));

  function nomeCategoria(gasto, mapa) {
    if (gasto.categoria_nome) return gasto.categoria_nome;
    if (gasto.categoria && gasto.categoria.nome) return gasto.categoria.nome;
    const c = mapa && mapa.get(String(categoriaId(gasto)));
    return c ? c.nome : 'Sem categoria';
  }

  /* Se a API não mandar "tipo", tudo conta como despesa. */
  const ehReceita = (g) => g.tipo === 'receita';

  const somar = (lista) => lista.reduce((t, g) => t + (Number(g.valor) || 0), 0);

  function maisRecentesPrimeiro(lista) {
    return lista.slice().sort((a, b) => {
      const porData = String(b.data).localeCompare(String(a.data));
      return porData !== 0 ? porData : (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }

  /* ---------- Interface ---------- */

  function toast(mensagem, tipo) {
    const cor = tipo === 'sucesso' ? '#2f6f5e' : '#e53e3e';
    const el = document.createElement('div');
    el.setAttribute('role', tipo === 'sucesso' ? 'status' : 'alert');
    el.textContent = mensagem;
    el.style.cssText =
      'position:fixed;right:20px;bottom:20px;z-index:9999;max-width:320px;' +
      'padding:12px 16px;border-radius:8px;color:#fff;font-size:14px;' +
      'box-shadow:0 4px 14px rgba(0,0,0,.2);background:' + cor;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  function pronto(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  window.MeuBolso = {
    CONFIG,
    urls: CONFIG.urls,
    api,
    listar,
    formatarMoeda,
    formatarData,
    mesDe,
    nomeMes,
    hojeISO,
    escapar,
    categoriaId,
    mapaCategorias,
    nomeCategoria,
    ehReceita,
    somar,
    maisRecentesPrimeiro,
    toast,
    pronto,
  };
})();

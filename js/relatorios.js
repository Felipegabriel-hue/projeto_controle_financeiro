/* Página Relatórios: pizza por categoria, barras por mês, exportação CSV e PDF. */
MeuBolso.pronto(async function () {
  const M = MeuBolso;

  const pizza = document.getElementById('grafico-pizza');
  const legenda = document.getElementById('legenda-categorias');
  const barras = document.getElementById('grafico-meses');

  const CORES = ['#2f6f5e', '#d9822b', '#4a6fa5', '#b5485d', '#7b6cb0', '#c9a227', '#3f9aa8', '#8a8f98'];
  const ALTURA_MAX_BARRA = 100; // px (o .bar-chart do CSS tem 180px de altura)
  const MAX_MESES = 12;

  let categorias;
  let gastos;
  try {
    const resultados = await Promise.all([M.listar(M.urls.categorias), M.listar(M.urls.gastos)]);
    categorias = resultados[0];
    gastos = resultados[1];
  } catch (e) {
    legenda.innerHTML = '<li>' + M.escapar(e.message) + '</li>';
    barras.innerHTML = '<p class="empty-state">' + M.escapar(e.message) + '</p>';
    return;
  }

  const mapa = M.mapaCategorias(categorias);
  const despesas = gastos.filter((g) => !M.ehReceita(g));

  desenharPizza();
  desenharBarras();
  ligarExportacao();

  /* ---------- Pizza ---------- */

  function desenharPizza() {
    const totais = new Map();
    despesas.forEach((g) => {
      const nome = M.nomeCategoria(g, mapa);
      totais.set(nome, (totais.get(nome) || 0) + Number(g.valor || 0));
    });

    const dados = Array.from(totais, (par) => ({ nome: par[0], valor: par[1] })).sort(
      (a, b) => b.valor - a.valor
    );
    const total = dados.reduce((t, d) => t + d.valor, 0);

    if (!dados.length || total <= 0) {
      pizza.style.background = '';
      legenda.innerHTML = '<li>Nenhum gasto cadastrado ainda.</li>';
      return;
    }

    let acumulado = 0;
    const fatias = dados.map((d, i) => {
      const inicio = acumulado;
      acumulado += (d.valor / total) * 100;
      return CORES[i % CORES.length] + ' ' + inicio.toFixed(2) + '% ' + acumulado.toFixed(2) + '%';
    });
    pizza.style.background = 'conic-gradient(' + fatias.join(', ') + ')';
    pizza.setAttribute('role', 'img');
    pizza.setAttribute(
      'aria-label',
      'Gastos por categoria: ' +
        dados.map((d) => d.nome + ' ' + ((d.valor / total) * 100).toFixed(0) + '%').join(', ')
    );

    legenda.innerHTML = dados
      .map(
        (d, i) =>
          '<li><span class="dot" style="background:' + CORES[i % CORES.length] + '"></span>' +
          M.escapar(d.nome) +
          '<span class="val">' + M.formatarMoeda(d.valor) +
          ' (' + ((d.valor / total) * 100).toFixed(1).replace('.', ',') + '%)</span></li>'
      )
      .join('');
  }

  /* ---------- Barras por mês ---------- */

  function desenharBarras() {
    const porMes = new Map();
    despesas.forEach((g) => {
      const mes = M.mesDe(g.data);
      if (!mes) return;
      porMes.set(mes, (porMes.get(mes) || 0) + Number(g.valor || 0));
    });

    const meses = Array.from(porMes.keys()).sort().slice(-MAX_MESES);
    if (!meses.length) {
      barras.innerHTML = '<p class="empty-state">Nenhum gasto cadastrado ainda.</p>';
      return;
    }

    const maior = Math.max.apply(null, meses.map((m) => porMes.get(m)));
    barras.innerHTML = meses
      .map((mes) => {
        const valor = porMes.get(mes);
        const altura = Math.max(2, Math.round((valor / maior) * ALTURA_MAX_BARRA));
        return (
          '<div class="col">' +
          '<span style="font-size:11px;white-space:nowrap">' + M.formatarMoeda(valor) + '</span>' +
          '<div class="bar" title="' + M.escapar(M.nomeMes(mes)) + ': ' + M.formatarMoeda(valor) + '" ' +
          'style="height:' + altura + 'px"></div>' +
          '<span>' + M.nomeMes(mes) + '</span>' +
          '</div>'
        );
      })
      .join('');
  }

  /* ---------- Exportação ---------- */

  function acharBotao(id, texto) {
    return (
      document.getElementById(id) ||
      Array.from(document.querySelectorAll('.page-head button')).find((b) =>
        b.textContent.toLowerCase().includes(texto)
      )
    );
  }

  function celulaCsv(valor) {
    let texto = String(valor == null ? '' : valor);
    // Evita que o Excel interprete o texto como fórmula.
    if (/^[=+\-@]/.test(texto)) texto = "'" + texto;
    return '"' + texto.replace(/"/g, '""') + '"';
  }

  function exportarCsv() {
    if (!gastos.length) return M.toast('Não há lançamentos para exportar.');

    const linhas = [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']];
    M.maisRecentesPrimeiro(gastos).forEach((g) => {
      linhas.push([
        M.formatarData(g.data),
        M.ehReceita(g) ? 'Receita' : 'Despesa',
        M.nomeCategoria(g, mapa),
        g.descricao,
        Number(g.valor || 0).toFixed(2).replace('.', ','),
      ]);
    });

    const csv = '\ufeff' + linhas.map((l) => l.map(celulaCsv).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meu-bolso-gastos-' + M.hojeISO() + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function ligarExportacao() {
    const botaoCsv = acharBotao('btn-exportar-csv', 'csv');
    const botaoPdf = acharBotao('btn-exportar-pdf', 'pdf');
    if (botaoCsv) botaoCsv.addEventListener('click', exportarCsv);
    // O PDF usa a impressão do navegador ("Salvar como PDF").
    if (botaoPdf) botaoPdf.addEventListener('click', () => window.print());
  }
});

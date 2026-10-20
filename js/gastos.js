/* Página Gastos: cadastro, histórico com filtros por categoria e mês, exclusão. */
MeuBolso.pronto(function () {
  const M = MeuBolso;

  const form = document.getElementById('form-gasto');
  const campoValor = document.getElementById('valor');
  const campoData = document.getElementById('data');
  const campoCategoria = document.getElementById('categoria');
  const campoDescricao = document.getElementById('descricao');
  const filtroCategoria = document.getElementById('filtro_categoria');
  const filtroMes = document.getElementById('filtro_mes');
  const tbody = document.getElementById('lista-gastos');
  const botao = form.querySelector('button[type="submit"]');

  let categorias = [];
  let gastos = [];

  campoData.value = M.hojeISO();

  function mensagemLinha(texto) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">' + M.escapar(texto) + '</td></tr>';
  }

  function preencherSelect(select, textoInicial, itens) {
    const atual = select.value;
    select.innerHTML =
      '<option value="">' + M.escapar(textoInicial) + '</option>' +
      itens
        .map((i) => '<option value="' + M.escapar(i.valor) + '">' + M.escapar(i.rotulo) + '</option>')
        .join('');
    select.value = itens.some((i) => String(i.valor) === atual) ? atual : '';
  }

  function preencherFiltros() {
    const itensCategoria = categorias.map((c) => ({ valor: c.id, rotulo: c.nome }));
    preencherSelect(campoCategoria, 'Selecione uma categoria', itensCategoria);
    preencherSelect(filtroCategoria, 'Todas as categorias', itensCategoria);

    const meses = Array.from(new Set(gastos.map((g) => M.mesDe(g.data)).filter(Boolean)))
      .sort()
      .reverse();
    preencherSelect(
      filtroMes,
      'Todos os meses',
      meses.map((m) => ({ valor: m, rotulo: M.nomeMes(m) }))
    );
  }

  function desenhar() {
    const mapa = M.mapaCategorias(categorias);
    const filtrados = M.maisRecentesPrimeiro(
      gastos.filter(
        (g) =>
          (!filtroCategoria.value || String(M.categoriaId(g)) === filtroCategoria.value) &&
          (!filtroMes.value || M.mesDe(g.data) === filtroMes.value)
      )
    );

    if (!filtrados.length) {
      mensagemLinha(gastos.length ? 'Nenhum gasto neste filtro.' : 'Nenhum gasto cadastrado ainda.');
      return;
    }

    tbody.innerHTML = filtrados
      .map((g) => {
        const receita = M.ehReceita(g);
        return (
          '<tr>' +
          '<td>' + M.formatarData(g.data) + '</td>' +
          '<td>' + M.escapar(M.nomeCategoria(g, mapa)) + '</td>' +
          '<td>' + M.escapar(g.descricao) + '</td>' +
          '<td class="num"' + (receita ? ' style="color:var(--success)"' : '') + '>' +
          (receita ? '+ ' : '') + M.formatarMoeda(g.valor) + '</td>' +
          '<td>' + (g.status ? '<span class="tag">' + M.escapar(g.status) + '</span>' : '—') + '</td>' +
          '<td class="actions"><button type="button" class="btn btn-danger btn-sm" data-excluir="' + Number(g.id) + '">Excluir</button></td>' +
          '</tr>'
        );
      })
      .join('');
  }

  async function carregar() {
    try {
      const resultados = await Promise.all([M.listar(M.urls.categorias), M.listar(M.urls.gastos)]);
      categorias = resultados[0];
      gastos = resultados[1];
    } catch (e) {
      mensagemLinha(e.message);
      return;
    }
    preencherFiltros();
    desenhar();
  }

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const valor = Number(campoValor.value);
    const descricao = campoDescricao.value.trim();

    if (!(valor > 0)) return M.toast('Informe um valor maior que zero.');
    if (!campoData.value) return M.toast('Informe a data.');
    if (!campoCategoria.value) return M.toast('Escolha uma categoria.');
    if (!descricao) return M.toast('Informe uma descrição.');

    botao.disabled = true;
    try {
      await M.api(M.urls.gastos, {
        method: 'POST',
        body: {
          valor: valor,
          data: campoData.value,
          categoria: Number(campoCategoria.value),
          descricao: descricao,
        },
      });
      campoValor.value = '';
      campoDescricao.value = '';
      campoValor.focus();
      M.toast('Gasto salvo.', 'sucesso');
      await carregar();
    } catch (e) {
      M.toast(e.message);
    } finally {
      botao.disabled = false;
    }
  });

  tbody.addEventListener('click', async function (evento) {
    const alvo = evento.target.closest('[data-excluir]');
    if (!alvo) return;
    if (!confirm('Excluir este lançamento?')) return;

    alvo.disabled = true;
    try {
      await M.api(M.urls.gastos + alvo.dataset.excluir + '/', { method: 'DELETE' });
      M.toast('Lançamento excluído.', 'sucesso');
      await carregar();
    } catch (e) {
      alvo.disabled = false;
      M.toast(e.message);
    }
  });

  filtroCategoria.addEventListener('change', desenhar);
  filtroMes.addEventListener('change', desenhar);

  carregar();
});

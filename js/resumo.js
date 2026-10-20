/* Página Resumo: totais do mês, alertas e últimos lançamentos. */
MeuBolso.pronto(async function () {
  const M = MeuBolso;

  const elSaldo = document.getElementById('saldo-mes');
  const elReceitas = document.getElementById('total-receitas');
  const elDespesas = document.getElementById('total-despesas');
  const elQuantidade = document.getElementById('quantidade-lancamentos');
  const elAlerta = document.getElementById('alerta-resumo');
  const tbody = document.getElementById('lista-ultimos-gastos');

  // O aviso começa escondido para não piscar enquanto os dados carregam.
  const cardAlerta = elAlerta.closest('.card') || elAlerta;
  cardAlerta.style.display = 'none';

  function mensagemTabela(texto) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">' + M.escapar(texto) + '</td></tr>';
  }

  function mostrarAlerta(mensagens, grave) {
    if (!mensagens.length) {
      cardAlerta.style.display = 'none';
      return;
    }
    elAlerta.classList.toggle('danger', !!grave);
    elAlerta.classList.toggle('warn', !grave);
    elAlerta.innerHTML = '<strong>Atenção!</strong> ' + mensagens.map(M.escapar).join(' ');
    cardAlerta.style.display = '';
  }

  let categorias;
  let gastos;
  try {
    const resultados = await Promise.all([M.listar(M.urls.categorias), M.listar(M.urls.gastos)]);
    categorias = resultados[0];
    gastos = resultados[1];
  } catch (e) {
    mensagemTabela(e.message);
    return;
  }

  const mesAtual = M.mesDe(M.hojeISO());
  const doMes = gastos.filter((g) => M.mesDe(g.data) === mesAtual);
  const receitas = M.somar(doMes.filter(M.ehReceita));
  const despesasDoMes = doMes.filter((g) => !M.ehReceita(g));
  const despesas = M.somar(despesasDoMes);
  const saldo = receitas - despesas;

  elReceitas.textContent = M.formatarMoeda(receitas);
  elDespesas.textContent = M.formatarMoeda(despesas);
  elSaldo.textContent = M.formatarMoeda(saldo);
  const carimbo = elSaldo.closest('.stamp');
  if (carimbo) carimbo.classList.toggle('negativo', saldo < 0);
  elQuantidade.textContent = String(doMes.length);

  // Alertas
  const avisos = [];
  if (!doMes.length) {
    avisos.push('Você ainda não cadastrou nenhum gasto neste mês.');
  } else {
    const gastoPorCategoria = new Map();
    despesasDoMes.forEach((g) => {
      const chave = String(M.categoriaId(g));
      gastoPorCategoria.set(chave, (gastoPorCategoria.get(chave) || 0) + Number(g.valor || 0));
    });

    const estouradas = [];
    const proximas = [];
    categorias.forEach((c) => {
      const limite = c.limite == null || c.limite === '' ? 0 : Number(c.limite);
      if (!(limite > 0)) return;
      const usado = gastoPorCategoria.get(String(c.id)) || 0;
      if (usado > limite) estouradas.push(c.nome);
      else if (usado >= limite * 0.8) proximas.push(c.nome);
    });

    if (estouradas.length) avisos.push('Limite mensal excedido em: ' + estouradas.join(', ') + '.');
    if (proximas.length) avisos.push('Perto do limite (80% ou mais): ' + proximas.join(', ') + '.');
    if (receitas > 0 && saldo < 0) avisos.push('Suas despesas superam as receitas do mês.');
  }
  mostrarAlerta(avisos, avisos.some((a) => /excedido|superam/.test(a)));

  // Últimos lançamentos
  const recentes = M.maisRecentesPrimeiro(gastos).slice(0, 5);
  if (!recentes.length) {
    mensagemTabela('Nenhum gasto cadastrado ainda.');
    return;
  }
  const mapa = M.mapaCategorias(categorias);
  tbody.innerHTML = recentes
    .map(
      (g) =>
        '<tr>' +
        '<td>' + M.formatarData(g.data) + '</td>' +
        '<td>' + M.escapar(M.nomeCategoria(g, mapa)) + '</td>' +
        '<td>' + M.escapar(g.descricao) + '</td>' +
        '<td class="num"' + (M.ehReceita(g) ? ' style="color:var(--success)"' : '') + '>' +
        (M.ehReceita(g) ? '+ ' : '') + M.formatarMoeda(g.valor) + '</td>' +
        '</tr>'
    )
    .join('');
});

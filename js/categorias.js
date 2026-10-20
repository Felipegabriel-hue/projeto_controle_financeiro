/* Página Categorias: lista, cria e exclui categorias, com o progresso do limite no mês. */
MeuBolso.pronto(function () {
  const M = MeuBolso;

  const form = document.getElementById('form-categoria');
  const campoNome = document.getElementById('nome_categoria');
  const campoLimite = document.getElementById('limite_categoria');
  const lista = document.getElementById('lista-categorias');
  const botao = form.querySelector('button[type="submit"]');

  async function carregar() {
    try {
      const [categorias, gastos] = await Promise.all([
        M.listar(M.urls.categorias),
        M.listar(M.urls.gastos),
      ]);
      desenhar(categorias, gastos);
    } catch (e) {
      lista.innerHTML = '<p class="empty-state">' + M.escapar(e.message) + '</p>';
    }
  }

  function desenhar(categorias, gastos) {
    if (!categorias.length) {
      lista.innerHTML = '<p class="empty-state">Nenhuma categoria cadastrada ainda.</p>';
      return;
    }

    // Soma das despesas do mês atual por categoria.
    const mesAtual = M.mesDe(M.hojeISO());
    const gastoPorCategoria = new Map();
    gastos
      .filter((g) => !M.ehReceita(g) && M.mesDe(g.data) === mesAtual)
      .forEach((g) => {
        const chave = String(M.categoriaId(g));
        gastoPorCategoria.set(chave, (gastoPorCategoria.get(chave) || 0) + Number(g.valor || 0));
      });

    lista.innerHTML = categorias
      .map((c) => {
        const gasto = gastoPorCategoria.get(String(c.id)) || 0;
        const limite = c.limite == null || c.limite === '' ? null : Number(c.limite);
        const temLimite = limite !== null && limite > 0;
        const estourou = temLimite && gasto > limite;

        let detalhe = 'Gasto no mês: ' + M.formatarMoeda(gasto);
        let barra = '';
        if (temLimite) {
          const pct = Math.min(100, (gasto / limite) * 100);
          const classe = estourou ? ' over' : pct >= 80 ? ' warn' : '';
          detalhe += ' · Limite: ' + M.formatarMoeda(limite);
          barra =
            '<div class="progress-bar' + classe + '" style="margin-top:10px" role="progressbar" ' +
            'aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(pct) + '">' +
            '<div style="width:' + pct.toFixed(1) + '%"></div></div>' +
            (estourou
              ? '<p style="margin:6px 0 0;font-size:12px;color:var(--danger)">Limite excedido</p>'
              : '');
        } else {
          detalhe += ' · Sem limite';
        }

        return (
          '<div class="card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px">' +
          '<h3 style="margin:0;font-size:16px">' + M.escapar(c.nome) + '</h3>' +
          '<button type="button" class="btn btn-danger btn-sm" data-excluir="' + Number(c.id) + '">Excluir</button>' +
          '</div>' +
          '<p style="margin:8px 0 0;font-size:13px;opacity:.75">' + detalhe + '</p>' +
          barra +
          '</div>'
        );
      })
      .join('');
  }

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    if (!nome) {
      M.toast('Informe o nome da categoria.');
      return;
    }
    const limite = campoLimite.value === '' ? null : Number(campoLimite.value);
    if (limite !== null && (Number.isNaN(limite) || limite < 0)) {
      M.toast('O limite precisa ser um valor positivo.');
      return;
    }

    botao.disabled = true;
    try {
      await M.api(M.urls.categorias, { method: 'POST', body: { nome: nome, limite: limite } });
      form.reset();
      M.toast('Categoria adicionada.', 'sucesso');
      await carregar();
    } catch (e) {
      M.toast(e.message);
    } finally {
      botao.disabled = false;
    }
  });

  lista.addEventListener('click', async function (evento) {
    const alvo = evento.target.closest('[data-excluir]');
    if (!alvo) return;
    if (!confirm('Excluir esta categoria? Os gastos ligados a ela podem ser afetados.')) return;

    alvo.disabled = true;
    try {
      await M.api(M.urls.categorias + alvo.dataset.excluir + '/', { method: 'DELETE' });
      M.toast('Categoria excluída.', 'sucesso');
      await carregar();
    } catch (e) {
      alvo.disabled = false;
      M.toast(e.message);
    }
  });

  carregar();
});

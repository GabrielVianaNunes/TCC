/**
 * dashboard-clientes.js — Dashboard de Receita por Cliente
 * Endpoint: GET /clientes/dashboard/dados
 * Response: [{clienteId, nome, ano, mes, receita, qtdOs}]
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }
  function monthNameLong(mes) {
    const lang = window.I18n?.lang() || 'pt-BR';
    return new Date(2000, mes - 1, 1).toLocaleString(lang, { month: 'long' });
  }
  const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

  let rawData = [];
  let modo = 'mes';
  let selectedYear = new Date().getFullYear();
  let selectedMonth = new Date().getMonth() + 1;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function fmtBRL(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  // ─── Seletores ────────────────────────────────────────────────────────────
  function buildYearSelector(years) {
    const sel = document.getElementById('filtroAno');
    if (!sel) return;
    sel.innerHTML = '';
    years.forEach(yr => {
      const opt = document.createElement('option');
      opt.value = yr;
      opt.textContent = yr;
      if (yr === selectedYear) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      selectedYear = parseInt(sel.value, 10);
      render();
    });
  }

  function buildMonthSelector() {
    const sel = document.getElementById('filtroMes');
    if (!sel) return;
    sel.innerHTML = '';
    ALL_MONTHS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = monthNameLong(m);
      if (m === selectedMonth) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      selectedMonth = parseInt(sel.value, 10);
      render();
    });
  }

  function bindModoToggle() {
    document.querySelectorAll('input[name="modoVisao"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const checked = document.querySelector('input[name="modoVisao"]:checked');
        modo = checked ? checked.value : 'mes';
        const wrap = document.getElementById('filtroMesWrap');
        if (wrap) wrap.style.display = modo === 'mes' ? '' : 'none';
        render();
      });
    });
  }

  // ─── Agregação ────────────────────────────────────────────────────────────
  function getPeriodoData() {
    const doAno = rawData.filter(d => d.ano === selectedYear);
    const doPeriodo = modo === 'mes' ? doAno.filter(d => d.mes === selectedMonth) : doAno;

    const porCliente = new Map();
    doPeriodo.forEach(d => {
      const atual = porCliente.get(d.clienteId) || { clienteId: d.clienteId, nome: d.nome, receita: 0, qtdOs: 0 };
      atual.receita += d.receita;
      atual.qtdOs += d.qtdOs;
      porCliente.set(d.clienteId, atual);
    });
    return [...porCliente.values()].sort((a, b) => b.receita - a.receita);
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  function renderKPIs(clientes) {
    const totalReceita = clientes.reduce((s, c) => s + c.receita, 0);
    const totalOS = clientes.reduce((s, c) => s + c.qtdOs, 0);
    const lider = clientes[0];
    const ticket = totalOS > 0 ? totalReceita / totalOS : 0;

    document.getElementById('kpiReceitaTotal').textContent = fmtBRL(totalReceita);
    document.getElementById('kpiTotalOS').textContent = totalOS;
    document.getElementById('kpiClienteLider').textContent = lider ? lider.nome : '—';
    const det = document.getElementById('kpiClienteLiderDetail');
    if (det) det.textContent = lider ? fmtBRL(lider.receita) : '';
    document.getElementById('kpiTicketMedio').textContent = fmtBRL(ticket);
  }

  // ─── Gráfico de barras horizontais (D3) ──────────────────────────────────
  function renderChart(clientes) {
    const container = document.getElementById('chartRankingClientes');
    if (!container) return;
    container.innerHTML = '';

    if (!clientes.length) {
      EmptyState.render(container, { message: _t('Nenhuma venda finalizada no período selecionado.') });
      return;
    }

    const top = clientes.slice(0, 10);
    const W = container.clientWidth || 600;
    const rowH = 34;
    const H = top.length * rowH + 20;
    const mg = { top: 10, right: 70, bottom: 10, left: 160 };
    const w = Math.max(W - mg.left - mg.right, 100);
    const h = H - mg.top - mg.bottom;

    const svg = d3.select(container).append('svg').attr('width', W).attr('height', H).attr('role', 'img');
    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

    const y = d3.scaleBand().domain(top.map(d => d.nome)).range([0, h]).padding(0.25);
    const x = d3.scaleLinear().domain([0, d3.max(top, d => d.receita) * 1.15]).nice().range([0, w]);

    const barColor = cssVar('--color-primary') || '#0033A0';
    const textColor = cssVar('--text-muted') || '#64748b';
    const labelColor = cssVar('--text-secondary') || '#475569';

    g.selectAll('.bar').data(top).enter().append('rect')
      .attr('class', 'bar').attr('y', d => y(d.nome)).attr('height', y.bandwidth())
      .attr('x', 0).attr('width', 0).attr('rx', 3).attr('fill', barColor)
      .transition().duration(600).delay((_, i) => i * 50)
      .attr('width', d => x(d.receita));

    g.selectAll('.bar-value').data(top).enter().append('text')
      .attr('class', 'bar-value').attr('x', d => x(d.receita) + 6)
      .attr('y', d => y(d.nome) + y.bandwidth() / 2).attr('dy', '0.35em')
      .attr('font-size', '11px').attr('fill', labelColor).attr('opacity', 0)
      .text(d => fmtBRL(d.receita))
      .transition().duration(600).delay((_, i) => i * 50 + 200).attr('opacity', 1);

    g.append('g').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();
    g.selectAll('.tick text').attr('fill', textColor).attr('font-size', '11px');
  }

  // ─── Tabela ───────────────────────────────────────────────────────────────
  function renderTable(clientes) {
    const tbody = document.getElementById('tabelaClientesRanking');
    const tfoot = document.getElementById('tabelaClientesTotal');
    if (!tbody) return;

    const totalReceita = clientes.reduce((s, c) => s + c.receita, 0);

    if (!clientes.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding:2rem">${_t('Nenhuma venda finalizada no período selecionado.')}</td></tr>`;
      if (tfoot) tfoot.style.display = 'none';
      return;
    }

    tbody.innerHTML = clientes.map(c => {
      const pct = totalReceita > 0 ? ((c.receita / totalReceita) * 100).toFixed(1) : '0.0';
      return `
        <tr>
          <td><strong>${escapeHtml(c.nome)}</strong></td>
          <td style="text-align:right">${fmtBRL(c.receita)}</td>
          <td style="text-align:right">${c.qtdOs}</td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <div style="flex:1;height:6px;border-radius:3px;background:var(--border-color);overflow:hidden">
                <div style="height:100%;width:${pct}%;background:var(--color-primary);border-radius:3px;transition:width .4s"></div>
              </div>
              <span style="font-size:0.75rem;color:var(--text-muted);min-width:36px;text-align:right">${pct}%</span>
            </div>
          </td>
        </tr>`;
    }).join('');

    if (tfoot) {
      tfoot.style.display = '';
      const osEl = document.getElementById('totalOSClientesFoot');
      const valEl = document.getElementById('totalReceitaClientesFoot');
      if (osEl) osEl.textContent = clientes.reduce((s, c) => s + c.qtdOs, 0);
      if (valEl) valEl.textContent = fmtBRL(totalReceita);
    }
  }

  // ─── Render principal ─────────────────────────────────────────────────────
  function render() {
    const clientes = getPeriodoData();
    renderKPIs(clientes);
    renderChart(clientes);
    renderTable(clientes);
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  async function init() {
    try {
      const data = await Api.get('/clientes/dashboard/dados');
      rawData = Array.isArray(data) ? data : [];

      const years = [...new Set(rawData.map(d => d.ano))].sort((a, b) => b - a);
      if (years.length === 0) years.push(new Date().getFullYear());
      if (!years.includes(selectedYear)) selectedYear = years[0];

      buildYearSelector(years);
      buildMonthSelector();
      bindModoToggle();
      render();
    } catch (err) {
      console.error('dashboard-clientes:', err);
      Toast.show({ type: 'error', message: _t('Erro ao carregar dashboard de clientes.') });
      ['kpiReceitaTotal', 'kpiTotalOS', 'kpiClienteLider', 'kpiTicketMedio'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });
      const chart = document.getElementById('chartRankingClientes');
      if (chart) EmptyState.render(chart, { message: _t('Não foi possível carregar os dados.') });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', () => { if (rawData.length) render(); });
})();

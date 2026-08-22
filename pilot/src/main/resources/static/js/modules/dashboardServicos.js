/**
 * dashboardServicos.js — Relatório de Serviços (OS)
 * Endpoint: GET /servicos/relatorio-servicos/api
 * Response: [{ano, mes, valorTotal, quantidadeServicos}]
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }
  function monthNames() {
    const lang = window.I18n?.lang() || 'pt-BR';
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleString(lang, { month: 'short' })
    );
  }
  function monthNameLong(mes) {
    const lang = window.I18n?.lang() || 'pt-BR';
    return new Date(2000, mes - 1, 1).toLocaleString(lang, { month: 'long' });
  }
  const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

  let rawData = [];
  let selectedYear = new Date().getFullYear();

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function fmtBRL(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  }

  // ─── Year selector ────────────────────────────────────────────────────────
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

  // ─── Data normalization ───────────────────────────────────────────────────
  function getYearData(year) {
    const filtered = rawData.filter(d => d.ano === year);
    return ALL_MONTHS.map(m => {
      const found = filtered.find(d => d.mes === m);
      return { mes: m, label: monthNames()[m - 1], valorTotal: found ? (found.valorTotal || 0) : 0, quantidadeServicos: found ? (found.quantidadeServicos || 0) : 0 };
    });
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  function renderKPIs(months) {
    const totalOS = months.reduce((s, d) => s + d.quantidadeServicos, 0);
    const totalVal = months.reduce((s, d) => s + d.valorTotal, 0);
    const activeMths = months.filter(d => d.quantidadeServicos > 0).length || 1;
    const mediaOS = (totalOS / activeMths).toFixed(1);
    const bestMonth = months.reduce((best, d) => d.quantidadeServicos > best.quantidadeServicos ? d : best, months[0]);

    document.getElementById('kpiTotalOS').textContent = totalOS;
    document.getElementById('kpiReceitaTotal').textContent = fmtBRL(totalVal);
    document.getElementById('kpiMediaMensal').textContent = mediaOS;
    document.getElementById('kpiMelhorMes').textContent = monthNameLong(bestMonth.mes);
    const det = document.getElementById('kpiMelhorMesDetail');
    if (det) det.textContent = bestMonth.quantidadeServicos > 0 ? `${bestMonth.quantidadeServicos} OS · ${fmtBRL(bestMonth.valorTotal)}` : 'Sem dados';
  }

  // ─── D3 Bar Chart (generic) ───────────────────────────────────────────────
  function renderBar(containerId, months, accessor, tickFormat) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const totalVal = months.reduce((s, d) => s + accessor(d), 0);
    if (totalVal === 0) {
      EmptyState.render(container, { message: _t('Nenhum dado para o período selecionado.') });
      return;
    }

    const W = container.clientWidth || 380;
    const H = 240;
    const mg = { top: 16, right: 16, bottom: 36, left: 60 };
    const w = W - mg.left - mg.right;
    const h = H - mg.top - mg.bottom;

    const svg = d3.select(container).append('svg').attr('width', W).attr('height', H).attr('role', 'img');
    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

    const x = d3.scaleBand().domain(months.map(d => d.label)).range([0, w]).padding(0.28);
    const y = d3.scaleLinear().domain([0, d3.max(months, accessor) * 1.15]).nice().range([h, 0]);

    const gridColor = cssVar('--border-color') || '#e2e8f0';
    const barColor = cssVar('--color-primary') || '#0033A0';
    const textColor = cssVar('--text-muted') || '#64748b';
    const labelColor = cssVar('--text-secondary') || '#475569';

    // Grid
    g.selectAll('.grid-line').data(y.ticks(5)).enter().append('line')
      .attr('class', 'grid-line').attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', gridColor).attr('stroke-dasharray', '3,3').attr('stroke-width', 1);

    // Bars
    g.selectAll('.bar').data(months).enter().append('rect')
      .attr('class', 'bar').attr('x', d => x(d.label)).attr('width', x.bandwidth())
      .attr('y', h).attr('height', 0).attr('rx', 3).attr('fill', barColor)
      .transition().duration(600).delay((_, i) => i * 40)
      .attr('y', d => y(accessor(d))).attr('height', d => h - y(accessor(d)));

    // Value labels
    g.selectAll('.bar-label').data(months).enter().append('text')
      .attr('class', 'bar-label').attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', labelColor)
      .attr('opacity', 0)
      .attr('y', d => y(accessor(d)) - 5)
      .text(d => accessor(d) > 0 ? tickFormat(accessor(d)) : '')
      .transition().duration(600).delay((_, i) => i * 40 + 200).attr('opacity', 1);

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0)).select('.domain').remove();
    g.selectAll('.tick text').attr('fill', textColor).attr('font-size', '11px');
    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(tickFormat)).select('.domain').remove();
    g.selectAll('.tick line').remove();
    g.selectAll('.tick text').attr('fill', textColor).attr('font-size', '10px');
  }

  // ─── Table ────────────────────────────────────────────────────────────────
  function renderTable(months) {
    const tbody = document.getElementById('tabelaMensal');
    const tfoot = document.getElementById('tabelaTotal');
    const anoLabel = document.getElementById('tabelaAnoLabel');
    if (!tbody) return;

    const totalOS = months.reduce((s, d) => s + d.quantidadeServicos, 0);
    const totalVal = months.reduce((s, d) => s + d.valorTotal, 0);
    if (anoLabel) anoLabel.textContent = `Ano ${selectedYear}`;

    tbody.innerHTML = '';
    months.forEach(d => {
      const pct = totalVal > 0 ? ((d.valorTotal / totalVal) * 100).toFixed(1) : '0.0';
      const ticket = d.quantidadeServicos > 0 ? fmtBRL(d.valorTotal / d.quantidadeServicos) : '—';
      const active = d.quantidadeServicos > 0;
      tbody.insertAdjacentHTML('beforeend', `
        <tr${active ? '' : ' style="opacity:0.45"'}>
          <td><strong>${d.label}</strong></td>
          <td style="text-align:right">${d.quantidadeServicos}</td>
          <td style="text-align:right">${fmtBRL(d.valorTotal)}</td>
          <td style="text-align:right">${ticket}</td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <div style="flex:1;height:6px;border-radius:3px;background:var(--border-color);overflow:hidden">
                <div style="height:100%;width:${pct}%;background:var(--color-primary);border-radius:3px;transition:width .4s"></div>
              </div>
              <span style="font-size:0.75rem;color:var(--text-muted);min-width:36px;text-align:right">${pct}%</span>
            </div>
          </td>
        </tr>`);
    });

    if (tfoot) {
      tfoot.style.display = '';
      const osEl = document.getElementById('totalOSTbFoot');
      const valEl = document.getElementById('totalValorTbFoot');
      if (osEl) osEl.textContent = totalOS;
      if (valEl) valEl.textContent = fmtBRL(totalVal);
    }
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  function render() {
    const months = getYearData(selectedYear);
    renderKPIs(months);
    renderBar('chartValorMensal', months, d => d.valorTotal, v => {
      if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
      return Math.round(v).toString();
    });
    renderBar('chartQuantidadeMensal', months, d => d.quantidadeServicos, v => v.toString());
    renderTable(months);
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  async function init() {
    try {
      const data = await Api.get('/servicos/relatorio-servicos/api');
      rawData = Array.isArray(data) ? data : [];

      const years = [...new Set(rawData.map(d => d.ano))].sort((a, b) => b - a);
      if (years.length === 0) years.push(new Date().getFullYear());
      if (!years.includes(selectedYear)) selectedYear = years[0];

      buildYearSelector(years);
      render();
    } catch (err) {
      console.error('dashboardServicos:', err);
      Toast.show({ type: 'error', message: _t('Erro ao carregar relatório de serviços.') });
      ['kpiTotalOS', 'kpiReceitaTotal', 'kpiMediaMensal', 'kpiMelhorMes'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });
      ['chartValorMensal', 'chartQuantidadeMensal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) EmptyState.render(el, { message: _t('Não foi possível carregar os dados.') });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', () => { if (rawData.length) render(); });
})();

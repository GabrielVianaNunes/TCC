/**
 * dashboardEventos.js — Dashboard de Eventos
 * Endpoint: GET /eventos/relatorios
 * Response: { totalEventos, adesaoMedia, distribuicaoMensal: { JANUARY: n, FEBRUARY: n, ... } }
 */
(function () {
  'use strict';

  const _t = ptBR => window.I18n?.t(ptBR) ?? ptBR;

  // Java month key → display label (index order)
  const MONTH_KEYS = [
    'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
    'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'
  ];
  function buildMonthMap() {
    const lang = window.I18n?.lang() || 'pt-BR';
    return MONTH_KEYS.map((key, i) => ({
      key,
      label: new Date(2000, i, 1).toLocaleString(lang, { month: 'short' }),
      full:  new Date(2000, i, 1).toLocaleString(lang, { month: 'long' }),
    }));
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // ─── Build normalized months array ───────────────────────────────────────
  function buildMonths(distribuicaoMensal) {
    return buildMonthMap().map(m => ({
      key: m.key,
      label: m.label,
      full: m.full,
      count: (distribuicaoMensal && distribuicaoMensal[m.key]) ? distribuicaoMensal[m.key] : 0,
    }));
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  function renderKPIs(total, adesaoMedia, months) {
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setEl('kpiTotalEventos', total || 0);

    const adesao = typeof adesaoMedia === 'number' ? adesaoMedia.toFixed(1).replace('.', ',') + '%' : (adesaoMedia || '—');
    setEl('kpiAdesaoMedia', adesao);

    const best = months.reduce((b, d) => d.count > b.count ? d : b, months[0]);
    setEl('kpiMelhorMes', best.count > 0 ? best.full : '—');
    const det = document.getElementById('kpiMelhorMesDetalhe');
    if (det) det.textContent = best.count > 0 ? `${best.count} ${_t(best.count > 1 ? 'eventos' : 'evento')}` : _t('Sem dados');

    const activeMths = months.filter(d => d.count > 0).length;
    setEl('kpiMesesAtivos', activeMths);
  }

  // ─── D3 Bar Chart ─────────────────────────────────────────────────────────
  function renderChart(months) {
    const container = document.getElementById('chartEventosMensal');
    if (!container) return;
    container.innerHTML = '';

    const total = months.reduce((s, d) => s + d.count, 0);
    if (total === 0) {
      EmptyState.render(container, { message: _t('Nenhum evento registrado.') });
      return;
    }

    const W = container.clientWidth || 380;
    const H = 260;
    const mg = { top: 16, right: 16, bottom: 36, left: 36 };
    const w = W - mg.left - mg.right;
    const h = H - mg.top - mg.bottom;

    const svg = d3.select(container).append('svg').attr('width', W).attr('height', H).attr('role', 'img');
    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`);

    const x = d3.scaleBand().domain(months.map(d => d.label)).range([0, w]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(months, d => d.count) * 1.2]).nice().range([h, 0]);

    const gridColor = cssVar('--border-color') || '#e2e8f0';
    const barColor  = cssVar('--color-primary') || '#0033A0';
    const textColor = cssVar('--text-muted') || '#64748b';
    const labelColor = cssVar('--text-secondary') || '#475569';

    // Grid
    g.selectAll('.grid-line').data(y.ticks(5)).enter().append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', gridColor).attr('stroke-dasharray', '3,3').attr('stroke-width', 1);

    // Bars
    g.selectAll('.bar').data(months).enter().append('rect')
      .attr('x', d => x(d.label)).attr('width', x.bandwidth())
      .attr('y', h).attr('height', 0).attr('rx', 3).attr('fill', (d, i) => {
        // Slight accent variation for months with data
        return d.count > 0 ? barColor : (cssVar('--border-color') || '#e2e8f0');
      })
      .transition().duration(600).delay((_, i) => i * 40)
      .attr('y', d => y(d.count)).attr('height', d => h - y(d.count));

    // Value labels
    g.selectAll('.bar-label').data(months).enter().append('text')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', labelColor)
      .attr('opacity', 0).attr('y', d => y(d.count) - 5)
      .text(d => d.count > 0 ? d.count : '')
      .transition().duration(600).delay((_, i) => i * 40 + 200).attr('opacity', 1);

    // X axis
    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0))
      .select('.domain').remove();
    g.selectAll('.tick text').attr('fill', textColor).attr('font-size', '11px');

    // Y axis
    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')))
      .select('.domain').remove();
    g.selectAll('.tick line').remove();
    g.selectAll('.tick text').attr('fill', textColor).attr('font-size', '10px');
  }

  // ─── Distribution mini-bars ───────────────────────────────────────────────
  function renderDistribution(months) {
    const container = document.getElementById('tabelaDistribuicao');
    if (!container) return;
    container.innerHTML = '';

    const total = months.reduce((s, d) => s + d.count, 0);
    if (total === 0) {
      EmptyState.render(container, { message: _t('Nenhum dado de distribuição.') });
      return;
    }

    const items = months.filter(d => d.count > 0);
    const html = items.map(d => {
      const pct = ((d.count / total) * 100).toFixed(1);
      return `
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem">
          <span style="width:28px;font-size:0.75rem;color:var(--text-muted);text-align:right;flex-shrink:0">${d.label}</span>
          <div style="flex:1;height:8px;border-radius:4px;background:var(--border-color);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:var(--color-primary);border-radius:4px;transition:width .5s ease"></div>
          </div>
          <span style="min-width:42px;font-size:0.75rem;color:var(--text-muted);text-align:right">${d.count} (${pct}%)</span>
        </div>`;
    }).join('');

    container.innerHTML = `<div style="padding:0.25rem 0">${html}</div>`;
  }

  // ─── Table ────────────────────────────────────────────────────────────────
  function renderTable(months, total) {
    const tbody = document.getElementById('tabelaMensal');
    if (!tbody) return;
    tbody.innerHTML = '';

    months.forEach(d => {
      const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0.0';
      tbody.insertAdjacentHTML('beforeend', `
        <tr${d.count === 0 ? ' style="opacity:0.4"' : ''}>
          <td><strong>${d.label}</strong></td>
          <td style="text-align:right">
            <span class="badge badge--${d.count > 0 ? 'info' : 'neutral'}">${d.count}</span>
          </td>
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
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  async function init() {
    try {
      const data = await Api.get('/api/eventos/relatorios');
      const months = buildMonths(data.distribuicaoMensal);

      renderKPIs(data.totalEventos, data.adesaoMedia, months);
      renderChart(months);
      renderDistribution(months);
      renderTable(months, data.totalEventos || 0);
    } catch (err) {
      console.error('dashboardEventos:', err);
      Toast.show({ type: 'error', message: _t('Erro ao carregar dashboard de eventos.') });
      ['kpiTotalEventos', 'kpiAdesaoMedia', 'kpiMelhorMes', 'kpiMesesAtivos'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
      });
      const chartEl = document.getElementById('chartEventosMensal');
      if (chartEl) EmptyState.render(chartEl, { message: _t('Não foi possível carregar os dados.') });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', init);
})();

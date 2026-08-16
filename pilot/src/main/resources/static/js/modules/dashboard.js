/**
 * ZEISS-PILOT — DASHBOARD.JS
 * Executive dashboard: KPIs, charts, activity feeds
 */

'use strict';

const Dashboard = (() => {
  const _t = ptBR => window.I18n?.t(ptBR) ?? ptBR;
  const { Fmt, Dom }    = window.ZP || {};
  const { StatusBadge, Skeleton, Toast, EmptyState } = window;

  /* ── Set current date ── */
  function setDate() {
    const el = document.getElementById('dashboardDate');
    if (!el) return;
    const lang = window.I18n?.lang() || 'pt-BR';
    el.textContent = `${_t('Visão geral operacional')} · ${new Date().toLocaleDateString(lang, {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })}`;
  }

  /* ── KPI Cards ── */
  async function loadKPIs() {
    const grid = document.getElementById('kpiGrid');
    if (!grid) return;
    Skeleton.kpis(grid, 4);

    const kpis = [
      { id: 'os',       variant: 'primary', label: _t('Ordens de Serviço Abertas'), icon: 'file', endpoint: '/api/servicos',         params: { size: 1 } },
      { id: 'projetos', variant: 'accent',  label: _t('Projetos Ativos'),           icon: 'star', endpoint: '/api/projetos',         params: { size: 1 } },
      { id: 'visitas',  variant: 'warning', label: _t('Visitas Agendadas'),         icon: 'user', endpoint: '/api/visitas-tecnicas', params: { size: 1 } },
      { id: 'docs',     variant: 'success', label: _t('Documentos Ativos'),         icon: 'doc',  endpoint: '/api/documentos',       params: { size: 1 } },
    ];

    const fetches = kpis.map(k =>
      Api.get(k.endpoint, k.params).then(data => ({ ok: true, k, data })).catch(() => ({ ok: false, k }))
    );

    const results = await Promise.all(fetches);

    const ICONS = {
      file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
      star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`,
      user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
      doc:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13,2 13,9 20,9"/></svg>`
    };

    grid.innerHTML = results.map(({ ok, k, data }) => {
      const total = ok && data
        ? (Array.isArray(data) ? data.length : (data.totalElements ?? data.content?.length ?? 0))
        : '—';
      return `
        <div class="kpi-card kpi-${k.variant}">
          <div class="kpi-card__left">
            <div class="kpi-card__label">${k.label}</div>
            <div class="kpi-card__value">${total}</div>
          </div>
          <div class="kpi-card__icon-wrap">${ICONS[k.icon]}</div>
        </div>`;
    }).join('');
  }

  /* ── CSS var helper for D3 ── */
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
  }

  /* ── Chart: Serviços por Status ── */
  async function loadChartServicos() {
    const container = document.getElementById('chartServicos');
    if (!container || typeof d3 === 'undefined') return;

    let statusData;
    try {
      const data = await Api.get('/api/servicos', { size: 1000 });
      const items = data.content || data;
      if (!Array.isArray(items) || !items.length) throw new Error('empty');
      const counts = {};
      items.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
      statusData = Object.entries(counts).map(([label, value]) => ({ label, value }));
    } catch (err) {
      const msg = err.message === 'empty' ? _t('Nenhuma OS registrada ainda.') : _t('Erro ao carregar dados do gráfico.');
      container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:220px;gap:var(--space-3);color:var(--text-muted)"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18"/><path d="M9 21V9"/></svg><span style="font-size:var(--font-size-sm)">${msg}</span></div>`;
      return;
    }

    const COLOR_MAP = {
      'Elaboração de proposta': '#3B82F6',
      'Negociação':             '#F59E0B',
      'Venda finalizada':       '#22C55E',
      'Desistiu':               '#EF4444'
    };

    const w = container.clientWidth || 400;
    const h = 260;
    const m = { top: 20, right: 20, bottom: 40, left: 48 };

    d3.select(container).selectAll('*').remove();
    const svg = d3.select(container).append('svg')
      .attr('width', '100%').attr('height', h)
      .attr('viewBox', `0 0 ${w} ${h}`);

    const x = d3.scaleBand()
      .domain(statusData.map(d => d.label))
      .range([m.left, w - m.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(statusData, d => d.value) * 1.2])
      .range([h - m.bottom, m.top]);

    // Grid lines
    svg.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-(w - m.left - m.right)).tickFormat(''))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('line').attr('stroke', cssVar('--border-color')).attr('stroke-dasharray', '3,3'))
      .attr('transform', `translate(${m.left},0)`);

    // Bars
    svg.selectAll('.bar').data(statusData).join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(d.value))
      .attr('fill', d => COLOR_MAP[d.label] || '#0033A0')
      .attr('rx', 4)
      .attr('ry', 4);

    // Values on bars
    svg.selectAll('.label').data(statusData).join('text')
      .attr('class', 'label')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', cssVar('--text-secondary'))
      .text(d => d.value);

    // X axis
    svg.append('g').attr('transform', `translate(0,${h - m.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
        .attr('font-size', '11px')
        .attr('fill', cssVar('--text-muted'))
        .call(wrap, x.bandwidth());

    // Y axis
    svg.append('g').attr('transform', `translate(${m.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d))
      .call(g => g.select('.domain').remove())
      .selectAll('text').attr('font-size', '11px').attr('fill', cssVar('--text-muted'));
  }

  function wrap(selection, width) {
    selection.each(function() {
      const t = d3.select(this);
      const words = t.text().split(' ');
      if (words.length > 1) {
        t.text(words[0]);
        t.append('tspan').attr('x', 0).attr('dy', '1.1em').text(words.slice(1).join(' '));
      }
    });
  }

  /* ── Próximas Visitas ── */
  async function loadProximasVisitas() {
    const el = document.getElementById('proximasVisitas');
    if (!el) return;

    try {
      const data = await Api.get('/api/visitas-tecnicas', { size: 5, page: 0 });
      const items = (data.content || data).filter(v => !v.visitaRealizada);

      if (!items.length) {
        el.innerHTML = `<p style="color:var(--text-muted);font-size:var(--font-size-sm);text-align:center;padding:var(--space-4)">${_t('Nenhuma visita pendente agendada.')}</p>`;
        return;
      }

      el.innerHTML = `<div class="activity-feed">${items.slice(0, 5).map(v => `
        <div class="activity-item">
          <span class="activity-dot activity-dot--warning"></span>
          <div class="activity-content">
            <div class="activity-title">${v.responsavel} — ${v.empresa || v.instituicao || ''}</div>
            <div class="activity-meta">
              ${_t('Agendada')}: ${Fmt?.date(v.dataAgendada) || v.dataAgendada || _t('Sem data')} ·
              ${v.local || ''} · ${v.quantidade || 1} ${_t('visitante(s)')}
            </div>
          </div>
        </div>`).join('')}</div>`;
    } catch {
      el.innerHTML = `<p style="color:var(--text-muted);font-size:var(--font-size-sm);padding:var(--space-3)">${_t('Não foi possível carregar os dados.')}</p>`;
    }
  }

  /* ── Projetos em Andamento ── */
  async function loadProjetosEmAndamento() {
    const el = document.getElementById('projetosEmAndamento');
    if (!el) return;

    try {
      const data = await Api.get('/api/projetos', { size: 50 });
      const items = (data.content || data).filter(p =>
        ['Em andamento', 'Pendente autorização', 'A iniciar'].includes(p.status)
      );

      if (!items.length) {
        el.innerHTML = `<p style="color:var(--text-muted);font-size:var(--font-size-sm);text-align:center;padding:var(--space-4)">${_t('Nenhum projeto em andamento.')}</p>`;
        return;
      }

      el.innerHTML = `<div class="activity-feed">${items.slice(0, 5).map(p => `
        <div class="activity-item">
          <span class="activity-dot"></span>
          <div class="activity-content">
            <div class="flex-between" style="display:flex;align-items:center;justify-content:space-between">
              <span class="activity-title">${p.nomeProjeto || p.nome}</span>
              ${StatusBadge?.prioridade(p.prioridade) || ''}
            </div>
            <div class="activity-meta">
              ${p.responsavelNome || p.responsavel || '—'} ·
              ${_t('Término previsto')}: ${Fmt?.date(p.previsaoTermino) || '—'}
            </div>
          </div>
        </div>`).join('')}</div>`;
    } catch {
      el.innerHTML = `<p style="color:var(--text-muted);font-size:var(--font-size-sm);padding:var(--space-3)">${_t('Não foi possível carregar os dados.')}</p>`;
    }
  }

  /* ── Documentos Status ── */
  /* ── Document status helper (mirrors documentos.js) ── */
  function computeDocStatus(dataExpiracao) {
    if (!dataExpiracao) return 'ativo';
    const diff = (new Date(dataExpiracao) - new Date()) / 86400000; // days
    if (diff < 0)   return 'expirado';
    if (diff <= 30) return 'prestes-a-vencer';
    return 'ativo';
  }

  async function loadDocumentos() {
    const el = document.getElementById('documentosStatus');
    const badgeDocs = document.getElementById('badgeDocs');
    if (!el) return;

    try {
      const data = await Api.get('/api/documentos', { size: 1000 });
      const items = (data.content || data).map(d => ({
        ...d, _status: d.status || computeDocStatus(d.dataExpiracao)
      }));

      const ativos    = items.filter(d => d._status === 'ativo').length;
      const vencendo  = items.filter(d => d._status === 'prestes-a-vencer').length;
      const expirados = items.filter(d => d._status === 'expirado').length;

      if (badgeDocs) badgeDocs.textContent = vencendo + expirados || '';

      // ── Alert banner ──
      const banner = document.getElementById('alertBanner');
      if (banner && (vencendo + expirados > 0)) {
        const msgs = [];
        if (expirados > 0) msgs.push(`<strong>${expirados} ${_t('documento(s) expirado(s)')}</strong>`);
        if (vencendo  > 0) msgs.push(`<strong>${vencendo} ${_t('vencendo em <30 dias')}</strong>`);
        banner.innerHTML = `
          <div class="alert alert--warning" style="display:flex;align-items:center;gap:var(--space-3)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>${_t('Atenção — seus documentos têm alertas')}: ${msgs.join(' · ')}. <a href="/documentos" style="color:inherit;font-weight:700;text-decoration:underline">${_t('Revisar agora')} →</a></span>
          </div>`;
        banner.style.display = '';
      }

      el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-3)">
          <div style="text-align:center;padding:var(--space-3);background:var(--color-success-bg);border-radius:var(--border-radius-md);border:1px solid var(--color-success-border)">
            <div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-success)">${ativos}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-success);font-weight:600">${_t('Ativos')}</div>
          </div>
          <div style="text-align:center;padding:var(--space-3);background:var(--color-warning-bg);border-radius:var(--border-radius-md);border:1px solid var(--color-warning-border)">
            <div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-warning)">${vencendo}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-warning);font-weight:600">${_t('A Vencer')}</div>
          </div>
          <div style="text-align:center;padding:var(--space-3);background:var(--color-danger-bg);border-radius:var(--border-radius-md);border:1px solid var(--color-danger-border)">
            <div style="font-size:var(--font-size-2xl);font-weight:700;color:var(--color-danger)">${expirados}</div>
            <div style="font-size:var(--font-size-xs);color:var(--color-danger);font-weight:600">${_t('Expirados')}</div>
          </div>
        </div>
        ${vencendo > 0 || expirados > 0 ? `
        <div class="alert alert--warning" style="margin-top:var(--space-4)">
          <svg class="alert__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span><strong>${vencendo + expirados} ${_t('documento(s)')}</strong> ${_t('requerem atenção imediata.')}</span>
        </div>` : ''}`;
    } catch {
      el.innerHTML = `<p style="color:var(--text-muted);font-size:var(--font-size-sm);padding:var(--space-3)">${_t('Não foi possível carregar os dados.')}</p>`;
    }
  }

  /* ── Chart: Receita Mensal (line/area) ── */
  async function loadChartReceita() {
    const container = document.getElementById('chartReceita');
    if (!container || typeof d3 === 'undefined') return;

    let data;
    try {
      const raw = await Api.get('/api/servicos', { size: 1000 });
      const items = (raw.content || raw).filter(s => s.status === 'Venda finalizada' && s.dataRealizada);
      if (!items.length) throw new Error('empty');

      // Aggregate by month
      const byMonth = {};
      items.forEach(s => {
        const key = s.dataRealizada.substring(0, 7); // YYYY-MM
        byMonth[key] = (byMonth[key] || 0) + (s.valor || 0);
      });

      // Last 6 months (fill zeros for missing)
      const now = new Date();
      data = [];
      for (let i = 5; i >= 0; i--) {
        const d  = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString(window.I18n?.lang() || 'pt-BR', { month: 'short', year: '2-digit' });
        data.push({ label, value: byMonth[key] || 0 });
      }
    } catch {
      container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--text-muted);font-size:var(--font-size-sm)">${_t('Sem dados de receita ainda.')}</div>`;
      return;
    }

    const w  = container.clientWidth || 420;
    const h  = 220;
    const m  = { top: 20, right: 20, bottom: 34, left: 62 };

    d3.select(container).selectAll('*').remove();
    const svg = d3.select(container).append('svg')
      .attr('width', '100%').attr('height', h)
      .attr('viewBox', `0 0 ${w} ${h}`);

    const iw = w - m.left - m.right;
    const ih = h - m.top  - m.bottom;

    const x = d3.scalePoint().domain(data.map(d => d.label)).range([0, iw]).padding(0.3);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) * 1.25 || 1]).range([ih, 0]);

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    // Grid
    g.append('g').call(d3.axisLeft(y).ticks(4).tickSize(-iw).tickFormat(''))
      .call(gr => gr.select('.domain').remove())
      .call(gr => gr.selectAll('line').attr('stroke', cssVar('--border-color')).attr('stroke-dasharray', '3,3'));

    // Area fill
    const area = d3.area().x(d => x(d.label)).y0(ih).y1(d => y(d.value)).curve(d3.curveMonotoneX);
    const line = d3.line().x(d => x(d.label)).y(d => y(d.value)).curve(d3.curveMonotoneX);

    const gradId = 'receitaGrad';
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', gradId).attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#0033A0').attr('stop-opacity', 0.18);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#0033A0').attr('stop-opacity', 0.01);

    g.append('path').datum(data).attr('fill', `url(#${gradId})`).attr('d', area);
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', '#0033A0').attr('stroke-width', 2.5).attr('d', line);

    // Dots
    g.selectAll('.dot').data(data).join('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.label)).attr('cy', d => y(d.value))
      .attr('r', 4).attr('fill', '#0033A0').attr('stroke', cssVar('--color-surface')).attr('stroke-width', 2);

    // X axis
    g.append('g').attr('transform', `translate(0,${ih})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(gr => gr.select('.domain').remove())
      .selectAll('text').attr('font-size', '11px').attr('fill', cssVar('--text-muted'));

    // Y axis
    g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(v => `R$${(v / 1000).toFixed(0)}k`))
      .call(gr => gr.select('.domain').remove())
      .selectAll('text').attr('font-size', '11px').attr('fill', cssVar('--text-muted'));
  }

  /* ── Chart: Projetos por Status (Donut) ── */
  async function loadChartProjetos() {
    const wrap = document.getElementById('chartProjetosWrap');
    const container = document.getElementById('chartProjetos');
    if (!container || typeof d3 === 'undefined') return;

    let slices;
    try {
      const raw = await Api.get('/api/projetos', { size: 1000 });
      const items = raw.content || raw;
      const counts = {};
      items.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
      slices = Object.entries(counts).map(([label, value]) => ({ label, value }));
      if (!slices.length) throw new Error('empty');
    } catch {
      container.innerHTML = `<div style="color:var(--text-muted);font-size:var(--font-size-sm)">${_t('Sem dados de projetos.')}</div>`;
      return;
    }

    const STATUS_COLORS = {
      'Em andamento':           '#0033A0',
      'Pendente autorização':   '#F59E0B',
      'A iniciar':              '#3B82F6',
      'Concluído':              '#22C55E',
      'Descontinuado':          '#EF4444',
    };
    const size   = 200;
    const radius = size / 2;
    const inner  = radius * 0.6;
    const total  = slices.reduce((s, d) => s + d.value, 0);

    // Outer wrap becomes flex
    if (wrap) wrap.style.flexDirection = 'row';

    d3.select(container).selectAll('*').remove();
    const svg = d3.select(container).append('svg')
      .attr('width', size).attr('height', size);

    const g = svg.append('g').attr('transform', `translate(${radius},${radius})`);
    const pie  = d3.pie().sort(null).value(d => d.value);
    const arc  = d3.arc().innerRadius(inner).outerRadius(radius - 4);
    const arcH = d3.arc().innerRadius(inner).outerRadius(radius);

    const paths = g.selectAll('.arc').data(pie(slices)).join('g').attr('class', 'arc');
    paths.append('path')
      .attr('d', arc)
      .attr('fill', d => STATUS_COLORS[d.data.label] || '#888')
      .attr('stroke', cssVar('--color-surface')).attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(_, d) { d3.select(this).transition().duration(150).attr('d', arcH(d)); })
      .on('mouseleave', function(_, d) { d3.select(this).transition().duration(150).attr('d', arc(d)); });

    // Center label
    g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.2em')
      .attr('font-size', '22px').attr('font-weight', '700').attr('fill', cssVar('--text-primary'))
      .text(total);
    g.append('text').attr('text-anchor', 'middle').attr('dy', '1.2em')
      .attr('font-size', '11px').attr('fill', cssVar('--text-muted'))
      .text(_t('total'));

    // Legend
    const legend = d3.select(container).append('div')
      .style('display', 'flex').style('flex-direction', 'column')
      .style('justify-content', 'center').style('gap', '8px')
      .style('margin-left', '20px').style('min-width', '140px');

    slices.forEach(s => {
      const row = legend.append('div').style('display', 'flex').style('align-items', 'center').style('gap', '8px');
      row.append('span').style('width', '10px').style('height', '10px').style('border-radius', '50%')
        .style('background', STATUS_COLORS[s.label] || '#888').style('flex-shrink', '0');
      row.append('span').style('font-size', '12px').style('color', cssVar('--text-secondary')).text(`${_t(s.label)} (${s.value})`);
    });
  }

  /* ── Update sidebar badges ── */
  async function loadSidebarBadges() {
    try {
      const data = await Api.get('/api/servicos', { size: 1000 });
      const items = Array.isArray(data) ? data : (data.content || []);
      const CLOSED = new Set(['Venda finalizada', 'Desistiu']);
      const abertos = items.filter(s => !CLOSED.has(s.status)).length;
      const badge = document.getElementById('badgeServicos');
      if (badge) badge.textContent = abertos || '';
    } catch { /**/ }
  }

  /* ── Init ── */
  function init() {
    setDate();
    loadKPIs();
    loadChartServicos();
    loadChartReceita();
    loadChartProjetos();
    loadProximasVisitas();
    loadProjetosEmAndamento();
    loadDocumentos();
    loadSidebarBadges();
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', init);
  return { init };
})();

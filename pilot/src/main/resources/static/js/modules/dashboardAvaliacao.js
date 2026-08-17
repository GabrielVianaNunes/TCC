/**
 * dashboardAvaliacao.js — Dashboard NPS / Índice de Desempenho
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  const API = '/api/avaliacoes';
  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }
  function monthNames() {
    const lang = window.I18n?.lang() || 'pt-BR';
    return Array.from({ length: 12 }, (_, i) =>
      new Date(2000, i, 1).toLocaleString(lang, { month: 'short' })
    );
  }

  let allRespostas = [];
  let selectedYear = new Date().getFullYear();
  let activeTab    = 'todos';

  // ── Helpers ───────────────────────────────────────────────────────────────
  function esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function npsClass(score) {
    if (score >= 75) return 'nps-score--excellence';
    if (score >= 50) return 'nps-score--quality';
    if (score >= 0)  return 'nps-score--improve';
    return 'nps-score--critical';
  }

  function npsZone(score) {
    if (score >= 75) return { label: _t('Zona de Excelência'), color: '#0033a0' };
    if (score >= 50) return { label: _t('Zona de Qualidade'),  color: '#10b981' };
    if (score >= 0)  return { label: _t('Zona de Melhoria'),   color: '#d97706' };
    return                  { label: _t('Zona Crítica'),       color: '#dc2626' };
  }

  function npsCategory(nps) {
    if (nps >= 9) return 'promotor';
    if (nps >= 7) return 'neutro';
    return 'detrator';
  }

  function tipoBadge(tipo) {
    if (!tipo) return '';
    const map = {
      reclamacao: `<span class="badge--reclamacao">${_t('Reclamação')}</span>`,
      sugestao:   `<span class="badge--sugestao">${_t('Sugestão')}</span>`,
      elogio:     `<span class="badge--elogio">${_t('Elogio')}</span>`,
    };
    return map[tipo] || '';
  }

  function npsBadgeHtml(nps) {
    const cat = npsCategory(nps);
    const color = cat === 'promotor' ? '#10b981' : cat === 'neutro' ? '#d97706' : '#ef4444';
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;border:2px solid ${color};color:${color};font-weight:700;font-size:13px">${nps}</span>`;
  }

  // ── Year selector ─────────────────────────────────────────────────────────
  function buildYearSelector() {
    const years = [...new Set(allRespostas.map(r => new Date(r.data).getFullYear()))].sort((a,b) => b-a);
    if (!years.includes(selectedYear)) selectedYear = years[0] || selectedYear;

    const sel = document.getElementById('filtroAno');
    if (!sel) return;
    sel.innerHTML = years.map(y => `<option value="${y}"${y===selectedYear?' selected':''}>${y}</option>`).join('');
    sel.addEventListener('change', () => { selectedYear = parseInt(sel.value, 10); render(); });
  }

  // ── Filter by year ────────────────────────────────────────────────────────
  function yearData() {
    return allRespostas.filter(r => new Date(r.data).getFullYear() === selectedYear);
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────
  function renderKPIs(data) {
    const total     = data.length;
    const promotors = data.filter(r => npsCategory(r.nps) === 'promotor').length;
    const neutros   = data.filter(r => npsCategory(r.nps) === 'neutro').length;
    const detrators = data.filter(r => npsCategory(r.nps) === 'detrator').length;

    const pctProm = total ? (promotors / total * 100) : 0;
    const pctDeta = total ? (detrators / total * 100) : 0;
    const npsScore = total ? Math.round(pctProm - pctDeta) : 0;

    // Score badge
    const badge = document.getElementById('npsScoreBadge');
    if (badge) {
      badge.textContent = total ? npsScore : '—';
      badge.className = 'nps-score-badge ' + (total ? npsClass(npsScore) : '');
    }
    const zone = npsZone(npsScore);
    const zoneEl = document.getElementById('npsZoneLabel');
    if (zoneEl) { zoneEl.textContent = total ? zone.label : '—'; zoneEl.style.color = total ? zone.color : 'var(--text-muted)'; }

    const set = (id, v) => { const el = document.getElementById(id); if(el) el.textContent = v; };
    set('kpiTotal',       total);
    set('kpiTotalSub',    total ? `${_t('Média NPS')}: ${(data.reduce((s,r)=>s+r.nps,0)/total).toFixed(1)}` : '');
    set('kpiPromotores',  promotors);
    set('kpiPromotoresPct', total ? `${pctProm.toFixed(1)}% ${_t('do total')}` : '');
    set('kpiNeutros',     neutros);
    set('kpiNeutrosPct',  total ? `${(neutros/total*100).toFixed(1)}% ${_t('do total')}` : '');
    set('kpiDetratores',  detrators);
    set('kpiDetratoresPct', total ? `${pctDeta.toFixed(1)}% ${_t('do total')}` : '');

    // Barra de distribuição
    ['distProm','distNeut','distDeta'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.width = '0%'; el && (el.textContent = '');
    });
    if (total) {
      const dp = document.getElementById('distProm');
      const dn = document.getElementById('distNeut');
      const dd = document.getElementById('distDeta');
      if (dp) { dp.style.width = pctProm.toFixed(1)+'%'; if(pctProm>8) dp.textContent = pctProm.toFixed(0)+'%'; }
      const pctNeut = neutros/total*100;
      if (dn) { dn.style.width = pctNeut.toFixed(1)+'%'; if(pctNeut>8) dn.textContent = pctNeut.toFixed(0)+'%'; }
      if (dd) { dd.style.width = pctDeta.toFixed(1)+'%'; if(pctDeta>8) dd.textContent = pctDeta.toFixed(0)+'%'; }
    }

    const setLeg = (id, label, n, pct) => {
      const el = document.getElementById(id);
      if (el) el.textContent = `${label}: ${n} (${pct.toFixed(1)}%)`;
    };
    if (total) {
      setLeg('legendProm', _t('Promotores'), promotors, pctProm);
      setLeg('legendNeut', _t('Neutros'),    neutros,   neutros/total*100);
      setLeg('legendDeta', _t('Detratores'), detrators, pctDeta);
    }
  }

  // ── Gráfico: NPS por mês (barras) ─────────────────────────────────────────
  function renderChartMensal(data) {
    const container = document.getElementById('chartNpsMensal');
    if (!container) return;
    container.innerHTML = '';

    // agrupa por mês
    const byMonth = {};
    data.forEach(r => {
      const m = new Date(r.data).getMonth(); // 0-11
      if (!byMonth[m]) byMonth[m] = [];
      byMonth[m].push(r);
    });

    const months = Array.from({length:12}, (_,i) => {
      const rs = byMonth[i] || [];
      const total = rs.length;
      const prom  = rs.filter(r => npsCategory(r.nps)==='promotor').length;
      const deta  = rs.filter(r => npsCategory(r.nps)==='detrator').length;
      const score = total ? Math.round(prom/total*100 - deta/total*100) : null;
      return { label: monthNames()[i], score, total };
    });

    const hasData = months.some(m => m.total > 0);
    if (!hasData) { EmptyState.render(container, { message: _t('Sem avaliações no período.') }); return; }

    const W = container.clientWidth || 380;
    const H = 220;
    const margin = { top:16, right:8, bottom:28, left:36 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top  - margin.bottom;

    const svg = d3.select(container).append('svg')
      .attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(months.map(m=>m.label)).range([0,w]).padding(0.35);
    const y = d3.scaleLinear().domain([-100,100]).range([h,0]);

    // Zero line
    g.append('line').attr('x1',0).attr('x2',w).attr('y1',y(0)).attr('y2',y(0))
      .attr('stroke','var(--border-color)').attr('stroke-dasharray','3,3');

    // Bars
    const textColor = cssVar('--text-primary') || '#111';
    months.forEach(m => {
      if (m.score === null) return;
      const barColor = m.score >= 75 ? '#0033a0' : m.score >= 50 ? '#10b981' : m.score >= 0 ? '#d97706' : '#ef4444';
      const barH = Math.abs(y(m.score) - y(0));
      const barY = m.score >= 0 ? y(m.score) : y(0);
      g.append('rect')
        .attr('x', x(m.label)).attr('y', barY)
        .attr('width', x.bandwidth()).attr('height', Math.max(1, barH))
        .attr('fill', barColor).attr('rx', 3);
      g.append('text')
        .attr('x', x(m.label) + x.bandwidth()/2).attr('y', barY - 4)
        .attr('text-anchor','middle').attr('font-size','10').attr('fill', textColor)
        .text(m.score);
    });

    // Axes
    g.append('g').attr('transform',`translate(0,${h})`).call(d3.axisBottom(x).tickSize(0))
      .call(a => a.select('.domain').remove())
      .call(a => a.selectAll('text').attr('fill', textColor).attr('font-size','10'));
    g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(-w))
      .call(a => a.select('.domain').remove())
      .call(a => a.selectAll('line').attr('stroke','var(--border-color)').attr('stroke-dasharray','2,2'))
      .call(a => a.selectAll('text').attr('fill', textColor).attr('font-size','10'));
  }

  // ── Gráfico: Respostas por Vínculo (barras horizontais) ───────────────────
  function renderChartVinculo(data) {
    const container = document.getElementById('chartVinculo');
    if (!container) return;
    container.innerHTML = '';
    if (!data.length) { EmptyState.render(container, { message: _t('Sem dados.') }); return; }

    const counts = {};
    data.forEach(r => { counts[r.vinculo] = (counts[r.vinculo] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);

    const W = container.clientWidth || 380;
    const H = 220;
    const margin = { top:8, right:40, bottom:8, left:140 };
    const w = W - margin.left - margin.right;
    const h = H - margin.top  - margin.bottom;

    const svg = d3.select(container).append('svg').attr('width',W).attr('height',H);
    const g   = svg.append('g').attr('transform',`translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand().domain(sorted.map(d=>d[0])).range([0,h]).padding(0.3);
    const x = d3.scaleLinear().domain([0, d3.max(sorted, d=>d[1])]).range([0,w]);
    const textColor = cssVar('--text-primary') || '#111';
    const primary   = cssVar('--color-primary') || '#0033a0';

    sorted.forEach(([label, count]) => {
      g.append('rect')
        .attr('x',0).attr('y',y(label))
        .attr('width', x(count)).attr('height', y.bandwidth())
        .attr('fill', primary).attr('rx', 3).attr('opacity', 0.85);
      g.append('text')
        .attr('x', x(count)+5).attr('y', y(label)+y.bandwidth()/2)
        .attr('dominant-baseline','middle').attr('font-size','11').attr('fill', textColor)
        .text(count);
    });

    g.append('g').call(d3.axisLeft(y).tickSize(0))
      .call(a => a.select('.domain').remove())
      .call(a => a.selectAll('text').attr('fill',textColor).attr('font-size','10').attr('dx','-4'));
  }

  // ── Comentários ───────────────────────────────────────────────────────────
  function renderComentarios(data) {
    const container = document.getElementById('listaComentarios');
    if (!container) return;

    const comComentario = data
      .filter(r => r.comentario)
      .filter(r => activeTab === 'todos' || r.tipoComentario === activeTab)
      .sort((a,b) => new Date(b.data) - new Date(a.data));

    const countEl = document.getElementById('comentariosCount');
    if (countEl) countEl.textContent = `${comComentario.length} ${_t('comentário(s)')}`;

    if (!comComentario.length) {
      container.innerHTML = `<div style="text-align:center;padding:var(--space-6);color:var(--text-muted)">${_t('Nenhum comentário encontrado.')}</div>`;
      return;
    }

    const catLabel = nps => {
      const cat = npsCategory(nps);
      const map = { promotor:'Promotor', neutro:'Neutro', detrator:'Detrator' };
      return map[cat];
    };

    container.innerHTML = comComentario.slice(0, 30).map(r => `
      <div class="nps-comentario-item">
        <div class="nps-comentario-meta">
          ${tipoBadge(r.tipoComentario)}
          <span style="font-size:12px;color:var(--text-muted)">${fmtDate(r.data)}</span>
          <span style="font-size:12px;color:var(--text-secondary)">${esc(r.vinculo)}</span>
          ${npsBadgeHtml(r.nps)}
          <span style="font-size:11px;color:${npsCategory(r.nps)==='promotor'?'var(--color-success-text)':npsCategory(r.nps)==='neutro'?'var(--color-warning-text)':'var(--color-danger-text)'}">${catLabel(r.nps)}</span>
        </div>
        <div class="nps-comentario-texto">${esc(r.comentario)}</div>
        ${r.descServico ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Serviço: ${esc(r.descServico)}</div>` : ''}
      </div>
    `).join('');
  }

  // ── Tabela de respostas ───────────────────────────────────────────────────
  function renderTabela(data) {
    const tbody   = document.getElementById('tbodyRespostas');
    const countEl = document.getElementById('respostasCount');
    if (!tbody) return;

    const sorted = [...data].sort((a,b) => new Date(b.data) - new Date(a.data));
    if (countEl) countEl.textContent = `${sorted.length} resposta(s)`;

    if (!sorted.length) {
      EmptyState.table(tbody, 5, _t('Nenhuma resposta encontrada'), _t('As avaliações aparecerão aqui após o envio do formulário.'));
      return;
    }

    tbody.innerHTML = sorted.slice(0,50).map(r => {
      return `<tr>
        <td style="font-size:var(--font-size-sm);white-space:nowrap">${fmtDate(r.data)}</td>
        <td style="font-size:var(--font-size-sm)">${esc(r.vinculo)}</td>
        <td style="font-size:var(--font-size-sm)">${esc(r.realizouServico)}${r.descServico ? `<br><small style="color:var(--text-muted)">${esc(r.descServico)}</small>` : ''}</td>
        <td style="text-align:center">${npsBadgeHtml(r.nps)}</td>
        <td style="font-size:var(--font-size-sm);color:var(--text-secondary)">${r.comentario ? esc(r.comentario.slice(0,120)) + (r.comentario.length>120?'…':'') : '<span style="color:var(--text-muted)">—</span>'}</td>
      </tr>`;
    }).join('');
  }

  // ── Render completo ───────────────────────────────────────────────────────
  function render() {
    const data = yearData();
    renderKPIs(data);
    renderChartMensal(data);
    renderChartVinculo(data);
    renderComentarios(data);
    renderTabela(data);
  }

  // ── Carregar dados (API + localStorage) ──────────────────────────────────
  async function load() {
    try {
      const resp   = await Api.get(API, { size: 5000 });
      const server = Array.isArray(resp) ? resp : (resp.content || []);

      // Merge com dados enviados localmente via formulário
      let local = [];
      try { local = JSON.parse(localStorage.getItem('zp-avaliacoes') || '[]'); } catch { /**/ }

      // Evita duplicatas por id
      const serverIds = new Set(server.map(r => r.id));
      const localOnly = local.filter(r => !serverIds.has(r.id));
      allRespostas = [...server, ...localOnly];

      buildYearSelector();
      render();
    } catch {
      const tb = document.getElementById('tbodyRespostas');
      if (tb) EmptyState.table(tb, 5, _t('Erro ao carregar dados'), _t('Verifique a conexão com o servidor.'));
    }
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  function bindTabs() {
    document.querySelectorAll('.nps-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.nps-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.getAttribute('data-tab');
        renderComentarios(yearData());
      });
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    bindTabs();
    load();
  });
  document.addEventListener('zeiss:langchange', () => { if (allRespostas.length) render(); });

})();

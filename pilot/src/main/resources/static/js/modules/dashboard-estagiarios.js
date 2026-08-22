/**
 * dashboard-estagiarios.js — Dashboard de desempenho dos estagiários
 * Agrega dados do Kanban + Notas do Diretor para métricas individuais e globais.
 */
(function () {
  'use strict';

  const API_DASH     = '/api/dashboard-estagiarios';
  const API_NOTAS    = '/api/notas-estagiarios';
  const API_SERVICOS = '/api/servicos';

  let dashData     = null;
  let allServicos  = [];
  let allCards     = [];
  let allNotas     = [];

  // ── i18n helper ───────────────────────────────────────────────────────────

  function _t(key, fallback) {
    return (window.I18n?.t(key)) || fallback;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function initials(nome) {
    return (nome || '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  function avatarColor(id) {
    // Tons escolhidos para que o texto branco das iniciais fique acima de
    // 4.5:1 — os originais (#00A3E0, #16A34A, #D97706, #0891B2, #059669)
    // ficavam entre 2.9:1 e 3.7:1.
    const palette = ['#0033A0','#0E7490','#15803D','#B45309','#DC2626','#7C3AED','#DB2777','#155E75'];
    return palette[(id - 1) % palette.length];
  }

  function stars(nota) {
    if (nota === null || nota === undefined) return '<span style="color:var(--text-muted);font-size:var(--font-size-xs)">Sem notas</span>';
    const full  = Math.floor(nota);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
  }

  // Usam os tokens de TEXTO: as variáveis sem sufixo são tons para fundo e
  // ficam ilegíveis quando aplicadas como cor de texto no tema escuro.
  function starsColor(nota) {
    if (nota === null) return 'var(--text-muted)';
    if (nota >= 4.5) return 'var(--color-success-text)';
    if (nota >= 3)   return 'var(--color-warning-text)';
    return 'var(--color-danger-text)';
  }

  function taxaColor(taxa) {
    if (taxa >= 70) return 'var(--color-success-text)';
    if (taxa >= 40) return 'var(--color-warning-text)';
    return 'var(--color-danger-text)';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  // ── KPIs globais ──────────────────────────────────────────────────────────

  function renderKPIs(totais) {
    const taxa = totais.totalTarefas > 0
      ? Math.round((totais.totalConcluidas / totais.totalTarefas) * 100)
      : 0;

    document.getElementById('kpiGlobal').innerHTML = `
      <div class="kpi-card kpi-card--primary">
        <div class="kpi-card__label">${_t('destag.kpi.ativos','Estagiários Ativos')}</div>
        <div class="kpi-card__value">${totais.totalEstagiarios}</div>
        <div class="kpi-card__sub">${_t('destag.kpi.emEstag','em estágio')}</div>
      </div>
      <div class="kpi-card kpi-card--info">
        <div class="kpi-card__label">${_t('destag.kpi.tarefas','Total de Tarefas')}</div>
        <div class="kpi-card__value">${totais.totalTarefas}</div>
        <div class="kpi-card__sub">${totais.totalConcluidas} ${_t('destag.kpi.conc','concluídas')}</div>
      </div>
      <div class="kpi-card kpi-card--success">
        <div class="kpi-card__label">${_t('destag.kpi.taxa','Taxa de Conclusão')}</div>
        <div class="kpi-card__value">${taxa}%</div>
        <div class="kpi-card__sub">${_t('destag.kpi.doTime','geral do time')}</div>
      </div>
      <div class="kpi-card kpi-card--warning">
        <div class="kpi-card__label">${_t('destag.kpi.nota','Nota Média Geral')}</div>
        <div class="kpi-card__value">${totais.mediaGeralNotas !== null ? totais.mediaGeralNotas + '/5' : '—'}</div>
        <div class="kpi-card__sub">${_t('destag.kpi.avalDir','avaliações do diretor')}</div>
      </div>`;
  }

  // ── Tabela de desempenho ──────────────────────────────────────────────────

  function renderTabela(estagiarios) {
    const tbody = document.getElementById('tabelaDesempenho');
    tbody.innerHTML = '';

    if (!estagiarios.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="table-empty">${_t('destag.empty','Nenhum estagiário ativo encontrado.')}</td></tr>`;
      return;
    }

    estagiarios.forEach(e => {
      const cor   = avatarColor(e.id);
      const ini   = initials(e.nome);
      const nota  = e.mediaNotas;
      const taxa  = Math.round(e.taxaConclusao);
      const cpc   = e.cardsPorColuna || {};
      const emAnd = (cpc['em-andamento'] || 0) + (cpc['revisao'] || 0);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-2)">
            <div style="width:32px;height:32px;border-radius:50%;background:${cor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${ini}</div>
            <div>
              <div style="font-weight:var(--font-weight-semibold);color:var(--text-primary)">${e.nome}</div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted)">${e.orientador || ''}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge--neutral">${e.area || '—'}</span></td>
        <td style="text-align:center">${e.totalCards}</td>
        <td style="text-align:center"><span style="color:var(--color-success-text);font-weight:var(--font-weight-semibold)">${cpc['concluido'] || 0}</span></td>
        <td style="text-align:center">${emAnd}</td>
        <td style="text-align:center">
          ${e.vencidas > 0
            ? `<span style="color:var(--color-danger-text);font-weight:var(--font-weight-semibold)">${e.vencidas}</span>`
            : `<span style="color:var(--text-muted)">0</span>`}
        </td>
        <td style="text-align:center">
          <span style="font-weight:var(--font-weight-semibold);color:${taxaColor(taxa)}">${taxa}%</span>
        </td>
        <td style="text-align:center">
          <span style="color:${starsColor(nota)};font-size:16px;letter-spacing:1px">${stars(nota)}</span>
          ${nota !== null ? `<div style="font-size:var(--font-size-xs);color:var(--text-muted)">${nota}/5</div>` : ''}
        </td>
        <td class="actions-cell" style="white-space:nowrap">
          <button class="btn btn-ghost btn-sm" data-estag-id="${e.id}" data-action="nota" title="Adicionar nota">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            ${_t('destag.btn.eval','Avaliar')}
          </button>
          <button class="btn btn-ghost btn-sm" data-estag-id="${e.id}" data-action="print" title="${_t('btn.print','Imprimir relatório')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            ${_t('btn.print','Imprimir')}
          </button>
        </td>`;
      tbody.appendChild(tr);
    });

    // Bind buttons
    tbody.querySelectorAll('[data-action="nota"]').forEach(btn => {
      btn.addEventListener('click', () => openModalNota(parseInt(btn.dataset.estagId)));
    });
    tbody.querySelectorAll('[data-action="print"]').forEach(btn => {
      btn.addEventListener('click', () => printRelatorio(parseInt(btn.dataset.estagId)));
    });
  }

  // ── Gráfico de barras CSS puro ────────────────────────────────────────────

  function renderChart(estagiarios) {
    const container = document.getElementById('chartEstagiarios');
    container.innerHTML = '';

    if (!estagiarios.length) {
      container.innerHTML = `<p style="color:var(--text-muted);font-size:var(--font-size-sm)">${_t('Nenhum dado disponível.')}</p>`;
      return;
    }

    const maxCards = Math.max(...estagiarios.map(e => e.totalCards), 1);

    estagiarios.forEach(e => {
      const cor    = avatarColor(e.id);
      const cpc    = e.cardsPorColuna || {};
      const conc   = cpc['concluido']    || 0;
      const rev    = cpc['revisao']      || 0;
      const and_   = cpc['em-andamento'] || 0;
      const back   = cpc['backlog']      || 0;
      const total  = e.totalCards || 0;
      const pct    = total > 0 ? Math.round((conc / total) * 100) : 0;

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:var(--space-3)';
      row.innerHTML = `
        <div style="width:32px;height:32px;border-radius:50%;background:${cor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${initials(e.nome)}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:var(--font-size-xs);font-weight:var(--font-weight-semibold);color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.nome.split(' ')[0]}</span>
            <span style="font-size:var(--font-size-xs);color:var(--text-muted);white-space:nowrap">${conc}/${total} · ${pct}%</span>
          </div>
          <div style="height:8px;border-radius:4px;background:var(--border-color);overflow:hidden;display:flex">
            <div style="height:100%;background:var(--color-success);width:${maxCards > 0 ? (conc/maxCards*100) : 0}%;transition:width .6s ease"></div>
            <div style="height:100%;background:var(--color-warning);width:${maxCards > 0 ? (rev/maxCards*100) : 0}%;transition:width .6s ease"></div>
            <div style="height:100%;background:var(--color-info);width:${maxCards > 0 ? (and_/maxCards*100) : 0}%;transition:width .6s ease"></div>
            <div style="height:100%;background:var(--border-hover);width:${maxCards > 0 ? (back/maxCards*100) : 0}%;transition:width .6s ease"></div>
          </div>
        </div>`;
      container.appendChild(row);
    });

    // Legend
    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;gap:var(--space-4);margin-top:var(--space-4);flex-wrap:wrap';
    legend.innerHTML = `
      <span style="display:flex;align-items:center;gap:5px;font-size:var(--font-size-xs);color:var(--text-secondary)"><span style="width:10px;height:10px;border-radius:2px;background:var(--color-success);display:inline-block"></span>Concluído</span>
      <span style="display:flex;align-items:center;gap:5px;font-size:var(--font-size-xs);color:var(--text-secondary)"><span style="width:10px;height:10px;border-radius:2px;background:var(--color-warning);display:inline-block"></span>Revisão</span>
      <span style="display:flex;align-items:center;gap:5px;font-size:var(--font-size-xs);color:var(--text-secondary)"><span style="width:10px;height:10px;border-radius:2px;background:var(--color-info);display:inline-block"></span>Em Andamento</span>
      <span style="display:flex;align-items:center;gap:5px;font-size:var(--font-size-xs);color:var(--text-secondary)"><span style="width:10px;height:10px;border-radius:2px;background:var(--border-hover);display:inline-block"></span>Backlog</span>`;
    container.appendChild(legend);
  }

  // ── Feed de notas ─────────────────────────────────────────────────────────

  async function renderFeedNotas() {
    const feed = document.getElementById('feedNotas');
    feed.innerHTML = '';

    let notas = [];
    try {
      const resp = await Api.get(API_NOTAS);
      notas = Array.isArray(resp) ? resp : (resp.content || []);
    } catch { return; }

    if (!notas.length) {
      feed.innerHTML = `<p style="padding:var(--space-5);color:var(--text-muted);font-size:var(--font-size-sm);text-align:center">${_t('destag.noNotes','Nenhuma nota registrada ainda.')}</p>`;
      return;
    }

    // Sort newest first
    notas = notas.slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    const estagiarios = dashData?.estagiarios || [];

    notas.forEach(n => {
      const estag = estagiarios.find(e => e.id === n.estagiariaId);
      const nome  = estag ? estag.nome : `Estagiário #${n.estagiariaId}`;
      const cor   = avatarColor(n.estagiariaId || 1);
      const ini   = initials(nome);

      const item = document.createElement('div');
      item.style.cssText = 'padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-color);display:flex;gap:var(--space-3)';
      item.innerHTML = `
        <div style="width:34px;height:34px;border-radius:50%;background:${cor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${ini}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-2)">
            <span style="font-size:var(--font-size-sm);font-weight:var(--font-weight-semibold);color:var(--text-primary)">${nome.split(' ')[0]}</span>
            <span style="color:${starsColor(n.nota)};white-space:nowrap;font-size:14px">${'★'.repeat(n.nota)}${'☆'.repeat(5 - n.nota)}</span>
          </div>
          <p style="font-size:var(--font-size-xs);color:var(--text-secondary);margin:2px 0;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${n.comentario}</p>
          <div style="font-size:11px;color:var(--text-muted);margin-top:3px">${n.avaliadorNome || 'Diretor'} · ${formatDate(n.data)}</div>
        </div>`;
      feed.appendChild(item);
    });
  }

  // ── Impressão de relatório ────────────────────────────────────────────────

  function printRelatorio(estagId) {
    const e = (dashData?.estagiarios || []).find(x => x.id === estagId);
    if (!e) return;

    const cpc         = e.cardsPorColuna || {};
    const taxa        = Math.round(e.taxaConclusao);
    const hoje        = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
    const internCards = allCards.filter(c => c.estagiariaId === estagId);
    const internNotas = allNotas.filter(n => n.estagiariaId === estagId).sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    function taxaBg(t) { return t >= 70 ? '#16A34A' : t >= 40 ? '#D97706' : '#DC2626'; }
    function notaBg(n)  { return n === null ? '#6B7280' : n >= 4.5 ? '#16A34A' : n >= 3 ? '#D97706' : '#DC2626'; }

    function colLabel(col) {
      const map = { backlog: _t('Backlog'), 'em-andamento': _t('Em Andamento'), revisao: _t('Revisão'), concluido: _t('Concluído') };
      return map[col] || col;
    }
    function prioLabel(p) {
      const map = { urgente: _t('Urgente'), alta: _t('Alta'), media: _t('Média'), baixa: _t('Baixa') };
      return map[p] || p;
    }

    const cardsHtml = internCards.length
      ? internCards.map(c => `
          <tr>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px">${c.titulo}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center">${colLabel(c.coluna)}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center">${prioLabel(c.prioridade)}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center">${c.prazo ? c.prazo.split('-').reverse().join('/') : '—'}</td>
          </tr>`).join('')
      : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#6B7280;font-size:13px">${_t('Nenhuma tarefa atribuída.')}</td></tr>`;

    const notasHtml = internNotas.length
      ? internNotas.map(n => `
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-weight:600;color:#111827;font-size:13px">${n.avaliadorNome || 'Diretor'}</span>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="color:#F59E0B;font-size:18px">${'★'.repeat(n.nota)}${'☆'.repeat(5 - n.nota)}</span>
                <span style="font-size:12px;color:#6B7280">${n.data ? n.data.split('-').reverse().join('/') : ''}</span>
              </div>
            </div>
            <p style="margin:0;font-size:13px;color:#374151;line-height:1.5">${n.comentario}</p>
          </div>`).join('')
      : `<p style="color:#6B7280;font-size:13px;text-align:center">${_t('Nenhuma nota registrada.')}</p>`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Relatório — ${e.nome}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Segoe UI',Arial,sans-serif; color:#111827; background:#fff; padding:32px 40px; }
    @media print {
      body { padding:20px; }
      .no-print { display:none !important; }
      @page { margin:1.5cm; }
    }
    .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:16px; border-bottom:3px solid #0033A0; margin-bottom:24px; }
    .logo-block { display:flex; flex-direction:column; }
    .logo-title  { font-size:22px; font-weight:700; color:#0033A0; letter-spacing:1px; }
    .logo-sub    { font-size:12px; color:#6B7280; margin-top:2px; }
    .report-label { text-align:right; }
    .report-label h1 { font-size:18px; font-weight:700; color:#111827; }
    .report-label p  { font-size:12px; color:#6B7280; margin-top:2px; }
    .intern-card { background:#F8FAFC; border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:16px; }
    .intern-info { grid-column:1/5; display:flex; align-items:center; gap:14px; padding-bottom:14px; border-bottom:1px solid #e5e7eb; margin-bottom:4px; }
    .avatar { width:52px; height:52px; border-radius:50%; background:${avatarColor(e.id)}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; flex-shrink:0; }
    .intern-name { font-size:20px; font-weight:700; color:#111827; }
    .intern-meta { font-size:13px; color:#6B7280; margin-top:2px; }
    .kpi { background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:14px 16px; }
    .kpi-label { font-size:11px; color:#6B7280; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
    .kpi-value { font-size:26px; font-weight:700; }
    .section-title { font-size:15px; font-weight:700; color:#111827; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #e5e7eb; }
    table { width:100%; border-collapse:collapse; }
    thead th { background:#F3F4F6; padding:8px; font-size:12px; font-weight:600; color:#374151; text-align:left; }
    .footer { margin-top:32px; padding-top:12px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; font-size:11px; color:#9CA3AF; }
    .print-btn { position:fixed; bottom:24px; right:24px; background:#0033A0; color:#fff; border:none; padding:10px 22px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,.2); }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-block">
      <span class="logo-title">ZEISS·PILOT</span>
      <span class="logo-sub">SENAI — Centro de Metrologia</span>
    </div>
    <div class="report-label">
      <h1>${_t('report.title','Relatório de Desempenho')}</h1>
      <p>${_t('report.issued','Emitido em')} ${hoje}</p>
    </div>
  </div>

  <div class="intern-card">
    <div class="intern-info">
      <div class="avatar">${initials(e.nome)}</div>
      <div>
        <div class="intern-name">${e.nome}</div>
        <div class="intern-meta">${_t(e.area)} · ${_t('Turno')} ${_t(e.turno)} · ${_t('Orientador')}: ${e.orientador || '—'} · ${_t('Início')}: ${e.inicioEstagio ? e.inicioEstagio.split('-').reverse().join('/') : '—'}</div>
      </div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Tarefas Totais</div>
      <div class="kpi-value" style="color:#111827">${e.totalCards}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Concluídas</div>
      <div class="kpi-value" style="color:#16A34A">${cpc['concluido'] || 0}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Taxa de Conclusão</div>
      <div class="kpi-value" style="color:${taxaBg(taxa)}">${taxa}%</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Nota Média</div>
      <div class="kpi-value" style="color:${notaBg(e.mediaNotas)}">${e.mediaNotas !== null ? e.mediaNotas + '/5' : '—'}</div>
    </div>
  </div>

  <div style="margin-bottom:24px">
    <div class="section-title">${_t('report.tasks','Tarefas Atribuídas')}</div>
    <table>
      <thead><tr>
        <th style="width:50%">Título</th>
        <th style="text-align:center;width:20%">Status</th>
        <th style="text-align:center;width:15%">Prioridade</th>
        <th style="text-align:center;width:15%">Prazo</th>
      </tr></thead>
      <tbody>${cardsHtml}</tbody>
    </table>
  </div>

  <div>
    <div class="section-title">${_t('report.notes','Notas do Diretor')}</div>
    ${notasHtml}
  </div>

  <div class="footer">
    <span>ZEISS·PILOT — Sistema de Gestão de Metrologia · SENAI</span>
    <span>${e.email}</span>
  </div>

  <button class="print-btn no-print" onclick="window.print()">${_t('report.printBtn','🖨 Imprimir / Salvar PDF')}</button>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank', 'width=900,height=700');
  }

  // ── Modal Nota ────────────────────────────────────────────────────────────

  let notaValor = null;

  function initStars() {
    const btns = document.querySelectorAll('.star-btn');
    btns.forEach(btn => {
      btn.addEventListener('mouseover', () => {
        const val = parseInt(btn.dataset.val);
        btns.forEach(b => {
          b.style.color = parseInt(b.dataset.val) <= val ? '#F59E0B' : 'var(--border-color)';
        });
      });
      btn.addEventListener('mouseout', () => paintStars(notaValor));
      btn.addEventListener('click', () => {
        notaValor = parseInt(btn.dataset.val);
        document.getElementById('notaValor').value = notaValor;
        paintStars(notaValor);
      });
    });
  }

  function paintStars(val) {
    document.querySelectorAll('.star-btn').forEach(b => {
      b.style.color = val && parseInt(b.dataset.val) <= val ? '#F59E0B' : 'var(--border-color)';
    });
  }

  function populateNotaModal(estagiarios) {
    const sel = document.getElementById('notaEstagiario');
    sel.innerHTML = '<option value="">Selecione...</option>';
    estagiarios.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.nome} — ${_t(e.area)}`;
      sel.appendChild(opt);
    });
  }

  async function populateServicosSelect() {
    const sel = document.getElementById('notaServico');
    sel.innerHTML = `<option value="">${_t('Nenhum')}</option>`;
    if (!allServicos.length) return;
    allServicos.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `OS #${s.id} — ${s.clienteNome || s.cliente} (${s.solicitacao})`;
      sel.appendChild(opt);
    });
  }

  function openModalNota(estagId) {
    notaValor = null;
    paintStars(null);
    document.getElementById('notaValor').value   = '';
    document.getElementById('notaComentario').value = '';
    document.getElementById('notaServico').value = '';

    if (estagId) {
      document.getElementById('notaEstagiario').value = estagId;
    }
    Modal.open('modalNota');
  }

  async function saveNota() {
    const estagId = parseInt(document.getElementById('notaEstagiario').value);
    const nota    = notaValor || parseInt(document.getElementById('notaValor').value);
    const coment  = document.getElementById('notaComentario').value.trim();
    const servId  = parseInt(document.getElementById('notaServico').value) || null;

    if (!estagId)  { Toast.error(_t('Selecione o estagiário.')); return; }
    if (!nota)     { Toast.error(_t('Selecione uma nota (1-5).')); return; }
    if (!coment)   { Toast.error(_t('Informe um comentário.')); return; }

    const payload = {
      estagiariaId:  estagId,
      servicoId:     servId,
      nota,
      comentario:    coment,
      avaliadorNome: 'Diretor',
      data:          new Date().toISOString().slice(0, 10),
    };

    try {
      await Api.post(API_NOTAS, payload);
      Toast.success(_t('Nota salva com sucesso!'));
      Modal.close('modalNota');
      await load();
    } catch {
      Toast.error(_t('Erro ao salvar nota.'));
    }
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  async function load() {
    try {
      const [dash, servResp, cardsResp, notasResp] = await Promise.all([
        Api.get(API_DASH),
        Api.get(API_SERVICOS),
        Api.get('/api/kanban-cards'),
        Api.get(API_NOTAS),
      ]);

      dashData    = dash;
      allServicos = Array.isArray(servResp)  ? servResp  : (servResp.content  || []);
      allCards    = Array.isArray(cardsResp) ? cardsResp : (cardsResp.content || []);
      allNotas    = Array.isArray(notasResp) ? notasResp : (notasResp.content || []);

      renderKPIs(dash.totais);
      renderTabela(dash.estagiarios);
      renderChart(dash.estagiarios);
      renderFeedNotas();

      populateNotaModal(dash.estagiarios);
      populateServicosSelect();
    } catch (err) {
      Toast.error(_t('Erro ao carregar dados do dashboard.'));
      console.error(err);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    initStars();
    load();

    document.getElementById('btnAddNota').addEventListener('click', () => openModalNota(null));
    document.getElementById('btnSalvarNota').addEventListener('click', saveNota);
  });

  document.addEventListener('zeiss:langchange', () => {
    if (dashData) {
      renderKPIs(dashData.totais);
      renderTabela(dashData.estagiarios);
      renderChart(dashData.estagiarios);
      renderFeedNotas();
    }
  });

})();

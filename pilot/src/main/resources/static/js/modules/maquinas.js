/* ─────────────────────────────────────────────────────────────────
   Módulo: Máquinas do Laboratório
   - Lista de máquinas CMM/CT com cards interativos
   - Detalhe com 4 abas: Visão Geral | Registros de Uso | Manutenção | Agendamentos
   - CRUD completo para sessões, manutenções e agendamentos
───────────────────────────────────────────────────────────────── */

const _t = ptBR => window.I18n?.t(ptBR) ?? ptBR;

const BASE_MAQ = '/api/maquinas';

let allMachines   = [];
let selectedMach  = null;
let sessoesData   = [];
let manutsData    = [];
let agendData     = [];
let docsData      = [];
let manutFilter   = 'todos';

/* ══════════════════════════════════════════
   SVG ICONS PER MACHINE TYPE
══════════════════════════════════════════ */
function getMachineImage(modelo) {
  const map = {
    'Duramax HTG':    '/img/zeiss-duramax-htg.jpg',
    'O-Inspect':      '/img/zeiss-o-inspect-product-picture.jpg',
    'Bosello MAX':    '/img/zeiss-bosello-max_1920_1920.jpg',
    'Prismo Standard':'/img/zeiss-prismo-standard.jpg',
  };
  return map[modelo] || '';
}

function getMachineIcon(modelo) {
  const cmm = `<svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="44" width="48" height="8" rx="2"/>
    <rect x="12" y="36" width="16" height="8"/>
    <rect x="28" y="14" width="16" height="22"/>
    <path d="M36 14 V8 M32 8 h8"/>
    <circle cx="36" cy="6" r="3"/>
    <line x1="14" y1="36" x2="14" y2="16"/><line x1="22" y1="36" x2="22" y2="16"/>
    <line x1="10" y1="16" x2="26" y2="16"/>
  </svg>`;
  const ct = `<svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="32" cy="32" r="22"/>
    <circle cx="32" cy="32" r="10"/>
    <rect x="28" y="8" width="8" height="6" rx="1"/>
    <rect x="28" y="50" width="8" height="6" rx="1"/>
    <line x1="32" y1="14" x2="32" y2="22"/>
    <line x1="32" y1="42" x2="32" y2="50"/>
    <line x1="10" y1="32" x2="18" y2="32"/>
    <line x1="46" y1="32" x2="54" y2="32"/>
  </svg>`;
  const optical = `<svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="44" width="48" height="8" rx="2"/>
    <rect x="20" y="34" width="24" height="10"/>
    <rect x="28" y="20" width="8" height="14"/>
    <circle cx="32" cy="16" r="6"/>
    <line x1="26" y1="16" x2="18" y2="16"/><line x1="38" y1="16" x2="46" y2="16"/>
    <circle cx="32" cy="16" r="2" fill="currentColor" stroke="none"/>
  </svg>`;
  if (modelo === 'Bosello MAX') return ct;
  if (modelo === 'O-Inspect')   return optical;
  return cmm;
}

/* ══════════════════════════════════════════
   FORMAT HELPERS
══════════════════════════════════════════ */
function fmtDT(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(window.I18n?.lang() || 'pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function fmtDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}
function fmtHours(h) {
  if (h === null || h === undefined) return '—';
  return h.toFixed(1) + ' h';
}
function calcHours(ligada, desligada) {
  if (!ligada || !desligada) return null;
  const diff = (new Date(desligada) - new Date(ligada)) / 3600000;
  return Math.round(diff * 10) / 10;
}
function initials(name) {
  return (name || '?').split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}
function statusBadge(s) {
  const map = {
    'Ativa':        'badge--success',
    'Inativa':      'badge--danger',
    'Manutenção':   'badge--warning',
    'Concluída':    'badge--success',
    'Em andamento': 'badge--warning',
    'Agendada':     'badge--info',
  };
  return `<span class="status-badge ${map[s] || 'badge--neutral'}">${_t(s)}</span>`;
}
function monthAbbr(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
}

/* ══════════════════════════════════════════
   MACHINE NAV TABS
══════════════════════════════════════════ */
function renderMachineNav() {
  const nav = document.getElementById('maqNav');
  nav.innerHTML = '';

  allMachines.forEach(m => {
    const isActive  = selectedMach?.id === m.id;
    const isOn      = m.ligada;
    const statusCls = { 'Ativa': 'badge--success', 'Manutenção': 'badge--warning', 'Inativa': 'badge--danger' }[m.status] || 'badge--neutral';

    const btn = document.createElement('button');
    btn.className  = `maq-nav__tab${isActive ? ' maq-nav__tab--active' : ''} ${isOn ? 'maq-nav__tab--on' : 'maq-nav__tab--off'}`;
    btn.dataset.id = m.id;
    btn.innerHTML  = `
      <div class="maq-nav__top">
        <span class="maq-nav__dot"></span>
        <span class="maq-nav__power">${isOn ? _t('Ligada') : _t('Desligada')}</span>
        ${m.usuarioAtual ? `<span class="maq-nav__user" title="${m.usuarioAtual}">👤 ${m.usuarioAtual}</span>` : ''}
        <span class="status-badge ${statusCls}" style="font-size:10px;padding:1px 6px;margin-left:auto">${_t(m.status)}</span>
      </div>
      <div class="maq-nav__name">${m.nome}</div>
      <div class="maq-nav__meta">${m.tipoMedida}</div>
    `;
    btn.addEventListener('click', () => selectMachine(m.id));
    nav.appendChild(btn);
  });
}

/* ══════════════════════════════════════════
   SELECT MACHINE → load sub-data + render detail
══════════════════════════════════════════ */
async function selectMachine(id) {
  selectedMach = allMachines.find(m => m.id === id) || null;
  renderMachineNav(); // refresh active tab

  const detail = document.getElementById('machineDetail');
  detail.style.display = 'block';

  // Reset tabs (escopo apenas ao painel CMM)
  document.querySelectorAll('#machineDetail .detail-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#machineDetail .detail-tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('#machineDetail [data-tab="visao-geral"]').classList.add('active');
  document.getElementById('tab-visao-geral').classList.add('active');

  // Load sub-resources
  const [sessoes, manut, agend, docs] = await Promise.all([
    Api.get(`${BASE_MAQ}/${id}/sessoes`),
    Api.get(`${BASE_MAQ}/${id}/manutencoes`),
    Api.get(`${BASE_MAQ}/${id}/agendamentos`),
    Api.get(`${BASE_MAQ}/${id}/documentos`),
  ]);
  sessoesData = sessoes;
  manutsData  = manut;
  agendData   = agend;
  docsData    = docs;

  renderDetailHeader();
  renderVisaoGeral();
  renderSessoes();
  renderManut();
  renderAgenda();
  renderDocs();
}

/* ── Detail Header ── */
function renderDetailHeader() {
  const m = selectedMach;
  const header = document.getElementById('detailHeader');

  const totalHoras = sessoesData.reduce((acc, s) => {
    const h = s.horasUso ?? calcHours(s.dataLigada, s.dataDesligada);
    return acc + (h || 0);
  }, 0);

  const proximoAgend = agendData
    .filter(a => new Date(a.dataInicio) >= new Date())
    .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))[0];

  const powerCls = m.ligada ? 'power-indicator--on' : 'power-indicator--off';
  const powerDot = m.ligada
    ? '<span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;margin-right:6px;box-shadow:0 0 6px rgba(34,197,94,.6)"></span>'
    : '<span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted);display:inline-block;margin-right:6px"></span>';

  header.innerHTML = `
    <div class="machine-detail__logo no-img" id="detailLogo">
      <img src="${getMachineImage(m.modelo)}" alt="${m.nome}"
           onload="document.getElementById('detailLogo').classList.remove('no-img')"
           onerror="document.getElementById('detailLogo').classList.add('no-img');this.style.display='none'">
      <div class="machine-detail__logo-placeholder">${getMachineIcon(m.modelo)}</div>
    </div>
    <div class="machine-detail__right">
      <div class="machine-detail__info">
        <div class="machine-detail__title">${m.nome}</div>
        <div class="machine-detail__subtitle">${m.modelo} &nbsp;·&nbsp; ${_t(m.tipoMedida)} &nbsp;·&nbsp; ${_t('Patrimônio')}: ${m.patrimonioId}</div>
        <div style="margin-top:var(--space-2)">
          <span class="power-indicator ${powerCls}">${powerDot}${m.ligada ? _t('Ligada') : _t('Desligada')}</span>
        </div>
      </div>
      <div class="machine-detail__kpis">
      <div class="machine-kpi">
        <div class="machine-kpi__value">${sessoesData.length}</div>
        <div class="machine-kpi__label">${_t('Sessões')}</div>
      </div>
      <div class="machine-kpi">
        <div class="machine-kpi__value">${totalHoras.toFixed(0)} h</div>
        <div class="machine-kpi__label">${_t('Horas totais')}</div>
      </div>
      <div class="machine-kpi">
        <div class="machine-kpi__value">${manutsData.length}</div>
        <div class="machine-kpi__label">${_t('Manutenções')}</div>
      </div>
      <div class="machine-kpi">
        <div class="machine-kpi__value">${agendData.length}</div>
        <div class="machine-kpi__label">${_t('Agendamentos')}</div>
      </div>
      <div class="machine-kpi">
        <div class="machine-kpi__value">${docsData.length}</div>
        <div class="machine-kpi__label">${_t('Documentos')}</div>
      </div>
    </div>
    <div class="machine-detail__actions">
      ${m.ligada
        ? `<button class="btn btn-danger btn-sm" id="btnDesligar">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
             ${_t('Desligar')}
           </button>`
        : `<button class="btn btn-success btn-sm" id="btnLigarHeader">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
             ${_t('Ligar')}
           </button>`}
      <button class="btn btn-ghost btn-sm" id="btnPrintReport">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        ${_t('Relatório')}
      </button>
    </div>
  </div>`;

  // Bind ligar/desligar from header
  const btnD = document.getElementById('btnDesligar');
  const btnL = document.getElementById('btnLigarHeader');
  if (btnD) btnD.addEventListener('click', () => openDesligarModal());
  if (btnL) btnL.addEventListener('click', () => openLigarModal());
  document.getElementById('btnPrintReport').addEventListener('click', printReport);
}

/* ── Tab: Visão Geral ── */
function renderVisaoGeral() {
  const m = selectedMach;

  // Current user section
  const curSection = document.getElementById('currentUserSection');
  if (m.ligada && m.usuarioAtual) {
    const sessaoAtiva = sessoesData.find(s => !s.dataDesligada);
    curSection.innerHTML = `
      <div class="current-user-card">
        <div class="current-user-avatar">${initials(m.usuarioAtual)}</div>
        <div class="current-user-info">
          <div class="current-user-info__name">${m.usuarioAtual}</div>
          <div class="current-user-info__since">
            ${_t('Usando desde')} ${sessaoAtiva ? fmtDT(sessaoAtiva.dataLigada) : '—'}
            ${sessaoAtiva?.motivo ? ' · ' + _t(sessaoAtiva.motivo) : ''}
          </div>
        </div>
        <span class="power-indicator power-indicator--on" style="margin-left:auto">● ${_t('Em uso')}</span>
      </div>`;
  } else {
    curSection.innerHTML = `
      <div class="no-user-card">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></svg>
        <span>${_t('Máquina livre — nenhum usuário no momento')}</span>
      </div>`;
  }

  // Info cards
  const ultimaManut = [...manutsData].sort((a, b) => new Date(b.data) - new Date(a.data))[0];
  const proximaManut = manutsData
    .filter(mn => mn.proximaData)
    .sort((a, b) => new Date(a.proximaData) - new Date(b.proximaData))[0];
  const proximoAgend = agendData
    .filter(a => new Date(a.dataInicio) >= new Date())
    .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))[0];
  const totalHoras = sessoesData.reduce((acc, s) => {
    const h = s.horasUso ?? calcHours(s.dataLigada, s.dataDesligada);
    return acc + (h || 0);
  }, 0);

  document.getElementById('overviewGrid').innerHTML = `
    <div class="overview-card">
      <div class="overview-card__title">🔧 ${_t('Dados do Equipamento')}</div>
      <div class="overview-row"><span class="overview-row__label">${_t('Modelo')}</span><span class="overview-row__value">${m.modelo}</span></div>
      <div class="overview-row"><span class="overview-row__label">${_t('Tipo de medida')}</span><span class="overview-row__value">${m.tipoMedida}</span></div>
      <div class="overview-row"><span class="overview-row__label">${_t('Volume de medição')}</span><span class="overview-row__value">${m.volumeMedicao}</span></div>
      <div class="overview-row"><span class="overview-row__label">${_t('Fabricante')}</span><span class="overview-row__value">${m.fabricante}</span></div>
      <div class="overview-row"><span class="overview-row__label">${_t('Ano instalação')}</span><span class="overview-row__value">${m.anoInstalacao}</span></div>
      <div class="overview-row"><span class="overview-row__label">${_t('Patrimônio')}</span><span class="overview-row__value">${m.patrimonioId}</span></div>
      <div class="overview-row"><span class="overview-row__label">${_t('Status')}</span><span class="overview-row__value">${statusBadge(m.status)}</span></div>
      ${m.observacao ? `<div class="overview-row"><span class="overview-row__label">${_t('Observação')}</span><span class="overview-row__value" style="font-style:italic">${m.observacao}</span></div>` : ''}
    </div>
    <div class="overview-card">
      <div class="overview-card__title">📊 ${_t('Uso & Manutenção')}</div>
      <div class="overview-row"><span class="overview-row__label">${_t('Total de sessões')}</span><span class="overview-row__value">${sessoesData.length}</span></div>
      <div class="overview-row"><span class="overview-row__label">${_t('Horas de uso total')}</span><span class="overview-row__value">${totalHoras.toFixed(1)} h</span></div>
      <div class="overview-row">
        <span class="overview-row__label">${_t('Última manutenção')}</span>
        <span class="overview-row__value">${ultimaManut ? fmtDate(ultimaManut.data) + ' — ' + ultimaManut.tipo : '—'}</span>
      </div>
      <div class="overview-row">
        <span class="overview-row__label">${_t('Próxima manutenção')}</span>
        <span class="overview-row__value">${proximaManut ? fmtDate(proximaManut.proximaData) + ' — ' + proximaManut.tipo : '—'}</span>
      </div>
      <div class="overview-row"><span class="overview-row__label">${_t('Manutenções registradas')}</span><span class="overview-row__value">${manutsData.length}</span></div>
      <div class="overview-row">
        <span class="overview-row__label">${_t('Próximo agendamento')}</span>
        <span class="overview-row__value">${proximoAgend ? fmtDT(proximoAgend.dataInicio) + ' — ' + proximoAgend.usuario : _t('Nenhum')}</span>
      </div>
      <div class="overview-row"><span class="overview-row__label">${_t('Total agendamentos')}</span><span class="overview-row__value">${agendData.length}</span></div>
    </div>`;
}

/* ── Tab: Registros de Uso (Sessões) ── */
function renderSessoes() {
  const tbody = document.getElementById('sessoesBody');
  if (!sessoesData.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--space-8); color:var(--text-muted)">${_t('Nenhum registro de uso encontrado.')}</td></tr>`;
    return;
  }
  tbody.innerHTML = [...sessoesData]
    .sort((a, b) => new Date(b.dataLigada) - new Date(a.dataLigada))
    .map(s => {
      const h = s.horasUso ?? calcHours(s.dataLigada, s.dataDesligada);
      const ativa = !s.dataDesligada;
      return `<tr${ativa ? ' style="background:rgba(34,197,94,.05)"' : ''}>
        <td>
          <span style="display:inline-flex;align-items:center;gap:6px">
            <span style="width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${initials(s.usuario)}</span>
            ${s.usuario}
          </span>
        </td>
        <td>${fmtDT(s.dataLigada)}</td>
        <td>${ativa ? `<span class="status-badge badge--success">${_t('Em uso')}</span>` : fmtDT(s.dataDesligada)}</td>
        <td>${fmtHours(h)}</td>
        <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.motivo || '—'}</td>
        <td style="color:var(--text-muted);font-size:var(--font-size-xs)">${s.observacao || '—'}</td>
        <td>
          <div style="display:flex;gap:4px">
            ${ativa
              ? `<button class="btn btn-danger btn-sm" onclick="desligarSessao(${s.id})" title="${_t('Desligar')}">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                 </button>`
              : ''}
            <button class="btn btn-ghost btn-sm" onclick="deleteSessao(${s.id})" title="${_t('Remover')}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
}

/* ── Tab: Manutenção ── */
function renderManut() {
  const filtered = manutFilter === 'todos'
    ? manutsData
    : manutsData.filter(mn => mn.tipo === manutFilter);

  const tbody = document.getElementById('manutBody');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:var(--space-8); color:var(--text-muted)">${_t('Nenhum registro de manutenção encontrado.')}</td></tr>`;
    return;
  }
  tbody.innerHTML = [...filtered]
    .sort((a, b) => new Date(b.data) - new Date(a.data))
    .map(mn => `
      <tr>
        <td><span class="status-badge badge--info" style="font-size:11px">${_t(mn.tipo)}</span></td>
        <td>${mn.responsavel}</td>
        <td>${fmtDate(mn.data)}</td>
        <td>${fmtDate(mn.proximaData)}</td>
        <td>${statusBadge(mn.status)}</td>
        <td style="color:var(--text-muted);font-size:var(--font-size-xs);max-width:200px">${mn.observacao || '—'}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-sm" onclick="editManut(${mn.id})" title="${_t('Editar')}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="deleteManut(${mn.id})" title="${_t('Remover')}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>`).join('');
}

/* ── Tab: Agendamentos ── */
function renderAgenda() {
  const list = document.getElementById('agendaList');
  const sorted = [...agendData].sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio));

  if (!sorted.length) {
    list.innerHTML = `<div class="machine-placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
      <p>${_t('Nenhum agendamento.')} ${_t('Clique em')} <strong>${_t('Novo Agendamento')}</strong> ${_t('para reservar.')}  </p>
    </div>`;
    return;
  }

  const now = new Date();
  list.innerHTML = sorted.map(a => {
    const start   = new Date(a.dataInicio);
    const end     = new Date(a.dataFim);
    const isPast  = end < now;
    const isNow   = start <= now && now <= end;
    const confCls = a.confirmado ? 'badge--success' : 'badge--warning';
    const confLbl = a.confirmado ? 'Confirmado' : 'Pendente';
    const bgStyle = isNow ? 'border-color:var(--color-success,#22c55e);background:rgba(34,197,94,.04)' : isPast ? 'opacity:.6' : '';

    return `
      <div class="agenda-item" style="${bgStyle}">
        <div class="agenda-item__date" style="${isPast ? 'background:var(--text-muted)' : isNow ? 'background:var(--color-success,#22c55e)' : ''}">
          <div class="agenda-item__date-day">${start.getDate().toString().padStart(2,'0')}</div>
          <div class="agenda-item__date-mon">${monthAbbr(a.dataInicio)}</div>
        </div>
        <div class="agenda-item__body">
          <div class="agenda-item__title">${a.usuario}</div>
          <div class="agenda-item__meta">
            <span>🕐 ${fmtDT(a.dataInicio)} → ${fmtDT(a.dataFim)}</span>
            ${a.motivo ? `<span>📋 ${_t(a.motivo)}</span>` : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-2)">
          <span class="status-badge ${confCls}">${confLbl}</span>
          <div class="agenda-item__actions">
            <button class="btn btn-ghost btn-sm" onclick="editAgend(${a.id})" title="${_t('Editar')}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="deleteAgend(${a.id})" title="${_t('Cancelar')}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ══════════════════════════════════════════
   PRINT REPORT
══════════════════════════════════════════ */
function printReport() {
  const m   = selectedMach;
  const now = new Date().toLocaleString(window.I18n?.lang() || 'pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

  const totalHoras = sessoesData.reduce((acc, s) => {
    const h = s.horasUso ?? calcHours(s.dataLigada, s.dataDesligada);
    return acc + (h || 0);
  }, 0);

  const ultimaManut = [...manutsData].sort((a, b) => new Date(b.data) - new Date(a.data))[0];
  const proximaManut = manutsData.filter(mn => mn.proximaData)
    .sort((a, b) => new Date(a.proximaData) - new Date(b.proximaData))[0];

  /* ── Sessões table rows ── */
  const sessoesRows = sessoesData.length
    ? [...sessoesData]
        .sort((a, b) => new Date(b.dataLigada) - new Date(a.dataLigada))
        .map(s => {
          const h = s.horasUso ?? calcHours(s.dataLigada, s.dataDesligada);
          const ativa = !s.dataDesligada;
          return `<tr${ativa ? ' class="row-active"' : ''}>
            <td>${s.usuario}</td>
            <td>${fmtDT(s.dataLigada)}</td>
            <td>${ativa ? `<span class="pill pill-green">${_t('Em uso')}</span>` : fmtDT(s.dataDesligada)}</td>
            <td>${fmtHours(h)}</td>
            <td>${s.motivo || '—'}</td>
            <td>${s.observacao || '—'}</td>
          </tr>`;
        }).join('')
    : `<tr><td colspan="6" class="empty">${_t('Nenhum registro de uso.')}</td></tr>`;

  /* ── Manutenções table rows ── */
  const manutRows = manutsData.length
    ? [...manutsData]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .map(mn => `<tr>
            <td>${_t(mn.tipo)}</td>
            <td>${mn.responsavel}</td>
            <td>${fmtDate(mn.data)}</td>
            <td>${fmtDate(mn.proximaData)}</td>
            <td><span class="pill ${mn.status === 'Concluída' ? 'pill-green' : mn.status === 'Em andamento' ? 'pill-orange' : 'pill-blue'}">${_t(mn.status)}</span></td>
            <td>${mn.observacao || '—'}</td>
          </tr>`).join('')
    : `<tr><td colspan="6" class="empty">${_t('Nenhum registro de manutenção.')}</td></tr>`;

  /* ── Agendamentos table rows ── */
  const agendRows = agendData.length
    ? [...agendData]
        .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
        .map(a => `<tr>
            <td>${a.usuario}</td>
            <td>${fmtDT(a.dataInicio)}</td>
            <td>${fmtDT(a.dataFim)}</td>
            <td>${a.motivo || '—'}</td>
            <td><span class="pill ${a.confirmado ? 'pill-green' : 'pill-orange'}">${a.confirmado ? _t('Confirmado') : _t('Pendente')}</span></td>
          </tr>`).join('')
    : `<tr><td colspan="5" class="empty">${_t('Nenhum agendamento.')}</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório — ${m.nome}</title>
  <style>
    @page { size: A4; margin: 18mm 20mm 18mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.5; }

    /* Header */
    .rpt-header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 16px; }
    .rpt-logo-block { display: flex; align-items: center; gap: 10px; }
    .rpt-logo-text { font-size: 18px; font-weight: 700; color: #2563eb; letter-spacing: .03em; }
    .rpt-logo-sub  { font-size: 10px; color: #64748b; }
    .rpt-title-block { text-align: right; }
    .rpt-title-block h1 { font-size: 15px; font-weight: 700; color: #1e293b; }
    .rpt-title-block .meta { font-size: 10px; color: #64748b; margin-top: 3px; }

    /* Machine info band */
    .info-band { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .info-item label { font-size: 9px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; display: block; }
    .info-item span  { font-size: 11px; font-weight: 600; color: #1e293b; }

    /* KPI row */
    .kpi-row  { display: flex; gap: 8px; margin-bottom: 18px; }
    .kpi-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; text-align: center; }
    .kpi-card .val { font-size: 18px; font-weight: 700; color: #2563eb; }
    .kpi-card .lbl { font-size: 9px; color: #94a3b8; margin-top: 2px; }

    /* Sections */
    .section        { margin-bottom: 22px; page-break-inside: avoid; }
    .section-title  { font-size: 12px; font-weight: 700; color: #2563eb; border-bottom: 1px solid #bfdbfe; padding-bottom: 4px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .section-title::before { content: ''; display: inline-block; width: 4px; height: 14px; background: #2563eb; border-radius: 2px; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    thead tr { background: #2563eb; color: #fff; }
    thead th { padding: 5px 7px; text-align: left; font-weight: 600; }
    tbody tr { border-bottom: 1px solid #e2e8f0; }
    tbody tr:nth-child(even) { background: #f8faff; }
    tbody tr.row-active { background: #dcfce7; }
    td { padding: 5px 7px; vertical-align: top; }
    td.empty { text-align: center; color: #94a3b8; padding: 12px; }

    /* Pills */
    .pill        { display: inline-block; padding: 1px 7px; border-radius: 9999px; font-size: 9px; font-weight: 600; }
    .pill-green  { background: #dcfce7; color: #16a34a; }
    .pill-orange { background: #ffedd5; color: #ea580c; }
    .pill-blue   { background: #dbeafe; color: #2563eb; }

    /* Footer */
    .rpt-footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }

    @media print { .no-print { display: none; } }
  </style>
</head>
<body>

  <!-- Print button (hidden when printing) -->
  <div class="no-print" style="text-align:right;margin-bottom:12px">
    <button onclick="window.print()" style="padding:6px 16px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">
      🖨️ Imprimir / Salvar PDF
    </button>
  </div>

  <!-- Report Header -->
  <div class="rpt-header">
    <div class="rpt-logo-block">
      <div>
        <div class="rpt-logo-text">ZEISS · PILOT</div>
        <div class="rpt-logo-sub">Metrologia SENAI · Centro de Metrologia</div>
      </div>
    </div>
    <div class="rpt-title-block">
      <h1>Relatório de Equipamento</h1>
      <div class="meta">Gerado em: ${now}</div>
      <div class="meta">Status: <strong>${_t(m.status)}</strong> &nbsp;|&nbsp; ${m.ligada ? `⚡ ${_t('Ligada')}` : `○ ${_t('Desligada')}`}</div>
    </div>
  </div>

  <!-- Machine Info -->
  <div class="info-band">
    <div class="info-item"><label>Equipamento</label><span>${m.nome}</span></div>
    <div class="info-item"><label>Modelo</label><span>${m.modelo}</span></div>
    <div class="info-item"><label>Tipo de Medida</label><span>${m.tipoMedida}</span></div>
    <div class="info-item"><label>Volume de Medição</label><span>${m.volumeMedicao}</span></div>
    <div class="info-item"><label>Fabricante</label><span>${m.fabricante}</span></div>
    <div class="info-item"><label>Ano de Instalação</label><span>${m.anoInstalacao}</span></div>
    <div class="info-item"><label>Patrimônio</label><span>${m.patrimonioId}</span></div>
    <div class="info-item"><label>Usuário atual</label><span>${m.usuarioAtual || '—'}</span></div>
    <div class="info-item"><label>Última manutenção</label><span>${ultimaManut ? fmtDate(ultimaManut.data) + ' — ' + ultimaManut.tipo : '—'}</span></div>
  </div>

  <!-- KPIs -->
  <div class="kpi-row">
    <div class="kpi-card"><div class="val">${sessoesData.length}</div><div class="lbl">Sessões de uso</div></div>
    <div class="kpi-card"><div class="val">${totalHoras.toFixed(1)} h</div><div class="lbl">Horas de operação</div></div>
    <div class="kpi-card"><div class="val">${manutsData.length}</div><div class="lbl">Manutenções</div></div>
    <div class="kpi-card"><div class="val">${agendData.length}</div><div class="lbl">Agendamentos</div></div>
    <div class="kpi-card"><div class="val">${proximaManut ? fmtDate(proximaManut.proximaData) : '—'}</div><div class="lbl">Próxima manutenção</div></div>
  </div>

  <!-- Sessões de Uso -->
  <div class="section">
    <div class="section-title">Registros de Uso (Sessões)</div>
    <table>
      <thead><tr>
        <th>Usuário</th><th>Ligada em</th><th>Desligada em</th><th>Horas</th><th>Motivo / Peças</th><th>Observações</th>
      </tr></thead>
      <tbody>${sessoesRows}</tbody>
    </table>
  </div>

  <!-- Manutenções -->
  <div class="section">
    <div class="section-title">Histórico de Manutenção</div>
    <table>
      <thead><tr>
        <th>Tipo</th><th>Responsável</th><th>Data</th><th>Próxima</th><th>Status</th><th>Observações</th>
      </tr></thead>
      <tbody>${manutRows}</tbody>
    </table>
  </div>

  <!-- Agendamentos -->
  <div class="section">
    <div class="section-title">Agendamentos</div>
    <table>
      <thead><tr>
        <th>Usuário</th><th>Início</th><th>Fim</th><th>Motivo</th><th>Confirmação</th>
      </tr></thead>
      <tbody>${agendRows}</tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="rpt-footer">
    <span>SENAI — Centro de Metrologia Zeiss · Relatório gerado automaticamente pelo sistema ZEISS·PILOT</span>
    <span>${now}</span>
  </div>

</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
}

/* ══════════════════════════════════════════
   USO MODALS (Ligar / Desligar)
══════════════════════════════════════════ */
function openLigarModal() {
  document.getElementById('usoSessaoId').value = '';
  document.getElementById('usoUsuario').value  = '';
  document.getElementById('usoMotivo').value   = '';
  document.getElementById('usoObs').value      = '';
  document.getElementById('usoDataLigada').value = toLocalDT(new Date());
  document.getElementById('grupoUsuario').style.display  = '';
  document.getElementById('grupoDataLigada').style.display = '';
  document.getElementById('grupoDataDesligada').style.display = 'none';
  document.getElementById('modalUsoTitle').textContent = _t('Registrar Ligação');
  showModal('modalUsoBackdrop');
}

function openDesligarModal() {
  const sessaoAtiva = sessoesData.find(s => !s.dataDesligada);
  if (!sessaoAtiva) { Toast.warning(_t('Nenhuma sessão ativa encontrada.')); return; }
  document.getElementById('usoSessaoId').value = sessaoAtiva.id;
  document.getElementById('usoUsuario').value  = sessaoAtiva.usuario;
  document.getElementById('usoMotivo').value   = sessaoAtiva.motivo || '';
  document.getElementById('usoObs').value      = sessaoAtiva.observacao || '';
  document.getElementById('usoDataLigada').value = toLocalDT(new Date(sessaoAtiva.dataLigada));
  document.getElementById('usoDataDesligada').value = toLocalDT(new Date());
  document.getElementById('grupoUsuario').style.display  = 'none';
  document.getElementById('grupoDataLigada').style.display = 'none';
  document.getElementById('grupoDataDesligada').style.display = '';
  document.getElementById('modalUsoTitle').textContent = _t('Desligar Máquina');
  showModal('modalUsoBackdrop');
}

async function saveUso() {
  const sessaoId = document.getElementById('usoSessaoId').value;
  const usuario  = document.getElementById('usoUsuario').value.trim();
  const motivo   = document.getElementById('usoMotivo').value.trim();
  const obs      = document.getElementById('usoObs').value.trim();

  if (sessaoId) {
    // Desligar
    const dataDesligada = document.getElementById('usoDataDesligada').value;
    if (!dataDesligada) { Toast.warning(_t('Informe a data/hora de desligamento.')); return; }
    const h = calcHours(
      sessoesData.find(s => s.id === parseInt(sessaoId))?.dataLigada,
      new Date(dataDesligada).toISOString()
    );
    await Api.patch(`${BASE_MAQ}/${selectedMach.id}/sessoes/${sessaoId}`, { dataDesligada: new Date(dataDesligada).toISOString(), horasUso: h, observacao: obs });
    selectedMach.ligada       = false;
    selectedMach.usuarioAtual = null;
  } else {
    // Ligar
    if (!usuario) { Toast.warning(_t('Informe o nome do usuário.')); return; }
    const dataLigada = document.getElementById('usoDataLigada').value;
    await Api.post(`${BASE_MAQ}/${selectedMach.id}/sessoes`, { usuario, motivo, observacao: obs, dataLigada: new Date(dataLigada).toISOString(), dataDesligada: null });
    selectedMach.ligada       = true;
    selectedMach.usuarioAtual = usuario;
  }
  hideModal('modalUsoBackdrop');
  sessaoId ? Toast.success(_t('Máquina desligada com sucesso.')) : Toast.success(_t('Uso registrado com sucesso.'));
  await selectMachine(selectedMach.id);
}

async function desligarSessao(sesId) {
  document.getElementById('usoSessaoId').value = sesId;
  const sessao = sessoesData.find(s => s.id === sesId);
  document.getElementById('usoUsuario').value  = sessao?.usuario  || '';
  document.getElementById('usoMotivo').value   = sessao?.motivo   || '';
  document.getElementById('usoObs').value      = sessao?.observacao || '';
  document.getElementById('usoDataLigada').value = toLocalDT(new Date(sessao?.dataLigada));
  document.getElementById('usoDataDesligada').value = toLocalDT(new Date());
  document.getElementById('grupoUsuario').style.display = 'none';
  document.getElementById('grupoDataLigada').style.display = 'none';
  document.getElementById('grupoDataDesligada').style.display = '';
  document.getElementById('modalUsoTitle').textContent = _t('Desligar Máquina');
  showModal('modalUsoBackdrop');
}

async function deleteSessao(id) {
  const ok = await Confirm.show({ message: _t('Remover este registro de uso?') });
  if (!ok) return;
  await Api.del(`${BASE_MAQ}/${selectedMach.id}/sessoes/${id}`);
  Toast.success(_t('Registro removido.'));
  await selectMachine(selectedMach.id);
}

/* ══════════════════════════════════════════
   MANUTENCAO MODAL
══════════════════════════════════════════ */
function openManutModal(mn = null) {
  document.getElementById('manutId').value           = mn?.id ?? '';
  document.getElementById('manutTipo').value         = mn?.tipo ?? '';
  document.getElementById('manutResponsavel').value  = mn?.responsavel ?? '';
  document.getElementById('manutData').value         = mn?.data ?? '';
  document.getElementById('manutProxima').value      = mn?.proximaData ?? '';
  document.getElementById('manutStatus').value       = mn?.status ?? 'Concluída';
  document.getElementById('manutObs').value          = mn?.observacao ?? '';
  showModal('modalManutBackdrop');
}

function editManut(id) {
  openManutModal(manutsData.find(mn => mn.id === id));
}

async function saveManut() {
  const id    = document.getElementById('manutId').value;
  const tipo  = document.getElementById('manutTipo').value;
  const resp  = document.getElementById('manutResponsavel').value.trim();
  const data  = document.getElementById('manutData').value;
  if (!tipo || !resp || !data) { Toast.warning(_t('Preencha os campos obrigatórios.')); return; }

  const payload = {
    tipo, responsavel: resp, data,
    proximaData: document.getElementById('manutProxima').value || null,
    status:      document.getElementById('manutStatus').value,
    observacao:  document.getElementById('manutObs').value.trim(),
  };
  if (id) {
    await Api.patch(`${BASE_MAQ}/${selectedMach.id}/manutencoes/${id}`, payload);
  } else {
    await Api.post(`${BASE_MAQ}/${selectedMach.id}/manutencoes`, payload);
  }
  hideModal('modalManutBackdrop');
  id ? Toast.success(_t('Manutenção atualizada.')) : Toast.success(_t('Manutenção registrada.'));
  await selectMachine(selectedMach.id);
}

async function deleteManut(id) {
  const ok = await Confirm.show({ message: _t('Remover este registro de manutenção?') });
  if (!ok) return;
  await Api.del(`${BASE_MAQ}/${selectedMach.id}/manutencoes/${id}`);
  Toast.success(_t('Registro removido.'));
  await selectMachine(selectedMach.id);
}

/* ══════════════════════════════════════════
   AGENDAMENTO MODAL
══════════════════════════════════════════ */
function openAgendModal(a = null) {
  document.getElementById('agendId').value         = a?.id ?? '';
  document.getElementById('agendUsuario').value    = a?.usuario ?? '';
  document.getElementById('agendInicio').value     = a ? toLocalDT(new Date(a.dataInicio)) : '';
  document.getElementById('agendFim').value        = a ? toLocalDT(new Date(a.dataFim))    : '';
  document.getElementById('agendMotivo').value     = a?.motivo ?? '';
  document.getElementById('agendConfirmado').value = a ? String(a.confirmado) : 'false';
  document.getElementById('modalAgendTitle').textContent = a ? _t('Editar Agendamento') : _t('Novo Agendamento');
  showModal('modalAgendBackdrop');
}

function editAgend(id) {
  openAgendModal(agendData.find(a => a.id === id));
}

async function saveAgend() {
  const id       = document.getElementById('agendId').value;
  const usuario  = document.getElementById('agendUsuario').value.trim();
  const inicio   = document.getElementById('agendInicio').value;
  const fim      = document.getElementById('agendFim').value;
  if (!usuario || !inicio || !fim) { Toast.warning(_t('Preencha os campos obrigatórios.')); return; }

  const payload = {
    usuario,
    dataInicio:  new Date(inicio).toISOString(),
    dataFim:     new Date(fim).toISOString(),
    motivo:      document.getElementById('agendMotivo').value.trim(),
    confirmado:  document.getElementById('agendConfirmado').value === 'true',
  };
  if (id) {
    await Api.patch(`${BASE_MAQ}/${selectedMach.id}/agendamentos/${id}`, payload);
  } else {
    await Api.post(`${BASE_MAQ}/${selectedMach.id}/agendamentos`, payload);
  }
  hideModal('modalAgendBackdrop');
  id ? Toast.success(_t('Agendamento atualizado.')) : Toast.success(_t('Agendamento criado.'));
  await selectMachine(selectedMach.id);
}

async function deleteAgend(id) {
  const ok = await Confirm.show({ message: _t('Cancelar este agendamento?') });
  if (!ok) return;
  await Api.del(`${BASE_MAQ}/${selectedMach.id}/agendamentos/${id}`);
  Toast.success(_t('Agendamento cancelado.'));
  await selectMachine(selectedMach.id);
}

/* ══════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════ */
function showModal(id) { Modal.open(id); }
function hideModal(id) { Modal.close(id); }

function toLocalDT(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

/* ══════════════════════════════════════════
   DOCUMENTOS DA MÁQUINA
══════════════════════════════════════════ */
function docStatusBadge(status) {
  const map = {
    'ativo':           'badge--success',
    'prestes a vencer':'badge--warning',
    'expirado':        'badge--danger',
  };
  const labels = {
    'ativo':           'Ativo',
    'prestes a vencer':'Vence em breve',
    'expirado':        'Expirado',
  };
  const cls = map[status] || 'badge--neutral';
  const lbl = labels[status] || status;
  return `<span class="status-badge ${cls}">${_t(lbl)}</span>`;
}

function renderDocs() {
  const tbody  = document.getElementById('docsMaquinaBody');
  const count  = document.getElementById('docsTabCount');
  const alerts = document.getElementById('docsMaquinaAlerts');
  if (!tbody) return;

  // badge no tab
  if (count) {
    count.textContent = docsData.length;
    count.style.display = docsData.length ? '' : 'none';
  }

  // alert de vencimento
  if (alerts) {
    const vencendo = docsData.filter(d => d.status === 'prestes a vencer');
    const expirado = docsData.filter(d => d.status === 'expirado');
    const parts = [];
    if (expirado.length)  parts.push(`<strong>${expirado.length}</strong> documento(s) <strong>expirado(s)</strong>`);
    if (vencendo.length)  parts.push(`<strong>${vencendo.length}</strong> vencendo em 30 dias`);
    alerts.innerHTML = parts.length
      ? `<div class="alert alert--warning" style="margin-bottom:var(--space-4)"><strong>Atenção:</strong> ${parts.join(' e ')}. Revise os documentos imediatamente.</div>`
      : '';
  }

  if (!docsData.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:var(--space-8);color:var(--text-muted)">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display:block;margin:0 auto 8px;opacity:.35"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
      ${_t('Nenhum documento anexado a esta máquina.')}
    </td></tr>`;
    return;
  }

  tbody.innerHTML = docsData.map(d => {
    const expirado = d.status === 'expirado';
    const rowStyle = expirado ? ' style="opacity:.65"' : '';
    return `<tr${rowStyle}>
      <td>
        <a href="/api/maquinas/${d.maquinaId}/documentos/${d.id}/abrir" target="_blank" rel="noopener"
           style="display:flex;align-items:center;gap:6px;color:var(--color-primary-text);font-weight:500;text-decoration:none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          ${d.nomeArquivo}
        </a>
      </td>
      <td><span class="status-badge badge--info" style="font-size:11px">${_t(d.tipoDocumento || '—')}</span></td>
      <td style="color:var(--text-muted);font-size:var(--font-size-xs)">${d.dataUpload ? fmtDate(d.dataUpload.split('T')[0]) : '—'}</td>
      <td style="color:var(--text-muted);font-size:var(--font-size-xs)">${d.dataExpiracao ? fmtDate(d.dataExpiracao) : '—'}</td>
      <td>${docStatusBadge(d.status)}</td>
      <td>
        <button class="btn btn-ghost btn-sm perm-edit" onclick="deleteDoc(${d.id})" title="${_t('Remover')}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

function openDocModal() {
  document.getElementById('docMaquinaArquivo').value = '';
  document.getElementById('docMaquinaTipo').value    = '';
  document.getElementById('docMaquinaValidade').value = '';
  showModal('modalDocMaquina');
}

async function saveDoc() {
  const fileInput = document.getElementById('docMaquinaArquivo');
  const tipo      = document.getElementById('docMaquinaTipo').value;
  const validade  = document.getElementById('docMaquinaValidade').value;

  if (!fileInput.files || !fileInput.files[0]) { Toast.warning(_t('Selecione um arquivo PDF.')); return; }
  if (!tipo) { Toast.warning(_t('Selecione o tipo de documento.')); return; }

  const formData = new FormData();
  formData.append('arquivo', fileInput.files[0]);
  formData.append('tipoDocumento', tipo);
  if (validade) formData.append('dataExpiracao', validade);

  const btn = document.getElementById('saveDocMaquina');
  btn.disabled = true; btn.textContent = _t('Enviando…');

  try {
    await Api.upload(`${BASE_MAQ}/${selectedMach.id}/documentos/upload`, formData);
    Toast.success(_t('Documento anexado com sucesso!'));
    hideModal('modalDocMaquina');
    docsData = await Api.get(`${BASE_MAQ}/${selectedMach.id}/documentos`);
    renderDocs();
    renderDetailHeader();
  } catch (err) {
    Toast.error(err.message || _t('Erro ao enviar documento.'));
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> ${_t('Enviar')}`;
  }
}

async function deleteDoc(id) {
  const ok = await Confirm.show({ title: _t('Remover Documento'), message: _t('O arquivo será removido permanentemente. Confirmar?'), confirmText: _t('Remover'), type: 'danger' });
  if (!ok) return;
  try {
    await Api.del(`${BASE_MAQ}/${selectedMach.id}/documentos/${id}`);
    Toast.success(_t('Documento removido.'));
    docsData = docsData.filter(d => d.id !== id);
    renderDocs();
    renderDetailHeader();
  } catch (err) {
    Toast.error(err.message || _t('Erro ao remover documento.'));
  }
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('zeiss:langchange', () => {
  renderMachineNav();
  if (selectedMach) {
    renderDetailHeader();
    renderVisaoGeral();
    renderSessoes();
    renderManut();
    renderAgenda();
    renderDocs();
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  // Load machines
  try {
    const data = await Api.get(BASE_MAQ);
    allMachines = data.content ?? data;
  } catch {
    allMachines = [];
    document.getElementById('maqNav').innerHTML =
      '<p style="color:var(--text-muted);padding:var(--space-4)">Erro ao carregar máquinas.</p>';
    return;
  }
  renderMachineNav();
  if (allMachines.length) await selectMachine(allMachines[0].id);

  // Page-level tab switching (CMM ↔ Scanners 3D)
  document.querySelectorAll('.maq-page-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.maq-page-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.maq-page-section').forEach(s => s.style.display = 'none');
      btn.classList.add('active');
      const section = document.getElementById('section-' + btn.dataset.section);
      if (section) section.style.display = '';
    });
  });

  // Tab switching
  document.querySelectorAll('#machineDetail .detail-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#machineDetail .detail-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('#machineDetail .detail-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Maint sub-tabs
  document.querySelectorAll('.maint-subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.maint-subtab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      manutFilter = btn.dataset.maint;
      renderManut();
    });
  });

  // Botão "Registrar Uso" inside use tab
  document.getElementById('btnLigar').addEventListener('click', openLigarModal);
  document.getElementById('btnNovaManutencao').addEventListener('click', () => openManutModal());
  document.getElementById('btnNovoAgendamento').addEventListener('click', () => openAgendModal());

  // Modal close / cancel
  ['modalUsoBackdrop','modalManutBackdrop','modalAgendBackdrop'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) hideModal(id);
    });
  });
  document.getElementById('modalUsoClose').addEventListener('click',   () => hideModal('modalUsoBackdrop'));
  document.getElementById('cancelUso').addEventListener('click',       () => hideModal('modalUsoBackdrop'));
  document.getElementById('saveUso').addEventListener('click',         saveUso);

  document.getElementById('modalManutClose').addEventListener('click', () => hideModal('modalManutBackdrop'));
  document.getElementById('cancelManut').addEventListener('click',     () => hideModal('modalManutBackdrop'));
  document.getElementById('saveManut').addEventListener('click',       saveManut);

  document.getElementById('modalAgendClose').addEventListener('click', () => hideModal('modalAgendBackdrop'));
  document.getElementById('cancelAgend').addEventListener('click',     () => hideModal('modalAgendBackdrop'));
  document.getElementById('saveAgend').addEventListener('click',       saveAgend);

  // Documentos da máquina
  document.getElementById('btnNovoDocMaquina').addEventListener('click', openDocModal);
  document.getElementById('saveDocMaquina').addEventListener('click',    saveDoc);
  document.getElementById('cancelDocMaquina').addEventListener('click',  () => hideModal('modalDocMaquina'));
  document.getElementById('modalDocMaquinaClose').addEventListener('click', () => hideModal('modalDocMaquina'));
});

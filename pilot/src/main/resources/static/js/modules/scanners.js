/* ─────────────────────────────────────────────────────────────────
   Módulo: Controle de Scanners 3D
   - Registro de retirada/retorno (T-SCAN Hawk, T-SCAN CS+, etc.)
   - Armazenamento em localStorage: zp-scanner-logs
───────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const STORAGE_KEY = 'zp-scanner-logs';
  const MANUT_KEY   = 'zp-scanner-manut';
  const AGEND_KEY   = 'zp-scanner-agend';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  const SCANNERS = [
    { id: 'tscan-hawk2', nome: 'T-SCAN Hawk 2', tipo: 'Scanner 3D Portátil a Laser',    sn: 'TSH2-2024-001',   img: '/img/ZEISS-ScanHanwk2.jpg' },
    { id: 'atos-q',      nome: 'ATOS Q',         tipo: 'Scanner 3D de Luz Estruturada',  sn: 'ATOSQ-2023-001',  img: '/img/solutions_atosq_product-1024x768.png' },
  ];

  let allLogs         = [];
  let allManut        = [];
  let allAgend        = [];
  let filterStat      = 'todos';
  let selectedScannerId = SCANNERS[0].id;

  /* ── storage (fallback para dados demo se localStorage vazio ou sem scannerId) ── */
  function getLogs() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!d.length) return DEMO_LOGS;
      // se nenhum registro tem scannerId, descarta dados legados e usa demo
      return d.some(r => r.scannerId) ? d : DEMO_LOGS;
    } catch { return DEMO_LOGS; }
  }
  function saveLogs(data)   { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  function nextId()         { return allLogs.length  ? Math.max(...allLogs.map(r => r.id  || 0)) + 1 : 1; }

  function getManut() {
    try {
      const d = JSON.parse(localStorage.getItem(MANUT_KEY) || '[]');
      if (!d.length) return DEMO_MANUT;
      return d.some(r => r.scannerId) ? d : DEMO_MANUT;
    } catch { return DEMO_MANUT; }
  }
  function saveManutData(d) { localStorage.setItem(MANUT_KEY, JSON.stringify(d)); }
  function nextManutId()    { return allManut.length ? Math.max(...allManut.map(r => r.id || 0)) + 1 : 1; }

  function getAgend() {
    try {
      const d = JSON.parse(localStorage.getItem(AGEND_KEY) || '[]');
      if (!d.length) return DEMO_AGEND;
      return d.some(r => r.scannerId) ? d : DEMO_AGEND;
    } catch { return DEMO_AGEND; }
  }
  function saveAgendData(d) { localStorage.setItem(AGEND_KEY, JSON.stringify(d)); }
  function nextAgendId()    { return allAgend.length ? Math.max(...allAgend.map(r => r.id || 0)) + 1 : 1; }

  /* ── demo data (fallback quando localStorage vazio) ── */
  const DEMO_LOGS = [
    { id:1, scannerId:'tscan-hawk2', responsavel:'Carlos Mendes',   local:'Em Campo',    dataRetirada:'2025-03-10T08:30', dataRetorno:'2025-03-10T17:45', observacoes:'Digitalização peças motor — cliente Bosch',      criadoEm:'2025-03-10T08:30:00Z' },
    { id:2, scannerId:'atos-q',      responsavel:'Fernanda Lima',   local:'Laboratório', dataRetirada:'2025-03-14T09:00', dataRetorno:'2025-03-14T12:30', observacoes:'Inspeção dimensional lote #A47',                 criadoEm:'2025-03-14T09:00:00Z' },
    { id:3, scannerId:'tscan-hawk2', responsavel:'Rafael Souza',    local:'Em Campo',    dataRetirada:'2025-03-18T07:00', dataRetorno:'2025-03-19T16:00', observacoes:'Escaneamento de turbina — planta Curitiba',       criadoEm:'2025-03-18T07:00:00Z' },
    { id:4, scannerId:'atos-q',      responsavel:'Ana Paula Costa', local:'Laboratório', dataRetirada:'2025-03-20T13:00', dataRetorno:'2025-03-20T16:00', observacoes:'Controle de qualidade peças injetadas',           criadoEm:'2025-03-20T13:00:00Z' },
    { id:5, scannerId:'tscan-hawk2', responsavel:'Lucas Ferreira',  local:'Em Campo',    dataRetirada:'2025-03-24T08:00', dataRetorno:null,               observacoes:'Digitalização estrutura metálica — obra campo',  criadoEm:'2025-03-24T08:00:00Z' },
  ];
  const DEMO_MANUT = [
    { id:1, scannerId:'tscan-hawk2', tipo:'Revisão Geral',       responsavel:'ZEISS Brasil',  data:'2025-01-15', proxima:'2025-07-15', status:'Concluída',    observacoes:'Revisão semestral preventiva — sem anomalias'  },
    { id:2, scannerId:'atos-q',      tipo:'Calibração',          responsavel:'ZEISS Brasil',  data:'2025-02-03', proxima:'2025-08-03', status:'Concluída',    observacoes:'Recalibração após transporte'                  },
    { id:3, scannerId:'tscan-hawk2', tipo:'Limpeza',             responsavel:'Carlos Mendes', data:'2025-03-05', proxima:null,         status:'Concluída',    observacoes:'Limpeza das lentes e sensores após campo'      },
    { id:4, scannerId:'atos-q',      tipo:'Revisão Geral',       responsavel:'ZEISS Brasil',  data:'2025-07-10', proxima:'2026-01-10', status:'Agendada',     observacoes:'Revisão semestral programada'                  },
    { id:5, scannerId:'tscan-hawk2', tipo:'Troca de Componente', responsavel:'ZEISS Brasil',  data:'2025-03-20', proxima:null,         status:'Em andamento', observacoes:'Substituição do cabo USB-C do controlador'     },
  ];
  const DEMO_AGEND = [
    { id:1, scannerId:'tscan-hawk2', usuario:'Rafael Souza',    inicio:'2025-03-26T08:00', fim:'2025-03-26T12:00', motivo:'Digitalização carcaça motor — lote 52',    confirmado:'true'  },
    { id:2, scannerId:'atos-q',      usuario:'Fernanda Lima',   inicio:'2025-03-26T13:30', fim:'2025-03-26T17:00', motivo:'Inspeção peças fundidas — cliente WEG',    confirmado:'true'  },
    { id:3, scannerId:'tscan-hawk2', usuario:'Ana Paula Costa', inicio:'2025-03-28T09:00', fim:'2025-03-28T11:00', motivo:'Medição de desvios geométricos',            confirmado:'false' },
    { id:4, scannerId:'atos-q',      usuario:'Lucas Ferreira',  inicio:'2025-04-02T08:00', fim:'2025-04-02T16:00', motivo:'Projeto de engenharia reversa — peça X9',  confirmado:'false' },
    { id:5, scannerId:'tscan-hawk2', usuario:'Carlos Mendes',   inicio:'2025-04-07T07:30', fim:'2025-04-08T17:00', motivo:'Digitalização em campo — planta São Paulo', confirmado:'true'  },
  ];

  /* ── date helpers ── */
  function fmtDT(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString(window.I18n?.lang() || 'pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }
  function nowLocal() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  /* ── Selecionar scanner ── */
  function selectScanner(id) {
    selectedScannerId = id;
    renderCards();
    updateDetailHeader();
    renderTable();
    renderManut();
    renderAgend();
  }

  /* ── Header do detalhe ── */
  function updateDetailHeader() {
    const header = document.getElementById('scannerDetailHeader');
    if (!header) return;
    const scanner = SCANNERS.find(s => s.id === selectedScannerId);
    if (!scanner) { header.innerHTML = ''; return; }
    const inUse      = allLogs.find(r => r.scannerId === scanner.id && !r.dataRetorno);
    const logsCount  = allLogs.filter(r => r.scannerId === scanner.id).length;
    const manutCount = allManut.filter(r => r.scannerId === scanner.id).length;
    const agendCount = allAgend.filter(r => r.scannerId === scanner.id).length;
    header.innerHTML = `
      <div class="machine-detail__info">
        <div class="machine-detail__title">${scanner.nome}</div>
        <div class="machine-detail__subtitle">${_t(scanner.tipo)} · S/N ${scanner.sn}</div>
        <div style="margin-top:var(--space-3);display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center">
          <span class="badge ${inUse ? 'badge--danger' : 'badge--success'}">
            <span class="badge-dot"></span>${inUse ? _t('Em uso / Fora do Lab') : _t('Disponível')}
          </span>
        </div>
      </div>
      <div class="machine-detail__kpis">
        <div class="machine-kpi"><div class="machine-kpi__value">${logsCount}</div><div class="machine-kpi__label">Registros</div></div>
        <div class="machine-kpi"><div class="machine-kpi__value">${manutCount}</div><div class="machine-kpi__label">Manutenções</div></div>
        <div class="machine-kpi"><div class="machine-kpi__value">${agendCount}</div><div class="machine-kpi__label">Agendamentos</div></div>
      </div>
      <div class="machine-detail__actions">
        ${inUse ? `
          <button class="btn btn-success btn-sm" onclick="ScannersModule.registrarRetorno(${inUse.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,14 4,9 9,4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
            Registrar Retorno
          </button>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="ScannersModule.abrirModalRetirada('${scanner.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar Retirada
          </button>
        `}
      </div>`;
  }

  /* ── load & render ── */
  function load() {
    allLogs  = getLogs();
    allManut = getManut();
    allAgend = getAgend();
    renderCards();
    updateDetailHeader();
    renderTable();
    renderManut();
    renderAgend();
  }

  /* ── Scanner Status Cards ── */
  function renderCards() {
    const grid = document.getElementById('scannerGrid');
    if (!grid) return;

    const scanSvg = `<svg width="36" height="36" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 20 Q8 8 20 8 H44 Q56 8 56 20 V44 Q56 56 44 56 H20 Q8 56 8 44 Z"/>
      <circle cx="32" cy="32" r="10"/>
      <line x1="32" y1="8" x2="32" y2="22"/><line x1="32" y1="42" x2="32" y2="56"/>
      <line x1="8" y1="32" x2="22" y2="32"/><line x1="42" y1="32" x2="56" y2="32"/>
      <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none"/>
    </svg>`;

    grid.innerHTML = SCANNERS.map(s => {
      const active   = allLogs.find(r => r.scannerId === s.id && !r.dataRetorno);
      const inUse    = !!active;
      const selected = s.id === selectedScannerId;

      const thumb = s.img
        ? `<div class="scanner-card__thumb"><img src="${s.img}" alt="${s.nome}" /></div>`
        : `<div class="scanner-card__icon">${scanSvg}</div>`;

      return `
        <div class="scanner-card ${inUse ? 'scanner-card--in-use' : 'scanner-card--available'}${selected ? ' scanner-card--selected' : ''}"
             onclick="ScannersModule.selectScanner('${s.id}')">
          ${thumb}
          <div class="scanner-card__info">
            <div class="scanner-card__name">${s.nome}</div>
            <div class="scanner-card__meta">${_t(s.tipo)} · S/N ${s.sn}</div>
            <span class="badge ${inUse ? 'badge--danger' : 'badge--success'}" style="margin-top:6px">
              <span class="badge-dot"></span>${inUse ? _t('Em uso / Fora do Lab') : _t('Disponível')}
            </span>
          </div>
          <div class="scanner-card__actions">
            ${inUse ? `
              <div class="scanner-card__user-info">
                <span><strong>${active.responsavel}</strong></span>
                <span>${active.local === 'Em Campo' ? 'Em Campo' : 'Laboratório'}</span>
                <span>Saída: ${fmtDT(active.dataRetirada)}</span>
              </div>
              <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); ScannersModule.registrarRetorno(${active.id})">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,14 4,9 9,4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
                Registrar Retorno
              </button>
            ` : `
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); ScannersModule.selectScanner('${s.id}'); ScannersModule.abrirModalRetirada('${s.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Registrar Retirada
              </button>
            `}
          </div>
        </div>`;
    }).join('');
  }

  /* ── Registros Table ── */
  function renderTable() {
    const tbody = document.getElementById('scannerLogsBody');
    if (!tbody) return;

    const scannerLogs = allLogs.filter(r => r.scannerId === selectedScannerId);
    const data = filterStat === 'em-uso'    ? scannerLogs.filter(r => !r.dataRetorno)
               : filterStat === 'devolvido' ? scannerLogs.filter(r => !!r.dataRetorno)
               : scannerLogs;

    const sorted = [...data].sort((a, b) => new Date(b.dataRetirada) - new Date(a.dataRetirada));

    if (!sorted.length) {
      EmptyState.table(tbody, 7, _t('Nenhum registro encontrado'), _t('Registre a retirada de um scanner.'));
      return;
    }

    tbody.innerHTML = sorted.map(r => {
      const emUso   = !r.dataRetorno;
      const duracao = calcDuracao(r.dataRetirada, r.dataRetorno);
      const initials = (r.responsavel || '?').split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

      return `<tr${emUso ? ' style="background:rgba(34,197,94,.04)"' : ''}>
        <td>
          <span style="display:inline-flex;align-items:center;gap:8px">
            <span style="width:28px;height:28px;border-radius:50%;background:var(--color-primary);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${initials}</span>
            ${r.responsavel}
          </span>
        </td>
        <td>${fmtDT(r.dataRetirada)}</td>
        <td>${emUso ? `<span class="badge badge--danger"><span class="badge-dot"></span>${_t('Em uso')}</span>` : fmtDT(r.dataRetorno)}</td>
        <td>${duracao}</td>
        <td>
          ${r.local === 'Em Campo'
            ? `<span class="badge badge--warning"><span class="badge-dot"></span>${_t('Em Campo')}</span>`
            : `<span class="badge badge--neutral"><span class="badge-dot"></span>${_t('Laboratório')}</span>`}
        </td>
        <td style="color:var(--text-muted);font-size:var(--font-size-xs);max-width:200px">${r.observacoes || '—'}</td>
        <td>
          <div style="display:flex;gap:4px">
            ${emUso ? `<button class="btn btn-success btn-sm" onclick="ScannersModule.registrarRetorno(${r.id})" title="Registrar Retorno">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,14 4,9 9,4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
            </button>` : ''}
            <button class="btn btn-ghost btn-sm" onclick="ScannersModule.editar(${r.id})" title="Editar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="ScannersModule.excluir(${r.id})" title="Excluir">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  function calcDuracao(inicio, fim) {
    if (!inicio) return '—';
    const ms = (fim ? new Date(fim) : new Date()) - new Date(inicio);
    if (ms < 0) return '—';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (h >= 24) { const d = Math.floor(h / 24); return `${d}d ${h % 24}h`; }
    return `${h}h ${m}m`;
  }

  /* ── Modal: Retirada ── */
  function abrirModalRetirada(scannerId) {
    document.getElementById('scannerLogId').value    = '';
    document.getElementById('scannerSelect').value   = scannerId || '';
    document.getElementById('scannerResp').value     = '';
    document.getElementById('scannerLocal').value    = 'Laboratório';
    document.getElementById('scannerRetirada').value = nowLocal();
    document.getElementById('scannerRetorno').value  = '';
    document.getElementById('scannerObs').value      = '';
    document.getElementById('scannerModalTitle').textContent = _t('Registrar Retirada de Scanner');
    document.getElementById('scannerRetornoGroup').style.display = 'none';
    document.getElementById('scannerLocal').dispatchEvent(new Event('change'));
    Modal.open('modalScannerLog');
  }

  function editar(id) {
    const r = allLogs.find(x => x.id === id);
    if (!r) { Toast.error(_t('Registro não encontrado.')); return; }
    document.getElementById('scannerLogId').value    = r.id;
    document.getElementById('scannerSelect').value   = r.scannerId || '';
    document.getElementById('scannerResp').value     = r.responsavel || '';
    document.getElementById('scannerLocal').value    = r.local || 'Laboratório';
    document.getElementById('scannerRetirada').value = r.dataRetirada ? r.dataRetirada.slice(0,16) : '';
    document.getElementById('scannerRetorno').value  = r.dataRetorno  ? r.dataRetorno.slice(0,16)  : '';
    document.getElementById('scannerObs').value      = r.observacoes || '';
    document.getElementById('scannerModalTitle').textContent = _t('Editar Registro');
    document.getElementById('scannerRetornoGroup').style.display = '';
    Modal.open('modalScannerLog');
  }

  /* ── Modal: Retorno rápido ── */
  function registrarRetorno(id) {
    const r = allLogs.find(x => x.id === id);
    if (!r) { Toast.error(_t('Registro não encontrado.')); return; }
    editar(id);
    // pre-fill retorno with now
    document.getElementById('scannerRetorno').value = nowLocal();
  }

  /* ── Save ── */
  function salvar() {
    const scannerId    = document.getElementById('scannerSelect').value;
    const responsavel  = document.getElementById('scannerResp').value.trim();
    const local        = document.getElementById('scannerLocal').value;
    const dataRetirada = document.getElementById('scannerRetirada').value;
    const dataRetorno  = document.getElementById('scannerRetorno').value;
    const observacoes  = document.getElementById('scannerObs').value.trim();

    if (!scannerId)   { Toast.warning(_t('Selecione o scanner.')); return; }
    if (!responsavel) { Toast.warning(_t('Informe o responsável.')); return; }
    if (!dataRetirada){ Toast.warning(_t('Informe a data/hora de retirada.')); return; }
    if (dataRetorno && dataRetorno < dataRetirada) {
      Toast.warning(_t('Data de retorno não pode ser anterior à retirada.')); return;
    }

    const btn = document.getElementById('btnSalvarScannerLog');
    btn.disabled = true; btn.textContent = _t('Salvando...');

    try {
      allLogs = getLogs();
      const id = document.getElementById('scannerLogId').value;

      if (id) {
        const idx = allLogs.findIndex(r => r.id === parseInt(id));
        if (idx !== -1) {
          allLogs[idx] = { ...allLogs[idx], scannerId, responsavel, local, dataRetirada, dataRetorno: dataRetorno || null, observacoes };
          Toast.success(_t('Registro atualizado!'));
        }
      } else {
        allLogs.push({ id: nextId(), scannerId, responsavel, local, dataRetirada, dataRetorno: dataRetorno || null, observacoes, criadoEm: new Date().toISOString() });
        Toast.success(_t('Retirada registrada com sucesso!'));
      }

      saveLogs(allLogs);
      Modal.close('modalScannerLog');
      load();
    } finally {
      btn.disabled = false; btn.textContent = _t('Salvar');
    }
  }

  async function excluir(id) {
    const ok = await Confirm.show({ title: _t('Excluir Registro'), message: _t('Confirmar exclusão deste registro?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    allLogs = getLogs().filter(r => r.id !== id);
    saveLogs(allLogs);
    Toast.success(_t('Registro excluído.'));
    load();
  }

  /* ── Manutenção ── */
  function renderManut() {
    const tbody = document.getElementById('scannerManutBody');
    if (!tbody) return;

    const scannerManut = allManut.filter(r => r.scannerId === selectedScannerId);

    if (!scannerManut.length) {
      EmptyState.table(tbody, 8, _t('Nenhuma manutenção registrada'), _t('Registre a primeira manutenção para este scanner.'));
      return;
    }

    const sorted = [...scannerManut].sort((a, b) => new Date(b.data) - new Date(a.data));
    tbody.innerHTML = sorted.map(r => {
      const scanner = SCANNERS.find(s => s.id === r.scannerId) || { nome: r.scannerId };
      const statusClass = r.status === 'Concluída' ? 'badge--success' : r.status === 'Em andamento' ? 'badge--warning' : 'badge--neutral';
      return `<tr>
        <td><strong>${scanner.nome}</strong></td>
        <td>${_t(r.tipo)}</td>
        <td>${r.responsavel}</td>
        <td>${r.data ? new Date(r.data + 'T00:00').toLocaleDateString(window.I18n?.lang() || 'pt-BR') : '—'}</td>
        <td>${r.proxima ? new Date(r.proxima + 'T00:00').toLocaleDateString(window.I18n?.lang() || 'pt-BR') : '—'}</td>
        <td><span class="badge ${statusClass}"><span class="badge-dot"></span>${_t(r.status)}</span></td>
        <td>${r.observacoes || '—'}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-sm" onclick="ScannersModule.editarManut(${r.id})" title="Editar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm" onclick="ScannersModule.excluirManut(${r.id})" title="Excluir">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  function abrirModalManut(id) {
    if (id) {
      const r = allManut.find(x => x.id === id);
      if (!r) return;
      document.getElementById('scannerManutId').value       = r.id;
      document.getElementById('scannerManutScanner').value  = r.scannerId || '';
      document.getElementById('scannerManutTipo').value     = r.tipo || '';
      document.getElementById('scannerManutResp').value     = r.responsavel || '';
      document.getElementById('scannerManutData').value     = r.data || '';
      document.getElementById('scannerManutProxima').value  = r.proxima || '';
      document.getElementById('scannerManutStatus').value   = r.status || 'Concluída';
      document.getElementById('scannerManutObs').value      = r.observacoes || '';
      document.getElementById('scannerManutModalTitle').textContent = _t('Editar Manutenção');
    } else {
      document.getElementById('scannerManutId').value       = '';
      document.getElementById('scannerManutScanner').value  = selectedScannerId || '';
      document.getElementById('scannerManutTipo').value     = '';
      document.getElementById('scannerManutResp').value     = '';
      document.getElementById('scannerManutData').value     = new Date().toISOString().slice(0, 10);
      document.getElementById('scannerManutProxima').value  = '';
      document.getElementById('scannerManutStatus').value   = 'Concluída';
      document.getElementById('scannerManutObs').value      = '';
      document.getElementById('scannerManutModalTitle').textContent = _t('Registrar Manutenção');
    }
    Modal.open('modalScannerManut');
  }

  function salvarManut() {
    const scannerId   = document.getElementById('scannerManutScanner').value;
    const tipo        = document.getElementById('scannerManutTipo').value;
    const responsavel = document.getElementById('scannerManutResp').value.trim();
    const data        = document.getElementById('scannerManutData').value;
    const proxima     = document.getElementById('scannerManutProxima').value;
    const status      = document.getElementById('scannerManutStatus').value;
    const observacoes = document.getElementById('scannerManutObs').value.trim();

    if (!scannerId)   { Toast.warning(_t('Selecione o scanner.')); return; }
    if (!tipo)        { Toast.warning(_t('Selecione o tipo de manutenção.')); return; }
    if (!responsavel) { Toast.warning(_t('Informe o responsável.')); return; }
    if (!data)        { Toast.warning(_t('Informe a data realizada.')); return; }

    const btn = document.getElementById('btnSalvarScannerManut');
    btn.disabled = true; btn.textContent = _t('Salvando...');
    try {
      allManut = getManut();
      const id = document.getElementById('scannerManutId').value;
      if (id) {
        const idx = allManut.findIndex(r => r.id === parseInt(id));
        if (idx !== -1) { allManut[idx] = { ...allManut[idx], scannerId, tipo, responsavel, data, proxima: proxima || null, status, observacoes }; Toast.success(_t('Manutenção atualizada!')); }
      } else {
        allManut.push({ id: nextManutId(), scannerId, tipo, responsavel, data, proxima: proxima || null, status, observacoes, criadoEm: new Date().toISOString() });
        Toast.success(_t('Manutenção registrada!'));
      }
      saveManutData(allManut);
      Modal.close('modalScannerManut');
      load();
    } finally { btn.disabled = false; btn.textContent = _t('Salvar'); }
  }

  function editarManut(id) { abrirModalManut(id); }

  async function excluirManut(id) {
    const ok = await Confirm.show({ title: _t('Excluir Manutenção'), message: _t('Confirmar exclusão?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    allManut = getManut().filter(r => r.id !== id);
    saveManutData(allManut);
    Toast.success(_t('Manutenção excluída.'));
    load();
  }

  /* ── Agendamentos ── */
  function renderAgend() {
    const container = document.getElementById('scannerAgendList');
    if (!container) return;

    const scannerAgend = allAgend.filter(r => r.scannerId === selectedScannerId);

    if (!scannerAgend.length) {
      container.innerHTML = `<div style="text-align:center;padding:var(--space-8);color:var(--text-muted)">
        <p style="margin:0;font-size:var(--font-size-sm)">${_t('Nenhum agendamento encontrado.')}</p>
        <p style="margin:4px 0 0;font-size:var(--font-size-xs)">${_t('Crie o primeiro agendamento para este scanner.')}</p>
      </div>`;
      return;
    }

    const sorted = [...scannerAgend].sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    container.innerHTML = sorted.map(r => {
      const scanner = SCANNERS.find(s => s.id === r.scannerId) || { nome: r.scannerId };
      const confirmado = r.confirmado === 'true' || r.confirmado === true;
      const past = new Date(r.fim) < new Date();
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-3) var(--space-4);border:1px solid var(--border-color);border-radius:var(--border-radius-md);margin-bottom:var(--space-2);background:var(--color-surface)">
        <div>
          <div style="font-weight:var(--font-weight-semibold);font-size:var(--font-size-sm)">${scanner.nome} — ${r.usuario}</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:2px">${fmtDT(r.inicio)} → ${fmtDT(r.fim)}${r.motivo ? ' · ' + r.motivo : ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-2)">
          <span class="badge ${past ? 'badge--neutral' : confirmado ? 'badge--success' : 'badge--warning'}">
            <span class="badge-dot"></span>${past ? 'Concluído' : confirmado ? 'Confirmado' : 'Pendente'}
          </span>
          <button class="btn btn-ghost btn-sm" onclick="ScannersModule.editarAgend(${r.id})" title="Editar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="ScannersModule.excluirAgend(${r.id})" title="Excluir">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  }

  function abrirModalAgend(id) {
    if (id) {
      const r = allAgend.find(x => x.id === id);
      if (!r) return;
      document.getElementById('scannerAgendId').value         = r.id;
      document.getElementById('scannerAgendScanner').value    = r.scannerId || '';
      document.getElementById('scannerAgendUsuario').value    = r.usuario || '';
      document.getElementById('scannerAgendInicio').value     = r.inicio ? r.inicio.slice(0, 16) : '';
      document.getElementById('scannerAgendFim').value        = r.fim    ? r.fim.slice(0, 16)    : '';
      document.getElementById('scannerAgendMotivo').value     = r.motivo || '';
      document.getElementById('scannerAgendConfirmado').value = String(r.confirmado);
      document.getElementById('scannerAgendModalTitle').textContent = _t('Editar Agendamento');
    } else {
      document.getElementById('scannerAgendId').value         = '';
      document.getElementById('scannerAgendScanner').value    = selectedScannerId || '';
      document.getElementById('scannerAgendUsuario').value    = '';
      document.getElementById('scannerAgendInicio').value     = nowLocal();
      document.getElementById('scannerAgendFim').value        = '';
      document.getElementById('scannerAgendMotivo').value     = '';
      document.getElementById('scannerAgendConfirmado').value = 'false';
      document.getElementById('scannerAgendModalTitle').textContent = _t('Novo Agendamento');
    }
    Modal.open('modalScannerAgend');
  }

  function salvarAgend() {
    const scannerId  = document.getElementById('scannerAgendScanner').value;
    const usuario    = document.getElementById('scannerAgendUsuario').value.trim();
    const inicio     = document.getElementById('scannerAgendInicio').value;
    const fim        = document.getElementById('scannerAgendFim').value;
    const motivo     = document.getElementById('scannerAgendMotivo').value.trim();
    const confirmado = document.getElementById('scannerAgendConfirmado').value;

    if (!scannerId) { Toast.warning(_t('Selecione o scanner.')); return; }
    if (!usuario)   { Toast.warning(_t('Informe o usuário.')); return; }
    if (!inicio)    { Toast.warning(_t('Informe a data/hora de início.')); return; }
    if (!fim)       { Toast.warning(_t('Informe a data/hora de fim.')); return; }
    if (fim <= inicio) { Toast.warning(_t('A data de fim deve ser após o início.')); return; }

    const btn = document.getElementById('btnSalvarScannerAgend');
    btn.disabled = true; btn.textContent = _t('Salvando...');
    try {
      allAgend = getAgend();
      const id = document.getElementById('scannerAgendId').value;
      if (id) {
        const idx = allAgend.findIndex(r => r.id === parseInt(id));
        if (idx !== -1) { allAgend[idx] = { ...allAgend[idx], scannerId, usuario, inicio, fim, motivo, confirmado }; Toast.success(_t('Agendamento atualizado!')); }
      } else {
        allAgend.push({ id: nextAgendId(), scannerId, usuario, inicio, fim, motivo, confirmado, criadoEm: new Date().toISOString() });
        Toast.success(_t('Agendamento criado!'));
      }
      saveAgendData(allAgend);
      Modal.close('modalScannerAgend');
      load();
    } finally { btn.disabled = false; btn.textContent = _t('Salvar'); }
  }

  function editarAgend(id) { abrirModalAgend(id); }

  async function excluirAgend(id) {
    const ok = await Confirm.show({ title: _t('Excluir Agendamento'), message: _t('Confirmar exclusão?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    allAgend = getAgend().filter(r => r.id !== id);
    saveAgendData(allAgend);
    Toast.success(_t('Agendamento excluído.'));
    load();
  }

  /* ── Scanner detail tabs ── */
  function initScannerDetailTabs() {
    document.querySelectorAll('[data-scanner-tab]').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('[data-scanner-tab]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#section-scanners .detail-tab-panel').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const panel = document.getElementById('scanner-tab-' + this.dataset.scannerTab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ── Page-level tabs (CMM / Scanners) ── */
  function initPageTabs() {
    document.querySelectorAll('.maq-page-tab').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.maq-page-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.maq-page-section').forEach(s => s.style.display = 'none');
        this.classList.add('active');
        const target = document.getElementById('section-' + this.dataset.section);
        if (target) target.style.display = '';
      });
    });
  }

  /* ── Local change ── */
  function initLocalToggle() {
    const sel = document.getElementById('scannerLocal');
    if (!sel) return;
    sel.addEventListener('change', function () {
      const hint = document.getElementById('scannerLocalHint');
      if (!hint) return;
      hint.textContent = this.value === 'Em Campo'
        ? '⚠ O scanner sairá dos domínios do laboratório. Certifique-se de que o transporte está autorizado.'
        : '';
    });
  }

  /* ── Filter tabs ── */
  function initFilterTabs() {
    document.querySelectorAll('.scanner-filter-tab').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.scanner-filter-tab').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filterStat = this.dataset.filter;
        renderTable();
      });
    });
  }

  /* ── Init ── */
  function init() {
    initPageTabs();
    initLocalToggle();
    initFilterTabs();
    initScannerDetailTabs();
    load();

    document.getElementById('btnNovaRetirada')?.addEventListener('click', () => abrirModalRetirada(''));
    document.getElementById('btnSalvarScannerLog')?.addEventListener('click', salvar);
    document.getElementById('btnCancelarScannerLog')?.addEventListener('click', () => Modal.close('modalScannerLog'));
    document.getElementById('modalScannerLogClose')?.addEventListener('click', () => Modal.close('modalScannerLog'));

    document.getElementById('btnNovaScannerManut')?.addEventListener('click', () => abrirModalManut(null));
    document.getElementById('btnSalvarScannerManut')?.addEventListener('click', salvarManut);
    document.getElementById('btnCancelarScannerManut')?.addEventListener('click', () => Modal.close('modalScannerManut'));
    document.getElementById('modalScannerManutClose')?.addEventListener('click', () => Modal.close('modalScannerManut'));

    document.getElementById('btnNovoScannerAgend')?.addEventListener('click', () => abrirModalAgend(null));
    document.getElementById('btnSalvarScannerAgend')?.addEventListener('click', salvarAgend);
    document.getElementById('btnCancelarScannerAgend')?.addEventListener('click', () => Modal.close('modalScannerAgend'));
    document.getElementById('modalScannerAgendClose')?.addEventListener('click', () => Modal.close('modalScannerAgend'));
  }

  document.addEventListener('DOMContentLoaded', init);

  // Re-renderiza ao trocar o idioma
  document.addEventListener('zeiss:langchange', () => load());

  window.ScannersModule = { load, selectScanner, abrirModalRetirada, registrarRetorno, editar, excluir, editarManut, excluirManut, editarAgend, excluirAgend };
})();
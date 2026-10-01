/**
 * eventos.js — Módulo de Eventos (lista-eventos.html)
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const API_URL = '/api/eventos';
  const PAGE_SIZE = 12;

  let allItems = [];
  let filtered = [];
  let currentPage = 0;

  /* ── Calendar state ─────────────────────────────────────────── */
  function _monthNames() {
    const fmt = new Intl.DateTimeFormat(window.I18n?.lang() || 'pt-BR', { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => {
      const s = fmt.format(new Date(2000, i, 1));
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
  }
  function _dayNames() {
    const fmt = new Intl.DateTimeFormat(window.I18n?.lang() || 'pt-BR', { weekday: 'short' });
    // Sunday = day 0 in JS; find the Sunday-first order
    return Array.from({ length: 7 }, (_, i) => {
      const s = fmt.format(new Date(2000, 0, 2 + i)); // Jan 2 2000 = Sunday
      return s.charAt(0).toUpperCase() + s.slice(1).replace('.', '');
    });
  }
  let viewMode      = 'lista';
  let calYear       = new Date().getFullYear();
  let calMonth      = new Date().getMonth();
  let evtMap        = {};
  let _currentDayKey = null;

  /* ── DOM refs ───────────────────────────────────────────────── */
  const tbody = document.getElementById('tabelaEventos');
  const info  = document.getElementById('paginacaoInfo');

  /* ── Utilities ──────────────────────────────────────────────── */
  function debounce(fn, ms) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  /* ── Responsável (Usuário) ─────────────────────────────────────────── */
  async function carregarResponsaveisEvento() {
    const sel = document.getElementById('responsavel');
    if (!sel) return;
    let usuarios = [];
    try {
      usuarios = await Api.get('/api/usuarios');
    } catch {
      usuarios = [];
      Toast.error(_t('Erro ao carregar lista de usuários.'));
    }
    const gestores = (Array.isArray(usuarios) ? usuarios : (usuarios.content || []))
      .filter(u => u.cargo === 'GESTOR');
    sel.innerHTML = `<option value="">${_t('Selecione...')}</option>` +
      gestores.map(u => `<option value="${u.id}">${esc(u.nome)}</option>`).join('');
  }

  /* ── Load ───────────────────────────────────────────────────── */
  async function loadEventos() {
    Skeleton.tableRows(tbody, 8, 8);
    try {
      const data = await Api.get(API_URL, { size: 1000 });
      allItems = Array.isArray(data) ? data : (data.content || []);
      applyFilters();
      if (viewMode === 'cal') { renderCalendario(); renderUpcoming(); }
    } catch (err) {
      Toast.error(_t('Erro ao carregar eventos.'));
      EmptyState.table(tbody, 8, _t('Erro ao carregar dados'), err.message);
    }
  }

  /* ── Filters ────────────────────────────────────────────────── */
  function applyFilters() {
    const q = (document.getElementById('campoBusca').value || '').toLowerCase();
    const di = document.getElementById('dataInicio').value;
    const df = document.getElementById('dataFim').value;

    filtered = allItems.filter(e => {
      const matchQ = !q ||
        (e.titulo || e.nome || '').toLowerCase().includes(q) ||
        (e.local || '').toLowerCase().includes(q) ||
        (e.responsavel || '').toLowerCase().includes(q);

      const d = e.data ? new Date(e.data) : null;
      const matchDi = !di || (d && d >= new Date(di));
      const matchDf = !df || (d && d <= new Date(df + 'T23:59:59'));
      return matchQ && matchDi && matchDf;
    });

    currentPage = 0;
    renderTabela(filtered);
  }

  /* ── Render ─────────────────────────────────────────────────── */
  function renderTabela(items) {
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const start = currentPage * PAGE_SIZE;
    const page  = items.slice(start, start + PAGE_SIZE);

    document.getElementById('btnAnterior').disabled = currentPage === 0;
    document.getElementById('btnProximo').disabled  = currentPage >= totalPages - 1;
    document.getElementById('paginaAtual').textContent = currentPage + 1;
    info.textContent = `${items.length} ${_t('evento(s) encontrado(s)')}`;

    if (!page.length) { EmptyState.table(tbody, 8, _t('Nenhum evento encontrado'), _t('Crie um novo evento ou ajuste os filtros.')); return; }

    tbody.innerHTML = page.map(e => `
      <tr>
        <td><strong>${e.titulo || e.nome || '—'}</strong></td>
        <td class="td-truncate">${e.descricao || '—'}</td>
        <td>${e.data ? ZP.Fmt.date(e.data) : '—'}</td>
        <td>${e.horario || '—'}</td>
        <td>${e.local || '—'}</td>
        <td>${e.responsavel || '—'}</td>
        <td>${e.numeroParticipantes != null ? e.numeroParticipantes : '—'}</td>
        <td class="actions-cell">
          <button class="btn btn-ghost btn-sm" onclick="EventosModule.editar(${e.id})">${_t('Editar')}</button>
        </td>
      </tr>`).join('');
  }

  /* ── Modal ──────────────────────────────────────────────────── */
  function abrirModalNovo() {
    document.getElementById('eventoId').value = '';
    document.getElementById('eventoForm').reset();
    document.getElementById('modalTitulo').textContent = _t('Novo Evento');
    document.getElementById('btnExcluirEvento').style.display = 'none';
    carregarResponsaveisEvento();
    Modal.open('modalEvento');
  }

  async function editar(id) {
    try {
      const e = await Api.get(`${API_URL}/${id}`);
      await carregarResponsaveisEvento();
      document.getElementById('eventoId').value = e.id;
      document.getElementById('titulo').value = e.titulo || e.nome || '';
      document.getElementById('descricao').value = e.descricao || '';
      document.getElementById('data').value = e.data ? e.data.substring(0, 10) : '';
      document.getElementById('horario').value = e.horario || '';
      document.getElementById('local').value = e.local || '';
      document.getElementById('responsavel').value = e.responsavelId || '';
      document.getElementById('numeroParticipantes').value = e.numeroParticipantes || '';
      document.getElementById('numeroConvidados').value = e.numeroConvidados || '';
      document.getElementById('observacao').value = e.observacao || '';
      document.getElementById('modalTitulo').textContent = _t('Editar Evento');
      document.getElementById('btnExcluirEvento').style.display = '';
      Modal.open('modalEvento');
    } catch { Toast.error(_t('Não foi possível carregar o evento.')); }
  }

  /* ── Save ───────────────────────────────────────────────────── */
  async function salvar() {
    const form = document.getElementById('eventoForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('eventoId').value;
    const body = {
      titulo: document.getElementById('titulo').value,
      descricao: document.getElementById('descricao').value,
      data: document.getElementById('data').value || null,
      horario: document.getElementById('horario').value || null,
      local: document.getElementById('local').value,
      responsavelId: document.getElementById('responsavel').value ? Number(document.getElementById('responsavel').value) : null,
      numeroParticipantes: document.getElementById('numeroParticipantes').value
        ? parseInt(document.getElementById('numeroParticipantes').value) : null,
      numeroConvidados: document.getElementById('numeroConvidados').value
        ? parseInt(document.getElementById('numeroConvidados').value) : null,
      observacao: document.getElementById('observacao').value,
    };

    const btn = document.getElementById('btnSalvarEvento');
    btn.disabled = true; btn.textContent = _t('Salvando...');

    try {
      if (id) {
        await Api.put(`${API_URL}/${id}`, body);
        Toast.success(_t('Evento atualizado com sucesso!'));
      } else {
        await Api.post(API_URL, body);
        Toast.success(_t('Evento criado com sucesso!'));
      }
      Modal.close('modalEvento');
      loadEventos();
    } catch (err) {
      Toast.error(err.message || _t('Erro ao salvar evento.'));
    } finally {
      btn.disabled = false; btn.textContent = _t('Salvar Evento');
    }
  }

  /* ── Delete ─────────────────────────────────────────────────── */
  async function excluir() {
    const id = document.getElementById('eventoId').value;
    if (!id) return;
    const ok = await Confirm.show({ title: _t('Excluir Evento'), message: _t('Esta ação não pode ser desfeita. Confirmar exclusão?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    try {
      await Api.del(`${API_URL}/${id}`);
      Toast.success(_t('Evento excluído.'));
      Modal.close('modalEvento');
      loadEventos();
    } catch { Toast.error(_t('Erro ao excluir evento.')); }
  }

  /* ── Pagination ─────────────────────────────────────────────── */
  function prevPage() { if (currentPage > 0) { currentPage--; renderTabela(filtered); } }
  function nextPage() {
    if (currentPage < Math.ceil(filtered.length / PAGE_SIZE) - 1) { currentPage++; renderTabela(filtered); }
  }

  /* ── View switch ─────────────────────────────────────────────── */
  function switchView(mode) {
    viewMode = mode;
    document.getElementById('viewLista').style.display      = mode === 'lista' ? '' : 'none';
    document.getElementById('viewCalendario').style.display = mode === 'cal'   ? '' : 'none';
    document.getElementById('btnViewLista').classList.toggle('active', mode === 'lista');
    document.getElementById('btnViewCal').classList.toggle('active', mode === 'cal');
    if (mode === 'cal') { renderCalendario(); renderUpcoming(); }
  }

  /* ── Calendar ────────────────────────────────────────────────── */
  function renderCalendario() {
    const MONTHS = _monthNames();
    const DAYS   = _dayNames();
    document.getElementById('calNavTitle').textContent = `${MONTHS[calMonth]} ${calYear}`;

    const today       = new Date();
    const firstDay    = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrev  = new Date(calYear, calMonth, 0).getDate();

    // Build event map keyed by 'YYYY-MM-DD'
    evtMap = {};
    allItems.forEach(e => {
      if (!e.data) return;
      const key = e.data.substring(0, 10);
      if (!evtMap[key]) evtMap[key] = [];
      evtMap[key].push(e);
    });

    // Event count badge for this month
    const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
    const monthTotal  = Object.keys(evtMap)
      .filter(k => k.startsWith(monthPrefix))
      .reduce((s, k) => s + evtMap[k].length, 0);
    const countEl = document.getElementById('calEvtCount');
    if (countEl) countEl.textContent = monthTotal ? `${monthTotal} ${_t(monthTotal !== 1 ? 'eventos' : 'evento')}` : '';

    let html = DAYS.map((d, i) =>
      `<div class="evt-cal__dow${i === 0 || i === 6 ? ' evt-cal__dow--weekend' : ''}">${d}</div>`
    ).join('');

    // Prev-month padding
    for (let i = 0; i < firstDay; i++) {
      const d = daysInPrev - firstDay + 1 + i;
      html += `<div class="evt-cal__cell evt-cal__cell--other"><div class="evt-cal__day-row"><span class="evt-cal__day">${d}</span></div></div>`;
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const mm  = String(calMonth + 1).padStart(2, '0');
      const dd  = String(d).padStart(2, '0');
      const key = `${calYear}-${mm}-${dd}`;
      const isToday   = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();
      const dayOfWeek = new Date(calYear, calMonth, d).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const evts = (evtMap[key] || []).slice().sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
      const hasEvts = evts.length > 0;

      let chips = '';
      evts.slice(0, 3).forEach(e => {
        const cIdx  = e.id % 5;
        const label = (e.titulo || e.nome || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const time  = e.horario ? `<span class="evt-chip__time">${e.horario.substring(0,5)}</span>` : '';
        chips += `<button class="evt-chip evt-chip--c${cIdx}" onclick="event.stopPropagation();EventosModule.editar(${e.id})" title="${label}">${time}<span class="evt-chip__label">${label}</span></button>`;
      });
      if (evts.length > 3) chips += `<button class="evt-chip evt-chip--more" onclick="event.stopPropagation();EventosModule.clickDay('${key}')">+${evts.length - 3} ${_t('mais')}</button>`;

      html += `<div class="evt-cal__cell${isToday ? ' evt-cal__cell--today' : ''}${isWeekend ? ' evt-cal__cell--weekend' : ''}${hasEvts ? ' evt-cal__cell--has-events' : ''}"
                  onclick="EventosModule.clickDay('${key}')">
        <div class="evt-cal__day-row">
          <span class="evt-cal__day">${d}</span>
          <span class="evt-cal__add-hint">+</span>
        </div>
        <div class="evt-chips">${chips}</div>
      </div>`;
    }

    // Fill trailing cells
    const totalCells = firstDay + daysInMonth;
    const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= trailing; i++) {
      const dayOfWeek = new Date(calYear, calMonth + 1, i).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      html += `<div class="evt-cal__cell evt-cal__cell--other${isWeekend ? ' evt-cal__cell--weekend' : ''}"><div class="evt-cal__day-row"><span class="evt-cal__day">${i}</span></div></div>`;
    }

    document.getElementById('calGrid').innerHTML = html;
  }

  function clickDay(key) {
    const dayEvts = (evtMap[key] || []).slice().sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
    if (dayEvts.length > 0) {
      renderDayPanel(key, dayEvts);
    } else {
      document.getElementById('calDayPanel').style.display = 'none';
      novoNaData(key);
    }
  }

  function renderDayPanel(key, evts) {
    const [y, m, d] = key.split('-').map(Number);
    const dateLabel = new Intl.DateTimeFormat(window.I18n?.lang() || 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(y, m - 1, d));
    document.getElementById('calDayTitle').textContent = dateLabel;
    _currentDayKey = key;

    const listEl = document.getElementById('calDayList');
    if (!evts.length) {
      listEl.innerHTML = `<div class="evt-day-panel__empty">${_t('Nenhum evento neste dia.')}</div>`;
    } else {
      listEl.innerHTML = evts.map(e => {
        const cIdx  = e.id % 5;
        const title = (e.titulo || e.nome || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const time  = e.horario ? e.horario.substring(0, 5) : '--:--';
        const sub   = [e.local, e.responsavel].filter(Boolean).join(' · ');
        return `<div class="evt-day-panel__item evt-day-panel__item--c${cIdx}" onclick="EventosModule.editar(${e.id})">
          <span class="evt-day-panel__item-time">${time}</span>
          <div class="evt-day-panel__item-body">
            <div class="evt-day-panel__item-title">${title}</div>
            ${sub ? `<div class="evt-day-panel__item-sub">${sub}</div>` : ''}
          </div>
        </div>`;
      }).join('');
    }

    const panel = document.getElementById('calDayPanel');
    panel.style.display = '';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderUpcoming() {
    const ul = document.getElementById('calUpcoming');
    if (!ul) return;

    const now = new Date(); now.setHours(0, 0, 0, 0);
    const upcoming = allItems
      .filter(e => e.data && new Date(e.data + 'T00:00:00') >= now)
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 8);

    if (!upcoming.length) {
      ul.innerHTML = `<li class="evt-upcoming__empty">${_t('Nenhum evento próximo.')}</li>`;
      return;
    }

    ul.innerHTML = upcoming.map(e => {
      const cIdx    = e.id % 5;
      const [, m, d] = e.data.substring(0, 10).split('-').map(Number);
      const dateStr = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
      const timeStr = e.horario ? e.horario.substring(0, 5) : '';
      const meta    = [dateStr, timeStr, e.local].filter(Boolean).join(' · ');
      const title   = (e.titulo || e.nome || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<li class="evt-upcoming__item" onclick="EventosModule.editar(${e.id})">
        <span class="evt-upcoming__dot evt-dot--c${cIdx}"></span>
        <div class="evt-upcoming__info">
          <div class="evt-upcoming__title">${title}</div>
          <div class="evt-upcoming__meta">${meta}</div>
        </div>
      </li>`;
    }).join('');
  }

  function calPrev() {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendario();
  }
  function calNext() {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendario();
  }
  function calGoToday() {
    const t = new Date();
    calYear = t.getFullYear(); calMonth = t.getMonth();
    renderCalendario();
  }

  function novoNaData(dateStr) {
    document.getElementById('eventoId').value = '';
    document.getElementById('eventoForm').reset();
    document.getElementById('modalTitulo').textContent = _t('Novo Evento');
    document.getElementById('btnExcluirEvento').style.display = 'none';
    document.getElementById('data').value = dateStr;
    carregarResponsaveisEvento();
    Modal.open('modalEvento');
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    loadEventos();
    document.getElementById('btnNovoEvento').addEventListener('click', abrirModalNovo);
    document.getElementById('btnSalvarEvento').addEventListener('click', salvar);
    document.getElementById('btnExcluirEvento').addEventListener('click', excluir);
    document.getElementById('btnAnterior').addEventListener('click', prevPage);
    document.getElementById('btnProximo').addEventListener('click', nextPage);
    document.getElementById('btnLimparFiltros').addEventListener('click', () => {
      document.getElementById('campoBusca').value = '';
      document.getElementById('dataInicio').value = '';
      document.getElementById('dataFim').value = '';
      applyFilters();
    });
    // View toggle
    document.getElementById('btnViewLista').addEventListener('click', () => switchView('lista'));
    document.getElementById('btnViewCal').addEventListener('click',   () => switchView('cal'));
    // Calendar nav
    document.getElementById('calPrev').addEventListener('click', calPrev);
    document.getElementById('calNext').addEventListener('click', calNext);
    document.getElementById('calHoje').addEventListener('click', calGoToday);
    // Calendar day panel
    document.getElementById('calDayClose').addEventListener('click', () => {
      document.getElementById('calDayPanel').style.display = 'none';
    });
    document.getElementById('calDayNewBtn').addEventListener('click', () => {
      document.getElementById('calDayPanel').style.display = 'none';
      if (_currentDayKey) novoNaData(_currentDayKey);
    });

    const debouncedFilter = debounce(applyFilters, 250);
    document.getElementById('campoBusca').addEventListener('input', debouncedFilter);
    document.getElementById('dataInicio').addEventListener('change', applyFilters);
    document.getElementById('dataFim').addEventListener('change', applyFilters);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', () => {
    renderTabela(filtered);
    if (viewMode === 'cal') { renderCalendario(); renderUpcoming(); }
  });
  window.EventosModule = { editar, salvar, excluir, loadEventos, novoNaData, clickDay };
})();

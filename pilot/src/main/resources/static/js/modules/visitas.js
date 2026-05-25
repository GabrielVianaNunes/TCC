/**
 * visitas.js — Módulo de Visitas Técnicas (visitasTecnicas.html)
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  const API_URL = '/api/visitas-tecnicas';
  const PAGE_SIZE = 12;

  let allItems = [];
  let filtered = [];
  let currentPage = 0;

  const tbody = document.getElementById('tabelaVisitas');
  const info  = document.getElementById('paginacaoInfo');

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ── Load ───────────────────────────────────────────────────── */
  async function loadVisitas() {
    Skeleton.tableRows(tbody, 9, 6);
    try {
      const data = await Api.get(API_URL, { size: 1000 });
      allItems = Array.isArray(data) ? data : (data.content || []);
      applyFilters();
    } catch (err) {
      Toast.error(_t('Erro ao carregar visitas técnicas.'));
      EmptyState.table(tbody, 9, _t('Erro ao carregar dados'), err.message);
    }
  }

  /* ── Filters ────────────────────────────────────────────────── */
  function applyFilters() {
    const q  = (document.getElementById('campoBusca').value || '').toLowerCase();
    const fr = document.getElementById('filtroRealizada').value;

    filtered = allItems.filter(v => {
      const matchQ = !q ||
        (v.responsavel || '').toLowerCase().includes(q) ||
        (v.empresa || '').toLowerCase().includes(q) ||
        (v.local || '').toLowerCase().includes(q);
      const matchR = fr === '' || String(!!v.visitaRealizada) === fr;
      return matchQ && matchR;
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
    info.textContent = `${items.length} ${_t('visita(s) encontrada(s)')}`;

    if (!page.length) { EmptyState.table(tbody, 9, _t('Nenhuma visita encontrada'), _t('Agende uma nova visita ou ajuste os filtros.')); return; }

    tbody.innerHTML = page.map(v => `
      <tr>
        <td>${v.responsavel || '—'}</td>
        <td><strong>${v.empresa || '—'}</strong></td>
        <td>${v.dataSolicitada ? ZP.Fmt.date(v.dataSolicitada) : '—'}</td>
        <td>${v.dataAgendada ? ZP.Fmt.date(v.dataAgendada) : '—'}</td>
        <td>${v.local || '—'}</td>
        <td>${v.quantidade || '—'}</td>
        <td>${v.telefones || '—'}</td>
        <td>${StatusBadge.visita(v.visitaRealizada)}</td>
        <td class="actions-cell">
          <button class="btn btn-ghost btn-sm" onclick="VisitasModule.editar(${v.id})">${_t('Editar')}</button>
        </td>
      </tr>`).join('');
  }

  /* ── Modal ──────────────────────────────────────────────────── */
  function abrirModalNovo() {
    document.getElementById('visitaId').value = '';
    document.getElementById('visitaForm').reset();
    document.getElementById('visitaRealizada').value = 'false';
    document.getElementById('modalTitulo').textContent = _t('Agendar Visita Técnica');
    document.getElementById('btnExcluirVisita').style.display = 'none';
    Modal.open('modalVisita');
  }

  async function editar(id) {
    try {
      const v = await Api.get(`${API_URL}/${id}`);
      document.getElementById('visitaId').value = v.id;
      document.getElementById('responsavel').value = v.responsavel || '';
      document.getElementById('empresa').value = v.empresa || '';
      document.getElementById('dataSolicitada').value = v.dataSolicitada ? v.dataSolicitada.substring(0, 10) : '';
      document.getElementById('dataAgendada').value = v.dataAgendada ? v.dataAgendada.substring(0, 10) : '';
      document.getElementById('local').value = v.local || '';
      document.getElementById('quantidade').value = v.quantidade || '';
      document.getElementById('telefones').value = v.telefones || '';
      document.getElementById('visitaRealizada').value = String(!!v.visitaRealizada);
      document.getElementById('observacao').value = v.observacao || '';
      document.getElementById('modalTitulo').textContent = _t('Editar Visita Técnica');
      document.getElementById('btnExcluirVisita').style.display = '';
      Modal.open('modalVisita');
    } catch { Toast.error(_t('Não foi possível carregar a visita.')); }
  }

  /* ── Save ───────────────────────────────────────────────────── */
  async function salvar() {
    const id = document.getElementById('visitaId').value;
    const body = {
      responsavel: document.getElementById('responsavel').value,
      empresa: document.getElementById('empresa').value,
      dataSolicitada: document.getElementById('dataSolicitada').value || null,
      dataAgendada: document.getElementById('dataAgendada').value || null,
      local: document.getElementById('local').value,
      quantidade: document.getElementById('quantidade').value
        ? parseInt(document.getElementById('quantidade').value) : null,
      telefones: document.getElementById('telefones').value,
      visitaRealizada: document.getElementById('visitaRealizada').value === 'true',
      observacao: document.getElementById('observacao').value,
    };

    const btn = document.getElementById('btnSalvarVisita');
    btn.disabled = true; btn.textContent = _t('Salvando...');

    try {
      if (id) {
        await Api.put(`${API_URL}/${id}`, body);
        Toast.success(_t('Visita atualizada com sucesso!'));
      } else {
        await Api.post(API_URL, body);
        Toast.success(_t('Visita agendada com sucesso!'));
      }
      Modal.close('modalVisita');
      loadVisitas();
    } catch (err) {
      Toast.error(err.message || _t('Erro ao salvar visita.'));
    } finally {
      btn.disabled = false; btn.textContent = _t('Salvar Visita');
    }
  }

  /* ── Delete ─────────────────────────────────────────────────── */
  async function excluir() {
    const id = document.getElementById('visitaId').value;
    if (!id) return;
    const ok = await Confirm.show({ title: _t('Excluir Visita'), message: _t('Esta ação não pode ser desfeita. Confirmar exclusão?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    try {
      await Api.del(`${API_URL}/${id}`);
      Toast.success(_t('Visita excluída.'));
      Modal.close('modalVisita');
      loadVisitas();
    } catch { Toast.error(_t('Erro ao excluir visita.')); }
  }

  function prevPage() { if (currentPage > 0) { currentPage--; renderTabela(filtered); } }
  function nextPage() {
    if (currentPage < Math.ceil(filtered.length / PAGE_SIZE) - 1) { currentPage++; renderTabela(filtered); }
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    loadVisitas();
    document.getElementById('btnNovaVisita').addEventListener('click', abrirModalNovo);
    document.getElementById('btnSalvarVisita').addEventListener('click', salvar);
    document.getElementById('btnExcluirVisita').addEventListener('click', excluir);
    document.getElementById('btnAnterior').addEventListener('click', prevPage);
    document.getElementById('btnProximo').addEventListener('click', nextPage);
    document.getElementById('btnLimparFiltros').addEventListener('click', () => {
      document.getElementById('campoBusca').value = '';
      document.getElementById('filtroRealizada').value = '';
      applyFilters();
    });
    const dF = debounce(applyFilters, 250);
    document.getElementById('campoBusca').addEventListener('input', dF);
    document.getElementById('filtroRealizada').addEventListener('change', applyFilters);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', () => renderTabela(filtered));
  window.VisitasModule = { editar, salvar, excluir, loadVisitas };
})();

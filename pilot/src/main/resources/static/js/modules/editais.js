/**
 * editais.js — Módulo de Editais (lista-editais.html)
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  const API_URL = '/api/editais';
  const PAGE_SIZE = 12;

  let allItems = [];
  let filtered = [];
  let currentPage = 0;

  const tbody = document.getElementById('tabelaEditais');
  const info  = document.getElementById('paginacaoInfo');

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ── Load ───────────────────────────────────────────────────── */
  async function loadEditais() {
    Skeleton.tableRows(tbody, 7, 5);
    try {
      const data = await Api.get(API_URL, { size: 1000 });
      allItems = Array.isArray(data) ? data : (data.content || []);
      applyFilters();
    } catch (err) {
      Toast.error(_t('Erro ao carregar editais.'));
      EmptyState.table(tbody, 7, _t('Erro ao carregar dados'), err.message);
    }
  }

  /* ── Filters ────────────────────────────────────────────────── */
  function applyFilters() {
    const q  = (document.getElementById('campoBusca').value || '').toLowerCase();
    const st = document.getElementById('filtroStatus').value;

    filtered = allItems.filter(e => {
      const matchQ  = !q  || (e.nome || '').toLowerCase().includes(q)
                          || (e.instituicaoFornecedora || '').toLowerCase().includes(q)
                          || (e.instituicaoParceira || '').toLowerCase().includes(q);
      const matchSt = !st || e.status === st;
      return matchQ && matchSt;
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
    info.textContent = `${items.length} ${_t('edital(is) encontrado(s)')}`;

    if (!page.length) { EmptyState.table(tbody, 7, _t('Nenhum edital encontrado'), _t('Crie um novo edital ou ajuste os filtros.')); return; }

    tbody.innerHTML = page.map(e => `
      <tr>
        <td><strong>${e.nome || '—'}</strong></td>
        <td>${e.instituicaoFornecedora || '—'}</td>
        <td>${e.instituicaoParceira || '—'}</td>
        <td>${e.valor != null ? ZP.Fmt.currency(e.valor) : '—'}</td>
        <td>${StatusBadge.edital(e.status)}</td>
        <td class="td-truncate">${e.observacao || '—'}</td>
        <td class="actions-cell">
          <div style="display:flex;gap:4px">
            <a href="/editais/${e.id}" class="btn btn-ghost btn-sm" title="${_t('Ver Detalhes')}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </a>
            <button class="btn btn-secondary btn-sm" onclick="EditaisModule.editar(${e.id})" title="${_t('Editar')}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </td>
      </tr>`).join('');
  }

  /* ── Modal ──────────────────────────────────────────────────── */
  function abrirModalNovo() {
    document.getElementById('editalId').value = '';
    document.getElementById('editalForm').reset();
    document.getElementById('modalTitulo').textContent = _t('Novo Edital');
    document.getElementById('btnExcluirEdital').style.display = 'none';
    Modal.open('modalEdital');
  }

  async function editar(id) {
    try {
      const e = await Api.get(`${API_URL}/${id}`);
      document.getElementById('editalId').value = e.id;
      document.getElementById('nome').value = e.nome || '';
      document.getElementById('instituicaoFornecedora').value = e.instituicaoFornecedora || '';
      document.getElementById('instituicaoParceira').value = e.instituicaoParceira || '';
      document.getElementById('valor').value = e.valor != null ? e.valor : '';
      document.getElementById('status').value = e.status || '';
      document.getElementById('observacao').value = e.observacao || '';
      document.getElementById('modalTitulo').textContent = _t('Editar Edital');
      document.getElementById('btnExcluirEdital').style.display = '';
      Modal.open('modalEdital');
    } catch { Toast.error(_t('Não foi possível carregar o edital.')); }
  }

  /* ── Save ───────────────────────────────────────────────────── */
  async function salvar() {
    const id = document.getElementById('editalId').value;
    const body = {
      nome: document.getElementById('nome').value,
      instituicaoFornecedora: document.getElementById('instituicaoFornecedora').value,
      instituicaoParceira: document.getElementById('instituicaoParceira').value,
      valor: document.getElementById('valor').value ? parseFloat(document.getElementById('valor').value) : null,
      status: document.getElementById('status').value,
      observacao: document.getElementById('observacao').value,
    };

    const btn = document.getElementById('btnSalvarEdital');
    btn.disabled = true; btn.textContent = _t('Salvando...');

    try {
      if (id) {
        await Api.put(`${API_URL}/${id}`, body);
        Toast.success(_t('Edital atualizado com sucesso!'));
      } else {
        await Api.post(API_URL, body);
        Toast.success(_t('Edital criado com sucesso!'));
      }
      Modal.close('modalEdital');
      loadEditais();
    } catch (err) {
      Toast.error(err.message || _t('Erro ao salvar edital.'));
    } finally {
      btn.disabled = false; btn.textContent = _t('Salvar Edital');
    }
  }

  /* ── Delete ─────────────────────────────────────────────────── */
  async function excluir() {
    const id = document.getElementById('editalId').value;
    if (!id) return;
    const ok = await Confirm.show({ title: _t('Excluir Edital'), message: _t('Esta ação não pode ser desfeita. Confirmar exclusão?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    try {
      await Api.del(`${API_URL}/${id}`);
      Toast.success(_t('Edital excluído.'));
      Modal.close('modalEdital');
      loadEditais();
    } catch { Toast.error(_t('Erro ao excluir edital.')); }
  }

  function prevPage() { if (currentPage > 0) { currentPage--; renderTabela(filtered); } }
  function nextPage() {
    if (currentPage < Math.ceil(filtered.length / PAGE_SIZE) - 1) { currentPage++; renderTabela(filtered); }
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    loadEditais();
    document.getElementById('btnNovoEdital').addEventListener('click', abrirModalNovo);
    document.getElementById('btnSalvarEdital').addEventListener('click', salvar);
    document.getElementById('btnExcluirEdital').addEventListener('click', excluir);
    document.getElementById('btnAnterior').addEventListener('click', prevPage);
    document.getElementById('btnProximo').addEventListener('click', nextPage);
    document.getElementById('btnLimparFiltros').addEventListener('click', () => {
      document.getElementById('campoBusca').value = '';
      document.getElementById('filtroStatus').value = '';
      applyFilters();
    });
    const dF = debounce(applyFilters, 250);
    document.getElementById('campoBusca').addEventListener('input', dF);
    document.getElementById('filtroStatus').addEventListener('change', applyFilters);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', () => renderTabela(filtered));
  window.EditaisModule = { editar, salvar, excluir, loadEditais };
})();

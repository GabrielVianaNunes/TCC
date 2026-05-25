/**
 * ZEISS-PILOT — PROJETOS.JS
 */

'use strict';

const ProjetosModule = (() => {
  const _t = ptBR => window.I18n?.t(ptBR) ?? ptBR;
  const { Fmt } = window.ZP || {};
  const ENDPOINT = '/api/projetos';
  let currentPage = 0, totalPages = 1;
  let allItems = [];
  let admins = [];

  async function loadAdmins() {
    try {
      const data = await Api.get('/api/usuarios');
      admins = (data.content || data).filter(u => u.role === 'ADMIN' || u.perfil === 'ADMIN');
      const sel = document.getElementById('responsavelId');
      if (!sel) return;
      sel.innerHTML = `<option value="">${_t('Selecione...')}</option>` +
        admins.map(a => `<option value="${a.id}">${a.nome || a.name}</option>`).join('');

      // Também preenche o filtro
      const filt = document.getElementById('filtroResponsavel');
      if (filt) filt.innerHTML = `<option value="">${_t('Todos')}</option>` +
        admins.map(a => `<option value="${a.id}">${a.nome || a.name}</option>`).join('');
    } catch { /**/ }
  }

  function applyFilters() {
    const q  = (document.getElementById('barraPesquisa')?.value || '').toLowerCase();
    const st = document.getElementById('filtroStatus')?.value || '';
    const pr = document.getElementById('filtroPrioridade')?.value || '';
    const re = document.getElementById('filtroResponsavel')?.value || '';

    return allItems.filter(p =>
      (!q  || (p.nomeProjeto||'').toLowerCase().includes(q)) &&
      (!st || p.status === st) &&
      (!pr || p.prioridade === pr) &&
      (!re || String(p.responsavelId) === re)
    );
  }

  function renderTabela(items) {
    const tbody = document.getElementById('tabelaProjetos');
    if (!tbody) return;
    if (!items.length) { EmptyState.table(tbody, 10); return; }

    const PAGE = 10;
    const start = currentPage * PAGE;
    const page  = items.slice(start, start + PAGE);
    totalPages  = Math.ceil(items.length / PAGE);

    const info = document.getElementById('paginacaoInfo');
    if (info) info.textContent = `${_t('Exibindo')} ${page.length} ${_t('de')} ${items.length} ${_t('projeto(s)')}`;
    document.getElementById('paginaAtual').textContent = currentPage + 1;
    document.getElementById('btnAnterior').disabled = currentPage === 0;
    document.getElementById('btnProximo').disabled  = currentPage >= totalPages - 1;

    tbody.innerHTML = page.map(p => `
      <tr>
        <td class="table-cell--strong">${p.nomeProjeto || '—'}</td>
        <td class="table-cell--muted">${p.responsavelNome || p.responsavel || '—'}</td>
        <td>${StatusBadge.prioridade(p.prioridade)}</td>
        <td class="perm-financial">${Fmt?.currency(p.custoAnualPrevisto) || p.custoAnualPrevisto || '—'}</td>
        <td class="perm-financial">${Fmt?.currency(p.retornoPrevisto) || p.retornoPrevisto || '—'}</td>
        <td>${StatusBadge.projeto(p.status)}</td>
        <td class="table-cell--muted">${Fmt?.date(p.previsaoInicio) || '—'}</td>
        <td class="table-cell--muted">${Fmt?.date(p.previsaoTermino) || '—'}</td>
        <td class="table-cell--muted">${Fmt?.date(p.dataRealFinalizacao) || '—'}</td>
        <td class="actions-cell">
          <button class="btn btn-secondary btn-sm perm-edit" onclick="ProjetosModule.editar(${p.id})" title="${_t('Editar')}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </td>
      </tr>`).join('');
  }

  async function loadProjetos() {
    const tbody = document.getElementById('tabelaProjetos');
    Skeleton.tableRows(tbody, 10, 5);
    try {
      const data = await Api.get(ENDPOINT, { size: 1000 });
      allItems = data.content || data;
      renderTabela(applyFilters());
    } catch (err) {
      Toast.error(err.message);
      EmptyState.table(tbody, 10, _t('Erro ao carregar projetos.'));
    }
  }

  function novo() {
    document.getElementById('projetoId').value = '';
    document.getElementById('formProjeto').reset();
    document.getElementById('tituloModal').textContent = _t('Novo Projeto');
    document.getElementById('btnExcluirProjeto').style.display = 'none';
    Modal.open('modalProjeto');
  }

  async function editar(id) {
    try {
      const p = await Api.get(`${ENDPOINT}/${id}`);
      document.getElementById('projetoId').value      = p.id;
      document.getElementById('nomeProjeto').value    = p.nomeProjeto || '';
      document.getElementById('objetivo').value       = p.objetivo || '';
      document.getElementById('atividades').value     = p.atividades || '';
      document.getElementById('responsavelId').value  = p.responsavelId || '';
      document.getElementById('prioridade').value     = p.prioridade || 'Alta';
      document.getElementById('custoAnualPrevisto').value = p.custoAnualPrevisto || '';
      document.getElementById('retornoPrevisto').value    = p.retornoPrevisto || '';
      document.getElementById('status').value         = p.status || '';
      document.getElementById('observacao').value     = p.observacao || '';
      document.getElementById('previsaoInicio').value = p.previsaoInicio ? p.previsaoInicio.split('T')[0] : '';
      document.getElementById('previsaoTermino').value = p.previsaoTermino ? p.previsaoTermino.split('T')[0] : '';
      document.getElementById('dataRealFinalizacao').value = p.dataRealFinalizacao ? p.dataRealFinalizacao.split('T')[0] : '';

      document.getElementById('tituloModal').textContent = `${_t('Editar')} — ${p.nomeProjeto}`;
      document.getElementById('btnExcluirProjeto').style.display = 'inline-flex';
      Modal.open('modalProjeto');
    } catch (err) { Toast.error(err.message); }
  }

  async function salvar() {
    const form = document.getElementById('formProjeto');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('projetoId').value;
    const parseDecimal = v => { const n = parseFloat(String(v).trim()); return isNaN(n) ? null : n; };
    const payload = {
      nomeProjeto:      document.getElementById('nomeProjeto').value.trim(),
      objetivo:         document.getElementById('objetivo').value.trim(),
      atividades:       document.getElementById('atividades').value.trim(),
      responsavelId:    parseInt(document.getElementById('responsavelId').value) || null,
      prioridade:       document.getElementById('prioridade').value,
      custoAnualPrevisto: parseDecimal(document.getElementById('custoAnualPrevisto').value),
      retornoPrevisto:  parseDecimal(document.getElementById('retornoPrevisto').value),
      status:           document.getElementById('status').value,
      observacao:       document.getElementById('observacao').value.trim(),
      previsaoInicio:   document.getElementById('previsaoInicio').value || null,
      previsaoTermino:  document.getElementById('previsaoTermino').value || null,
      dataRealFinalizacao: document.getElementById('dataRealFinalizacao').value || null
    };

    const btn = document.getElementById('btnSalvarProjeto');
    btn.disabled = true; btn.textContent = _t('Salvando...');
    try {
      if (id) { await Api.put(`${ENDPOINT}/${id}`, payload); Toast.success(_t('Projeto atualizado!')); }
      else     { await Api.post(ENDPOINT, payload);           Toast.success(_t('Projeto criado!')); }
      Modal.close('modalProjeto');
      loadProjetos();
    } catch (err) { Toast.error(err.message); }
    finally { btn.disabled = false; btn.textContent = _t('Salvar Projeto'); }
  }

  async function excluir() {
    const id = document.getElementById('projetoId').value;
    const ok = await Confirm.show({ title: _t('Excluir Projeto'), message: _t('Deseja realmente excluir este projeto?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    try {
      await Api.del(`${ENDPOINT}/${id}`);
      Toast.success(_t('Projeto excluído.'));
      Modal.close('modalProjeto');
      loadProjetos();
    } catch (err) { Toast.error(err.message); }
  }

  function init() {
    loadAdmins();
    loadProjetos();

    document.getElementById('btnAbrirModal')?.addEventListener('click', novo);
    document.getElementById('btnSalvarProjeto')?.addEventListener('click', salvar);
    document.getElementById('btnExcluirProjeto')?.addEventListener('click', excluir);

    document.getElementById('btnAnterior')?.addEventListener('click', () => {
      if (currentPage > 0) { currentPage--; renderTabela(applyFilters()); }
    });
    document.getElementById('btnProximo')?.addEventListener('click', () => {
      if (currentPage < totalPages - 1) { currentPage++; renderTabela(applyFilters()); }
    });

    let deb;
    document.getElementById('barraPesquisa')?.addEventListener('input', () => {
      clearTimeout(deb); deb = setTimeout(() => { currentPage = 0; renderTabela(applyFilters()); }, 300);
    });
    ['filtroStatus', 'filtroPrioridade', 'filtroResponsavel'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => { currentPage = 0; renderTabela(applyFilters()); });
    });
    document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
      ['barraPesquisa','filtroStatus','filtroPrioridade','filtroResponsavel'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
      currentPage = 0; renderTabela(applyFilters());
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', () => renderTabela(applyFilters()));
  return { editar };
})();

window.ProjetosModule = ProjetosModule;

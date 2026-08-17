/**
 * almoxarifado.js — Módulo de Almoxarifado
 * Zeiss-Pilot Frontend Redesign
 *
 * Fixes aplicados:
 *  - Classes de botão corrigidas (btn-sm / btn-icon)
 *  - Empty state usa EmptyState helper (classe correta)
 *  - KPI movimentações mantidas em memória local para não resetar
 *  - Histórico carregado do store de movs em memória
 *
 * Features adicionadas:
 *  - Ordenação de colunas (clique no cabeçalho)
 *  - Exportação CSV
 *  - Barra de progresso de estoque inline
 *  - Reabastecimento rápido (ação de atalho para itens críticos)
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  const API_ITENS = '/api/almoxarifado/itens';
  const API_MOV   = '/api/almoxarifado/movimentacoes';

  // ── Estado local ─────────────────────────────────────────────────────────
  let allItens       = [];
  let filteredItens  = [];
  let allMovs        = [];   // mantemos em memória para KPI e histórico
  let editingItemId  = null;
  let movItemId      = null;
  let deleteItemId   = null;

  // Sort state
  let sortCol = null;
  let sortDir = 'asc';

  // ── Helpers ───────────────────────────────────────────────────────────────
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtDT(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(window.I18n?.lang() || 'pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function statusInfo(item) {
    if (item.quantidadeAtual <= 0)                           return { key: 'critico', label: _t('Crítico'),  cls: 'badge--critico' };
    if (item.quantidadeAtual <= item.estoqueMinimo)          return { key: 'critico', label: _t('Crítico'),  cls: 'badge--critico' };
    const ratio = item.quantidadeAtual / Math.max(item.estoqueMinimo, 1);
    if (ratio <= 1.5)                                        return { key: 'aviso',   label: _t('Aviso'),    cls: 'badge--aviso'   };
    return                                                          { key: 'ok',      label: _t('OK'),       cls: 'badge--ok'      };
  }

  function catClass(cat) {
    const map = {
      'Ponteiras':    'almo-cat--ponteiras',
      'Limpeza':      'almo-cat--limpeza',
      'Ferramentas':  'almo-cat--ferramentas',
      'Metrologia':   'almo-cat--metrologia',
      'Eng. Mecânica':'almo-cat--engmec',
      'EPI':          'almo-cat--epi',
      'Papelaria':    'almo-cat--papelaria',
    };
    return map[cat] || '';
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // ── Barra de progresso de estoque ─────────────────────────────────────────
  function stockBarHtml(item) {
    const max = Math.max(item.estoqueMinimo * 3, item.quantidadeAtual, 1);
    const pct = Math.min(100, Math.round((item.quantidadeAtual / max) * 100));
    const s   = statusInfo(item);
    const barColor = s.key === 'critico' ? 'var(--color-danger)' :
                     s.key === 'aviso'   ? 'var(--color-warning)' :
                                           'var(--color-success)';
    return `
      <div class="almo-stock-bar" title="${item.quantidadeAtual}/${item.estoqueMinimo} mín.">
        <div class="almo-stock-bar__fill" style="width:${pct}%;background:${barColor}"></div>
      </div>`;
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────
  function renderKPIs(itens, movs) {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

    set('kpiTotal', itens.length);

    const criticos = itens.filter(i => statusInfo(i).key === 'critico').length;
    set('kpiCritico', criticos);

    const hoje = todayStr();
    const entradas = movs.filter(m => m.tipo === 'entrada' && (m.data || '').slice(0, 10) === hoje).length;
    const saidas   = movs.filter(m => m.tipo === 'saida'   && (m.data || '').slice(0, 10) === hoje).length;
    set('kpiEntradas', entradas);
    set('kpiSaidas',   saidas);
  }

  // ── Ordenação ────────────────────────────────────────────────────────────
  function sortItens(lista) {
    if (!sortCol) return lista;
    return [...lista].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === 'status') {
        const order = { critico: 0, aviso: 1, ok: 2 };
        va = order[statusInfo(a).key] ?? 3;
        vb = order[statusInfo(b).key] ?? 3;
      }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va == null) va = '';
      if (vb == null) vb = '';
      if (va < vb) return sortDir === 'asc' ? -1 :  1;
      if (va > vb) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }

  function setSortHeader(col) {
    document.querySelectorAll('#tabelaItens th[data-sort]').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
      th.querySelector('.sort-icon')?.remove();
    });
    const th = document.querySelector(`#tabelaItens th[data-sort="${col}"]`);
    if (!th) return;
    th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    const icon = document.createElement('span');
    icon.className = 'sort-icon';
    icon.textContent = sortDir === 'asc' ? ' ↑' : ' ↓';
    icon.style.cssText = 'font-size:10px;opacity:0.7;margin-left:2px';
    th.appendChild(icon);
  }

  // ── Tabela principal ──────────────────────────────────────────────────────
  function applyFilters() {
    const busca    = (document.getElementById('searchInput')?.value   || '').toLowerCase().trim();
    const catFilt  = (document.getElementById('filterCategoria')?.value || '');
    const statFilt = (document.getElementById('filterStatus')?.value   || '');

    filteredItens = allItens.filter(item => {
      if (busca    && !((item.nome || '') + (item.localizacao || '') + (item.observacao || '')).toLowerCase().includes(busca)) return false;
      if (catFilt  && item.categoria !== catFilt)        return false;
      if (statFilt && statusInfo(item).key !== statFilt) return false;
      return true;
    });

    filteredItens = sortItens(filteredItens);
    renderTable();
  }

  function renderTable() {
    const tbody      = document.getElementById('tbodyItens');
    const countLabel = document.getElementById('countLabel');
    if (!tbody) return;

    if (countLabel) countLabel.textContent = `${filteredItens.length} ${_t('item(s)')}`;

    if (!filteredItens.length) {
      EmptyState.table(tbody, 7, _t('Nenhum item encontrado'), _t('Ajuste os filtros ou cadastre um novo item.'));
      return;
    }

    tbody.innerHTML = filteredItens.map(item => {
      const s      = statusInfo(item);
      const qtyCls = s.key === 'critico' ? 'almo-qty--critico' : (s.key === 'aviso' ? 'almo-qty--aviso' : '');
      const rowCls = s.key === 'critico' ? 'almo-row--critico' : '';

      return `<tr class="${rowCls}" data-id="${item.id}">
        <td>
          <div class="almo-item-nome">${esc(item.nome)}</div>
          ${item.observacao ? `<div class="almo-item-obs">${esc(item.observacao)}</div>` : ''}
        </td>
        <td><span class="almo-cat-badge ${catClass(item.categoria)}">${esc(_t(item.categoria))}</span></td>
        <td>${esc(item.localizacao) || '<span style="color:var(--text-muted)">—</span>'}</td>
        <td style="text-align:right">
          <span class="almo-qty ${qtyCls}">${item.quantidadeAtual} ${esc(item.unidade)}</span>
          ${stockBarHtml(item)}
        </td>
        <td style="text-align:right"><span class="almo-qty-min">${item.estoqueMinimo} ${esc(item.unidade)}</span></td>
        <td><span class="${s.cls}">${s.label}</span></td>
        <td>
          <div class="almo-actions">
            ${s.key === 'critico' ? `
            <button class="btn btn-danger btn-sm btn-icon almo-btn--restock" title="${_t('Reabastecimento rápido')}" onclick="Almo.quickRestock(${item.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>` : ''}
            <button class="btn btn-ghost btn-sm btn-icon" title="${_t('Movimentar')}" onclick="Almo.openMovimentar(${item.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon" title="${_t('Histórico')}" onclick="Almo.openHistorico(${item.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon" title="${_t('Editar')}" onclick="Almo.openEditar(${item.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon almo-btn--delete" title="${_t('Excluir')}" onclick="Almo.openDelete(${item.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // ── Carregar dados ────────────────────────────────────────────────────────
  async function load() {
    const tbody = document.getElementById('tbodyItens');
    if (tbody) Skeleton.tableRows(tbody, 7, 6);

    try {
      const [itensResp, movsResp] = await Promise.all([
        Api.get(API_ITENS, { size: 1000 }),
        Api.get(API_MOV,   { size: 1000 }),
      ]);
      allItens = Array.isArray(itensResp) ? itensResp : (itensResp.content || []);
      allMovs  = Array.isArray(movsResp)  ? movsResp  : (movsResp.content  || []);
      renderKPIs(allItens, allMovs);
      applyFilters();
    } catch (err) {
      if (tbody) EmptyState.table(tbody, 7, _t('Erro ao carregar dados'), _t('Verifique a conexão com o servidor.'));
    }
  }

  // ── Exportar CSV ──────────────────────────────────────────────────────────
  function exportCSV() {
    const rows = filteredItens;
    if (!rows.length) { Toast.warning(_t('Nenhum item para exportar.')); return; }

    const headers = [_t('Nome'), _t('Categoria'), _t('Localização'), _t('Qtd. Atual'), _t('Estoque Mín.'), _t('Unidade'), _t('Status'), _t('Observação')];
    const lines   = [headers.join(';')];

    rows.forEach(item => {
      const s = statusInfo(item);
      const row = [
        item.nome, item.categoria, item.localizacao || '',
        item.quantidadeAtual, item.estoqueMinimo, item.unidade,
        s.label, item.observacao || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(row.join(';'));
    });

    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `almoxarifado_${todayStr()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.success(`${rows.length} ${_t('itens exportados com sucesso.')}`);
  }

  // ── Modal Item (Novo / Editar) ─────────────────────────────────────────────
  function openNovoItem() {
    editingItemId = null;
    document.getElementById('modalItemTitle').textContent = _t('Novo Item');
    ['itemNome', 'itemUnidade', 'itemLocalizacao', 'itemObs'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('itemCategoria').value   = '';
    document.getElementById('itemQtdInicial').value  = '';
    document.getElementById('itemEstoqueMin').value  = '';
    document.getElementById('itemQtdInicial').disabled = false;
    Modal.open('modalItem');
  }

  function openEditar(id) {
    const item = allItens.find(i => i.id === id);
    if (!item) return;
    editingItemId = id;
    document.getElementById('modalItemTitle').textContent    = _t('Editar Item');
    document.getElementById('itemNome').value        = item.nome;
    document.getElementById('itemCategoria').value   = item.categoria;
    document.getElementById('itemUnidade').value     = item.unidade;
    document.getElementById('itemQtdInicial').value  = item.quantidadeAtual;
    document.getElementById('itemEstoqueMin').value  = item.estoqueMinimo;
    document.getElementById('itemLocalizacao').value = item.localizacao || '';
    document.getElementById('itemObs').value         = item.observacao  || '';
    document.getElementById('itemQtdInicial').disabled = true;
    Modal.open('modalItem');
  }

  function closeModalItem() {
    Modal.close('modalItem');
  }

  async function salvarItem() {
    const nome        = document.getElementById('itemNome').value.trim();
    const categoria   = document.getElementById('itemCategoria').value;
    const unidade     = document.getElementById('itemUnidade').value.trim();
    const qtdInicial  = parseInt(document.getElementById('itemQtdInicial').value, 10);
    const estoqueMin  = parseInt(document.getElementById('itemEstoqueMin').value, 10);
    const localizacao = document.getElementById('itemLocalizacao').value.trim();
    const observacao  = document.getElementById('itemObs').value.trim();

    if (!nome || !categoria || !unidade || isNaN(estoqueMin)) {
      Toast.error(_t('Preencha todos os campos obrigatórios.'));
      return;
    }

    const btn = document.getElementById('btnSalvarItem');
    if (btn) btn.disabled = true;

    try {
      if (editingItemId === null) {
        const payload = { nome, categoria, unidade, estoqueMinimo: estoqueMin,
                          quantidadeAtual: isNaN(qtdInicial) ? 0 : qtdInicial,
                          localizacao, observacao };
        await Api.post(API_ITENS, payload);
        Toast.success(_t('Item cadastrado com sucesso!'));
      } else {
        const payload = { nome, categoria, unidade, estoqueMinimo: estoqueMin, localizacao, observacao };
        await Api.put(`${API_ITENS}/${editingItemId}`, payload);
        Toast.success(_t('Item atualizado.'));
      }
      closeModalItem();
      await load();
    } catch (err) {
      Toast.error(err?.message || _t('Erro ao salvar item.'));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ── Modal Movimentar ──────────────────────────────────────────────────────
  function openMovimentar(id) {
    const item = allItens.find(i => i.id === id);
    if (!item) return;
    movItemId = id;

    document.getElementById('movItemNome').textContent = `${item.nome} — ${_t('estoque atual:')} ${item.quantidadeAtual} ${_t(item.unidade)}`;
    document.getElementById('movQtdHint').textContent  = `${_t('Disponível:')} ${item.quantidadeAtual} ${_t(item.unidade)}`;
    document.querySelectorAll('input[name="movTipo"]').forEach(r => r.checked = false);
    document.getElementById('movQtd').value         = '';
    document.getElementById('movResponsavel').value = '';
    document.getElementById('movMotivo').value      = '';
    Modal.open('modalMovimentar');
  }

  function closeModalMov() {
    Modal.close('modalMovimentar');
    movItemId = null;
  }

  async function confirmarMovimentacao() {
    const tipo        = document.querySelector('input[name="movTipo"]:checked')?.value;
    const qtd         = parseInt(document.getElementById('movQtd').value, 10);
    const responsavel = document.getElementById('movResponsavel').value.trim();
    const motivo      = document.getElementById('movMotivo').value.trim();

    if (!tipo)           { Toast.error(_t('Selecione o tipo de movimentação.')); return; }
    if (!qtd || qtd < 1) { Toast.error(_t('Informe uma quantidade válida.'));    return; }
    if (!responsavel)    { Toast.error(_t('Informe o responsável.'));             return; }

    const item = allItens.find(i => i.id === movItemId);
    if (!item) return;

    if (tipo === 'saida' && qtd > item.quantidadeAtual) {
      Toast.error(`${_t('Quantidade insuficiente. Estoque atual:')} ${item.quantidadeAtual} ${_t(item.unidade)}.`);
      return;
    }

    const btn = document.getElementById('btnConfirmarMov');
    if (btn) btn.disabled = true;

    try {
      await Api.post(API_MOV, {
        itemId:      movItemId,
        tipo,
        quantidade:  qtd,
        responsavel,
        motivo,
        data:        new Date().toISOString(),
      });

      const novoEstoque = tipo === 'entrada'
        ? item.quantidadeAtual + qtd
        : Math.max(0, item.quantidadeAtual - qtd);

      Toast.success(`${_t(tipo === 'entrada' ? 'Entrada' : 'Saída')} ${_t('registrada! Novo estoque:')} ${novoEstoque} ${_t(item.unidade)}`);

      closeModalMov();
      await load();

      const atualizado = allItens.find(i => i.id === movItemId);
      if (atualizado && statusInfo(atualizado).key === 'critico') {
        setTimeout(() => Toast.error(`⚠️ ${_t('Atenção')}: "${atualizado.nome}" ${_t('está com estoque crítico')} (${atualizado.quantidadeAtual} ${_t(atualizado.unidade)})!`), 600);
      }
    } catch (err) {
      Toast.error(err?.message || _t('Erro ao registrar movimentação.'));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ── Reabastecimento rápido ─────────────────────────────────────────────────
  function quickRestock(id) {
    const item = allItens.find(i => i.id === id);
    if (!item) return;
    // Pré-seleciona "entrada" e abre modal de movimentação
    movItemId = id;
    document.getElementById('movItemNome').textContent = `${item.nome} — ${_t('estoque atual:')} ${item.quantidadeAtual} ${_t(item.unidade)}`;
    document.getElementById('movQtdHint').textContent  = `${_t('Disponível:')} ${item.quantidadeAtual} ${_t(item.unidade)}`;
    document.querySelectorAll('input[name="movTipo"]').forEach(r => {
      r.checked = (r.value === 'entrada');
    });
    // Sugere quantidade para atingir 2× mínimo
    const sugestao = Math.max(1, (item.estoqueMinimo * 2) - item.quantidadeAtual);
    document.getElementById('movQtd').value         = sugestao;
    document.getElementById('movResponsavel').value = '';
    document.getElementById('movMotivo').value      = _t('Reabastecimento de emergência');
    Modal.open('modalMovimentar');
  }

  // ── Modal Delete ──────────────────────────────────────────────────────────
  function openDelete(id) {
    const item = allItens.find(i => i.id === id);
    if (!item) return;
    deleteItemId = id;
    document.getElementById('deleteItemNome').textContent = item.nome;
    Modal.open('modalDelete');
  }

  function closeModalDelete() {
    Modal.close('modalDelete');
    deleteItemId = null;
  }

  async function confirmarDelete() {
    if (!deleteItemId) return;

    const btn = document.getElementById('btnConfirmarDelete');
    if (btn) btn.disabled = true;

    try {
      await Api.del(`${API_ITENS}/${deleteItemId}`);
      Toast.success(_t('Item excluído.'));
      closeModalDelete();
      await load();
    } catch (err) {
      Toast.error(err?.message || _t('Erro ao excluir item.'));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // ── Histórico ─────────────────────────────────────────────────────────────
  async function openHistorico(id) {
    const item = allItens.find(i => i.id === id);
    if (!item) return;

    const painel = document.getElementById('painelHistorico');
    document.getElementById('historicoItemNome').textContent = item.nome;
    painel.style.display = '';
    painel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const tbody = document.getElementById('tbodyHistorico');
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted)">${_t('Carregando...')}</td></tr>`;

    let movs = [];

    try {
      const resp = await Api.get(API_MOV, { itemId: id });
      movs = Array.isArray(resp) ? resp : (resp.content || []);
    } catch {
      EmptyState.table(tbody, 5, _t('Erro ao carregar histórico'), _t('Verifique a conexão com o servidor.'));
      return;
    }

    const filtered = movs
      .filter(m => m.itemId === id)
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    if (!filtered.length) {
      EmptyState.table(tbody, 5, _t('Sem movimentações registradas'), _t('Movimentações futuras aparecerão aqui.'));
      return;
    }

    tbody.innerHTML = filtered.map(m => {
      const tipoCls = m.tipo === 'entrada'
        ? 'color:var(--color-success-text);font-weight:600'
        : 'color:var(--color-danger-text);font-weight:600';
      const sinal = m.tipo === 'entrada' ? '+' : '−';
      return `<tr>
        <td>${fmtDT(m.data)}</td>
        <td><span style="${tipoCls}">${m.tipo === 'entrada' ? '▲ Entrada' : '▼ Saída'}</span></td>
        <td style="text-align:right;${tipoCls}">${sinal}${m.quantidade} ${esc(item.unidade)}</td>
        <td>${esc(m.responsavel)}</td>
        <td>${esc(m.motivo) || '<span style="color:var(--text-muted)">—</span>'}</td>
      </tr>`;
    }).join('');
  }

  // ── Bind de eventos ───────────────────────────────────────────────────────
  function bindEvents() {
    // Filtros
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('filterCategoria')?.addEventListener('change', applyFilters);
    document.getElementById('filterStatus')?.addEventListener('change', applyFilters);
    document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
      document.getElementById('searchInput').value     = '';
      document.getElementById('filterCategoria').value = '';
      document.getElementById('filterStatus').value    = '';
      sortCol = null;
      sortDir = 'asc';
      document.querySelectorAll('#tabelaItens th[data-sort]').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        th.querySelector('.sort-icon')?.remove();
      });
      applyFilters();
    });

    // Exportar CSV
    document.getElementById('btnExportCSV')?.addEventListener('click', exportCSV);

    // Modal Item
    document.getElementById('btnNovoItem')?.addEventListener('click', openNovoItem);
    document.getElementById('btnFecharModalItem')?.addEventListener('click', closeModalItem);
    document.getElementById('btnCancelarItem')?.addEventListener('click', closeModalItem);
    document.getElementById('btnSalvarItem')?.addEventListener('click', salvarItem);

    // Salvar item com Enter no último campo
    document.getElementById('itemObs')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); salvarItem(); }
    });

    // Modal Movimentar
    document.getElementById('btnFecharModalMov')?.addEventListener('click', closeModalMov);
    document.getElementById('btnCancelarMov')?.addEventListener('click', closeModalMov);
    document.getElementById('btnConfirmarMov')?.addEventListener('click', confirmarMovimentacao);

    document.querySelectorAll('input[name="movTipo"]').forEach(r => {
      r.addEventListener('change', () => {
        const item = allItens.find(i => i.id === movItemId);
        if (!item) return;
        document.getElementById('movQtdHint').textContent =
          r.value === 'saida'
            ? `Estoque disponível: ${item.quantidadeAtual} ${_t(item.unidade)}`
            : '';
      });
    });

    // Modal Delete
    document.getElementById('btnFecharModalDelete')?.addEventListener('click', closeModalDelete);
    document.getElementById('btnCancelarDelete')?.addEventListener('click', closeModalDelete);
    document.getElementById('btnConfirmarDelete')?.addEventListener('click', confirmarDelete);

    // Histórico fechar
    document.getElementById('btnFecharHistorico')?.addEventListener('click', () => {
      document.getElementById('painelHistorico').style.display = 'none';
    });

    // Fechar ao clicar no fundo já é gerenciado pelo Modal manager (ui.js)

    // Escape na busca
    document.getElementById('searchInput')?.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.target.value = ''; applyFilters(); }
    });

    // Ordenação por colunas
    document.querySelectorAll('#tabelaItens th[data-sort]').forEach(th => {
      th.style.cursor = 'pointer';
      th.title = 'Clique para ordenar';
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (sortCol === col) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortCol = col;
          sortDir = 'asc';
        }
        setSortHeader(col);
        filteredItens = sortItens(filteredItens);
        renderTable();
      });
    });
  }

  // ── Exposição pública ─────────────────────────────────────────────────────
  window.Almo = {
    openMovimentar,
    openHistorico,
    openEditar,
    openDelete,
    quickRestock,
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    load();
  });
  document.addEventListener('zeiss:langchange', () => {
    applyFilters();
    renderKPIs(allItens, allMovs);
  });

})();

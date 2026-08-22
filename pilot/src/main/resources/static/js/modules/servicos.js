/**
 * ZEISS-PILOT — SERVICOS.JS
 * Ordens de Serviço CRUD
 */

'use strict';

const ServicosModule = (() => {
  const _t = ptBR => window.I18n?.t(ptBR) ?? ptBR;
  const { Fmt, Dom } = window.ZP || {};
  const ENDPOINT       = '/api/servicos';
  const ENDPOINT_NOTAS = '/api/notas-estagiarios';
  const ENDPOINT_ESTAG = '/api/estagiarios';
  const CLIENTES_URL   = '/api/clientes';

  let notaDiretorValor = null;
  let allEstagiarios   = [];

  let currentPage = 0;
  let totalPages  = 1;
  let currentQuery = '';
  let currentStatus = '';

  /* ── Fetch & Render ── */
  async function loadServicos(page = 0) {
    const tbody = document.getElementById('tabelaServicos');
    if (!tbody) return;

    Skeleton.tableRows(tbody, 9, 5);

    try {
      const params = { page, size: 10 };
      if (currentQuery)  params.query  = currentQuery;
      if (currentStatus) params.status = currentStatus;

      const data = await Api.get(ENDPOINT, params);
      const items = data.content || data;
      totalPages  = data.totalPages || 1;
      currentPage = data.number    || page;

      const total = data.totalElements || items.length;
      const info  = document.getElementById('paginacaoInfo');
      if (info) info.textContent =
        `${_t('Exibindo')} ${items.length} ${_t('de')} ${total} ${_t('registro(s)')}`;

      document.getElementById('paginaAtual').textContent = currentPage + 1;
      document.getElementById('btnAnterior').disabled = currentPage === 0;
      document.getElementById('btnProximo').disabled  = currentPage >= totalPages - 1;

      if (!items.length) {
        EmptyState.table(tbody, 9);
        return;
      }

      tbody.innerHTML = items.map(s => `
        <tr>
          <td class="table-cell--strong">${s.clienteNome || s.cliente || '—'}</td>
          <td>${s.solicitacao || '—'}</td>
          <td style="text-align:center">${s.quantidade ?? '—'}</td>
          <td>${StatusBadge.servico(s.status)}</td>
          <td class="table-cell--muted">${s.tecnicoResponsavel || '—'}</td>
          <td class="table-cell--muted">${Fmt?.date(s.dataPrevista) || s.dataPrevista || '—'}</td>
          <td class="table-cell--strong perm-financial">${Fmt?.currency(s.valor) || s.valor || '—'}</td>
          <td class="table-cell--muted" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${s.observacao || ''}">${s.observacao || '—'}</td>
          <td class="actions-cell">
            <div style="display:flex;gap:4px">
              <button class="btn btn-secondary btn-sm perm-edit" onclick="ServicosModule.editar(${s.id})" title="${_t('Editar')}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </td>
        </tr>`).join('');
    } catch (err) {
      Toast.error(err.message || _t('Erro ao carregar serviços.'));
      EmptyState.table(tbody, 9, _t('Erro ao carregar dados'), _t('Verifique sua conexão e tente novamente.'));
    }
  }

  /* ── Nota do Diretor: stars ── */
  function paintNDStars(val) {
    document.querySelectorAll('.nd-star').forEach(b => {
      b.style.color = val && parseInt(b.dataset.val) <= val ? '#F59E0B' : 'var(--border-color)';
    });
  }

  function resetNotaDirector() {
    notaDiretorValor = null;
    document.getElementById('notaDiretorValor').value      = '';
    document.getElementById('notaDiretorComentario').value = '';
    document.getElementById('notaDiretorEstagiario').value = '';
    paintNDStars(null);
  }

  function toggleNotaSection(statusValue) {
    const sec = document.getElementById('notaDiretorSection');
    if (sec) sec.style.display = statusValue === 'Venda finalizada' ? '' : 'none';
  }

  async function loadEstagiarios() {
    if (allEstagiarios.length) return;
    try {
      const resp = await Api.get(ENDPOINT_ESTAG);
      allEstagiarios = Array.isArray(resp) ? resp : (resp.content || []);
      const sel = document.getElementById('notaDiretorEstagiario');
      if (!sel) return;
      sel.innerHTML = `<option value="">${_t('Nenhum / Não aplicável')}</option>`;
      allEstagiarios.filter(e => e.ativo).forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = `${e.nome} — ${e.area}`;
        sel.appendChild(opt);
      });
    } catch { /* non-fatal */ }
  }

  /* ── Cliente combobox ── */
  let clienteCombobox = null;

  function initClienteCombobox() {
    const inputEl = document.getElementById('clienteBusca');
    const hiddenEl = document.getElementById('clienteId');
    if (!inputEl || !hiddenEl) return;
    clienteCombobox = Combobox.create({
      inputEl,
      hiddenEl,
      items: [],
      getLabel: c => c.nome,
      getId: c => c.id,
      placeholder: _t('Buscar cliente...'),
      emptyMessage: _t('Nenhum cliente encontrado.'),
    });
  }

  async function carregarClientesNoCombobox() {
    if (!clienteCombobox) return;
    let clientes = [];
    try {
      clientes = await Api.get(CLIENTES_URL);
    } catch { clientes = []; }
    // O rótulo só precisa ajudar a escolher o cliente pelo nome — mostrar
    // CPF/CNPJ aqui expõe o dado a qualquer usuário que abra o formulário de
    // OS, mesmo sem precisar visitar /clientes.
    clienteCombobox.setItems(clientes);
  }

  /* ── Open Modal (New) ── */
  async function novo() {
    document.getElementById('servicoId').value = '';
    document.getElementById('servicoForm').reset();
    clienteCombobox?.clear();
    document.getElementById('modalTitulo').textContent = _t('Nova Ordem de Serviço');
    document.getElementById('btnExcluirServico').style.display = 'none';
    resetNotaDirector();
    toggleNotaSection('');
    await carregarClientesNoCombobox();
    Modal.open('modalServico');
  }

  /* ── Open Modal (Edit) ── */
  async function editar(id) {
    try {
      const s = await Api.get(`${ENDPOINT}/${id}`);
      document.getElementById('servicoId').value       = s.id;
      await carregarClientesNoCombobox();
      clienteCombobox?.setValue(s.clienteId, s.clienteNome);
      document.getElementById('solicitacao').value     = s.solicitacao || '';
      document.getElementById('quantidade').value      = s.quantidade || '';
      document.getElementById('status').value          = s.status || '';
      document.getElementById('tecnicoResponsavel').value = s.tecnicoResponsavel || '';
      document.getElementById('valor').value           = s.valor || '';
      document.getElementById('dataPrevista').value    = s.dataPrevista ? s.dataPrevista.split('T')[0] : '';
      document.getElementById('dataRealizada').value   = s.dataRealizada ? s.dataRealizada.split('T')[0] : '';
      document.getElementById('observacao').value      = s.observacao || '';

      resetNotaDirector();
      toggleNotaSection(s.status || '');
      await loadEstagiarios();

      document.getElementById('modalTitulo').textContent = `${_t('Editar OS')} — ${s.clienteNome || s.cliente}`;
      document.getElementById('btnExcluirServico').style.display = 'inline-flex';
      Modal.open('modalServico');
    } catch (err) {
      Toast.error(err.message || _t('Erro ao carregar OS.'));
    }
  }

  /* ── Save ── */
  async function salvar() {
    const form = document.getElementById('servicoForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('servicoId').value;
    const payload = {
      clienteId:           document.getElementById('clienteId').value ? Number(document.getElementById('clienteId').value) : null,
      solicitacao:         document.getElementById('solicitacao').value.trim(),
      quantidade:          parseInt(document.getElementById('quantidade').value, 10),
      status:              document.getElementById('status').value,
      tecnicoResponsavel:  document.getElementById('tecnicoResponsavel').value.trim(),
      valor:               document.getElementById('valor').value.trim(),
      dataPrevista:        document.getElementById('dataPrevista').value || null,
      dataRealizada:       document.getElementById('dataRealizada').value || null,
      observacao:          document.getElementById('observacao').value.trim()
    };

    const btn = document.getElementById('btnSalvarServico');
    btn.disabled = true; btn.textContent = _t('Salvando...');
    try {
      let savedId = id;
      if (id) {
        await Api.put(`${ENDPOINT}/${id}`, payload);
        Toast.success(_t('Ordem de Serviço atualizada com sucesso!'));
      } else {
        const created = await Api.post(ENDPOINT, payload);
        savedId = created?.id;
        Toast.success(_t('Ordem de Serviço criada com sucesso!'));
      }

      // ── Salvar nota do diretor se preenchida e OS finalizada ──
      if (payload.status === 'Venda finalizada') {
        const estagId  = parseInt(document.getElementById('notaDiretorEstagiario')?.value);
        const notaVal  = notaDiretorValor || parseInt(document.getElementById('notaDiretorValor')?.value || '0');
        const coment   = document.getElementById('notaDiretorComentario')?.value?.trim();
        if (estagId && notaVal && coment) {
          try {
            await Api.post(ENDPOINT_NOTAS, {
              estagiariaId:  estagId,
              servicoId:     savedId || null,
              nota:          notaVal,
              comentario:    coment,
              avaliadorNome: 'Diretor',
              data:          new Date().toISOString().slice(0, 10),
            });
            Toast.success(_t('Nota do diretor salva!'));
          } catch { /* non-fatal */ }
        }
      }

      Modal.close('modalServico');
      loadServicos(currentPage);
    } catch (err) {
      Toast.error(err.message || _t('Erro ao salvar OS.'));
    } finally {
      btn.disabled = false; btn.textContent = _t('Salvar OS');
    }
  }

  /* ── Delete ── */
  async function excluir() {
    const id = document.getElementById('servicoId').value;
    if (!id) return;

    const confirmed = await Confirm.show({
      title: _t('Excluir Ordem de Serviço'),
      message: _t('Esta ação é permanente. Deseja realmente excluir esta OS?'),
      confirmText: _t('Excluir'),
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await Api.del(`${ENDPOINT}/${id}`);
      Toast.success(_t('OS excluída com sucesso.'));
      Modal.close('modalServico');
      loadServicos(currentPage);
    } catch (err) {
      Toast.error(err.message || _t('Erro ao excluir OS.'));
    }
  }

  /* ── Filters ── */
  function applyFilters() {
    currentQuery  = (document.getElementById('campoBusca')?.value || '').trim();
    currentStatus = document.getElementById('filtroStatus')?.value || '';
    loadServicos(0);
  }

  /* ── Init ── */
  function init() {
    initClienteCombobox();
    loadServicos(0);
    loadEstagiarios();
    carregarClientesNoCombobox();

    // Stars interaction for Nota do Diretor
    document.querySelectorAll('.nd-star').forEach(btn => {
      btn.addEventListener('mouseover', () => {
        const v = parseInt(btn.dataset.val);
        document.querySelectorAll('.nd-star').forEach(b => {
          b.style.color = parseInt(b.dataset.val) <= v ? '#F59E0B' : 'var(--border-color)';
        });
      });
      btn.addEventListener('mouseout', () => paintNDStars(notaDiretorValor));
      btn.addEventListener('click', () => {
        notaDiretorValor = parseInt(btn.dataset.val);
        document.getElementById('notaDiretorValor').value = notaDiretorValor;
        paintNDStars(notaDiretorValor);
      });
    });

    // Show/hide nota section based on status change
    document.getElementById('status')?.addEventListener('change', e => {
      toggleNotaSection(e.target.value);
    });

    document.getElementById('btnNovoServico')?.addEventListener('click', novo);
    document.getElementById('btnSalvarServico')?.addEventListener('click', salvar);
    document.getElementById('btnExcluirServico')?.addEventListener('click', excluir);
    document.getElementById('btnClienteRapido')?.addEventListener('click', () => window.open('/clientes', '_blank'));

    document.getElementById('btnAnterior')?.addEventListener('click', () => {
      if (currentPage > 0) loadServicos(currentPage - 1);
    });
    document.getElementById('btnProximo')?.addEventListener('click', () => {
      if (currentPage < totalPages - 1) loadServicos(currentPage + 1);
    });

    let debounce;
    document.getElementById('campoBusca')?.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(applyFilters, 350);
    });
    document.getElementById('filtroStatus')?.addEventListener('change', applyFilters);
    document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
      document.getElementById('campoBusca').value = '';
      document.getElementById('filtroStatus').value = '';
      currentQuery = ''; currentStatus = '';
      loadServicos(0);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', () => loadServicos(currentPage));
  return { editar };
})();

window.ServicosModule = ServicosModule;

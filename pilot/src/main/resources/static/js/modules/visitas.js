/**
 * visitas.js — Módulo de Visitas Técnicas (visitasTecnicas.html)
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

  const API_URL = '/api/visitas-tecnicas';
  const PAGE_SIZE = 12;

  let allItems = [];
  let filtered = [];
  let currentPage = 0;

  const tbody = document.getElementById('tabelaVisitas');
  const info  = document.getElementById('paginacaoInfo');

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ── CEM (visita interna) ──────────────────────────────────────────── */
  const CEM_EMPRESA_FIXA = 'CEM SENAI Zeiss';
  const CEM_ENDERECO_FIXO = 'R. Armogaste José da Silveira, 612 · Setor Centro Oeste · Goiânia - GO · 74560-550';

  /* ── Responsável (Usuário) ─────────────────────────────────────────── */
  const CARGOS_RESPONSAVEL_VISITA = ['GESTOR', 'TECNICO'];

  async function carregarResponsaveisVisita() {
    const sel = document.getElementById('responsavel');
    if (!sel) return;
    let usuarios = [];
    try {
      usuarios = await Api.get('/api/usuarios');
    } catch {
      usuarios = [];
      Toast.error(_t('Erro ao carregar lista de usuários.'));
    }
    const permitidos = (Array.isArray(usuarios) ? usuarios : (usuarios.content || []))
      .filter(u => CARGOS_RESPONSAVEL_VISITA.includes(u.cargo));
    sel.innerHTML = `<option value="">${_t('Selecione...')}</option>` +
      permitidos.map(u => `<option value="${u.id}">${esc(u.nome)}</option>`).join('');
  }

  /* ── Empresa (Combobox de Cliente) ────────────────────────────────── */
  let empresaCombobox = null;
  let clientesCarregados = [];

  function initEmpresaCombobox() {
    const inputEl = document.getElementById('empresaBusca');
    const hiddenEl = document.getElementById('clienteId');
    if (!inputEl || !hiddenEl) return;
    empresaCombobox = Combobox.create({
      inputEl,
      hiddenEl,
      items: [],
      getLabel: c => c.nome,
      getId: c => c.id,
      placeholder: _t('Buscar cliente...'),
      emptyMessage: _t('Nenhum cliente encontrado.'),
    });
    hiddenEl.addEventListener('change', () => {
      const cliente = clientesCarregados.find(c => String(c.id) === String(hiddenEl.value));
      if (cliente) document.getElementById('local').value = cliente.endereco || '';
    });
  }

  async function carregarClientesNoEmpresaCombobox() {
    if (!empresaCombobox) return;
    try {
      clientesCarregados = await Api.get('/api/clientes');
    } catch { clientesCarregados = []; }
    empresaCombobox.setItems(clientesCarregados);
  }

  /* ── Alternador Cliente / Interna ─────────────────────────────────── */
  function toggleTipoVisita(mode) {
    const isInterna = mode === 'interna';
    document.getElementById('empresaClienteWrap').style.display = isInterna ? 'none' : '';
    document.getElementById('empresaFixaWrap').style.display = isInterna ? '' : 'none';
    const empresaBuscaEl = document.getElementById('empresaBusca');
    empresaBuscaEl.required = !isInterna;
    // O Combobox (ui.js) chama setCustomValidity() sempre que o campo fica
    // vazio, mesmo antes de o usuário interagir — isso acontece já na
    // criação (initEmpresaCombobox) e de novo em empresaCombobox.clear()
    // (abrirModalNovo). Sem replicar aqui a mesma checagem ao entrar/sair do
    // modo Interna, esse "Selecione um item da lista." sobrevive escondido
    // no campo oculto e não-obrigatório, e form.checkValidity() nunca mais
    // fica true — bloqueando pra sempre o salvamento de uma Visita Interna.
    empresaBuscaEl.setCustomValidity(
      isInterna || document.getElementById('clienteId').value ? '' : 'Selecione um item da lista.'
    );
    if (isInterna) {
      document.getElementById('local').value = CEM_ENDERECO_FIXO;
    }
  }

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
        (v.empresaInstituicao || '').toLowerCase().includes(q) ||
        (v.localVisita || '').toLowerCase().includes(q);
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
        <td><strong>${v.empresaInstituicao || '—'}</strong></td>
        <td>${v.dataSolicitada ? ZP.Fmt.date(v.dataSolicitada) : '—'}</td>
        <td>${v.dataAgendada ? ZP.Fmt.date(v.dataAgendada) : '—'}</td>
        <td>${v.localVisita || '—'}</td>
        <td>${v.quantidadeVisitantes || '—'}</td>
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
    document.getElementById('tipoVisitaCliente').checked = true;
    toggleTipoVisita('cliente');
    empresaCombobox?.clear();
    document.getElementById('modalTitulo').textContent = _t('Agendar Visita Técnica');
    document.getElementById('btnExcluirVisita').style.display = 'none';
    carregarResponsaveisVisita();
    carregarClientesNoEmpresaCombobox();
    Modal.open('modalVisita');
  }

  async function editar(id) {
    try {
      const v = await Api.get(`${API_URL}/${id}`);
      await carregarResponsaveisVisita();
      await carregarClientesNoEmpresaCombobox();
      document.getElementById('visitaId').value = v.id;
      document.getElementById('responsavel').value = v.responsavelId || '';
      if (v.clienteId) {
        document.getElementById('tipoVisitaCliente').checked = true;
        toggleTipoVisita('cliente');
        empresaCombobox?.setValue(v.clienteId, v.empresaInstituicao);
      } else if (v.empresaInstituicao === CEM_EMPRESA_FIXA) {
        document.getElementById('tipoVisitaInterna').checked = true;
        toggleTipoVisita('interna');
        empresaCombobox?.clear();
      } else {
        document.getElementById('tipoVisitaCliente').checked = true;
        toggleTipoVisita('cliente');
        empresaCombobox?.clear();
      }
      document.getElementById('dataSolicitada').value = v.dataSolicitada ? v.dataSolicitada.substring(0, 10) : '';
      document.getElementById('dataAgendada').value = v.dataAgendada ? v.dataAgendada.substring(0, 10) : '';
      document.getElementById('local').value = v.localVisita || '';
      document.getElementById('quantidade').value = v.quantidadeVisitantes || '';
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
    const form = document.getElementById('visitaForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('visitaId').value;
    const interna = document.getElementById('tipoVisitaInterna').checked;
    const body = {
      responsavelId: document.getElementById('responsavel').value ? Number(document.getElementById('responsavel').value) : null,
      visitaInterna: interna,
      clienteId: interna ? null : (document.getElementById('clienteId').value ? Number(document.getElementById('clienteId').value) : null),
      dataSolicitada: document.getElementById('dataSolicitada').value || null,
      dataAgendada: document.getElementById('dataAgendada').value || null,
      localVisita: document.getElementById('local').value,
      quantidadeVisitantes: document.getElementById('quantidade').value
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
    initEmpresaCombobox();
    document.getElementById('tipoVisitaCliente').addEventListener('change', () => toggleTipoVisita('cliente'));
    document.getElementById('tipoVisitaInterna').addEventListener('change', () => toggleTipoVisita('interna'));
    document.getElementById('btnNovaVisita').addEventListener('click', abrirModalNovo);
    document.getElementById('visitaBtnClienteRapido')?.addEventListener('click', () => window.open('/clientes', '_blank'));
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

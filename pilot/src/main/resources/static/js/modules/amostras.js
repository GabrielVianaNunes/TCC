/**
 * amostras.js — Módulo de Amostras / Recebimento de Peças CEM Rev 00
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  const API_AMOSTRAS = '/api/amostras';
  const TOTAL_STEPS  = 6;

  let allAmostras      = [];
  let filteredAmostras = [];
  let editingId        = null;
  let devItemId        = null;
  let anexoItemId      = null;
  let deleteItemId     = null;
  let currentStep      = 1;
  let sortCol = null;
  let sortDir = 'asc';

  let currentPage    = 0;
  let totalPages     = 1;
  let totalElements  = 0;
  let currentQuery   = '';
  let currentStatus  = '';

  // ── Helpers ───────────────────────────────────────────────────────────────
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function val(id) {
    return (document.getElementById(id)?.value || '').trim();
  }

  function setVal(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v ?? '';
  }

  function checked(id) {
    return document.getElementById(id)?.checked ?? false;
  }

  function setChecked(id, v) {
    const el = document.getElementById(id);
    if (el) el.checked = !!v;
  }

  function isVencendo(a) {
    if (a.status !== 'Em custódia') return false;
    if (!a.dataDevPrevista) return false;
    return a.dataDevPrevista <= todayISO();
  }

  function statusInfo(a) {
    if (a.status === 'Devolvida')  return { key: 'devolvida',  label: _t('Devolvida'),   cls: 'badge--devolvida'  };
    if (a.status === 'Extraviada') return { key: 'extraviada', label: _t('Extraviada'),  cls: 'badge--extraviada' };
    if (isVencendo(a))             return { key: 'vencendo',   label: _t('Vencendo'),    cls: 'badge--vencendo'   };
    return                                { key: 'custodia',   label: _t('Em custódia'), cls: 'badge--custodia'   };
  }

  function getServicos() {
    return [...document.querySelectorAll('input[name="servicos"]:checked')]
      .map(el => el.value);
  }

  function setServicos(list) {
    document.querySelectorAll('input[name="servicos"]').forEach(cb => {
      cb.checked = Array.isArray(list) && list.includes(cb.value);
      cb.closest('.amos-servico-item')?.classList.toggle('amos-servico-item--checked', cb.checked);
    });
  }

  // ── KPIs ──────────────────────────────────────────────────────────────────
  async function loadKPIs() {
    try {
      const k   = await Api.get(`${API_AMOSTRAS}/kpis`);
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? 0; };
      set('kpiTotal',      k.total);
      set('kpiCustodia',   k.custodia);
      set('kpiVencendo',   k.vencendo);
      set('kpiDevolvidas', k.devolvidas);
    } catch { /* non-fatal */ }
  }

  // ── Ordenação ─────────────────────────────────────────────────────────────
  function sortAmostras(lista) {
    if (!sortCol) return lista;
    return [...lista].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === 'status') {
        const order = { vencendo: 0, custodia: 1, devolvida: 2, extraviada: 3 };
        va = order[statusInfo(a).key] ?? 4;
        vb = order[statusInfo(b).key] ?? 4;
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
    document.querySelectorAll('#tabelaAmostras th[data-sort]').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
      th.querySelector('.sort-icon')?.remove();
    });
    const th = document.querySelector(`#tabelaAmostras th[data-sort="${col}"]`);
    if (!th) return;
    th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    const icon = document.createElement('span');
    icon.className = 'sort-icon';
    icon.textContent = sortDir === 'asc' ? ' ↑' : ' ↓';
    icon.style.cssText = 'font-size:10px;opacity:0.7;margin-left:2px';
    th.appendChild(icon);
  }

  // ── Tabela ────────────────────────────────────────────────────────────────
  function applyFilters() {
    currentQuery  = (document.getElementById('searchInput')?.value  || '').trim();
    currentStatus = (document.getElementById('filterStatus')?.value || '');
    load(0);
  }

  function renderTable() {
    const tbody      = document.getElementById('tbodyAmostras');
    const countLabel = document.getElementById('countLabel');
    if (!tbody) return;

    if (countLabel) countLabel.textContent = `${totalElements || filteredAmostras.length} ${_t('registro(s)')}`;

    if (!filteredAmostras.length) {
      EmptyState.table(tbody, 7, _t('Nenhuma amostra encontrada'), _t('Ajuste os filtros ou cadastre uma nova amostra.'));
      return;
    }

    tbody.innerHTML = filteredAmostras.map(a => {
      const s      = statusInfo(a);
      const rowCls = s.key === 'vencendo' ? 'amos-row--vencendo' :
                     s.key === 'extraviada' ? 'amos-row--extraviada' : '';

      const devPrevHtml = a.dataDevPrevista
        ? (s.key === 'vencendo'
            ? `<span style="color:#d97706;font-weight:600">${fmtDate(a.dataDevPrevista)}</span>`
            : fmtDate(a.dataDevPrevista))
        : '<span style="color:var(--text-muted)">—</span>';

      const anexoIcon = a.termoAnexo
        ? `<span title="${_t('Termo assinado anexado')}" style="color:var(--color-success-text);margin-left:4px">
             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
           </span>`
        : '';

      const servicosBadge = Array.isArray(a.servicos) && a.servicos.length
        ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">${esc(a.servicos.slice(0,2).map(s => _t(s)).join(', '))}${a.servicos.length > 2 ? ` +${a.servicos.length - 2}` : ''}</div>`
        : '';

      const podeDevolver = s.key === 'custodia' || s.key === 'vencendo';

      return `<tr class="${rowCls}" data-id="${a.id}">
        <td>
          <div class="amos-cliente">${esc(a.cliente)}${anexoIcon}</div>
          ${a.descricao ? `<div class="amos-desc">${esc(a.descricao)}</div>` : ''}
          ${servicosBadge}
        </td>
        <td>
          ${a.servicoRef
            ? `<span class="amos-servico-ref">${esc(a.servicoRef)}</span>`
            : '<span style="color:var(--text-muted)">—</span>'}
        </td>
        <td style="text-align:right;font-weight:var(--font-weight-semibold)">${a.quantidade} ${esc(_t(a.unidade))}</td>
        <td>${fmtDate(a.dataEntrada)}</td>
        <td>${devPrevHtml}</td>
        <td><span class="${s.cls}">${s.label}</span></td>
        <td>
          <div class="amos-actions">
            ${podeDevolver ? `
            <button class="btn btn-ghost btn-sm btn-icon" title="${_t('Registrar devolução')}" onclick="Amos.openDevolucao(${a.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
            </button>` : ''}
            <button class="btn btn-ghost btn-sm btn-icon" title="${_t('Gerar Termo de Custódia')}" onclick="Amos.gerarTermo(${a.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon" title="${_t('Anexar termo assinado')}" onclick="Amos.openAnexo(${a.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon" title="${_t('Editar')}" onclick="Amos.openEditar(${a.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon amos-btn--delete" title="${_t('Excluir')}" onclick="Amos.openDelete(${a.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // ── Carregar dados ────────────────────────────────────────────────────────
  async function load(page = currentPage) {
    const tbody = document.getElementById('tbodyAmostras');
    if (tbody) Skeleton.tableRows(tbody, 7, 6);
    try {
      const params = { page, size: 20 };
      if (currentQuery)  params.query  = currentQuery;
      if (currentStatus) params.status = currentStatus;
      const resp      = await Api.get(API_AMOSTRAS, params);
      allAmostras     = resp.content || (Array.isArray(resp) ? resp : []);
      totalPages      = resp.totalPages    || 1;
      currentPage     = resp.number        ?? page;
      totalElements   = resp.totalElements || allAmostras.length;
      filteredAmostras = sortAmostras(allAmostras);
      renderTable();
      renderPagination();
      loadKPIs();
    } catch {
      if (tbody) EmptyState.table(tbody, 7, _t('Erro ao carregar dados'), _t('Verifique a conexão com o servidor.'));
    }
  }

  function renderPagination() {
    let bar = document.getElementById('amostrasPagination');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'amostrasPagination';
      bar.style.cssText = 'display:flex;align-items:center;justify-content:flex-end;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-color);font-size:var(--font-size-sm);color:var(--text-muted)';
      document.querySelector('#tbodyAmostras')?.closest('.card')?.appendChild(bar);
    }
    if (totalPages <= 1) { bar.innerHTML = ''; return; }
    bar.innerHTML = `
      <span>${_t('Página')} ${currentPage + 1} ${_t('de')} ${totalPages}</span>
      <button id="btnAmostraPrev" class="btn btn-ghost btn-sm" ${currentPage === 0 ? 'disabled' : ''}>&#8592; ${_t('Anterior')}</button>
      <button id="btnAmostraNext" class="btn btn-ghost btn-sm" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>&#8594; ${_t('Próxima')}</button>
    `;
    document.getElementById('btnAmostraPrev')?.addEventListener('click', () => load(currentPage - 1));
    document.getElementById('btnAmostraNext')?.addEventListener('click', () => load(currentPage + 1));
  }

  // ── Exportar CSV ──────────────────────────────────────────────────────────
  function exportCSV() {
    if (!filteredAmostras.length) { Toast.warning(_t('Nenhum registro para exportar.')); return; }

    const headers = ['Cliente', 'Descrição', 'OS/Ref.', 'Qtd.', 'Unidade', 'Responsável',
                     'Data Entrada', 'Dev. Prevista', 'Dev. Realizada', 'Status',
                     'Serviços', 'Observação'];
    const lines = [headers.join(';')];

    filteredAmostras.forEach(a => {
      const s = statusInfo(a);
      const row = [
        a.cliente, a.descricao || '', a.servicoRef || '',
        a.quantidade, a.unidade, a.responsavel || '',
        fmtDate(a.dataEntrada), fmtDate(a.dataDevPrevista), fmtDate(a.dataDevRealizada),
        s.label,
        Array.isArray(a.servicos) ? a.servicos.join(' | ') : '',
        a.observacao || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(row.join(';'));
    });

    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `amostras_${todayISO()}.csv`; a.click();
    URL.revokeObjectURL(url);
    Toast.success(`${filteredAmostras.length} ${_t('registros exportados.')}`);
  }

  // ── Stepper ───────────────────────────────────────────────────────────────
  function goToStep(step) {
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, step));

    // Atualiza painéis
    document.querySelectorAll('.amos-step-panel').forEach((p, i) => {
      p.classList.toggle('amos-step-panel--active', i + 1 === currentStep);
    });

    // Atualiza dots do stepper
    document.querySelectorAll('.amos-step').forEach((el, i) => {
      const n = i + 1;
      el.classList.toggle('amos-step--active', n === currentStep);
      el.classList.toggle('amos-step--done',   n < currentStep);
    });

    // Contador
    const counter = document.getElementById('amosStepCounter');
    if (counter) counter.textContent = `Etapa ${currentStep} de ${TOTAL_STEPS}`;

    // Botões
    const btnAnterior = document.getElementById('btnStepAnterior');
    const btnProximo  = document.getElementById('btnStepProximo');
    const btnSalvar   = document.getElementById('btnSalvarAmostra');

    if (btnAnterior) btnAnterior.style.display = currentStep > 1 ? '' : 'none';
    if (btnProximo)  btnProximo.style.display  = currentStep < TOTAL_STEPS ? '' : 'none';
    if (btnSalvar)   btnSalvar.style.display   = currentStep === TOTAL_STEPS ? '' : 'none';

    // Scroll ao topo do body do modal
    document.querySelector('.modal__body--scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateStep(step) {
    if (step === 1) {
      if (!val('amostraDataEntrada')) { Toast.error(_t('Informe a data do recebimento.')); return false; }
      if (!val('amostraResponsavel')) { Toast.error(_t('Informe o responsável pelo recebimento.')); return false; }
      if (!val('amostraCliente'))     { Toast.error(_t('Informe o cliente / empresa.')); return false; }
      if (!val('amostraDesc'))        { Toast.error(_t('Informe a descrição da peça.')); return false; }
      const qtd = parseInt(document.getElementById('amostraQtd')?.value, 10);
      if (isNaN(qtd) || qtd < 1)     { Toast.error(_t('Informe uma quantidade válida.')); return false; }
      if (!val('amostraUnidade'))     { Toast.error(_t('Informe a unidade.')); return false; }
    }
    return true;
  }

  // ── Limpar formulário ─────────────────────────────────────────────────────
  function resetForm() {
    const ids = [
      'amostraDataEntrada','amostraHorario','amostraResponsavel','amostraFormaRecebimento',
      'amostraCliente','amostraRespEnvio','amostraTelEmail','amostraServico',
      'amostraObsRecebimento','amostraCodigoCEM','amostraCodigoCliente','amostraDesc',
      'amostraQtd','amostraUnidade','amostraDataDevPrev','amostraObsTecnicas',
      'amostraObjetivoCliente',
      'cond1','cond2','cond3','cond4','cond5','cond6','cond7','cond8','cond9',
      'amostraObsCondicao','foto1','foto2','foto3','foto4','amostraPathFotos',
      'amostraCodigoAtribuido','amostraFormaIdentificacao','amostraLocalArmazenamento',
      'amostraRespArmazenamento','amostraCondicaoAmbiental','amostraCondicaoRequerida',
      'amostraObsArmazenamento',
      'amostraHouveDivergencia','amostraTipoDivergencia','amostraDescDivergencia',
      'amostraImpactoTecnico','amostraRespTecnico','amostraDecisaoTecnica',
      'amostraAbrirNC','amostraJustificativa',
      'amostraClienteComunicado','amostraFormaComunicacao','amostraDataComunicacao',
      'amostraRespContato','amostraAutorizouRessalva','amostraClassificacao',
      'amostraJustificativaAceite',
      'amostraSeraDevolvida','amostraSeraRetida','amostraFormaDevolucao',
      'amostraRespDevolucao','amostraObsDevolucao',
      'amostraAssRecebimento','amostraAssRecebimentoData',
      'amostraAssTecnico','amostraAssTecnicoData',
      'amostraAssAprovacao','amostraAssAprovacaoData',
      'amostraObs',
    ];
    ids.forEach(id => setVal(id, ''));

    [
      'amostraTemDesenho','amostraTemCAD','amostraTemTolerancia','amostraTemInstrucao',
      'amostraFragil','amostraCortante','amostraEmbalagemEspecial','amostraIdentifPreservada',
    ].forEach(id => setChecked(id, false));

    setServicos([]);
    goToStep(1);
  }

  // ── Ler payload do formulário ─────────────────────────────────────────────
  function readPayload() {
    return {
      // Seção 1
      dataEntrada:          val('amostraDataEntrada'),
      horario:              val('amostraHorario'),
      responsavel:          val('amostraResponsavel'),
      formaRecebimento:     val('amostraFormaRecebimento'),
      cliente:              val('amostraCliente'),
      respEnvio:            val('amostraRespEnvio'),
      telEmail:             val('amostraTelEmail'),
      servicoRef:           val('amostraServico'),
      obsRecebimento:       val('amostraObsRecebimento'),
      // Seção 2
      codigoCEM:            val('amostraCodigoCEM'),
      codigoCliente:        val('amostraCodigoCliente'),
      descricao:            val('amostraDesc'),
      quantidade:           parseInt(document.getElementById('amostraQtd')?.value, 10) || 0,
      unidade:              val('amostraUnidade'),
      dataDevPrevista:      val('amostraDataDevPrev') || null,
      temDesenho:           checked('amostraTemDesenho'),
      temCAD:               checked('amostraTemCAD'),
      temTolerancia:        checked('amostraTemTolerancia'),
      temInstrucao:         checked('amostraTemInstrucao'),
      obsTecnicas:          val('amostraObsTecnicas'),
      // Seção 3
      servicos:             getServicos(),
      objetivoCliente:      val('amostraObjetivoCliente'),
      // Seção 4 - condição
      condicao: {
        pecaConforme:      val('cond1'),
        quantidadeCorreta: val('cond2'),
        embalagemIntegra:  val('cond3'),
        semDanoTransporte: val('cond4'),
        pecaLimpa:         val('cond5'),
        semContaminacao:   val('cond6'),
        identificacao:     val('cond7'),
        documentos:        val('cond8'),
        permiteExecucao:   val('cond9'),
      },
      obsCondicao:          val('amostraObsCondicao'),
      // Seção 5 - fotos
      fotos: {
        embalagem:    val('foto1'),
        pecaAntes:    val('foto2'),
        etiqueta:     val('foto3'),
        danos:        val('foto4'),
      },
      pathFotos:            val('amostraPathFotos'),
      // Seção 6
      codigoAtribuido:      val('amostraCodigoAtribuido'),
      formaIdentificacao:   val('amostraFormaIdentificacao'),
      localArmazenamento:   val('amostraLocalArmazenamento'),
      respArmazenamento:    val('amostraRespArmazenamento'),
      condicaoAmbiental:    val('amostraCondicaoAmbiental'),
      condicaoRequerida:    val('amostraCondicaoRequerida'),
      fragil:               checked('amostraFragil'),
      cortante:             checked('amostraCortante'),
      embalagemEspecial:    checked('amostraEmbalagemEspecial'),
      identifPreservada:    checked('amostraIdentifPreservada'),
      obsArmazenamento:     val('amostraObsArmazenamento'),
      // Seção 7
      houveDivergencia:     val('amostraHouveDivergencia'),
      tipoDivergencia:      val('amostraTipoDivergencia'),
      descDivergencia:      val('amostraDescDivergencia'),
      impactoTecnico:       val('amostraImpactoTecnico'),
      respTecnico:          val('amostraRespTecnico'),
      decisaoTecnica:       val('amostraDecisaoTecnica'),
      abrirNC:              val('amostraAbrirNC'),
      justificativa:        val('amostraJustificativa'),
      // Seção 8
      clienteComunicado:    val('amostraClienteComunicado'),
      formaComunicacao:     val('amostraFormaComunicacao'),
      dataComunicacao:      val('amostraDataComunicacao') || null,
      respContato:          val('amostraRespContato'),
      autorizouRessalva:    val('amostraAutorizouRessalva'),
      classificacao:        val('amostraClassificacao'),
      justificativaAceite:  val('amostraJustificativaAceite'),
      // Seção 9
      seraDevolvida:        val('amostraSeraDevolvida'),
      seraRetida:           val('amostraSeraRetida'),
      formaDevolucao:       val('amostraFormaDevolucao'),
      respDevolucao:        val('amostraRespDevolucao'),
      obsDevolucao:         val('amostraObsDevolucao'),
      // Seção 10
      assRecebimento:       val('amostraAssRecebimento'),
      assRecebimentoData:   val('amostraAssRecebimentoData') || null,
      assTecnico:           val('amostraAssTecnico'),
      assTecnicoData:       val('amostraAssTecnicoData') || null,
      assAprovacao:         val('amostraAssAprovacao'),
      assAprovacaoData:     val('amostraAssAprovacaoData') || null,
      observacao:           val('amostraObs'),
    };
  }

  // ── Preencher formulário (edição) ─────────────────────────────────────────
  function fillForm(a) {
    setVal('amostraDataEntrada',        a.dataEntrada);
    setVal('amostraHorario',            a.horario);
    setVal('amostraResponsavel',        a.responsavel);
    setVal('amostraFormaRecebimento',   a.formaRecebimento);
    setVal('amostraCliente',            a.cliente);
    setVal('amostraRespEnvio',          a.respEnvio);
    setVal('amostraTelEmail',           a.telEmail);
    setVal('amostraServico',            a.servicoRef);
    setVal('amostraObsRecebimento',     a.obsRecebimento);
    setVal('amostraCodigoCEM',          a.codigoCEM);
    setVal('amostraCodigoCliente',      a.codigoCliente);
    setVal('amostraDesc',               a.descricao);
    setVal('amostraQtd',                a.quantidade);
    setVal('amostraUnidade',            a.unidade);
    setVal('amostraDataDevPrev',        a.dataDevPrevista);
    setChecked('amostraTemDesenho',     a.temDesenho);
    setChecked('amostraTemCAD',         a.temCAD);
    setChecked('amostraTemTolerancia',  a.temTolerancia);
    setChecked('amostraTemInstrucao',   a.temInstrucao);
    setVal('amostraObsTecnicas',        a.obsTecnicas);
    setServicos(a.servicos);
    setVal('amostraObjetivoCliente',    a.objetivoCliente);
    // Condição
    const c = a.condicao || {};
    setVal('cond1', c.pecaConforme);      setVal('cond2', c.quantidadeCorreta);
    setVal('cond3', c.embalagemIntegra);  setVal('cond4', c.semDanoTransporte);
    setVal('cond5', c.pecaLimpa);         setVal('cond6', c.semContaminacao);
    setVal('cond7', c.identificacao);     setVal('cond8', c.documentos);
    setVal('cond9', c.permiteExecucao);
    setVal('amostraObsCondicao',         a.obsCondicao);
    // Fotos
    const f = a.fotos || {};
    setVal('foto1', f.embalagem); setVal('foto2', f.pecaAntes);
    setVal('foto3', f.etiqueta);  setVal('foto4', f.danos);
    setVal('amostraPathFotos',           a.pathFotos);
    // Armazenamento
    setVal('amostraCodigoAtribuido',     a.codigoAtribuido);
    setVal('amostraFormaIdentificacao',  a.formaIdentificacao);
    setVal('amostraLocalArmazenamento',  a.localArmazenamento);
    setVal('amostraRespArmazenamento',   a.respArmazenamento);
    setVal('amostraCondicaoAmbiental',   a.condicaoAmbiental);
    setVal('amostraCondicaoRequerida',   a.condicaoRequerida);
    setChecked('amostraFragil',          a.fragil);
    setChecked('amostraCortante',        a.cortante);
    setChecked('amostraEmbalagemEspecial', a.embalagemEspecial);
    setChecked('amostraIdentifPreservada', a.identifPreservada);
    setVal('amostraObsArmazenamento',    a.obsArmazenamento);
    // Divergências
    setVal('amostraHouveDivergencia',   a.houveDivergencia);
    setVal('amostraTipoDivergencia',    a.tipoDivergencia);
    setVal('amostraDescDivergencia',    a.descDivergencia);
    setVal('amostraImpactoTecnico',     a.impactoTecnico);
    setVal('amostraRespTecnico',        a.respTecnico);
    setVal('amostraDecisaoTecnica',     a.decisaoTecnica);
    setVal('amostraAbrirNC',            a.abrirNC);
    setVal('amostraJustificativa',      a.justificativa);
    // Comunicação
    setVal('amostraClienteComunicado',  a.clienteComunicado);
    setVal('amostraFormaComunicacao',   a.formaComunicacao);
    setVal('amostraDataComunicacao',    a.dataComunicacao);
    setVal('amostraRespContato',        a.respContato);
    setVal('amostraAutorizouRessalva',  a.autorizouRessalva);
    setVal('amostraClassificacao',      a.classificacao);
    setVal('amostraJustificativaAceite', a.justificativaAceite);
    // Devolução
    setVal('amostraSeraDevolvida',      a.seraDevolvida);
    setVal('amostraSeraRetida',         a.seraRetida);
    setVal('amostraFormaDevolucao',     a.formaDevolucao);
    setVal('amostraRespDevolucao',      a.respDevolucao);
    setVal('amostraObsDevolucao',       a.obsDevolucao);
    // Assinaturas
    setVal('amostraAssRecebimento',     a.assRecebimento);
    setVal('amostraAssRecebimentoData', a.assRecebimentoData);
    setVal('amostraAssTecnico',         a.assTecnico);
    setVal('amostraAssTecnicoData',     a.assTecnicoData);
    setVal('amostraAssAprovacao',       a.assAprovacao);
    setVal('amostraAssAprovacaoData',   a.assAprovacaoData);
    setVal('amostraObs',                a.observacao);
  }

  // ── Abrir modal nova amostra ──────────────────────────────────────────────
  function openNovaAmostra() {
    editingId = null;
    document.getElementById('modalAmostraTitle').textContent = _t('Novo Recebimento de Peças');
    resetForm();
    setVal('amostraDataEntrada', todayISO());
    Modal.open('modalAmostra');
  }

  // ── Abrir modal editar ────────────────────────────────────────────────────
  async function openEditar(id) {
    try {
      const a = await Api.get(`${API_AMOSTRAS}/${id}`);
      editingId = id;
      document.getElementById('modalAmostraTitle').textContent = _t('Editar Recebimento');
      resetForm();
      fillForm(a);
      Modal.open('modalAmostra');
    } catch (err) {
      Toast.error(err.message || _t('Erro ao carregar amostra.'));
    }
  }

  // ── Salvar ────────────────────────────────────────────────────────────────
  async function salvarAmostra() {
    const payload = readPayload();

    if (!payload.dataEntrada || !payload.responsavel || !payload.cliente ||
        !payload.descricao || payload.quantidade < 1 || !payload.unidade) {
      Toast.error(_t('Preencha os campos obrigatórios (etapa 1).'));
      goToStep(1);
      return;
    }

    const btn = document.getElementById('btnSalvarAmostra');
    if (btn) { btn.disabled = true; btn.textContent = _t('Salvando...'); }
    try {
      if (editingId === null) {
        payload.status = 'Em custódia';
        await Api.post(API_AMOSTRAS, payload);
        Toast.success(_t('Recebimento registrado com sucesso!'));
        load(0);
      } else {
        await Api.put(`${API_AMOSTRAS}/${editingId}`, payload);
        Toast.success(_t('Registro atualizado.'));
        load(currentPage);
      }
      Modal.close('modalAmostra');
    } catch (err) {
      Toast.error(err.message || _t('Erro ao salvar amostra.'));
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = _t('Salvar'); }
    }
  }

  // ── Modal Devolução ───────────────────────────────────────────────────────
  function openDevolucao(id) {
    const a = allAmostras.find(x => x.id === id);
    if (!a) return;
    devItemId = id;
    document.getElementById('devInfoBox').textContent =
      `${a.cliente} — ${a.descricao} (${a.quantidade} ${_t(a.unidade)})`;
    setVal('devData',        todayISO());
    setVal('devResponsavel', '');
    setVal('devObs',         '');
    Modal.open('modalDevolucao');
  }

  async function confirmarDevolucao() {
    const data        = val('devData');
    const responsavel = val('devResponsavel');
    const obs         = val('devObs');

    if (!data)        { Toast.error(_t('Informe a data de devolução.')); return; }
    if (!responsavel) { Toast.error(_t('Informe o responsável.')); return; }

    try {
      const a = allAmostras.find(x => x.id === devItemId);
      if (!a) return;
      const updated = { ...a, status: 'Devolvida', dataDevRealizada: data };
      if (obs) updated.observacao = (a.observacao ? a.observacao + ' | ' : '') + `Dev. por ${responsavel}: ${obs}`;
      await Api.put(`${API_AMOSTRAS}/${devItemId}`, updated);
      Toast.success(_t('Devolução registrada com sucesso!'));
      Modal.close('modalDevolucao');
      devItemId = null;
      load(currentPage);
    } catch (err) {
      Toast.error(err.message || _t('Erro ao registrar devolução.'));
    }
  }

  // ── Gerar Termo de Custódia ───────────────────────────────────────────────
  function gerarTermo(id) {
    const a = allAmostras.find(x => x.id === id);
    if (!a) return;

    const s        = statusInfo(a);
    const numTermo = `TC-${String(a.id).padStart(5, '0')}`;
    const hoje     = fmtDate(todayISO());
    const servicos = Array.isArray(a.servicos) && a.servicos.length
      ? a.servicos.join(', ')
      : '—';

    document.getElementById('termoPrint').innerHTML = `
      <div class="termo-logo">
        <div>
          <strong>SENAI · Centro de Metrologia</strong><br/>
          <small>Zeiss Metrologia — Laboratório de Medição 3D</small>
        </div>
        <div style="text-align:right">
          <small>Emitido em: ${hoje}</small><br/>
          <small>N° ${numTermo}</small>
        </div>
      </div>
      <hr style="border:1px solid #ccc;margin:12px 0"/>
      <h2>TERMO DE CUSTÓDIA DE AMOSTRAS</h2>
      <p class="termo-subtitulo">Formulário de Recebimento de Peças — CEM Rev 00</p>

      <table>
        <tr><th colspan="2" style="background:#e8eaf6;color:#1a237e">1. IDENTIFICAÇÃO DO RECEBIMENTO</th></tr>
        <tr><td style="width:40%"><strong>Cliente / Empresa</strong></td><td>${esc(a.cliente)}</td></tr>
        <tr><td><strong>Responsável pelo Envio</strong></td><td>${esc(a.respEnvio) || '—'}</td></tr>
        <tr><td><strong>Telefone / E-mail</strong></td><td>${esc(a.telEmail) || '—'}</td></tr>
        <tr><td><strong>Recebido por</strong></td><td>${esc(a.responsavel)}</td></tr>
        <tr><td><strong>Data / Horário</strong></td><td>${fmtDate(a.dataEntrada)}${a.horario ? ' às ' + a.horario : ''}</td></tr>
        <tr><td><strong>Forma de Recebimento</strong></td><td>${esc(a.formaRecebimento) || '—'}</td></tr>
        <tr><td><strong>OS / Referência</strong></td><td>${esc(a.servicoRef) || '—'}</td></tr>
      </table>

      <table>
        <tr><th colspan="2" style="background:#e8eaf6;color:#1a237e">2. IDENTIFICAÇÃO DA PEÇA</th></tr>
        <tr><td style="width:40%"><strong>Descrição</strong></td><td>${esc(a.descricao)}</td></tr>
        <tr><td><strong>Código Interno CEM</strong></td><td>${esc(a.codigoCEM) || '—'}</td></tr>
        <tr><td><strong>Código do Cliente / TAG</strong></td><td>${esc(a.codigoCliente) || '—'}</td></tr>
        <tr><td><strong>Quantidade</strong></td><td>${a.quantidade} ${esc(a.unidade)}</td></tr>
        <tr><td><strong>Documentação</strong></td><td>${[
          a.temDesenho    ? 'Desenho técnico' : '',
          a.temCAD        ? 'CAD/3D' : '',
          a.temTolerancia ? 'Especificação de tolerância' : '',
          a.temInstrucao  ? 'Instrução de manuseio' : '',
        ].filter(Boolean).join(', ') || _t('Nenhuma')}</td></tr>
      </table>

      <table>
        <tr><th colspan="2" style="background:#e8eaf6;color:#1a237e">3. SERVIÇOS SOLICITADOS</th></tr>
        <tr><td colspan="2">${esc(servicos)}</td></tr>
        ${a.objetivoCliente ? `<tr><td><strong>Objetivo do cliente</strong></td><td>${esc(a.objetivoCliente)}</td></tr>` : ''}
      </table>

      <table>
        <tr><th colspan="2" style="background:#e8f5e9;color:#1b5e20">MOVIMENTAÇÃO E STATUS</th></tr>
        <tr><td style="width:40%"><strong>Data de Entrada</strong></td><td>${fmtDate(a.dataEntrada)}</td></tr>
        <tr><td><strong>Devolução Prevista</strong></td><td>${fmtDate(a.dataDevPrevista)}</td></tr>
        <tr><td><strong>Devolução Realizada</strong></td><td>${fmtDate(a.dataDevRealizada)}</td></tr>
        <tr><td><strong>Local de Armazenamento</strong></td><td>${esc(a.localArmazenamento) || '—'}</td></tr>
        <tr><td><strong>Status</strong></td><td><strong>${s.label}</strong></td></tr>
        ${a.classificacao ? `<tr><td><strong>Classificação do Recebimento</strong></td><td>${esc(a.classificacao)}</td></tr>` : ''}
      </table>

      ${a.observacao ? `<p><strong>Observações:</strong></p><div class="termo-obs">${esc(a.observacao)}</div>` : ''}

      <div class="termo-assinatura">
        <div>
          <div class="termo-assinatura-linha">
            Responsável pelo Recebimento<br/>
            <small>${esc(a.assRecebimento || a.responsavel)} — SENAI CEM</small>
          </div>
        </div>
        <div>
          <div class="termo-assinatura-linha">
            Responsável Técnico<br/>
            <small>${esc(a.assTecnico || '—')}</small>
          </div>
        </div>
        <div>
          <div class="termo-assinatura-linha">
            Aprovação / Coordenação<br/>
            <small>${esc(a.assAprovacao || '—')}</small>
          </div>
        </div>
      </div>

      <p style="margin-top:32px;font-size:10px;color:#777;text-align:center">
        Documento gerado pelo sistema ZEISS·PILOT — ${hoje} — ${numTermo}
      </p>
    `;

    window.print();
    Toast.success(_t('Termo de custódia enviado para impressão.'));
  }

  // ── Modal Anexo ───────────────────────────────────────────────────────────
  function openAnexo(id) {
    const a = allAmostras.find(x => x.id === id);
    if (!a) return;
    anexoItemId = id;
    document.getElementById('anexoInfoBox').textContent = `${a.cliente} — ${a.descricao}`;
    setVal('anexoArquivo', '');
    setVal('anexoObs',     '');
    Modal.open('modalAnexo');
  }

  function confirmarAnexo() {
    const file = document.getElementById('anexoArquivo').files[0];
    const obs  = val('anexoObs');
    if (!file) { Toast.error(_t('Selecione um arquivo para anexar.')); return; }

    const idx = allAmostras.findIndex(x => x.id === anexoItemId);
    if (idx >= 0) {
      allAmostras[idx].termoAnexo = { nome: file.name, tamanho: file.size, obs, dataAnexo: todayISO() };
    }

    Toast.success(`"${file.name}" ${_t('Documento anexado!')}`);
    Modal.close('modalAnexo');
    anexoItemId = null;
    applyFilters();
  }

  // ── Modal Delete ──────────────────────────────────────────────────────────
  function openDelete(id) {
    const a = allAmostras.find(x => x.id === id);
    if (!a) return;
    deleteItemId = id;
    document.getElementById('deleteAmostraDesc').textContent = `${a.cliente} — ${a.descricao}`;
    Modal.open('modalDelete');
  }

  async function confirmarDelete() {
    try {
      await Api.del(`${API_AMOSTRAS}/${deleteItemId}`);
      Toast.success(_t('Registro excluído.'));
      Modal.close('modalDelete');
      deleteItemId = null;
      load(currentPage);
    } catch (err) {
      Toast.error(err.message || _t('Erro ao excluir amostra.'));
    }
  }

  // ── Bind eventos ──────────────────────────────────────────────────────────
  function bindEvents() {
    // Filtros
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('filterStatus')?.addEventListener('change', applyFilters);
    document.getElementById('btnLimparFiltros')?.addEventListener('click', () => {
      setVal('searchInput',  '');
      setVal('filterStatus', '');
      sortCol = null; sortDir = 'asc';
      document.querySelectorAll('#tabelaAmostras th[data-sort]').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        th.querySelector('.sort-icon')?.remove();
      });
      applyFilters();
    });
    document.getElementById('searchInput')?.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.target.value = ''; applyFilters(); }
    });

    document.getElementById('btnExportCSV')?.addEventListener('click', exportCSV);

    // Modal nova amostra
    document.getElementById('btnNovaAmostra')?.addEventListener('click', openNovaAmostra);
    document.getElementById('btnFecharModalAmostra')?.addEventListener('click', () => Modal.close('modalAmostra'));
    document.getElementById('btnCancelarAmostra')?.addEventListener('click', () => Modal.close('modalAmostra'));

    // Stepper
    document.getElementById('btnStepProximo')?.addEventListener('click', () => {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    });
    document.getElementById('btnStepAnterior')?.addEventListener('click', () => {
      goToStep(currentStep - 1);
    });
    document.getElementById('btnSalvarAmostra')?.addEventListener('click', salvarAmostra);

    // Clique nos dots do stepper
    document.querySelectorAll('.amos-step').forEach(el => {
      el.addEventListener('click', () => {
        const target = parseInt(el.getAttribute('data-step'), 10);
        if (target < currentStep) goToStep(target);
      });
    });

    // Checkbox de serviços — highlight visual
    document.querySelectorAll('input[name="servicos"]').forEach(cb => {
      cb.addEventListener('change', () => {
        cb.closest('.amos-servico-item')?.classList.toggle('amos-servico-item--checked', cb.checked);
      });
    });

    // Modal Devolução
    document.getElementById('btnFecharModalDev')?.addEventListener('click', () => Modal.close('modalDevolucao'));
    document.getElementById('btnCancelarDev')?.addEventListener('click',    () => Modal.close('modalDevolucao'));
    document.getElementById('btnConfirmarDev')?.addEventListener('click',   confirmarDevolucao);

    // Modal Anexo
    document.getElementById('btnFecharModalAnexo')?.addEventListener('click', () => Modal.close('modalAnexo'));
    document.getElementById('btnCancelarAnexo')?.addEventListener('click',    () => Modal.close('modalAnexo'));
    document.getElementById('btnConfirmarAnexo')?.addEventListener('click',   confirmarAnexo);

    // Modal Delete
    document.getElementById('btnFecharModalDelete')?.addEventListener('click', () => Modal.close('modalDelete'));
    document.getElementById('btnCancelarDelete')?.addEventListener('click',    () => Modal.close('modalDelete'));
    document.getElementById('btnConfirmarDelete')?.addEventListener('click',   confirmarDelete);

    // Ordenação de colunas
    document.querySelectorAll('#tabelaAmostras th[data-sort]').forEach(th => {
      th.style.cursor = 'pointer';
      th.title = 'Clique para ordenar';
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (sortCol === col) { sortDir = sortDir === 'asc' ? 'desc' : 'asc'; }
        else { sortCol = col; sortDir = 'asc'; }
        setSortHeader(col);
        filteredAmostras = sortAmostras(filteredAmostras);
        renderTable();
      });
    });
  }

  // ── Exposição pública ─────────────────────────────────────────────────────
  window.Amos = { openEditar, openDevolucao, gerarTermo, openAnexo, openDelete };

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    load();
  });
  document.addEventListener('zeiss:langchange', () => applyFilters());

})();

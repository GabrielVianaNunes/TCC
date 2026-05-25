/**
 * verificacao-ambiental.js — Módulo de Verificação Ambiental CEM
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  const API_URL = '/api/verificacoes-ambientais';
  const LS_KEY  = 'zp-verif-historico';

  function _t(k) { return window.I18n?.t(k) ?? k; }

  // Lista de responsáveis configuráveis
  const RESPONSAVEIS = [
    'Julio',
    'Weslley',
    'Thiago',
    'João Vitor Mamede',
    'Gabriel',
    'João Vitor Araujo',
  ];

  let historico = [];

  function saveHistoricoLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(historico)); } catch { /* quota */ }
  }

  function loadHistoricoLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      historico = raw ? JSON.parse(raw) : [];
    } catch { historico = []; }
  }

  function mergeDedup(local, remote) {
    const seen = new Set(remote.map(v => `${v.dataHora}|${v.responsavel}`));
    const extra = local.filter(v => !seen.has(`${v.dataHora}|${v.responsavel}`));
    return [...extra, ...remote];
  }

  /* ── Inicialização ───────────────────────────────────────────── */
  function init() {
    buildResponsaveisOptions();
    bindEvents();
    Nav.highlightCurrent?.();
    loadKPIs();
    loadChartHistorico();
    loadHistorico();
  }

  /* ── Monta opções de responsável ────────────────────────────── */
  function buildResponsaveisOptions() {
    const container = document.getElementById('q1Options');
    if (!container) return;

    RESPONSAVEIS.forEach(nome => {
      const lbl = document.createElement('label');
      lbl.className = 'verif-option';
      lbl.innerHTML = `<input type="radio" name="responsavel" value="${escapeHtml(nome)}" /> ${escapeHtml(nome)}`;
      container.appendChild(lbl);
    });

    // Opção "Outra"
    const lblOutra = document.createElement('label');
    lblOutra.className = 'verif-option';
    const _t = k => window.I18n?.t(k) ?? k;
    lblOutra.innerHTML = `<input type="radio" name="responsavel" value="__outro__" /> ${_t('Outra')}`;
    container.appendChild(lblOutra);

    container.addEventListener('change', e => {
      const wrap = document.getElementById('q1OtherWrap');
      if (e.target.name === 'responsavel') {
        wrap.style.display = e.target.value === '__outro__' ? 'block' : 'none';
        if (e.target.value !== '__outro__') {
          document.getElementById('q1OtherInput').value = '';
        }
      }
    });
  }

  /* ── Bind de eventos ─────────────────────────────────────────── */
  function bindEvents() {
    const form = document.getElementById('formVerificacao');
    if (form) form.addEventListener('submit', handleFormSubmit);

    document.getElementById('btnNovaVerificacao')?.addEventListener('click', () => {
      document.getElementById('formWrap').style.display = '';
      document.getElementById('cardHistorico').style.display = 'none';
      form?.reset();
      clearValidation();
      const q1Opts = document.getElementById('q1Options');
      q1Opts.innerHTML = '';
      buildResponsaveisOptions();
      document.getElementById('formWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('btnHistorico')?.addEventListener('click', () => {
      document.getElementById('cardHistorico').style.display = '';
      document.getElementById('formWrap').style.display = 'none';
      loadHistorico();
    });

    document.getElementById('btnFecharHistorico')?.addEventListener('click', () => {
      document.getElementById('cardHistorico').style.display = 'none';
      document.getElementById('formWrap').style.display = 'none';
    });

    document.getElementById('btnFecharModalConf')?.addEventListener('click', closeModal);
    document.getElementById('btnCancelarEnvio')?.addEventListener('click', closeModal);
    document.getElementById('btnConfirmarEnvio')?.addEventListener('click', submitVerificacao);
  }

  /* ── Validação e abertura do modal ──────────────────────────── */
  function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    openConfirmModal();
  }

  function validateForm() {
    clearValidation();
    let valid = true;

    // Q1 – responsável
    const resp = getRadioValue('responsavel');
    const outroInput = document.getElementById('q1OtherInput').value.trim();
    if (!resp || (resp === '__outro__' && !outroInput)) {
      markInvalid('q1');
      valid = false;
    }

    // Q2 – período
    if (!getRadioValue('periodo')) { markInvalid('q2'); valid = false; }

    // Q3 – temperatura
    const temp = document.getElementById('temperatura').value;
    if (!temp || !getRadioValue('tempConforme')) { markInvalid('q3'); valid = false; }

    // Q4 – umidade
    const umid = document.getElementById('umidade').value;
    if (!umid || !getRadioValue('umidConforme')) { markInvalid('q4'); valid = false; }

    // Q5 – ar-condicionado
    if (!getRadioValue('arCondicionado')) { markInvalid('q5'); valid = false; }

    // Q6 – não conformidade (obrigatória mesmo se vazia, mas validamos se está errada)
    if (!document.getElementById('naoConformidade').value.trim()) {
      document.getElementById('naoConformidade').value = _t('Nenhuma não conformidade observada.');
    }

    // Q7 – máquinas
    if (!getRadioValue('maquinasDesligadas')) { markInvalid('q7'); valid = false; }

    // Q8 – prisma
    if (!getRadioValue('prismoUso')) { markInvalid('q8'); valid = false; }

    if (!valid) {
      const firstInvalid = document.querySelector('.verif-question--invalid');
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  function markInvalid(qId) {
    document.getElementById(qId)?.classList.add('verif-question--invalid');
  }

  function clearValidation() {
    document.querySelectorAll('.verif-question--invalid')
      .forEach(el => el.classList.remove('verif-question--invalid'));
  }

  /* ── Modal de confirmação ───────────────────────────────────── */
  function openConfirmModal() {
    const resp    = getResponsavel();
    const periodo = getRadioLabel('periodo');
    const temp    = document.getElementById('temperatura').value;
    const umid    = document.getElementById('umidade').value;
    const tempOk  = getRadioValue('tempConforme') === 'sim';
    const umidOk  = getRadioValue('umidConforme') === 'sim';

    const resumo = document.getElementById('resumoVerif');
    resumo.innerHTML = `
      <div class="verif-resumo__row"><span class="verif-resumo__label">Responsável:</span><span class="verif-resumo__value">${escapeHtml(resp)}</span></div>
      <div class="verif-resumo__row"><span class="verif-resumo__label">Período:</span><span class="verif-resumo__value">${escapeHtml(periodo)}</span></div>
      <div class="verif-resumo__row"><span class="verif-resumo__label">Temperatura:</span><span class="verif-resumo__value">${escapeHtml(temp)} °C — ${tempOk ? '✅ ' + _t('Conforme') : '⚠️ ' + _t('Fora do padrão')}</span></div>
      <div class="verif-resumo__row"><span class="verif-resumo__label">Umidade:</span><span class="verif-resumo__value">${escapeHtml(umid)} % — ${umidOk ? '✅ ' + _t('Conforme') : '⚠️ ' + _t('Fora do padrão')}</span></div>
    `;

    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('modalConfirmacao').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    document.getElementById('modalConfirmacao').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Envio ──────────────────────────────────────────────────── */
  async function submitVerificacao() {
    document.getElementById('btnConfirmarEnvio').disabled = true;
    document.getElementById('btnConfirmarEnvio').textContent = _t('Enviando…');

    const payload = buildPayload();

    try {
      await Api.post(API_URL, payload);
      closeModal();
      Toast.success(_t('Verificação ambiental registrada com sucesso!'));
      document.getElementById('formVerificacao').reset();
      clearValidation();
      const q1Opts = document.getElementById('q1Options');
      q1Opts.innerHTML = '';
      buildResponsaveisOptions();
      document.getElementById('formWrap').style.display = 'none';
      document.getElementById('cardHistorico').style.display = '';
      loadHistorico();
      loadKPIs();
      loadChartHistorico();
    } catch (err) {
      closeModal();
      Toast.error(err?.message || _t('Erro ao registrar verificação. Tente novamente.'));
    }

    document.getElementById('btnConfirmarEnvio').disabled = false;
    document.getElementById('btnConfirmarEnvio').textContent = _t('Confirmar e Enviar');
  }

  function buildPayload() {
    return {
      responsavel:        getResponsavel(),
      periodo:            getRadioValue('periodo'),
      temperatura:        parseFloat(document.getElementById('temperatura').value),
      tempConforme:       getRadioValue('tempConforme') === 'sim',
      umidade:            parseFloat(document.getElementById('umidade').value),
      umidConforme:       getRadioValue('umidConforme') === 'sim',
      arCondicionado:     getRadioValue('arCondicionado'),
      naoConformidade:    document.getElementById('naoConformidade').value.trim(),
      maquinasDesligadas: getRadioValue('maquinasDesligadas'),
      prismoUso:          getRadioValue('prismoUso') === 'sim',
      dataHora:           new Date().toISOString(),
    };
  }

  /* ── Histórico ──────────────────────────────────────────────── */
  async function loadHistorico() {
    const tbody = document.getElementById('tbodyVerificacoes');
    tbody.innerHTML = `<tr><td colspan="8" class="table__empty">${_t('Carregando...')}</td></tr>`;

    let items = [];
    try {
      const data = await Api.get(API_URL);
      items = Array.isArray(data) ? data : (data.content || []);
    } catch {
      items = [];
    }

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="table__empty">${_t('Nenhum registro encontrado.')}</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(v => {
      const conforme = v.tempConforme && v.umidConforme;
      const dt = v.dataHora ? new Date(v.dataHora).toLocaleString(window.I18n?.lang() || 'pt-BR') : '—';
      return `<tr>
        <td>${escapeHtml(dt)}</td>
        <td>${escapeHtml(v.responsavel || '—')}</td>
        <td>${escapeHtml(periodoLabel(v.periodo))}</td>
        <td>${v.temperatura != null ? v.temperatura + ' °C' : '—'}</td>
        <td>${v.umidade != null ? v.umidade + ' %' : '—'}</td>
        <td>${v.tempConforme && v.umidConforme
          ? `<span class="badge--conforme">${_t('Conforme')}</span>`
          : `<span class="badge--nao-conforme">${_t('Não conforme')}</span>`}</td>
        <td>${v.maquinasDesligadas === 'todos'
          ? `<span class="badge--conforme">${_t('Desligadas')}</span>`
          : v.maquinasDesligadas === 'algum'
            ? `<span class="badge--nao-conforme">${_t('Alguma ligada')}</span>`
            : '<span style="color:var(--text-muted)">N/A</span>'}</td>
        <td>—</td>
      </tr>`;
    }).join('');
  }

  /* ── Helpers ────────────────────────────────────────────────── */
  function getRadioValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
  }

  function getRadioLabel(name) {
    const v = getRadioValue(name);
    const map = { manha: _t('Manhã'), tarde: _t('Tarde'), dia: _t('Dia todo') };
    return map[v] || v;
  }

  function getResponsavel() {
    const val = getRadioValue('responsavel');
    if (val === '__outro__') return document.getElementById('q1OtherInput').value.trim();
    return val;
  }

  function periodoLabel(v) {
    const map = { manha: _t('Manhã'), tarde: _t('Tarde'), dia: _t('Dia todo') };
    return map[v] || v || '—';
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── KPIs ───────────────────────────────────────────────────── */
  async function loadKPIs() {
    const grid = document.getElementById('verifKpiGrid');
    if (!grid) return;

    // Show skeleton loading state
    grid.querySelectorAll('.kpi-card__value').forEach(el => {
      el.innerHTML = '<span class="skeleton skeleton-text" style="width:50%;height:1em;display:inline-block"></span>';
    });

    let items = [];
    try {
      const data = await Api.get(API_URL);
      items = Array.isArray(data) ? data : (data.content || []);
    } catch { items = []; }

    // Filter to last 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recent = items.filter(v => v.dataHora && new Date(v.dataHora) >= cutoff);

    const total       = recent.length;
    const conformes   = recent.filter(v => v.tempConforme && v.umidConforme).length;
    const naoConformes = total - conformes;

    // Most recent reading (from all records)
    const ultima = items.slice().sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
    const ultimaTemp = ultima ? `${ultima.temperatura} °C` : '—';

    document.getElementById('kvTotal').textContent       = total;
    document.getElementById('kvConformes').textContent   = conformes;
    document.getElementById('kvNaoConformes').textContent = naoConformes;
    document.getElementById('kvUltimaTemp').textContent  = ultimaTemp;
  }

  /* ── Gráfico de histórico ───────────────────────────────────── */
  async function loadChartHistorico() {
    const wrap = document.getElementById('chartVerifHistorico');
    if (!wrap) return;

    if (typeof d3 === 'undefined') {
      wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:220px;color:var(--text-muted);font-size:var(--font-size-sm)">Gráfico indisponível — biblioteca D3 não carregada.</div>';
      return;
    }

    let items = [];
    try {
      const data = await Api.get(API_URL);
      items = Array.isArray(data) ? data : (data.content || []);
    } catch { items = []; }

    if (!items.length) {
      wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:220px;color:var(--text-muted);font-size:var(--font-size-sm)">Sem dados para exibir.</div>';
      return;
    }

    // Sort ascending, take last 14
    const sorted = items
      .filter(v => v.dataHora && v.temperatura != null && v.umidade != null)
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
      .slice(-14);

    if (sorted.length < 2) {
      wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:220px;color:var(--text-muted);font-size:var(--font-size-sm)">Registros insuficientes para gráfico (mínimo 2).</div>';
      return;
    }

    // Use rAF to ensure the container has been laid out and clientWidth is non-zero
    requestAnimationFrame(() => {
    const W = wrap.clientWidth || 700;
    const H = 210;
    const margin = { top: 18, right: 50, bottom: 48, left: 46 };
    const iW = W - margin.left - margin.right;
    const iH = H - margin.top - margin.bottom;

    d3.select(wrap).selectAll('*').remove();

    const svg = d3.select(wrap).append('svg')
      .attr('width', W).attr('height', H)
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scalePoint()
      .domain(sorted.map((_, i) => i))
      .range([0, iW]).padding(0.1);

    const tempExt = d3.extent(sorted, d => d.temperatura);
    const umidExt = d3.extent(sorted, d => d.umidade);
    const yTemp = d3.scaleLinear().domain([Math.min(15, tempExt[0] - 1), Math.max(28, tempExt[1] + 1)]).range([iH, 0]);
    const yUmid = d3.scaleLinear().domain([Math.min(40, umidExt[0] - 2), Math.max(80, umidExt[1] + 2)]).range([iH, 0]);

    // Tolerance bands
    svg.append('rect').attr('x', 0).attr('y', yTemp(22)).attr('width', iW)
      .attr('height', yTemp(18) - yTemp(22))
      .attr('fill', 'rgba(0,51,160,0.06)');
    svg.append('rect').attr('x', 0).attr('y', yUmid(65)).attr('width', iW)
      .attr('height', yUmid(45) - yUmid(65))
      .attr('fill', 'rgba(0,163,224,0.06)');

    // Grid
    svg.append('g').attr('class', 'chart-grid')
      .call(d3.axisLeft(yTemp).ticks(5).tickSize(-iW).tickFormat(''))
      .call(g => { g.select('.domain').remove(); g.selectAll('line').attr('stroke', 'var(--border-color)').attr('stroke-dasharray', '3,3'); });

    // Axes
    svg.append('g').attr('transform', `translate(0,${iH})`).call(
      d3.axisBottom(xScale).tickFormat(i => {
        const d = sorted[i]; if (!d) return '';
        return new Date(d.dataHora).toLocaleDateString(window.I18n?.lang() || 'pt-BR', { day: '2-digit', month: '2-digit' });
      })
    ).call(g => { g.select('.domain').attr('stroke', 'var(--border-color)'); g.selectAll('text').style('font-size', '10px').attr('dy', '1.2em'); });

    svg.append('g').call(d3.axisLeft(yTemp).ticks(5).tickFormat(d => d + '°'))
      .call(g => { g.select('.domain').remove(); g.selectAll('text').style('font-size', '10px').attr('fill', '#0033A0'); });

    svg.append('g').attr('transform', `translate(${iW},0)`).call(d3.axisRight(yUmid).ticks(5).tickFormat(d => d + '%'))
      .call(g => { g.select('.domain').remove(); g.selectAll('text').style('font-size', '10px').attr('fill', '#00A3E0'); });

    // Temperature line
    const lineTemp = d3.line().x((_, i) => xScale(i)).y(d => yTemp(d.temperatura)).curve(d3.curveMonotoneX);
    svg.append('path').datum(sorted).attr('fill', 'none').attr('stroke', '#0033A0')
      .attr('stroke-width', 2).attr('d', lineTemp);
    svg.selectAll('.dot-temp').data(sorted).enter().append('circle')
      .attr('cx', (_, i) => xScale(i)).attr('cy', d => yTemp(d.temperatura))
      .attr('r', 4).attr('fill', d => d.tempConforme ? '#0033A0' : '#EF4444').attr('stroke', 'var(--color-surface)').attr('stroke-width', 1.5);

    // Humidity line
    const lineUmid = d3.line().x((_, i) => xScale(i)).y(d => yUmid(d.umidade)).curve(d3.curveMonotoneX);
    svg.append('path').datum(sorted).attr('fill', 'none').attr('stroke', '#00A3E0')
      .attr('stroke-width', 2).attr('d', lineUmid);
    svg.selectAll('.dot-umid').data(sorted).enter().append('circle')
      .attr('cx', (_, i) => xScale(i)).attr('cy', d => yUmid(d.umidade))
      .attr('r', 4).attr('fill', d => d.umidConforme ? '#00A3E0' : '#F59E0B').attr('stroke', 'var(--color-surface)').attr('stroke-width', 1.5);
    }); // end requestAnimationFrame
  }

  /* ── Bootstrap ──────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', init);
})();

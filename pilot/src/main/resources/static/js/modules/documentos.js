/**
 * documentos.js — Módulo de Documentos PDF (documentos.html)
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  const API_URL      = '/api/documentos';   // POST / DELETE / GET list
  const PAGE_SIZE = 12;

  let allItems = [];
  let filtered = [];
  let currentPage = 0;

  const tbody = document.getElementById('tabelaDocumentos');
  const info  = document.getElementById('paginacaoInfo');

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ── Status helpers ─────────────────────────────────────────── */
  function computeStatus(dataExpiracao) {
    if (!dataExpiracao) return 'ativo';
    const exp = new Date(dataExpiracao);
    const now = new Date();
    const diff = (exp - now) / (1000 * 60 * 60 * 24); // days
    if (diff < 0) return 'expirado';
    if (diff <= 30) return 'prestes-a-vencer';
    return 'ativo';
  }

  /* ── Load ───────────────────────────────────────────────────── */
  async function loadDocumentos() {
    Skeleton.tableRows(tbody, 5, 4);
    try {
      const data = await Api.get(API_URL, { size: 1000 });
      allItems = Array.isArray(data) ? data : (data.content || []);
      // Inject computed status if backend doesn't provide
      allItems = allItems.map(d => ({
        ...d,
        _status: d.status || computeStatus(d.dataExpiracao),
      }));
      checkAlerts();
      applyFilters();
    } catch (err) {
      Toast.error(_t('Erro ao carregar documentos.'));
      EmptyState.table(tbody, 5, 'Erro ao carregar dados', err.message);
    }
  }

  function checkAlerts() {
    const container = document.getElementById('alertExpirados');
    if (!container) return;
    const expiring = allItems.filter(d => d._status === 'prestes-a-vencer');
    const expired  = allItems.filter(d => d._status === 'expirado');
    const parts = [];
    if (expired.length)  parts.push(`<strong>${expired.length}</strong> documento(s) <strong>expirado(s)</strong>`);
    if (expiring.length) parts.push(`<strong>${expiring.length}</strong> vencendo em 30 dias`);
    container.innerHTML = parts.length
      ? `<div class="alert alert--warning" style="margin-bottom:1rem"><strong>Atenção:</strong> ${parts.join(' e ')}. Revise os documentos imediatamente.</div>`
      : '';
  }

  /* ── Filters ────────────────────────────────────────────────── */
  function applyFilters() {
    const q  = (document.getElementById('campoBusca').value || '').toLowerCase();
    const st = document.getElementById('filtroStatus').value;

    filtered = allItems.filter(d => {
      const nome = (d.nomeArquivo || d.arquivo || d.nome || '').toLowerCase();
      const matchQ  = !q  || nome.includes(q);
      const matchSt = !st || d._status === st;
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
    info.textContent = `${items.length} ${_t('documento(s) encontrado(s)')}`;

    if (!page.length) { EmptyState.table(tbody, 5, _t('Nenhum documento encontrado'), _t('Envie documentos usando o botão acima.')); return; }

    tbody.innerHTML = page.map(d => {
      const nome = d.nomeArquivo || d.arquivo || d.nome || 'documento.pdf';
      const uploadUrl = d.url || d.urlArquivo || (d.id ? `${API_URL}/abrir/${d.id}` : '#');
      return `
        <tr>
          <td>
            <a href="${uploadUrl}" target="_blank" rel="noopener" class="doc-link" style="display:flex;align-items:center;gap:8px;color:var(--color-primary);font-weight:500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,9 20,9"/></svg>
              ${nome}
            </a>
          </td>
          <td>${d.dataUpload ? ZP.Fmt.date(d.dataUpload) : '—'}</td>
          <td>${d.dataExpiracao ? ZP.Fmt.date(d.dataExpiracao) : '—'}</td>
          <td>${StatusBadge.documento(d._status)}</td>
          <td class="actions-cell">
            <button class="btn btn-ghost btn-sm perm-delete" onclick="DocumentosModule.excluir(${d.id})">${_t('Excluir')}</button>
          </td>
        </tr>`;
    }).join('');
  }

  /* ── Upload ─────────────────────────────────────────────────── */
  async function enviarDocumento() {
    const fileInput = document.getElementById('arquivo');
    const dataInput = document.getElementById('dataExpiracao');

    if (!fileInput.files || !fileInput.files[0]) { Toast.warning(_t('Selecione um arquivo PDF.')); return; }
    if (!dataInput.value) { Toast.warning(_t('Informe a data de expiração.')); return; }

    const formData = new FormData();
    formData.append('arquivo', fileInput.files[0]);
    formData.append('dataExpiracao', dataInput.value);

    const btn = document.getElementById('btnEnviarDocumento');
    btn.disabled = true; btn.textContent = _t('Enviando...');

    try {
      await Api.upload(API_URL + '/upload', formData);
      Toast.success(_t('Documento enviado com sucesso!'));
      Modal.close('modalDocumento');
      document.getElementById('documentoForm').reset();
      loadDocumentos();
    } catch (err) {
      Toast.error(err.message || _t('Erro ao enviar documento.'));
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> ${_t('Enviar')}`;
    }
  }

  async function excluir(id) {
    if (!id) return;
    const ok = await Confirm.show({ title: _t('Excluir Documento'), message: _t('O arquivo será removido permanentemente. Confirmar?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    try {
      await Api.del(`${API_URL}/${id}`);
      Toast.success(_t('Documento excluído.'));
      loadDocumentos();
    } catch { Toast.error(_t('Erro ao excluir documento.')); }
  }

  function prevPage() { if (currentPage > 0) { currentPage--; renderTabela(filtered); } }
  function nextPage() {
    if (currentPage < Math.ceil(filtered.length / PAGE_SIZE) - 1) { currentPage++; renderTabela(filtered); }
  }

  /* ── Dropzone wiring ────────────────────────────────────────── */
  function wireDropzone() {
    const zone    = document.getElementById('uploadDropzone');
    const input   = document.getElementById('fileInput');       // dropzone hidden input
    const modal   = document.getElementById('arquivo');         // modal file input
    const nameEl  = document.getElementById('fileSelectedName');
    const selDiv  = document.getElementById('fileSelected');
    const clearBtn= document.getElementById('btnClearFile');

    function applyFile(file) {
      if (!file || file.type !== 'application/pdf') {
        Toast.error(_t('Apenas arquivos PDF são aceitos.'));
        return;
      }
      // transfer to modal input via DataTransfer
      const dt = new DataTransfer();
      dt.items.add(file);
      modal.files = dt.files;
      nameEl.textContent = file.name;
      selDiv.style.display = 'flex';
      zone.classList.add('upload-dropzone--selected');
      Modal.open('modalDocumento');
    }

    // click on zone body (not on label/input) triggers file picker
    zone.addEventListener('click', e => {
      if (!e.target.closest('label') && e.target !== input && e.target !== clearBtn) {
        input.click();
      }
    });

    // file picker selection
    input.addEventListener('change', () => {
      if (input.files[0]) applyFile(input.files[0]);
    });

    // drag-over highlight
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('upload-dropzone--dragover'); });
    zone.addEventListener('dragleave', ()  => zone.classList.remove('upload-dropzone--dragover'));

    // drop
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('upload-dropzone--dragover');
      const file = e.dataTransfer.files[0];
      if (file) applyFile(file);
    });

    // clear selection
    clearBtn.addEventListener('click', e => {
      e.stopPropagation();
      input.value = '';
      modal.value = '';
      selDiv.style.display = 'none';
      zone.classList.remove('upload-dropzone--selected');
    });
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    loadDocumentos();
    wireDropzone();
    document.getElementById('btnNovoDocumento').addEventListener('click', () => {
      /* Reset modal fields */
      document.getElementById('arquivo').value      = '';
      document.getElementById('dataExpiracao').value = '';
      /* Reset dropzone visual state */
      const zone    = document.getElementById('uploadDropzone');
      const fileInp = document.getElementById('fileInput');
      const selDiv  = document.getElementById('fileSelected');
      if (fileInp) fileInp.value = '';
      if (selDiv)  selDiv.style.display = 'none';
      if (zone)    zone.classList.remove('upload-dropzone--selected', 'upload-dropzone--dragover');
      Modal.open('modalDocumento');
    });
    document.getElementById('btnEnviarDocumento').addEventListener('click', enviarDocumento);
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
  window.DocumentosModule = { excluir, loadDocumentos };
})();

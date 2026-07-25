/**
 * usuarios.js — Módulo de Usuários
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  const API = '/api/usuarios';
  const PAGE_SIZE = 12;

  const papelLogado = document.body.dataset.papelUsuarioLogado || '';
  const ehGestor = papelLogado === 'GESTOR';

  function foraDoEscopoDoGestor(cargo) {
    return ehGestor && (cargo || '').toUpperCase() !== 'ESTAGIARIO';
  }

  let allItems    = [];
  let filtered    = [];
  let currentPage = 0;

  const tbody = document.getElementById('tabelaUsuarios');
  const info  = document.getElementById('paginacaoInfo');

  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

  /* ── Cargo badge ──────────────────────────────────────────── */
  const cargoLabel = (cargo) => ({
    ESTAGIARIO: _t('Estagiário'),
    GESTOR: _t('Gestor'),
    DIRETOR_CEM: _t('Diretor do CEM'),
  })[(cargo || '').toUpperCase()] || (cargo || '—');

  const CARGO_CLASS = { ESTAGIARIO: 'badge--neutral', GESTOR: 'badge--primary', DIRETOR_CEM: 'badge--danger' };

  function cargoBadge(cargo) {
    const c   = (cargo || '').toUpperCase();
    const cls = CARGO_CLASS[c] || 'badge--neutral';
    const lbl = cargoLabel(c);
    return `<span class="badge ${cls}"><span class="badge-dot"></span>${lbl}</span>`;
  }

  /* ── Load ─────────────────────────────────────────────────── */
  async function loadUsuarios() {
    Skeleton.tableRows(tbody, PAGE_SIZE, 5);
    try {
      const data = await Api.get(API);
      allItems = Array.isArray(data) ? data : (data.content || []);
      applyFilters();
    } catch (err) {
      Toast.error(_t('Erro ao carregar usuários.'));
      EmptyState.table(tbody, 5, _t('Erro ao carregar dados'), err.message);
    }
  }

  /* ── Filters ──────────────────────────────────────────────── */
  function applyFilters() {
    const q  = (document.getElementById('campoBusca').value || '').toLowerCase();
    const fc = document.getElementById('filtroCargo').value;

    filtered = allItems.filter(u => {
      const matchQ = !q || (u.nome || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
      const matchC = !fc || (u.cargo || '').toUpperCase() === fc;
      return matchQ && matchC;
    });

    currentPage = 0;
    renderTabela(filtered);
  }

  /* ── Render ───────────────────────────────────────────────── */
  function renderTabela(items) {
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const start = currentPage * PAGE_SIZE;
    const page  = items.slice(start, start + PAGE_SIZE);

    document.getElementById('btnAnterior').disabled = currentPage === 0;
    document.getElementById('btnProximo').disabled  = currentPage >= totalPages - 1;
    document.getElementById('paginaAtual').textContent = currentPage + 1;
    info.textContent = `${items.length} ${_t('usuário(s) encontrado(s)')}`;

    if (!page.length) {
      EmptyState.table(tbody, 5, _t('Nenhum usuário encontrado'), _t('Crie um novo usuário ou ajuste os filtros.'));
      return;
    }

    tbody.innerHTML = page.map(u => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:50%;background:var(--color-primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;flex-shrink:0">
              ${(u.nome || 'U').charAt(0).toUpperCase()}
            </div>
            <strong>${u.nome || '—'}</strong>
          </div>
        </td>
        <td>${u.email || '—'}</td>
        <td>${cargoBadge(u.cargo)}</td>
        <td>${u.dataCriacao ? ZP.Fmt.date(u.dataCriacao) : '—'}</td>
        <td class="actions-cell">
          <button class="btn btn-ghost btn-sm" title="${_t('Editar')}" onclick="UsuariosModule.editar(${u.id})">${_t('Editar')}</button>
        </td>
      </tr>`).join('');
  }

  /* ── Tab switcher ─────────────────────────────────────────── */
  function switchTab(tab) {
    const tabs   = { dados: 'tabDados', perms: 'tabPerms', docs: 'tabDocs' };
    const panels = { dados: 'panelDados', perms: 'panelPerms', docs: 'panelDocs' };
    Object.keys(tabs).forEach(key => {
      const btn = document.getElementById(tabs[key]);
      const pnl = document.getElementById(panels[key]);
      if (!btn || !pnl) return;
      const active = key === tab;
      btn.style.color        = active ? 'var(--color-primary)' : 'var(--text-muted)';
      btn.style.borderBottom = active ? '2px solid var(--color-primary)' : '2px solid transparent';
      pnl.style.display      = active ? '' : 'none';
    });
  }

  /* ── Modal ────────────────────────────────────────────────── */
  function abrirModalNovo() {
    document.getElementById('usuarioId').value = '';
    document.getElementById('usuarioForm').reset();
    document.getElementById('modalTitulo').textContent = _t('Novo Usuário');
    document.getElementById('btnExcluirUsuario').style.display = 'none';
    document.getElementById('senhaLabel').textContent = _t('Senha');
    document.getElementById('senhaHint').textContent = _t('Mínimo 6 caracteres.');
    document.getElementById('senha').required = true;
    document.getElementById('tabDocs').style.display = 'none';
    switchTab('dados');
    Modal.open('modalUsuario');
  }

  function editar(id) {
    const u = allItems.find(x => x.id === id);
    if (!u) { Toast.error(_t('Usuário não encontrado.')); return; }
    if (foraDoEscopoDoGestor(u.cargo)) {
      Toast.error(_t('Você não tem permissão para editar esse usuário.'));
      return;
    }
    document.getElementById('usuarioId').value  = u.id;
    document.getElementById('nome').value        = u.nome || '';
    document.getElementById('email').value       = u.email || '';
    document.getElementById('cargo').value       = u.cargo || '';
    document.getElementById('senha').value       = '';
    document.getElementById('modalTitulo').textContent     = _t('Editar Usuário');
    document.getElementById('btnExcluirUsuario').style.display = '';
    document.getElementById('senhaLabel').textContent      = _t('Nova Senha (opcional)');
    document.getElementById('senhaHint').textContent       = _t('Deixe em branco para manter a senha atual.');
    document.getElementById('senha').required = false;
    document.getElementById('tabDocs').style.display = '';
    switchTab('dados');
    renderDocs(id);
    Modal.open('modalUsuario');
  }

  /* ── Save ─────────────────────────────────────────────────── */
  async function salvar() {
    const form  = document.getElementById('usuarioForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id    = document.getElementById('usuarioId').value;
    const nome  = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const cargo = document.getElementById('cargo').value;
    const senha = document.getElementById('senha').value;

    if (!cargo) { Toast.warning(_t('Selecione um cargo.')); return; }

    const payload = { nome, email, cargo };
    if (senha) payload.senha = senha;

    const btn = document.getElementById('btnSalvarUsuario');
    btn.disabled = true; btn.textContent = _t('Salvando...');
    try {
      if (id) {
        await Api.put(`${API}/${id}`, payload);
        Toast.success(_t('Usuário atualizado com sucesso!'));
      } else {
        await Api.post(API, payload);
        Toast.success(_t('Usuário criado com sucesso!'));
      }
      Modal.close('modalUsuario');
      loadUsuarios();
    } catch (err) {
      Toast.error(err.message || _t('Erro ao salvar usuário.'));
    } finally {
      btn.disabled = false; btn.textContent = _t('Salvar Usuário');
    }
  }

  /* ── Delete ───────────────────────────────────────────────── */
  async function excluir() {
    const id = document.getElementById('usuarioId').value;
    if (!id) return;

    const sessUser = window.Auth?.user?.();
    const current  = allItems.find(u => String(u.id) === String(id));
    if (sessUser && current && sessUser.email === current.email) {
      Toast.error(_t('Você não pode excluir o próprio usuário.'));
      return;
    }

    if (foraDoEscopoDoGestor(current?.cargo)) {
      Toast.error(_t('Você não tem permissão para excluir esse usuário.'));
      return;
    }

    const ok = await Confirm.show({ title: _t('Excluir Usuário'), message: _t('O usuário perderá acesso imediatamente. Confirmar?'), confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    try {
      await Api.del(`${API}/${id}`);
      Toast.success(_t('Usuário excluído.'));
      Modal.close('modalUsuario');
      loadUsuarios();
    } catch (err) {
      Toast.error(err.message || _t('Erro ao excluir usuário.'));
    }
  }

  function prevPage() { if (currentPage > 0) { currentPage--; renderTabela(filtered); } }
  function nextPage() {
    if (currentPage < Math.ceil(filtered.length / PAGE_SIZE) - 1) { currentPage++; renderTabela(filtered); }
  }

  /* ── Documentos (localStorage — metadata de certificados) ─── */
  const DOC_KEY = uid => `zp-user-docs-${uid}`;
  const DOC_TIPOS_ICON = {
    'Certificado de Treinamento': '🎓',
    'Termo de Confidencialidade': '🔒',
    'Currículo': '📄',
    'NR-10': '⚡',
    'NR-12': '⚙️',
    'ISO 17025 — Competência': '🏆',
    'Atestado Médico': '🏥',
    'Outro': '📎',
  };

  function getDocs(uid)      { try { return JSON.parse(localStorage.getItem(DOC_KEY(uid)) || '[]'); } catch { return []; } }
  function saveDocs(uid, d)  { localStorage.setItem(DOC_KEY(uid), JSON.stringify(d)); }
  function nextDocId(docs)   { return docs.length ? Math.max(...docs.map(d => d.id || 0)) + 1 : 1; }

  function renderDocs(uid) {
    const docs  = getDocs(uid);
    const list  = document.getElementById('docsList');
    const count = document.getElementById('tabDocsCount');
    if (!list) return;

    if (count) {
      count.textContent = docs.length;
      count.style.display = docs.length ? '' : 'none';
    }

    if (!docs.length) {
      list.innerHTML = `<div style="text-align:center;padding:32px 16px;color:var(--text-muted)">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:10px;opacity:.4"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13,2 13,9 20,9"/></svg>
        <p style="margin:0;font-size:13px">${_t('Nenhum documento anexado.')}</p>
        <p style="margin:4px 0 0;font-size:12px">${_t('Clique em')} <strong>${_t('Anexar')}</strong> ${_t('para adicionar certificados e documentos.')}</p>
      </div>`;
      return;
    }

    const today = new Date();
    list.innerHTML = docs.map(d => {
      const icon = DOC_TIPOS_ICON[d.tipo] || '📎';
      const venc = d.validade ? new Date(d.validade + 'T00:00:00') : null;
      const vencido  = venc && venc < today;
      const proxVenc = venc && !vencido && (venc - today) < 30 * 86400000;
      const vencTxt  = venc ? (vencido ? `<span style="color:var(--color-danger,#ef4444);font-weight:600">Vencido em ${fmtDate(d.validade)}</span>`
                              : proxVenc ? `<span style="color:var(--color-warning,#f59e0b)">Vence em ${fmtDate(d.validade)}</span>`
                              : `Válido até ${fmtDate(d.validade)}`) : '';

      return `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-color)">
        <div style="font-size:24px;line-height:1;flex-shrink:0;padding-top:2px">${icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px">${d.nome}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${_t(d.tipo)} · ${fmtDate(d.data)}</div>
          ${vencTxt ? `<div style="font-size:11px;margin-top:3px">${vencTxt}</div>` : ''}
          ${d.observacoes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">${d.observacoes}</div>` : ''}
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button class="btn btn-ghost btn-sm" onclick="UsuariosModule.editarDoc(${uid},${d.id})" title="${_t('Editar')}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="UsuariosModule.excluirDoc(${uid},${d.id})" title="${_t('Excluir')}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14H6L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function abrirModalDoc(uid, docId) {
    const docs = getDocs(uid);
    const doc  = docId ? docs.find(d => d.id === docId) : null;
    document.getElementById('docEditId').value  = docId || '';
    document.getElementById('docTipo').value    = doc?.tipo || '';
    document.getElementById('docNome').value    = doc?.nome || '';
    document.getElementById('docData').value    = doc?.data || '';
    document.getElementById('docValidade').value = doc?.validade || '';
    document.getElementById('docObs').value     = doc?.observacoes || '';
    Modal.open('modalAnexarDoc');
  }

  function salvarDoc() {
    const tipo      = document.getElementById('docTipo').value;
    const nome      = document.getElementById('docNome').value.trim();
    const data      = document.getElementById('docData').value;
    const validade  = document.getElementById('docValidade').value;
    const obs       = document.getElementById('docObs').value.trim();
    const uid       = parseInt(document.getElementById('usuarioId').value);
    const editId    = document.getElementById('docEditId').value;

    if (!tipo) { Toast.warning(_t('Selecione o tipo de documento.')); return; }
    if (!nome) { Toast.warning(_t('Informe o nome do arquivo.')); return; }
    if (!data) { Toast.warning(_t('Informe a data do documento.')); return; }

    let docs = getDocs(uid);
    if (editId) {
      const idx = docs.findIndex(d => d.id === parseInt(editId));
      if (idx !== -1) docs[idx] = { ...docs[idx], tipo, nome, data, validade: validade || null, observacoes: obs };
      Toast.success(_t('Documento atualizado!'));
    } else {
      docs.push({ id: nextDocId(docs), tipo, nome, data, validade: validade || null, observacoes: obs, anexadoEm: new Date().toISOString() });
      Toast.success(_t('Documento anexado!'));
    }

    saveDocs(uid, docs);
    Modal.close('modalAnexarDoc');
    renderDocs(uid);
    switchTab('docs');
  }

  async function excluirDoc(uid, docId) {
    const ok = await Confirm.show({ title: _t('Remover Documento'), message: _t('Confirmar remoção deste documento?'), confirmText: _t('Remover'), type: 'danger' });
    if (!ok) return;
    const docs = getDocs(uid).filter(d => d.id !== docId);
    saveDocs(uid, docs);
    Toast.success(_t('Documento removido.'));
    renderDocs(uid);
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    switchTab('dados');
    if (ehGestor) {
      document.querySelectorAll('#cargo option[value="GESTOR"], #cargo option[value="DIRETOR_CEM"]')
        .forEach(o => o.remove());
    }
    loadUsuarios();
    document.getElementById('btnNovoUsuario').addEventListener('click', abrirModalNovo);
    document.getElementById('btnSalvarUsuario').addEventListener('click', salvar);
    document.getElementById('btnExcluirUsuario').addEventListener('click', excluir);
    document.getElementById('btnAnterior').addEventListener('click', prevPage);
    document.getElementById('btnProximo').addEventListener('click', nextPage);
    document.getElementById('btnLimparFiltros').addEventListener('click', () => {
      document.getElementById('campoBusca').value  = '';
      document.getElementById('filtroCargo').value = '';
      applyFilters();
    });
    const dF = debounce(applyFilters, 250);
    document.getElementById('campoBusca').addEventListener('input', dF);
    document.getElementById('filtroCargo').addEventListener('change', applyFilters);

    document.getElementById('btnAnexarDoc')?.addEventListener('click', () => {
      const uid = parseInt(document.getElementById('usuarioId').value);
      if (uid) abrirModalDoc(uid, null);
    });
    document.getElementById('btnSalvarDoc')?.addEventListener('click', salvarDoc);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', () => renderTabela(filtered));
  window.UsuariosModule = { editar, salvar, excluir, loadUsuarios, switchTab,
    editarDoc: (uid, docId) => abrirModalDoc(uid, docId),
    excluirDoc };
})();

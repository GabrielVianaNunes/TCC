/**
 * kanban-estagiarios.js — Kanban board de atividades (Estagiário, Técnico e
 * Gestor no mesmo quadro). Suporta drag-and-drop nativo (HTML5 Drag API) e
 * persistência via API. A API já devolve só os cards que o usuário logado
 * tem permissão de ver (Estagiário só as próprias; Técnico as próprias +
 * todas as de Estagiário; Gestor as próprias + todas as de Técnico e
 * Estagiário; Admin, tudo) — aqui é só renderizar o que chegou.
 */
(function () {
  'use strict';

  const API_CARDS       = '/api/kanban-cards';
  const API_ESTAGIARIOS = '/api/estagiarios';
  const API_USUARIOS    = '/api/usuarios';
  const COLUNAS         = ['backlog', 'em-andamento', 'revisao', 'concluido'];

  let allCards       = [];
  let allEstagiarios = [];
  let allTecnicos    = [];
  let allGestores    = [];
  let filtroId       = 'todos'; // "todos" | "est-<id>" | "usr-<id>"
  let filtroPrioridade = '';
  let filtroBusca    = '';
  let dragCardId     = null;

  // ── i18n helper ───────────────────────────────────────────────────────────

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function initials(nome) {
    if (!nome) return '?';
    return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  function avatarColor(id) {
    // Tons escolhidos para que o texto branco das iniciais fique acima de
    // 4.5:1 — os originais (#00A3E0, #16A34A, #D97706, #0891B2, #059669)
    // ficavam entre 2.9:1 e 3.7:1.
    const palette = [
      '#0033A0','#0E7490','#15803D','#B45309','#DC2626',
      '#7C3AED','#DB2777','#155E75','#047857','#9A3412',
    ];
    return palette[(id - 1) % palette.length];
  }

  const ROLE_LABEL = { TECNICO: 'Técnico', GESTOR: 'Gestor', ESTAGIARIO: 'Estagiário' };
  const ROLE_BADGE_CLS = { TECNICO: 'info', GESTOR: 'warning', ESTAGIARIO: 'neutral' };

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function dueDateClass(prazo, coluna) {
    if (coluna === 'concluido' || !prazo) return '';
    const today = todayISO();
    if (prazo < today) return 'kanban-card__due--vencido';
    const diff = (new Date(prazo) - new Date(today)) / 86400000;
    if (diff <= 2) return 'kanban-card__due--urgente';
    return '';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function getNomeEstagiario(id) {
    const e = allEstagiarios.find(e => e.id === id);
    return e ? e.nome : '—';
  }

  function getEstagiarioById(id) {
    return allEstagiarios.find(e => e.id === id);
  }

  /** Nome + papel + id "unificado" do dono do card, seja Estagiário ou Técnico/Gestor. */
  function assigneeInfo(card) {
    if (card.estagiariaId != null) {
      const e = getEstagiarioById(card.estagiariaId);
      return { nome: e ? e.nome : '—', role: 'ESTAGIARIO', filtroKey: `est-${card.estagiariaId}` };
    }
    if (card.usuarioId != null) {
      return { nome: card.usuarioNome || '—', role: card.usuarioRole || '', filtroKey: `usr-${card.usuarioId}` };
    }
    return { nome: '—', role: '', filtroKey: null };
  }

  // ── Render ────────────────────────────────────────────────────────────────

  function renderCard(card) {
    const info      = assigneeInfo(card);
    const ini       = initials(info.nome);
    const avatarSeed = card.estagiariaId ?? card.usuarioId ?? 1;
    const cor        = avatarColor(avatarSeed);
    const dueCls     = dueDateClass(card.prazo, card.coluna);
    const tagsHtml   = (card.tags || []).map(t =>
      `<span class="kanban-card__tag">${t}</span>`).join('');
    const roleBadge = info.role && info.role !== 'ESTAGIARIO'
      ? `<span class="badge badge--${ROLE_BADGE_CLS[info.role] || 'neutral'}" style="font-size:9px;padding:1px 6px">${_t(ROLE_LABEL[info.role] || info.role)}</span>`
      : '';

    const el = document.createElement('div');
    el.className = 'kanban-card';
    el.dataset.id = card.id;
    el.dataset.priority = card.prioridade || 'media';
    el.draggable = true;

    el.innerHTML = `
      <div class="kanban-card__top">
        <span class="kanban-card__title">${card.titulo}</span>
        <button class="kanban-card__menu-btn" data-card-id="${card.id}" title="${_t('Opções')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
      </div>
      ${card.descricao ? `<p class="kanban-card__desc">${card.descricao}</p>` : ''}
      ${roleBadge ? `<div class="kanban-card__tags">${roleBadge}</div>` : ''}
      ${tagsHtml ? `<div class="kanban-card__tags">${tagsHtml}</div>` : ''}
      <div class="kanban-card__footer">
        <div class="kanban-card__assignee">
          <div class="kanban-card__avatar" style="background:${cor}">${ini}</div>
          <span>${(info.nome || '—').split(' ')[0]}</span>
        </div>
        <span class="kanban-card__due ${dueCls}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatDate(card.prazo)}
        </span>
      </div>`;

    // Drag events
    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('dragend',   onDragEnd);

    // Menu button
    el.querySelector('.kanban-card__menu-btn').addEventListener('click', e => {
      e.stopPropagation();
      openCardMenu(card, el);
    });

    // Double-click to edit
    el.addEventListener('dblclick', () => openModal(card));

    return el;
  }

  function renderBoard() {
    let totalVisiveis = 0;

    COLUNAS.forEach(col => {
      const container = document.getElementById(`cards-${col}`);
      container.innerHTML = '';

      const filtered = allCards.filter(c => {
        if (c.coluna !== col) return false;
        if (filtroId !== 'todos' && assigneeInfo(c).filtroKey !== filtroId) return false;
        if (filtroPrioridade && c.prioridade !== filtroPrioridade) return false;
        if (filtroBusca) {
          const q = filtroBusca.toLowerCase();
          if (!(c.titulo.toLowerCase().includes(q) ||
                (c.descricao || '').toLowerCase().includes(q) ||
                assigneeInfo(c).nome.toLowerCase().includes(q))) return false;
        }
        return true;
      });

      filtered.forEach(card => container.appendChild(renderCard(card)));
      container.classList.toggle('is-empty', filtered.length === 0);

      document.getElementById(`count-${col}`).textContent = filtered.length;
      totalVisiveis += filtered.length;
    });

    const word = totalVisiveis === 1 ? _t('tarefa') : _t('tarefas');
    document.getElementById('kanbanContagem').textContent =
      `${totalVisiveis} ${word} ${_t('visíveis')}`;
  }

  function renderFilterAvatars() {
    const wrap = document.getElementById('filtroEstagiario');
    wrap.querySelectorAll('[data-id]:not([data-id="todos"])').forEach(el => el.remove());

    const pessoas = [
      ...allEstagiarios.filter(e => e.ativo).map(e => ({ id: `est-${e.id}`, seed: e.id, nome: e.nome })),
      ...allTecnicos.map(u => ({ id: `usr-${u.id}`, seed: u.id, nome: u.nome })),
      ...allGestores.map(u => ({ id: `usr-${u.id}`, seed: u.id, nome: u.nome })),
    ];

    pessoas.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'kanban-filter-avatar';
      btn.dataset.id = p.id;
      btn.title = p.nome;
      btn.textContent = initials(p.nome);
      btn.style.background = avatarColor(p.seed);
      btn.style.color = '#fff';
      btn.style.borderColor = avatarColor(p.seed);
      btn.addEventListener('click', () => setFiltroPessoa(p.id));
      wrap.appendChild(btn);
    });
  }

  function setFiltroPessoa(id) {
    filtroId = id;
    document.querySelectorAll('.kanban-filter-avatar').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === id);
    });
    renderBoard();
  }

  // ── Drag & Drop ───────────────────────────────────────────────────────────

  function onDragStart(e) {
    dragCardId = parseInt(e.currentTarget.dataset.id, 10);
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.kanban-col--drag-over')
      .forEach(el => el.classList.remove('kanban-col--drag-over'));
  }

  function initDropZones() {
    document.querySelectorAll('.kanban-col').forEach(col => {
      col.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('kanban-col--drag-over');
      });
      col.addEventListener('dragleave', e => {
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('kanban-col--drag-over');
        }
      });
      col.addEventListener('drop', async e => {
        e.preventDefault();
        col.classList.remove('kanban-col--drag-over');
        if (dragCardId == null) return;
        const novaColuna = col.dataset.col;
        const card = allCards.find(c => c.id === dragCardId);
        if (!card || card.coluna === novaColuna) return;
        const colunaAnterior = card.coluna;
        card.coluna = novaColuna;
        renderBoard();
        try {
          await Api.patch(`${API_CARDS}/${card.id}`, { coluna: novaColuna });
        } catch (err) {
          card.coluna = colunaAnterior;
          renderBoard();
          Toast.error(err.message || _t('Erro ao mover tarefa.'));
        }
        dragCardId = null;
      });
    });
  }

  // ── Card Context Menu ─────────────────────────────────────────────────────

  let openMenu = null;

  function closeOpenMenu() {
    if (openMenu) { openMenu.remove(); openMenu = null; }
  }

  function openCardMenu(card, cardEl) {
    closeOpenMenu();
    const menu = document.createElement('div');
    menu.className = 'kanban-card-menu open';

    const moveItems = COLUNAS.filter(c => c !== card.coluna).map(col => {
      const ptLabels = { 'backlog': 'Backlog', 'em-andamento': 'Em Andamento', 'revisao': 'Em Revisão', 'concluido': 'Concluído' };
      const label = _t('Mover para ' + ptLabels[col]);
      return `<button class="kanban-card-menu__item" data-move="${col}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        ${label}</button>`;
    }).join('');

    menu.innerHTML = `
      <button class="kanban-card-menu__item" data-action="edit">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        ${_t('Editar')}
      </button>
      <div class="kanban-card-menu__sep"></div>
      ${moveItems}
      <div class="kanban-card-menu__sep"></div>
      <button class="kanban-card-menu__item kanban-card-menu__item--danger" data-action="delete">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        ${_t('Excluir')}
      </button>`;

    menu.querySelectorAll('[data-move]').forEach(btn => {
      btn.addEventListener('click', async () => {
        closeOpenMenu();
        const colunaAnterior = card.coluna;
        card.coluna = btn.dataset.move;
        renderBoard();
        try {
          await Api.patch(`${API_CARDS}/${card.id}`, { coluna: card.coluna });
        } catch (err) {
          card.coluna = colunaAnterior;
          renderBoard();
          Toast.error(err.message || _t('Erro ao mover tarefa.'));
        }
      });
    });

    menu.querySelector('[data-action="edit"]').addEventListener('click', () => {
      closeOpenMenu(); openModal(card);
    });
    menu.querySelector('[data-action="delete"]').addEventListener('click', () => {
      closeOpenMenu(); deleteCard(card);
    });

    cardEl.style.position = 'relative';
    cardEl.appendChild(menu);
    openMenu = menu;
  }

  document.addEventListener('click', e => {
    if (openMenu && !openMenu.contains(e.target)) closeOpenMenu();
  });

  // ── Modal ─────────────────────────────────────────────────────────────────

  const TIPO_LABEL = { estagiario: _t('Estagiário'), tecnico: _t('Técnico'), gestor: _t('Gestor') };

  function populatePersonSelect(tipo, selectedId) {
    const sel = document.getElementById('cardEstagiario');
    sel.innerHTML = '<option value="">Selecione...</option>';
    let lista = [];
    if (tipo === 'tecnico') lista = allTecnicos.map(u => ({ id: u.id, label: u.nome }));
    else if (tipo === 'gestor') lista = allGestores.map(u => ({ id: u.id, label: u.nome }));
    else lista = allEstagiarios.filter(e => e.ativo).map(e => ({ id: e.id, label: `${e.nome} — ${e.area}` }));

    lista.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.label;
      if (selectedId && p.id === selectedId) opt.selected = true;
      sel.appendChild(opt);
    });

    document.getElementById('labelAtribuido').textContent = _t(
      tipo === 'tecnico' ? 'Técnico' : tipo === 'gestor' ? 'Gestor' : 'Estagiário'
    );
  }

  function tipoDoCard(card) {
    if (!card) return 'estagiario';
    if (card.usuarioRole === 'TECNICO') return 'tecnico';
    if (card.usuarioRole === 'GESTOR') return 'gestor';
    return 'estagiario';
  }

  function openModal(card, defaultColuna) {
    const isNew = !card;
    document.getElementById('modalCardTitulo').textContent = isNew ? _t('Nova Tarefa') : _t('Editar Tarefa');
    document.getElementById('btnExcluirCard').style.display = isNew ? 'none' : '';

    document.getElementById('cardId').value        = card?.id || '';
    document.getElementById('cardTitulo').value    = card?.titulo || '';
    document.getElementById('cardDescricao').value = card?.descricao || '';
    document.getElementById('cardPrazo').value     = card?.prazo || '';
    document.getElementById('cardTags').value      = (card?.tags || []).join(', ');

    const tipo = tipoDoCard(card);
    document.getElementById('cardTipo').value = tipo;
    const selectedId = tipo === 'estagiario' ? card?.estagiariaId : card?.usuarioId;
    populatePersonSelect(tipo, selectedId);

    const colSel = document.getElementById('cardColuna');
    colSel.value = card?.coluna || defaultColuna || 'backlog';

    const priSel = document.getElementById('cardPrioridade');
    priSel.value = card?.prioridade || 'media';

    Modal.open('modalCard');
  }

  async function saveCard() {
    const id         = parseInt(document.getElementById('cardId').value) || null;
    const titulo     = document.getElementById('cardTitulo').value.trim();
    const descricao  = document.getElementById('cardDescricao').value.trim();
    const tipo       = document.getElementById('cardTipo').value;
    const pessoaId   = parseInt(document.getElementById('cardEstagiario').value);
    const coluna     = document.getElementById('cardColuna').value;
    const prioridade = document.getElementById('cardPrioridade').value;
    const prazo      = document.getElementById('cardPrazo').value;
    const tagsRaw    = document.getElementById('cardTags').value;
    const tags       = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!titulo)  { Toast.error(_t('Informe o título da tarefa.')); return; }
    if (!pessoaId) { Toast.error(_t('Selecione a quem atribuir a tarefa.')); return; }
    if (!prazo)   { Toast.error(_t('Informe o prazo.')); return; }

    const payload = { titulo, descricao, coluna, prioridade, prazo, tags };
    if (tipo === 'tecnico' || tipo === 'gestor') {
      payload.usuarioId = pessoaId;
    } else {
      payload.estagiariaId = pessoaId;
    }

    try {
      if (id) {
        const updated = await Api.patch(`${API_CARDS}/${id}`, payload);
        const idx = allCards.findIndex(c => c.id === id);
        if (idx >= 0) allCards[idx] = updated;
        Toast.success(_t('Tarefa atualizada!'));
      } else {
        const created = await Api.post(API_CARDS, {
          ...payload,
          criadoPor: 'Diretor',
          criadoEm: todayISO(),
        });
        allCards.unshift(created);
        Toast.success(_t('Tarefa criada!'));
      }
    } catch (err) {
      Toast.error(err.message || _t('Erro ao salvar tarefa.'));
      return;
    }

    Modal.close('modalCard');
    renderBoard();
  }

  async function deleteCard(card) {
    const ok = await Confirm.show({ title: _t('Excluir Tarefa'), message: `${_t('Confirmar exclusão?')}`, confirmText: _t('Excluir'), type: 'danger' });
    if (!ok) return;
    try {
      await Api.delete(`${API_CARDS}/${card.id}`);
      allCards = allCards.filter(c => c.id !== card.id);
      renderBoard();
      Toast.success(_t('Tarefa excluída.'));
    } catch (err) {
      Toast.error(err.message || _t('Erro ao excluir tarefa.'));
    }
  }

  // ── Add button per column ─────────────────────────────────────────────────

  function initColAddBtns() {
    document.querySelectorAll('.kanban-col__add-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(null, btn.dataset.col));
    });
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  function toArray(resp) {
    return Array.isArray(resp) ? resp : (resp?.content || []);
  }

  async function load() {
    try {
      const [cardsResp, estagResp, tecResp, gestResp] = await Promise.all([
        Api.get(API_CARDS),
        Api.get(API_ESTAGIARIOS),
        Api.get(API_USUARIOS, { role: 'TECNICO' }),
        Api.get(API_USUARIOS, { role: 'GESTOR' }),
      ]);

      allCards       = toArray(cardsResp);
      allEstagiarios = toArray(estagResp);
      allTecnicos    = toArray(tecResp);
      allGestores    = toArray(gestResp);

      renderFilterAvatars();
      renderBoard();
    } catch (err) {
      Toast.error(_t('Erro ao carregar dados do Kanban.'));
      console.error(err);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async () => {
    if (window.ZP?.Auth?.ready) await window.ZP.Auth.ready();

    load();
    initDropZones();
    initColAddBtns();

    document.getElementById('btnNovoCard').addEventListener('click', () => openModal(null));
    document.getElementById('btnSalvarCard').addEventListener('click', saveCard);
    document.getElementById('btnExcluirCard').addEventListener('click', () => {
      const id = parseInt(document.getElementById('cardId').value);
      const card = allCards.find(c => c.id === id);
      if (card) { Modal.close('modalCard'); deleteCard(card); }
    });
    document.getElementById('cardTipo').addEventListener('change', e => {
      populatePersonSelect(e.target.value);
    });

    document.getElementById('kanbanBusca').addEventListener('input', e => {
      filtroBusca = e.target.value.trim();
      renderBoard();
    });
    document.getElementById('filtroPrioridade').addEventListener('change', e => {
      filtroPrioridade = e.target.value;
      renderBoard();
    });
    document.getElementById('filtroEstagiario').addEventListener('click', e => {
      const btn = e.target.closest('[data-id]');
      if (btn) setFiltroPessoa(btn.dataset.id);
    });
  });
  document.addEventListener('zeiss:langchange', renderBoard);

})();

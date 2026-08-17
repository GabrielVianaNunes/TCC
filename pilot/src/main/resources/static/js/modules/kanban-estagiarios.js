/**
 * kanban-estagiarios.js — Kanban board de atividades dos estagiários
 * Suporta drag-and-drop nativo (HTML5 Drag API) e persistência via API.
 */
(function () {
  'use strict';

  const API_CARDS       = '/api/kanban-cards';
  const API_ESTAGIARIOS = '/api/estagiarios';
  const COLUNAS         = ['backlog', 'em-andamento', 'revisao', 'concluido'];

  let allCards       = [];
  let allEstagiarios = [];
  let filtroId       = 'todos';
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

  // ── Render ────────────────────────────────────────────────────────────────

  function renderCard(card) {
    const estagiario = getEstagiarioById(card.estagiariaId);
    const nome       = estagiario ? estagiario.nome : '—';
    const ini        = initials(nome);
    const cor        = avatarColor(card.estagiariaId || 1);
    const dueCls     = dueDateClass(card.prazo, card.coluna);
    const tagsHtml   = (card.tags || []).map(t =>
      `<span class="kanban-card__tag">${t}</span>`).join('');

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
      ${tagsHtml ? `<div class="kanban-card__tags">${tagsHtml}</div>` : ''}
      <div class="kanban-card__footer">
        <div class="kanban-card__assignee">
          <div class="kanban-card__avatar" style="background:${cor}">${ini}</div>
          <span>${nome.split(' ')[0]}</span>
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
        if (filtroId !== 'todos' && c.estagiariaId !== parseInt(filtroId)) return false;
        if (filtroPrioridade && c.prioridade !== filtroPrioridade) return false;
        if (filtroBusca) {
          const q = filtroBusca.toLowerCase();
          if (!(c.titulo.toLowerCase().includes(q) ||
                (c.descricao || '').toLowerCase().includes(q) ||
                getNomeEstagiario(c.estagiariaId).toLowerCase().includes(q))) return false;
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
    // Keep "Todos" button, remove old avatar buttons
    wrap.querySelectorAll('[data-id]:not([data-id="todos"])').forEach(el => el.remove());

    allEstagiarios.filter(e => e.ativo).forEach(e => {
      const btn = document.createElement('button');
      btn.className = 'kanban-filter-avatar';
      btn.dataset.id = e.id;
      btn.title = e.nome;
      btn.textContent = initials(e.nome);
      btn.style.background = avatarColor(e.id);
      btn.style.color = '#fff';
      btn.style.borderColor = avatarColor(e.id);
      btn.addEventListener('click', () => setFiltroEstagiario(String(e.id)));
      wrap.appendChild(btn);
    });
  }

  function setFiltroEstagiario(id) {
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
        card.coluna = novaColuna;
        renderBoard();
        try {
          await Api.patch(`${API_CARDS}/${card.id}`, { coluna: novaColuna });
        } catch { /* non-fatal — board já atualizou localmente */ }
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
        card.coluna = btn.dataset.move;
        renderBoard();
        try { await Api.patch(`${API_CARDS}/${card.id}`, { coluna: card.coluna }); } catch {}
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

  function populateEstagiarioSelect(selectedId) {
    const sel = document.getElementById('cardEstagiario');
    sel.innerHTML = '<option value="">Selecione...</option>';
    allEstagiarios.filter(e => e.ativo).forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = `${e.nome} — ${e.area}`;
      if (selectedId && e.id === selectedId) opt.selected = true;
      sel.appendChild(opt);
    });
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

    populateEstagiarioSelect(card?.estagiariaId);

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
    const estagId    = parseInt(document.getElementById('cardEstagiario').value);
    const coluna     = document.getElementById('cardColuna').value;
    const prioridade = document.getElementById('cardPrioridade').value;
    const prazo      = document.getElementById('cardPrazo').value;
    const tagsRaw    = document.getElementById('cardTags').value;
    const tags       = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!titulo)  { Toast.error(_t('Informe o título da tarefa.')); return; }
    if (!estagId) { Toast.error(_t('Selecione um estagiário.')); return; }
    if (!prazo)   { Toast.error(_t('Informe o prazo.')); return; }

    const payload = { titulo, descricao, estagiariaId: estagId, coluna, prioridade, prazo, tags };

    try {
      if (id) {
        const updated = await Api.patch(`${API_CARDS}/${id}`, payload);
        const idx = allCards.findIndex(c => c.id === id);
        if (idx >= 0) allCards[idx] = { ...allCards[idx], ...updated };
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
    } catch {
      Toast.error(_t('Erro ao salvar tarefa.'));
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
    } catch {
      Toast.error(_t('Erro ao excluir tarefa.'));
    }
  }

  // ── Add button per column ─────────────────────────────────────────────────

  function initColAddBtns() {
    document.querySelectorAll('.kanban-col__add-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(null, btn.dataset.col));
    });
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  async function load() {
    try {
      const [cardsResp, estagResp] = await Promise.all([
        Api.get(API_CARDS),
        Api.get(API_ESTAGIARIOS),
      ]);

      // handle paginated or array responses
      allCards       = Array.isArray(cardsResp)       ? cardsResp       : (cardsResp.content       || []);
      allEstagiarios = Array.isArray(estagResp)       ? estagResp       : (estagResp.content       || []);

      renderFilterAvatars();
      renderBoard();
    } catch (err) {
      Toast.error(_t('Erro ao carregar dados do Kanban.'));
      console.error(err);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
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
      if (btn) setFiltroEstagiario(btn.dataset.id);
    });
  });
  document.addEventListener('zeiss:langchange', renderBoard);

})();

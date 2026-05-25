/**
 * ZEISS-PILOT — UI.JS
 * Toast, Modal, Skeleton, Status Badges, Confirm dialog
 */

'use strict';

/* ══════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════ */
const Toast = (() => {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  const TITLES = { success: 'Sucesso', error: 'Erro', warning: 'Atenção', info: 'Informação' };

  function show(type, message, title, duration = 4500) {
    const _t = k => window.I18n?.t(k) ?? k;
    const c = getContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const resolvedTitle = title || _t(TITLES[type]) || _t('Aviso');
    toast.innerHTML = `
      <span class="toast__icon">${ICONS[type] || ICONS.info}</span>
      <div class="toast__content">
        <div class="toast__title">${resolvedTitle}</div>
        <div class="toast__message">${message}</div>
      </div>
      <button class="toast__close" aria-label="Fechar">✕</button>
    `;

    toast.querySelector('.toast__close').addEventListener('click', () => dismiss(toast));
    c.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    if (duration > 0) setTimeout(() => dismiss(toast), duration);
    return toast;
  }

  function dismiss(toast) {
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  return {
    success: (msg, title) => show('success', msg, title),
    error:   (msg, title) => show('error',   msg, title, 6000),
    warning: (msg, title) => show('warning', msg, title, 5000),
    info:    (msg, title) => show('info',    msg, title)
  };
})();

/* ══════════════════════════════════════════
   MODAL MANAGER
══════════════════════════════════════════ */
const Modal = (() => {
  let overlay;

  function getOverlay() {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'modalOverlay';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', closeAll);
    }
    return overlay;
  }

  function open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    getOverlay().classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const firstFocus = modal.querySelector('input:not([type=hidden]), select, textarea');
      if (firstFocus) firstFocus.focus();
    }, 200);
  }

  function close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('open');
    // Check if any modal is still open
    if (!document.querySelector('.modal.open')) {
      getOverlay().classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function closeAll() {
    document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    getOverlay().classList.remove('open');
    document.body.style.overflow = '';
  }

  // Bind close buttons automatically
  document.addEventListener('click', e => {
    if (e.target.matches('[data-modal-close]')) {
      const id = e.target.getAttribute('data-modal-close') ||
        e.target.closest('.modal')?.id;
      if (id) close(id);
    }
    if (e.target.matches('[data-modal-open]')) {
      open(e.target.getAttribute('data-modal-open'));
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll();
  });

  return { open, close, closeAll };
})();

/* ══════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════ */
const Confirm = (() => {
  function show({ title = 'Confirmar ação', message = 'Deseja continuar?', confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) {
    return new Promise(resolve => {
      const id = 'confirmModal';
      let existing = document.getElementById(id);
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = id;
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal__dialog" style="max-width:420px">
          <div class="modal__header">
            <h3 class="modal__title">${title}</h3>
            <button class="modal__close" data-modal-close="${id}">✕</button>
          </div>
          <div class="modal__body">
            <p style="color:var(--text-secondary);line-height:1.6">${message}</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn-secondary" id="confirmCancel">${cancelText}</button>
            <button class="btn btn-${type}" id="confirmOk">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      Modal.open(id);

      modal.querySelector('#confirmOk').addEventListener('click', () => {
        Modal.close(id);
        modal.remove();
        resolve(true);
      });

      modal.querySelector('#confirmCancel').addEventListener('click', () => {
        Modal.close(id);
        modal.remove();
        resolve(false);
      });
    });
  }

  return { show };
})();

/* ══════════════════════════════════════════
   SKELETON LOADER
══════════════════════════════════════════ */
const Skeleton = {
  tableRows(tbody, cols = 6, rows = 5) {
    if (!tbody) return;
    tbody.innerHTML = Array.from({ length: rows }, () =>
      `<tr>${Array.from({ length: cols }, () =>
        `<td><div class="skeleton skeleton-text" style="width:${60 + Math.random() * 30}%"></div></td>`
      ).join('')}</tr>`
    ).join('');
  },

  card(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="skeleton skeleton-title" style="width:40%"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width:80%"></div>
      <div class="skeleton skeleton-text" style="width:60%"></div>
    `;
  },

  kpis(container, count = 4) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="kpi-card" style="gap:0">
        <div>
          <div class="skeleton skeleton-text" style="width:60%;margin-bottom:12px"></div>
          <div class="skeleton skeleton-title" style="width:40%"></div>
        </div>
        <div class="skeleton skeleton-circle" style="width:48px;height:48px;flex-shrink:0"></div>
      </div>
    `).join('');
  }
};

/* ══════════════════════════════════════════
   STATUS BADGE RENDERER
══════════════════════════════════════════ */
const StatusBadge = (() => {

  // ── Serviços ──
  const SERVICOS = {
    'Elaboração de proposta': { cls: 'info',    label: 'Elaboração de Proposta' },
    'Negociação':             { cls: 'warning', label: 'Negociação' },
    'Venda finalizada':       { cls: 'success', label: 'Venda Finalizada' },
    'Desistiu':               { cls: 'danger',  label: 'Desistiu' }
  };

  // ── Projetos ──
  const PROJETOS = {
    'A iniciar':              { cls: 'neutral', label: 'A Iniciar' },
    'Pendente autorização':   { cls: 'warning', label: 'Pendente Autorização' },
    'Em andamento':           { cls: 'info',    label: 'Em Andamento' },
    'Atrasada':               { cls: 'danger',  label: 'Atrasado' },
    'Concluído':              { cls: 'success', label: 'Concluído' },
    'Descontinuado':          { cls: 'neutral', label: 'Descontinuado' }
  };

  // ── Editais ──
  const EDITAIS = {
    'Aguardando aprovação':   { cls: 'warning', label: 'Aguardando Aprovação' },
    'Reprovado':              { cls: 'danger',  label: 'Reprovado' },
    'Aprovado':               { cls: 'success', label: 'Aprovado' },
    'Prestação de contas':    { cls: 'info',    label: 'Prestação de Contas' },
    'Finalizado':             { cls: 'neutral', label: 'Finalizado' }
  };

  // ── Documentos ──
  const DOCUMENTOS = {
    'ativo':              { cls: 'success', label: 'Ativo' },
    'prestes-a-vencer':   { cls: 'warning', label: 'Prestes a Vencer' },
    'expirado':           { cls: 'danger',  label: 'Expirado' }
  };

  // ── Visitas ──
  const VISITAS = {
    true:  { cls: 'success', label: 'Realizada' },
    false: { cls: 'warning', label: 'Pendente' }
  };

  // ── Prioridade ──
  const PRIORIDADE = {
    'Alta':  { cls: 'danger',  label: 'Alta' },
    'Média': { cls: 'warning', label: 'Média' },
    'Baixa': { cls: 'success', label: 'Baixa' }
  };

  const _t = k => window.I18n?.t(k) ?? k;

  function render(map, key) {
    const entry = map[key] || map[String(key)];
    if (!entry) return `<span class="badge badge--neutral"><span class="badge-dot"></span>${_t(key) || '—'}</span>`;
    return `<span class="badge badge--${entry.cls}"><span class="badge-dot"></span>${_t(entry.label)}</span>`;
  }

  return {
    servico:    v => render(SERVICOS,  v),
    projeto:    v => render(PROJETOS,  v),
    edital:     v => render(EDITAIS,   v),
    documento:  v => render(DOCUMENTOS, v),
    visita:     v => render(VISITAS,   v),
    prioridade: v => render(PRIORIDADE, v),

    // Generic fallback
    generic(v, colorMap = {}) {
      const cls = colorMap[v] || 'neutral';
      return `<span class="badge badge--${cls}"><span class="badge-dot"></span>${_t(v) || '—'}</span>`;
    }
  };
})();

/* ══════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════ */
const EmptyState = {
  table(tbody, cols, message = 'Nenhum registro encontrado', hint = 'Utilize o botão acima para adicionar um novo item.') {
    if (!tbody) return;
    const _t = k => window.I18n?.t(k) ?? k;
    tbody.innerHTML = `
      <tr>
        <td colspan="${cols}">
          <div class="table-empty">
            <svg class="table-empty__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>
            <div class="table-empty__title">${_t(message)}</div>
            <div class="table-empty__desc">${_t(hint)}</div>
          </div>
        </td>
      </tr>`;
  }
};

/* ── Exports ── */
window.Toast     = Toast;
window.Modal     = Modal;
window.Confirm   = Confirm;
window.Skeleton  = Skeleton;
window.StatusBadge  = StatusBadge;
window.EmptyState   = EmptyState;

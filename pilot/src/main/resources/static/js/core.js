/**
 * ZEISS-PILOT — CORE.JS
 * App initialization, sidebar, theme, nav helpers
 */

'use strict';

/* ── CSRF Helpers ── */
const CSRF = {
  token:  () => document.querySelector('meta[name="_csrf"]')?.content       || '',
  header: () => document.querySelector('meta[name="_csrf_header"]')?.content || 'X-CSRF-TOKEN'
};

/* ── Theme Manager ── */
const Theme = {
  KEY: 'zp-theme',

  init() {
    const saved = localStorage.getItem(this.KEY) || 'light';
    this.apply(saved);
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.KEY, theme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      const _t = k => window.I18n?.t(k) ?? k;
      btn.title = theme === 'dark' ? _t('Modo Claro') : _t('Modo Escuro');
    }
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.apply(current === 'dark' ? 'light' : 'dark');
  }
};

/* ── Sidebar Manager ── */
const Sidebar = {
  KEY: 'zp-sidebar-collapsed',

  init() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const collapsed = localStorage.getItem(this.KEY) === 'true';
    if (collapsed) sidebar.classList.add('collapsed');

    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
      toggle.innerHTML = collapsed ? '&#x276F;' : '&#x276E;';
      toggle.addEventListener('click', () => this.toggle());
    }

    /* Mobile hamburger: toggle open/close */
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) mobileBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar?.classList.contains('mobile-open')) this.closeMobile();
      else this.openMobile();
    });
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', () => this.closeMobile());

    this.setActiveNav();
  },

  toggle() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.toggle('collapsed');
    localStorage.setItem(this.KEY, isCollapsed);
    const btn = document.getElementById('sidebarToggle');
    if (btn) btn.innerHTML = isCollapsed ? '&#x276F;' : '&#x276E;';
  },

  openMobile() {
    document.getElementById('sidebar')?.classList.add('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
    const btn = document.getElementById('mobileMenuBtn');
    if (btn) btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  },

  closeMobile() {
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
    const btn = document.getElementById('mobileMenuBtn');
    if (btn) btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  },

  setActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.sidebar__nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      // Exact match for root; prefix match only when href ends on a full
      // path segment (avoids /servicos matching /servicos/relatorio-servicos)
      const isActive = path === href ||
        (href !== '/' && path.startsWith(href) &&
          (path.length === href.length || path[href.length] === '/'));
      link.classList.toggle('active', isActive);
    });
  }
};

/* ── Date Formatters ── */
const Fmt = {
  date(iso) {
    if (!iso) return '—';
    try {
      const [y, m, d] = iso.split('T')[0].split('-');
      const lang = window.I18n?.lang() || 'pt-BR';
      if (lang === 'en') return `${m}/${d}/${y}`;
      if (lang === 'de') return `${d}.${m}.${y}`;
      return `${d}/${m}/${y}`;
    } catch { return iso; }
  },

  datetime(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const locale = window.I18n?.lang() || 'pt-BR';
      return d.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
    } catch { return iso; }
  },

  currency(value) {
    if (value == null || value === '') return '—';
    const n = typeof value === 'string'
      ? parseFloat(value.replace(',', '.'))
      : parseFloat(value);
    if (isNaN(n)) return value;
    const locale = window.I18n?.lang() === 'en' ? 'en-US'
                 : window.I18n?.lang() === 'de' ? 'de-DE' : 'pt-BR';
    return n.toLocaleString(locale, { style: 'currency', currency: 'BRL' });
  },

  relative(iso) {
    if (!iso) return '—';
    try {
      const _t = k => window.I18n?.t(k) ?? k;
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1)  return _t('agora mesmo');
      if (mins < 60) return _t('há %d min').replace('%d', mins);
      const hrs = Math.floor(mins / 60);
      if (hrs < 24)  return _t('há %dh').replace('%d', hrs);
      const days = Math.floor(hrs / 24);
      if (days < 30) return _t('há %dd').replace('%d', days);
      return Fmt.date(iso);
    } catch { return iso; }
  }
};

/* ── DOM Helpers ── */
const Dom = {
  qs:  (sel, ctx = document) => ctx.querySelector(sel),
  qsa: (sel, ctx = document) => [...ctx.querySelectorAll(sel)],

  el(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'html')  el.innerHTML = v;
      else if (k === 'text')  el.textContent = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => c && el.append(typeof c === 'string' ? c : c));
    return el;
  },

  on(sel, event, handler, ctx = document) {
    ctx.querySelectorAll(sel).forEach(el => el.addEventListener(event, handler));
  },

  show(el) { if (el) el.style.display = ''; },
  hide(el) { if (el) el.style.display = 'none'; },
  toggle(el, condition) { if (el) el.style.display = condition ? '' : 'none'; }
};

/* ── Topbar Info ── */
const Topbar = {
  init() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', () => Theme.toggle());

    /* Inject notification bell before the divider */
    this._injectBell();

    const userMenuBtn  = document.getElementById('userMenuBtn');
    const userMenuWrap = document.getElementById('userMenuWrap');
    if (userMenuBtn && userMenuWrap) {
      userMenuBtn.addEventListener('click', e => {
        e.stopPropagation();
        userMenuWrap.classList.toggle('open');
      });
      document.addEventListener('click', e => {
        if (!userMenuWrap.contains(e.target)) userMenuWrap.classList.remove('open');
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') userMenuWrap.classList.remove('open');
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('zp-role');
        sessionStorage.removeItem('zp-user');
        window.location.href = '/login?logout';
      });
    }

    /* Populate avatar initials */
    setAvatarInitials();
  },

  _injectBell() {
    const right = document.querySelector('.topbar__right');
    if (!right || document.getElementById('notifBellWrap')) return;

    const divider = right.querySelector('.topbar__divider');

    const bellHTML = `
      <div class="notif-wrap" id="notifBellWrap">
        <button class="topbar__icon-btn notif-bell" id="notifBell" aria-label="Notificações" aria-expanded="false" aria-haspopup="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-badge" id="notifCount" style="display:none">0</span>
        </button>
        <div class="notif-panel" id="notifPanel" role="dialog" aria-label="Painel de notificações">
          <div class="notif-panel__header">
            <span class="notif-panel__title">Notificações</span>
            <button class="notif-panel__clear" id="notifClear" title="Marcar todas como lidas">✓ Limpar</button>
          </div>
          <ul class="notif-list" id="notifList">
            <li class="notif-empty">Carregando…</li>
          </ul>
        </div>
      </div>`;

    const tmp = document.createElement('div');
    tmp.innerHTML = bellHTML;
    const bellWrap = tmp.firstElementChild;

    if (divider) {
      right.insertBefore(bellWrap, divider);
    } else {
      right.prepend(bellWrap);
    }

    /* Toggle panel */
    const bell  = document.getElementById('notifBell');
    const panel = document.getElementById('notifPanel');
    bell.addEventListener('click', e => {
      e.stopPropagation();
      const open = panel.classList.toggle('open');
      bell.setAttribute('aria-expanded', open);
      if (open) Notifications.load();
    });
    document.addEventListener('click', e => {
      if (!document.getElementById('notifBellWrap').contains(e.target)) {
        panel.classList.remove('open');
        bell.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        panel.classList.remove('open');
        bell.setAttribute('aria-expanded', 'false');
      }
    });
    document.getElementById('notifClear')?.addEventListener('click', () => {
      Notifications.clear();
    });

    // Traduz cabeçalho do painel ao trocar idioma
    document.addEventListener('zeiss:langchange', () => {
      const _t = k => window.I18n?.t(k) ?? k;
      const title = document.querySelector('.notif-panel__title');
      if (title) title.textContent = _t('Notificações');
      const clearBtn = document.querySelector('.notif-panel__clear');
      if (clearBtn) clearBtn.innerHTML = `✓ ${_t('Limpar')}`;
    });
  }
};

/* ── Avatar initials helper ── */
function setAvatarInitials() {
  const nameEl  = document.querySelector('.topbar__user-name');
  const name    = nameEl?.textContent?.trim();
  if (!name || name === 'Usuário') return;
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  if (!initials) return;
  document.querySelectorAll('.topbar__user-avatar, .sidebar__avatar').forEach(el => {
    el.textContent = initials;
  });
}

/* ── Auth / Role System ── */
const Auth = (() => {
  const KEY  = 'zp-role';
  const UKEY = 'zp-user';

  const ROLES = {
    ESTAGIARIO:  'Estagiário',
    GESTOR:      'Gestor',
    DIRETOR_CEM: 'Diretor do CEM',
  };

  const PERMS = {
    ESTAGIARIO:  { delete: false, edit: false, viewFinancial: false, viewEditais: false, viewDocumentos: false, viewUsuarios: false, create: true  },
    GESTOR:      { delete: true,  edit: true,  viewFinancial: true,  viewEditais: true,  viewDocumentos: true,  viewUsuarios: false, create: true  },
    DIRETOR_CEM: { delete: true,  edit: true,  viewFinancial: true,  viewEditais: true,  viewDocumentos: true,  viewUsuarios: true,  create: true  },
  };

  const PAGE_ROLES = {
    '/editais/lista':    ['GESTOR', 'DIRETOR_CEM'],
    '/editais/detalhes': ['GESTOR', 'DIRETOR_CEM'],
    '/documentos':       ['GESTOR', 'DIRETOR_CEM'],
    '/usuarios':         ['DIRETOR_CEM'],
  };

  const NAV_ROLES = {
    '/editais/lista': ['GESTOR', 'DIRETOR_CEM'],
    '/documentos':    ['GESTOR', 'DIRETOR_CEM'],
    '/usuarios':      ['DIRETOR_CEM'],
  };

  const ROLE_COLORS = {
    ESTAGIARIO:  '#6b7280',
    GESTOR:      '#2563eb',
    DIRETOR_CEM: '#7c3aed',
  };

  function role() { return sessionStorage.getItem(KEY) || 'GESTOR'; }
  function user() { try { return JSON.parse(sessionStorage.getItem(UKEY)); } catch { return null; } }
  function can(p) { return !!((PERMS[role()] || {})[p]); }

  function set(r, u) {
    sessionStorage.setItem(KEY, r);
    if (u) sessionStorage.setItem(UKEY, JSON.stringify(u));
  }

  function guardPage() {
    const path = window.location.pathname;
    for (const [page, allowed] of Object.entries(PAGE_ROLES)) {
      if (path === page || path.startsWith(page + '/') || path.startsWith(page + '?')) {
        if (!allowed.includes(role())) { window.location.replace('/'); return false; }
      }
    }
    return true;
  }

  function applyNav() {
    const r = role();
    document.querySelectorAll('.sidebar__nav-item[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (NAV_ROLES[href] && !NAV_ROLES[href].includes(r)) {
        a.style.display = 'none';
      }
    });
    document.querySelectorAll('.sidebar__section-label').forEach(label => {
      let sib = label.nextElementSibling;
      let allHidden = true;
      while (sib && !sib.classList.contains('sidebar__section-label')) {
        if (sib.classList.contains('sidebar__nav-item') && sib.style.display !== 'none') {
          allHidden = false; break;
        }
        sib = sib.nextElementSibling;
      }
      if (allHidden) label.style.display = 'none';
    });
  }

  function applyBodyRole() {
    document.body.dataset.role = role();
  }

  function showRoleBadge() {
    const r = role();
    const u = user();

    // Topbar name
    const nameEl = document.getElementById('topbarName');
    if (nameEl && u?.nome) nameEl.textContent = u.nome;

    // Avatar initials
    const initials = u?.nome
      ? u.nome.split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase() || '').join('')
      : 'U';
    document.querySelectorAll('.topbar__user-avatar, #dropdownAvatar').forEach(el => {
      el.textContent = initials;
    });

    // Dropdown user info
    const dropName = document.getElementById('dropdownName');
    const dropRole = document.getElementById('dropdownRole');
    if (dropName && u?.nome) dropName.textContent = u.nome;
    if (dropRole) {
      const color = ROLE_COLORS[r] || '#6b7280';
      dropRole.textContent = ROLES[r] || r;
      dropRole.style.cssText = `font-size:10px;font-weight:600;color:${color};margin-top:2px`;
    }

    // Esconde "Gerenciar Usuários" se não for DIRETOR
    const manageLink = document.querySelector('.topbar__dropdown a[href="/usuarios"]');
    if (manageLink && !can('viewUsuarios')) manageLink.style.display = 'none';
  }

  function init() {
    applyBodyRole();
    if (!guardPage()) return;
    applyNav();
    showRoleBadge();
  }

  return { role, user, can, set, init, ROLES, PERMS };
})();

/* ── Page Transitions ── */
const PageTransition = {
  init() {
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
      } catch { return; }

      e.preventDefault();
      const area = document.querySelector('.content-area');
      if (!area) { window.location.href = href; return; }
      area.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 150);
    });
  }
};

/* ── App Bootstrap ── */
const App = {
  init() {
    Theme.init();
    Sidebar.init();
    Topbar.init();
    Auth.init();
    PageTransition.init();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());

/* ── Exports ── */
window.ZP   = { CSRF, Theme, Sidebar, Fmt, Dom, App, Auth };
window.Auth = Auth;

/**
 * notifications.js — Sistema global de notificações
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'zp-notif-dismissed';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  /* ── Load & render ─────────────────────────────────────────── */
  async function load() {
    const list = document.getElementById('notifList');
    if (!list) return;

    list.innerHTML = `<li class="notif-empty">${_t('Carregando…')}</li>`;

    const alerts = [];

    await Promise.allSettled([
      checkDocumentos(alerts),
      checkAlmoxarifado(alerts),
      checkMaquinas(alerts),
    ]);

    const dismissed = getDismissed();
    const visible = alerts.filter(a => !dismissed.includes(a.id));

    updateBadge(visible.length);

    if (!visible.length) {
      list.innerHTML = `<li class="notif-empty">${_t('Nenhuma notificação no momento.')}</li>`;
      return;
    }

    list.innerHTML = visible.map(a => `
      <li class="notif-item notif-item--${a.type}" data-id="${escHtml(a.id)}">
        <div class="notif-item__icon">${iconFor(a.type)}</div>
        <div class="notif-item__body">
          <div class="notif-item__title">${escHtml(a.title)}</div>
          <div class="notif-item__desc">${escHtml(a.desc)}</div>
          ${a.href ? `<a class="notif-item__link" href="${escHtml(a.href)}">${escHtml(a.linkText || _t('Ver detalhes'))} →</a>` : ''}
        </div>
        <button class="notif-item__dismiss" data-id="${escHtml(a.id)}" title="${_t('Dispensar')}">×</button>
      </li>`).join('');

    list.querySelectorAll('.notif-item__dismiss').forEach(btn => {
      btn.addEventListener('click', () => {
        dismiss(btn.dataset.id);
        btn.closest('.notif-item')?.remove();
        const remaining = list.querySelectorAll('.notif-item').length;
        updateBadge(remaining);
        if (!remaining) list.innerHTML = `<li class="notif-empty">${_t('Nenhuma notificação no momento.')}</li>`;
      });
    });
  }

  /* ── Checkers ──────────────────────────────────────────────── */
  async function checkDocumentos(alerts) {
    try {
      const data = await Api.get('/api/documentos', { size: 500 });
      const docs = Array.isArray(data) ? data : (data.content || []);
      const today = new Date(); today.setHours(0,0,0,0);
      const in30 = new Date(today); in30.setDate(today.getDate() + 30);

      // Suporta tanto "dataVencimento" (Thymeleaf) quanto "dataExpiracao" (mock server)
      const getExp = d => d.dataVencimento || d.dataExpiracao || null;

      const expirados = docs.filter(d => getExp(d) && new Date(getExp(d)) < today);
      const vencendo  = docs.filter(d => {
        const exp = getExp(d);
        if (!exp) return false;
        const dt = new Date(exp);
        return dt >= today && dt <= in30;
      });

      if (expirados.length) alerts.push({
        id: 'docs-expired',
        type: 'danger',
        title: `${expirados.length} ${_t('documento')}${expirados.length > 1 ? 's' : ''} ${expirados.length > 1 ? _t('vencidos') : _t('vencido')}`,
        desc: _t('Documentos expirados requerem atenção imediata.'),
        href: '/documentos',
        linkText: _t('Ver documentos')
      });

      if (vencendo.length) alerts.push({
        id: 'docs-expiring',
        type: 'warning',
        title: `${vencendo.length} ${_t('documento')}${vencendo.length > 1 ? 's' : ''} ${vencendo.length > 1 ? _t('vencem em 30 dias') : _t('vence em 30 dias')}`,
        desc: _t('Renove antes do vencimento para manter a conformidade.'),
        href: '/documentos',
        linkText: _t('Ver documentos')
      });
    } catch { /* ignore */ }
  }

  async function checkAlmoxarifado(alerts) {
    try {
      const data = await Api.get('/api/almoxarifado/itens', { size: 500 });
      const items = Array.isArray(data) ? data : (data.content || []);
      // Suporta tanto campos do mock (quantidadeAtual/estoqueMinimo) quanto do backend (quantidade/minimo)
      const getQtd = i => i.quantidadeAtual  ?? i.quantidade  ?? null;
      const getMin = i => i.estoqueMinimo    ?? i.minimo      ?? null;
      const critical = items.filter(i => getQtd(i) != null && getMin(i) != null && getQtd(i) <= getMin(i));
      if (critical.length) alerts.push({
        id: 'stock-critical',
        type: 'warning',
        title: `${critical.length} item${critical.length > 1 ? 'ns' : ''} ${_t('com estoque crítico')}`,
        desc: critical.slice(0, 2).map(i => i.nome || i.descricao).filter(Boolean).join(', ') + (critical.length > 2 ? '…' : ''),
        href: '/almoxarifado',
        linkText: _t('Ver almoxarifado')
      });
    } catch { /* ignore */ }
  }

  async function checkMaquinas(alerts) {
    try {
      const data = await Api.get('/api/maquinas', { size: 500 });
      const items = Array.isArray(data) ? data : (data.content || []);
      const manut = items.filter(i => (i.status || '').toLowerCase().includes('manutenção'));
      if (manut.length) alerts.push({
        id: 'machines-maintenance',
        type: 'info',
        title: `${manut.length} ${_t('máquina')}${manut.length > 1 ? 's' : ''} ${_t('em manutenção')}`,
        desc: manut.slice(0, 2).map(i => i.nome || i.modelo).filter(Boolean).join(', ') + (manut.length > 2 ? '…' : ''),
        href: '/maquinas',
        linkText: _t('Ver máquinas')
      });
    } catch { /* ignore */ }
  }

  /* ── Badge ─────────────────────────────────────────────────── */
  function updateBadge(count) {
    const badge = document.getElementById('notifCount');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  /* ── Dismiss / Clear ───────────────────────────────────────── */
  function getDismissed() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function dismiss(id) {
    const list = getDismissed();
    if (!list.includes(id)) { list.push(id); localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  }

  function clear() {
    const list = document.getElementById('notifList');
    if (!list) return;
    list.querySelectorAll('[data-id]').forEach(el => dismiss(el.dataset.id));
    list.innerHTML = `<li class="notif-empty">${_t('Nenhuma notificação no momento.')}</li>`;
    updateBadge(0);
  }

  /* ── Helpers ───────────────────────────────────────────────── */
  function iconFor(type) {
    const icons = {
      danger:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    };
    return icons[type] || icons.info;
  }

  function escHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Public API ────────────────────────────────────────────── */
  window.Notifications = { load, clear, updateBadge };

  /* Auto-load badge count on page load (without opening panel) */
  document.addEventListener('DOMContentLoaded', async () => {
    await new Promise(r => setTimeout(r, 400)); // slight defer so API calls happen after page modules init
    const counts = [];
    await Promise.allSettled([
      checkDocumentos(counts),
      checkAlmoxarifado(counts),
      checkMaquinas(counts),
    ]);
    const dismissed = getDismissed();
    const visible = counts.filter(a => !dismissed.includes(a.id));
    updateBadge(visible.length);
  });

  // Re-renderiza painel se estiver aberto ao trocar o idioma
  document.addEventListener('zeiss:langchange', () => {
    const list = document.getElementById('notifList');
    if (list && list.children.length) load();
  });
})();

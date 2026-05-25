/**
 * ZEISS-PILOT — API.JS
 * Centralized Fetch wrapper with CSRF, error handling and retries
 */

'use strict';

const Api = (() => {

  /* ── Build headers ── */
  function headers(extra = {}) {
    const csrf = window.ZP?.CSRF;
    return {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
      ...(csrf ? { [csrf.header()]: csrf.token() } : {}),
      ...extra
    };
  }

  /* ── Core fetch ── */
  async function request(url, options = {}) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers: headers(options.headers),
        signal:  ctrl.signal
      });
    } catch (err) {
      const _t = k => window.I18n?.t(k) ?? k;
      if (err.name === 'AbortError') throw new Error(_t('Tempo de resposta esgotado. Verifique sua conexão.'));
      throw err;
    } finally {
      clearTimeout(timer);
    }

    const _t = k => window.I18n?.t(k) ?? k;
    if (res.status === 401) {
      window.location.href = '/login';
      throw new Error(_t('Sessão expirada.'));
    }

    if (res.status === 403) throw new Error(_t('Sem permissão para esta ação.'));
    if (res.status === 404) throw new Error(_t('Recurso não encontrado.'));

    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const body = await res.json();
        msg = body.message || body.error || msg;
      } catch { /* ignore */ }
      throw new Error(msg);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    }
    return res.text();
  }

  /* ── HTTP Methods ── */
  function get(url, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`${url}${qs ? '?' + qs : ''}`);
  }

  function post(url, body) {
    return request(url, { method: 'POST', body: JSON.stringify(body) });
  }

  function put(url, body) {
    return request(url, { method: 'PUT', body: JSON.stringify(body) });
  }

  function patch(url, body) {
    return request(url, { method: 'PATCH', body: JSON.stringify(body) });
  }

  function del(url) {
    return request(url, { method: 'DELETE' });
  }

  /* ── Multipart (for file uploads) ── */
  async function upload(url, formData) {
    const csrf = window.ZP?.CSRF;
    const res = await fetch(url, {
      method: 'POST',
      headers: csrf ? { [csrf.header()]: csrf.token() } : {},
      body: formData
    });
    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try { const b = await res.json(); msg = b.message || msg; } catch { /**/ }
      throw new Error(msg);
    }
    return res.json().catch(() => null);
  }

  /* ── Paginated GET helper ── */
  async function paginated(url, page = 0, size = 10, params = {}) {
    return get(url, { page, size, ...params });
  }

  return { get, post, put, patch, del, 'delete': del, upload, paginated, request };
})();

window.Api = Api;

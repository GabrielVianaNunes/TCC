/**
 * clientes.js — Módulo de Cadastro de Clientes
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  const API_URL = '/api/clientes';
  const RANKING_URL = '/clientes/relatorio';

  function _t(k) { return window.I18n?.t(k) ?? k; }

  function fmtMoeda(v) {
    return (v ?? 0).toLocaleString(window.I18n?.lang() || 'pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  async function init() {
    bindEvents();
    await loadClientes();
    await loadRanking();
  }

  function bindEvents() {
    document.getElementById('btnNovoCliente')?.addEventListener('click', abrirModalNovo);
    document.getElementById('btnCancelarCliente')?.addEventListener('click', fecharModal);
    document.getElementById('btnFecharModalCliente')?.addEventListener('click', fecharModal);
    document.getElementById('formCliente')?.addEventListener('submit', salvarCliente);
    Valid?.somenteLetras?.(document.getElementById('nome'));
    Mask?.cpfCnpj?.(document.getElementById('cpfOuCnpj'));
    Mask?.telefone?.(document.getElementById('telefone'));
  }

  function abrirModalNovo() {
    document.getElementById('formCliente').reset();
    document.getElementById('clienteId').value = '';
    abrirModal();
  }

  function abrirModal() {
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('modalCliente').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function fecharModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    document.getElementById('modalCliente').classList.remove('open');
    document.body.style.overflow = '';
  }

  async function loadClientes() {
    const tbody = document.getElementById('tbodyClientes');
    let clientes = [];
    try {
      clientes = await Api.get(API_URL);
    } catch {
      tbody.innerHTML = `<tr><td colspan="5">${_t('Erro ao carregar clientes.')}</td></tr>`;
      return;
    }

    if (!clientes.length) {
      tbody.innerHTML = `<tr><td colspan="5">${_t('Nenhum cliente cadastrado ainda.')}</td></tr>`;
      return;
    }

    tbody.innerHTML = clientes.map(c => `
      <tr data-id="${c.id}">
        <td>${escapeHtml(c.nome)}</td>
        <td>${escapeHtml(c.cpfOuCnpj)}</td>
        <td>${escapeHtml(c.telefone || '—')}</td>
        <td>${escapeHtml(c.email || '—')}</td>
        <td>
          <button class="btn btn--sm" data-action="editar" data-id="${c.id}">${_t('Editar')}</button>
          <button class="btn btn--sm btn--danger" data-action="excluir" data-id="${c.id}">${_t('Excluir')}</button>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('[data-action="editar"]').forEach(btn =>
      btn.addEventListener('click', () => editarCliente(btn.dataset.id, clientes)));
    tbody.querySelectorAll('[data-action="excluir"]').forEach(btn =>
      btn.addEventListener('click', () => excluirCliente(btn.dataset.id)));
  }

  function editarCliente(id, clientes) {
    const c = clientes.find(x => String(x.id) === String(id));
    if (!c) return;
    document.getElementById('clienteId').value = c.id;
    document.getElementById('nome').value = c.nome || '';
    document.getElementById('cpfOuCnpj').value = c.cpfOuCnpj || '';
    document.getElementById('endereco').value = c.endereco || '';
    document.getElementById('telefone').value = c.telefone || '';
    document.getElementById('email').value = c.email || '';
    abrirModal();
  }

  async function excluirCliente(id) {
    if (!confirm(_t('Tem certeza que deseja excluir este cliente?'))) return;
    try {
      await Api.delete(`${API_URL}/${id}`);
      Toast?.success?.(_t('Cliente excluído.'));
      await loadClientes();
      await loadRanking();
    } catch (err) {
      Toast?.error?.(err?.message || _t('Não foi possível excluir este cliente.'));
    }
  }

  async function salvarCliente(ev) {
    ev.preventDefault();
    const id = document.getElementById('clienteId').value;
    const payload = {
      nome: document.getElementById('nome').value.trim(),
      cpfOuCnpj: document.getElementById('cpfOuCnpj').value.trim(),
      endereco: document.getElementById('endereco').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      email: document.getElementById('email').value.trim(),
    };
    try {
      if (id) {
        await Api.put(`${API_URL}/${id}`, payload);
      } else {
        await Api.post(API_URL, payload);
      }
      fecharModal();
      Toast?.success?.(_t('Cliente salvo.'));
      await loadClientes();
      await loadRanking();
    } catch (err) {
      Toast?.error?.(err?.message || _t('Não foi possível salvar este cliente.'));
    }
  }

  async function loadRanking() {
    const tbody = document.getElementById('tbodyRanking');
    let ranking = [];
    try {
      ranking = await Api.get(RANKING_URL);
    } catch {
      tbody.innerHTML = `<tr><td colspan="5">${_t('Erro ao carregar o ranking.')}</td></tr>`;
      return;
    }

    if (!ranking.length) {
      tbody.innerHTML = `<tr><td colspan="5">${_t('Nenhum dado de receita ainda.')}</td></tr>`;
      return;
    }

    tbody.innerHTML = ranking.map(r => `
      <tr>
        <td>${escapeHtml(r.nome)}</td>
        <td>${fmtMoeda(r.receitaMes)}</td>
        <td>${r.qtdOsMes}</td>
        <td>${fmtMoeda(r.receitaAno)}</td>
        <td>${r.qtdOsAno}</td>
      </tr>`).join('');
  }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('zeiss:langchange', init);
})();

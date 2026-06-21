/**
 * avaliacao.js — Formulário de Avaliação / Satisfação
 * Zeiss-Pilot Frontend Redesign
 */
(function () {
  'use strict';

  const API = '/api/avaliacoes';
  let npsValue = null;

  // ── i18n helper ───────────────────────────────────────────────────────────
  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function classifyComentario(texto) {
    if (!texto) return null;
    const t = texto.toLowerCase();
    if (/reclama|problema|insatisf|demora|ruim|péssimo|horrível|lento|erro|falha|defeito/.test(t)) return 'reclamacao';
    if (/sugiro|sugestão|sugere|poderia|melhoria|melhorar|implementar|adicionar|incluir/.test(t)) return 'sugestao';
    if (/ótimo|excelente|parabéns|ótima|perfeito|muito bom|satisfeito|adorei|gostei|recomendo|nota 10/.test(t)) return 'elogio';
    return 'sugestao'; // default for any comment
  }

  // ── NPS Scale ─────────────────────────────────────────────────────────────
  function initNPS() {
    document.querySelectorAll('.aval-nps-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.aval-nps-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        npsValue = parseInt(btn.getAttribute('data-val'), 10);
      });
    });
  }

  // ── Radio visual ──────────────────────────────────────────────────────────
  function initRadios() {
    document.querySelectorAll('.aval-option input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        // Clear selected from group
        const name = radio.getAttribute('name');
        document.querySelectorAll(`.aval-option input[name="${name}"]`).forEach(r => {
          r.closest('.aval-option').classList.remove('selected');
        });
        radio.closest('.aval-option').classList.add('selected');

        // Q2: toggle Q3
        if (name === 'realizouServico') {
          const q3 = document.getElementById('q3Area');
          if (radio.value === 'Sim') q3.classList.add('visible');
          else                       q3.classList.remove('visible');
        }
      });
    });
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function submit() {
    const vinculoRadio = document.querySelector('input[name="vinculo"]:checked');
    const servicoRadio = document.querySelector('input[name="realizouServico"]:checked');
    const comentario   = document.getElementById('comentario').value.trim();

    // Vínculo
    let vinculo = vinculoRadio ? vinculoRadio.value : null;
    if (vinculo === 'Outra') {
      const outro = document.getElementById('vinculoOutra').value.trim();
      vinculo = outro ? `Outra: ${outro}` : 'Outra';
    }

    if (!vinculo) { Toast.error(_t('Selecione seu vínculo com o CEM (Pergunta 1).')); return; }
    if (npsValue === null) { Toast.error(_t('Informe sua nota de recomendação (Pergunta 4).')); return; }

    // Q3 obrigatória se realizou serviço
    const realizouServico = servicoRadio ? servicoRadio.value : null;
    let descServico = '';
    if (realizouServico === 'Sim') {
      descServico = document.getElementById('descServico').value.trim();
      if (!descServico) { Toast.error(_t('Descreva brevemente o serviço realizado (Pergunta 3).')); return; }
    }

    const tipoComentario = classifyComentario(comentario);

    const payload = {
      vinculo,
      realizouServico: realizouServico || 'Não respondeu',
      descServico,
      nps: npsValue,
      comentario,
      tipoComentario,
      data: new Date().toISOString(),
    };

    const btn = document.getElementById('btnEnviar');
    btn.disabled = true;
    btn.textContent = _t('Enviando...');

    try { await Api.post(API, payload); } catch { saveLocal(payload); }

    // Show success
    document.getElementById('formArea').style.display = 'none';
    const success = document.getElementById('successArea');
    success.classList.add('visible');
    Toast.success(_t('Avaliação enviada! Obrigado.'));
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function resetForm() {
    npsValue = null;
    document.querySelectorAll('.aval-option').forEach(o => o.classList.remove('selected'));
    document.querySelectorAll('.aval-nps-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    ['descServico', 'comentario', 'vinculoOutra'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('q3Area')?.classList.remove('visible');
    document.getElementById('successArea').classList.remove('visible');
    document.getElementById('formArea').style.display = '';
    document.getElementById('btnEnviar').disabled = false;
    document.getElementById('btnEnviar').innerHTML =
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>${_t('Enviar')}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Standalone mode (acesso via QR code) ─────────────────────────────────
  function initStandalone() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pub') === '1') {
      document.body.classList.add('standalone');
    }
  }

  // ── Persistência local (para o dashboard ler) ─────────────────────────────
  function saveLocal(payload) {
    try {
      const key  = 'zp-avaliacoes';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      payload.id = Date.now();
      list.unshift(payload);
      localStorage.setItem(key, JSON.stringify(list));
    } catch { /* non-fatal */ }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initStandalone();
    initNPS();
    initRadios();
    document.getElementById('btnEnviar')?.addEventListener('click', submit);
    document.getElementById('btnNovaResposta')?.addEventListener('click', resetForm);
  });

  // ── Language change — re-aplica textos dinâmicos ─────────────────────────
  document.addEventListener('zeiss:langchange', () => {
    const btn = document.getElementById('btnEnviar');
    if (btn && !btn.disabled) {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>${_t('Enviar')}`;
    }
  });

})();

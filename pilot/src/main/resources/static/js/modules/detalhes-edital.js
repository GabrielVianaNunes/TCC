/**
 * detalhes-edital.js — Página de Detalhes do Edital
 * Reads the edital ID from the URL path (/editais/{id}),
 * fetches from /api/editais/{id} and populates the DOM.
 * In production (Spring Boot + Thymeleaf) the server pre-renders
 * the values — this module is the dev-mode equivalent.
 */
(function () {
  'use strict';

  function _t(ptBR) { return window.I18n?.t(ptBR) ?? ptBR; }

  const STATUS_COLORS = {
    'Aprovado':             { bg: 'var(--color-success-bg)', border: 'var(--color-success-border)', text: 'var(--color-success)' },
    'Reprovado':            { bg: 'var(--color-danger-bg)',  border: 'var(--color-danger-border)',  text: 'var(--color-danger)'  },
    'Aguardando aprovação': { bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'var(--color-warning)' },
    'Prestação de contas':  { bg: 'var(--color-info-bg)',    border: 'var(--color-info-border)',    text: 'var(--color-info)'    },
    'Finalizado':           { bg: 'var(--color-neutral-bg)', border: 'var(--color-neutral-border)', text: 'var(--text-muted)'    },
  };

  function applyStatusChips(status) {
    const c = STATUS_COLORS[status] || STATUS_COLORS['Finalizado'];
    document.querySelectorAll('.status-chip').forEach(chip => {
      chip.textContent = status;
      chip.style.background = c.bg;
      chip.style.border = `1px solid ${c.border}`;
      chip.style.color = c.text;
    });
  }

  function fmtCurrency(val) {
    if (val == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  }

  function populate(e) {
    // <title>
    document.title = `${e.nomeEdital} — Editais · SENAI Zeiss`;

    // breadcrumb + heading
    setText('editalBreadcrumb', e.nomeEdital);
    setText('editalTitulo',     e.nomeEdital);
    setText('editalIdSpan',     `#${e.id}`);

    // Detail fields
    setText('editalNomeDetalhe', e.nomeEdital);
    setText('editalFornecedora', e.instituicaoFornecedora);
    setText('editalParceira',    e.instituicaoParceira);
    setText('editalValor',       fmtCurrency(e.valor));

    // Observação
    const obs = document.getElementById('editalObservacao');
    if (obs) {
      if (e.observacao && e.observacao.trim()) {
        obs.textContent = e.observacao;
        obs.classList.remove('observacao-block--empty');
      } else {
        obs.textContent = _t('Nenhuma observação registrada.');
        obs.classList.add('observacao-block--empty');
      }
    }

    // Status chips
    applyStatusChips(e.status || '—');
  }

  async function init() {
    // Extract ID from URL: /editais/3 or /editais/3?...
    const match = location.pathname.match(/\/editais\/(\d+)/);
    if (!match) return; // not a detail page (or rendered by Spring Boot already)

    const id = match[1];
    try {
      const edital = await Api.get(`/api/editais/${id}`);
      populate(edital);
    } catch (err) {
      Toast.show({ type: 'error', message: `${_t('Edital')} #${id} ${_t('não encontrado.')}` });
      const titulo = document.getElementById('editalTitulo');
      if (titulo) titulo.textContent = _t('Edital não encontrado');
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  // Re-popula a página ao trocar o idioma (textos fixos do DOM são reescritos)
  document.addEventListener('zeiss:langchange', () => {
    const obs = document.getElementById('editalObservacao');
    if (obs && obs.classList.contains('observacao-block--empty')) {
      obs.textContent = _t('Nenhuma observação registrada.');
    }
  });
})();

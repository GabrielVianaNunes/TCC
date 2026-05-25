// /js/documentosPorSubpasta.js
document.addEventListener("DOMContentLoaded", () => {
  const tabela           = document.getElementById("tabelaDocumentos");
  const filtroNome       = document.getElementById("filtroNome");
  const filtroStatus     = document.getElementById("filtroStatus");
  const spanPaginaAtual  = document.getElementById("paginaAtual");
  const btnAnterior      = document.getElementById("btnAnterior");
  const btnProximo       = document.getElementById("btnProximo");

  // CSRF (se estiver disponível via Thymeleaf)
  const csrfToken  = window.csrfToken  || "";
  const csrfHeader = window.csrfHeader || "";

  // subpastaId da URL
  const urlParams  = new URLSearchParams(window.location.search);
  const subpastaId = urlParams.get("id");

  let paginaAtual   = 0;
  const tamanhoPag  = 8;
  let totalPaginas  = 1;

  // === Modal refs
  const modal             = document.getElementById("modalEdicao");
  const inputNovaData     = document.getElementById("inputNovaData");
  const btnSalvarEdicao   = document.getElementById("btnSalvarEdicao");
  const btnExcluirDoc     = document.getElementById("btnExcluirDoc");
  const btnCancelarEd     = document.getElementById("btnCancelarEd");

  let docSelecionadoId = null;

  function carregarDocumentos() {
    if (!subpastaId) {
      console.error("ID da subpasta não encontrado na URL.");
      renderizarTabela([]);
      atualizarPaginacao(1);
      return;
    }

    const nome   = (filtroNome?.value || "").trim();
    const status = (filtroStatus?.value || "").trim();

    const params = new URLSearchParams();
    if (nome)   params.append("nome", nome);
    if (status) params.append("status", status);
    params.append("page", paginaAtual);
    params.append("size", tamanhoPag);

    fetch(`/api/documentos/subpasta/${encodeURIComponent(subpastaId)}?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ${res.status} ao buscar documentos.`);
        return res.json();
      })
      .then(data => {
        const documentos = Array.isArray(data?.content) ? data.content : [];
        totalPaginas = Number.isFinite(data?.totalPages) ? data.totalPages : 1;
        renderizarTabela(documentos);
        atualizarPaginacao(totalPaginas);
      })
      .catch(err => {
        console.error("Erro ao carregar documentos:", err);
        renderizarTabela([]);
        atualizarPaginacao(1);
      });
  }

  function renderizarTabela(documentos) {
    tabela.innerHTML = "";

    if (!documentos.length) {
      tabela.innerHTML = `<tr><td colspan="4">Nenhum documento encontrado.</td></tr>`;
      return;
    }

    documentos.forEach(doc => {
      // papel do usuário vindo do DTO (preferencial) ou global
      const papel = doc.usuarioRole || window.usuarioRole || "";
      const isAdmin = String(papel).toUpperCase() === "ROLE_ADMIN" || String(papel).toUpperCase() === "ADMIN";

      // datas e status
      const dataExp = doc.dataExpiracao
        ? new Date(doc.dataExpiracao).toLocaleDateString("pt-BR")
        : "-";

      const statusRaw = (doc.status || "").toString();
      const statusFmt = statusRaw
        ? statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase()
        : "-";
      const classeStatus = statusRaw.toLowerCase().replace(/\s+/g, "-");

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(doc.nomeArquivo || doc.nome || "—")}</td>
        <td>${dataExp}</td>
        <td><span class="status ${classeStatus}">${escapeHtml(statusFmt)}</span></td>
        <td>
          <button class="acao abrir"  data-id="${Number(doc.id)}">Abrir</button>
          ${
            isAdmin
              ? `<button class="acao editar" data-id="${Number(doc.id)}" data-data="${escapeAttr(doc.dataExpiracao || "")}">Editar</button>`
              : ""
          }
        </td>
      `;
      tabela.appendChild(tr);
    });

    // Delegação de eventos (melhor que inline)
    tabela.querySelectorAll('button.acao.abrir').forEach(btn => {
      btn.addEventListener('click', () => abrirPDF(btn.dataset.id));
    });
    tabela.querySelectorAll('button.acao.editar').forEach(btn => {
      btn.addEventListener('click', () => abrirModalEdicao(btn.dataset.id, btn.dataset.data));
    });
  }

  function atualizarPaginacao(totalPages) {
    btnAnterior.disabled = paginaAtual <= 0;
    btnProximo.disabled  = paginaAtual >= (totalPages - 1);
    spanPaginaAtual.textContent = (paginaAtual + 1);
  }

  // Navegação
  window.paginaAnterior = () => {
    if (paginaAtual > 0) {
      paginaAtual--;
      carregarDocumentos();
    }
  };

  window.proximaPagina = () => {
    if (paginaAtual < totalPaginas - 1) {
      paginaAtual++;
      carregarDocumentos();
    }
  };

  // Ações
  function abrirPDF(id) {
    window.open(`/api/documentos/abrir/${encodeURIComponent(id)}`, "_blank");
  }

  // === Modal de Edição ===
  function abrirModalEdicao(id, dataISO) {
    docSelecionadoId = Number(id) || null;
    inputNovaData.value = (dataISO || "").substring(0, 10); // yyyy-MM-dd
    mostrarModal(true);
  }

  function fecharModal() {
    mostrarModal(false);
    docSelecionadoId = null;
    inputNovaData.value = "";
  }

  function mostrarModal(flag) {
    if (!modal) return;
    if (flag) {
      modal.style.display = "flex";
      setTimeout(() => modal.classList.add("mostrar"), 10);
    } else {
      modal.classList.remove("mostrar");
      setTimeout(() => modal.style.display = "none", 200);
    }
  }

  // Salvar (PUT expiração)
  btnSalvarEdicao?.addEventListener("click", async () => {
    if (!docSelecionadoId) return;
    const novaData = inputNovaData.value;
    if (!novaData) { alert("Informe a nova data de expiração."); return; }

    const headers = new Headers();
    if (csrfHeader && csrfToken) headers.append(csrfHeader, csrfToken);

    try {
      const res = await fetch(`/api/documentos/${encodeURIComponent(docSelecionadoId)}/expiracao?data=${encodeURIComponent(novaData)}`, {
        method: "PUT",
        headers
      });
      if (!res.ok) throw new Error("Falha ao atualizar data");
      fecharModal();
      carregarDocumentos();
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar a data.");
    }
  });

  // Excluir (DELETE)
  btnExcluirDoc?.addEventListener("click", async () => {
    if (!docSelecionadoId) return;
    if (!confirm("Deseja realmente excluir este documento?")) return;

    const headers = new Headers();
    if (csrfHeader && csrfToken) headers.append(csrfHeader, csrfToken);

    try {
      const res = await fetch(`/api/documentos/${encodeURIComponent(docSelecionadoId)}`, {
        method: "DELETE",
        headers
      });
      if (!res.ok) throw new Error("Falha ao excluir");
      fecharModal();
      carregarDocumentos();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir documento.");
    }
  });

  // Cancelar/fechar
  btnCancelarEd?.addEventListener("click", fecharModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal(); // clique fora
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.style.display === "flex") fecharModal();
  });

  // Filtros
  window.limparFiltros = () => {
    if (filtroNome)   filtroNome.value = "";
    if (filtroStatus) filtroStatus.value = "";
    paginaAtual = 0;
    carregarDocumentos();
  };

  filtroNome?.addEventListener("input", () => {
    paginaAtual = 0;
    carregarDocumentos();
  });

  filtroStatus?.addEventListener("change", () => {
    paginaAtual = 0;
    carregarDocumentos();
  });

  // Utilitários
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // Bootstrap
  carregarDocumentos();
});

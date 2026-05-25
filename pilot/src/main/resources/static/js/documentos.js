// documentos.js (apenas upload)
document.addEventListener("DOMContentLoaded", function () {
  // === CONFIG ===
  const UPLOAD_URL = "/api/documentos/upload"; // ajuste para "/api/documentos" se seu Controller estiver assim

  // CSRF (Spring Security via Thymeleaf)
  const csrfToken  = window.csrfToken  || "";
  const csrfHeader = window.csrfHeader || "";

  // Elementos principais
  const form           = document.getElementById("formDocumento");
  const botaoToggle    = document.getElementById("btnMostrarUpload");
  const pastaSelect    = document.getElementById("pastaSelect");
  const subpastaSelect = document.getElementById("subpastaSelect");
  const inputArquivo   = document.getElementById("arquivo");
  const spanArquivo    = document.getElementById("arquivoSelecionado");
  const inputExp       = document.getElementById("dataExpiracao");

  // === UI: mostrar/ocultar formulário ===
  botaoToggle.addEventListener("click", () => {
    const aberto = form.classList.contains("ativo");
    form.classList.toggle("ativo");
    botaoToggle.textContent = aberto ? "Adicionar Arquivo" : "Fechar Formulário";
    if (!aberto) {
      const offsetTop = form.getBoundingClientRect().top + window.scrollY - 280;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  });

  // === Upload ===
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const arquivo       = inputArquivo.files[0];
    const dataExpiracao = inputExp.value;
    const pastaId       = pastaSelect.value;
    const subpastaId    = subpastaSelect.value;

    // Validações
    if (!arquivo)        { alert("Selecione um arquivo PDF."); return; }
    if (!pastaId)        { alert("Selecione uma pasta."); return; }
    if (!subpastaId)     { alert("Selecione uma subpasta."); return; }
    if (!dataExpiracao)  { alert("Informe a data de expiração."); return; }

    // Monta FormData
    const fd = new FormData();
    fd.append("arquivo", arquivo);
    fd.append("dataExpiracao", dataExpiracao);
    fd.append("subpastaId", subpastaId);
    // Se o backend também usa pastaId por algum motivo, mantenha:
    // fd.append("pastaId", pastaId);
    // Caso tenha mais campos (nome, etc.), adicione-os aqui:
    // fd.append("nome", document.getElementById("nome").value);

    const headers = new Headers();
    if (csrfHeader && csrfToken) headers.append(csrfHeader, csrfToken);

    try {
      const resp = await fetch(UPLOAD_URL, {
        method: "POST",
        body: fd,
        headers
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        console.error("Erro no upload:", txt || resp.status);
        alert("Erro ao enviar documento.");
        return;
      }

      // Sucesso
      alert("Documento enviado com sucesso!");
      form.reset();
      spanArquivo.textContent = "Nenhum arquivo selecionado";

      // Redireciona para a página que lista pelos documentos da subpasta
      window.location.href = `/documentosPorSubpasta?id=${encodeURIComponent(subpastaId)}`;
    } catch (err) {
      console.error(err);
      alert("Erro na requisição.");
    }
  });

  // === Carregar Pastas ===
  async function carregarPastasDisponiveis() {
    try {
      const resp = await fetch("/api/pastas");
      if (!resp.ok) throw new Error("Falha ao buscar pastas");
      const pastas = await resp.json();

      pastaSelect.innerHTML = '<option value="">Selecione uma pasta</option>';
      (pastas || []).forEach((pasta) => {
        const option = document.createElement("option");
        option.value = pasta.id;
        option.textContent = `${pasta.nome} ${pasta.tipoAcesso === "INTERNO" ? "🔒" : "🔓"}`;
        pastaSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar pastas:", error);
      pastaSelect.innerHTML = '<option value="">Erro ao carregar pastas</option>';
    }
  }

  // === Carregar Subpastas ao trocar a pasta ===
  pastaSelect.addEventListener("change", function () {
    carregarSubpastas(this.value);
  });

  function carregarSubpastas(pastaId) {
    subpastaSelect.innerHTML = '<option value="">Carregando...</option>';
    subpastaSelect.disabled = true;

    if (!pastaId) {
      subpastaSelect.innerHTML = '<option value="">Selecione uma subpasta</option>';
      return;
    }

    fetch(`/api/pastas/${encodeURIComponent(pastaId)}/subpastas`)
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao buscar subpastas");
        return r.json();
      })
      .then((subpastas) => {
        if (!subpastas || subpastas.length === 0) {
          subpastaSelect.innerHTML = '<option value="">Nenhuma subpasta encontrada</option>';
          return;
        }
        subpastaSelect.innerHTML = '<option value="">Selecione uma subpasta</option>';
        subpastas.forEach((sub) => {
          const option = document.createElement("option");
          option.value = sub.id;
          option.textContent = `${sub.nome} ${sub.tipoAcesso === "INTERNO" ? "🔒" : "🔓"}`;
          subpastaSelect.appendChild(option);
        });
        subpastaSelect.disabled = false;
      })
      .catch((err) => {
        console.error("Erro ao carregar subpastas:", err);
        subpastaSelect.innerHTML = '<option value="">Erro ao carregar</option>';
      });
  }

  // === UX: mostrar nome do arquivo ===
  inputArquivo.addEventListener("change", function () {
    const nome = this.files.length > 0 ? this.files[0].name : "Nenhum arquivo selecionado";
    spanArquivo.textContent = nome;
  });

  // Bootstrap inicial
  carregarPastasDisponiveis();
});

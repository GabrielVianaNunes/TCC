let projetosGlobais = [];
let paginaAtual = 1;
const projetosPorPagina = 10;
let projetoEditando = null; 
let termoPesquisa = "";

document.addEventListener("DOMContentLoaded", function () {
  carregarResponsaveisADMIN();

  fetch("/projetos/api")
    .then(response => response.json())
    .then(data => {
      projetosGlobais = data;
      aplicarFiltros();
    })
    .catch(erro => console.error("Erro ao buscar projetos:", erro));

  document.getElementById("custoAnualPrevisto").addEventListener("input", function () {
    formatarParaReal(this);
  });

  document.getElementById("retornoPrevisto").addEventListener("input", function () {
    formatarParaReal(this);
  });

  document.getElementById("btnLimparFiltros")?.addEventListener("click", function () {
    document.getElementById("filtroStatus").value = "";
    document.getElementById("filtroPrioridade").value = "";
    document.getElementById("filtroResponsavel").value = "";
    paginaAtual = 1;
    aplicarFiltros();
  });

  document.getElementById("filtroStatus").addEventListener("change", aplicarFiltros);
  document.getElementById("filtroPrioridade").addEventListener("change", aplicarFiltros);
  document.getElementById("filtroResponsavel").addEventListener("change", aplicarFiltros);

  configurarModalProjeto();
});


function carregarResponsaveisADMIN() {
  fetch("/usuarios/api/admins")
    .then(response => response.json())
    .then(admins => {
      const selectCadastro = document.getElementById("responsavelId");
      if (selectCadastro) {
        selectCadastro.innerHTML = "<option value=''>Selecione um responsável</option>";
        admins.forEach(admin => {
          const option = document.createElement("option");
          option.value = admin.id;
          option.textContent = admin.nome;
          selectCadastro.appendChild(option);
        });
      }

      const selectFiltro = document.getElementById("filtroResponsavel");
      if (selectFiltro) {
        selectFiltro.innerHTML = "<option value=''>Todos</option>";
        admins.forEach(admin => {
          const option = document.createElement("option");
          option.value = admin.nome;
          option.textContent = admin.nome;
          selectFiltro.appendChild(option);
        });
      }
    })
    .catch(error => console.error("Erro ao carregar responsáveis ADMIN:", error));
}

document.getElementById("barraPesquisa").addEventListener("input", function () {
  termoPesquisa = this.value;
  paginaAtual = 1;
  aplicarFiltros();
});

function aplicarFiltros() {
  const status = document.getElementById("filtroStatus").value;
  const prioridade = document.getElementById("filtroPrioridade").value;
  const responsavel = document.getElementById("filtroResponsavel").value;

  const filtrados = projetosGlobais.filter(p => {
    const statusOK = !status || p.status === status;
    const prioridadeOK = !prioridade || p.prioridade === prioridade;
    const responsavelOK = !responsavel || p.responsavelNome === responsavel;
    const nomeOK = !termoPesquisa || p.nomeProjeto.toLowerCase().includes(termoPesquisa.toLowerCase());
    return statusOK && prioridadeOK && responsavelOK && nomeOK;
  });

  renderizarTabelaPaginada(filtrados);
}

function formatarDataCurta(data) {
  if (!data) return "-";
  const partes = data.split("-");
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano.slice(2)}`;
  }
  return data;
}

function renderizarTabelaPaginada(lista) {
  const tbody = document.querySelector("#tabelaProjetos tbody");
  tbody.innerHTML = "";

  const totalPaginas = Math.ceil(lista.length / projetosPorPagina);
  const inicio = (paginaAtual - 1) * projetosPorPagina;
  const fim = inicio + projetosPorPagina;
  const paginaProjetos = lista.slice(inicio, fim);

  paginaProjetos.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nomeProjeto}</td>
      <td>${p.responsavelNome || "-"}</td>
      <td>${p.prioridade}</td>
      <td class="valor-pequeno">${formatarParaRealValor(p.custoAnualPrevisto)}</td>
      <td class="valor-pequeno">${formatarParaRealValor(p.retornoPrevisto)}</td>
      <td>${p.status}</td>
      <td>${formatarDataCurta(p.previsaoInicio)}</td>
      <td>${formatarDataCurta(p.previsaoTermino)}</td>
      <td>${formatarDataCurta(p.dataRealFinalizacao)}</td>
      <td>
        <button class="setting-btn" title="Editar Projeto" onclick='editarProjeto(${JSON.stringify(p).replace(/'/g, "\\'")})'>
          <span class="bar bar1"></span>
          <span class="bar bar2"></span>
          <span class="bar bar1"></span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  atualizarControlesPaginacao(totalPaginas);
}

function atualizarControlesPaginacao(total) {
  document.getElementById("paginacaoInfo").textContent = `Página ${paginaAtual} de ${total}`;
  document.getElementById("btnAnterior").disabled = paginaAtual === 1;
  document.getElementById("btnProximo").disabled = paginaAtual === total;
  const infoSpan = document.getElementById("paginacaoInfo");
  if (infoSpan) {
    infoSpan.textContent = "";
  }
}

function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    aplicarFiltros();
  }
}

function proximaPagina() {
  const total = Math.ceil(projetosGlobais.filter(p => {
    const status = document.getElementById("filtroStatus").value;
    const prioridade = document.getElementById("filtroPrioridade").value;
    const responsavel = document.getElementById("filtroResponsavel").value;
    const statusOK = !status || p.status === status;
    const prioridadeOK = !prioridade || p.prioridade === prioridade;
    const responsavelOK = !responsavel || p.responsavelNome === responsavel;
    return statusOK && prioridadeOK && responsavelOK;
  }).length / projetosPorPagina);

  if (paginaAtual < total) {
    paginaAtual++;
    aplicarFiltros();
  }
}

document.getElementById("formProjeto").addEventListener("submit", function (e) {
  e.preventDefault();

  const custo = parseFloat(document.getElementById("custoAnualPrevisto").value.replace("R$ ", "").replace(/\./g, "").replace(",", "."));
  const retorno = parseFloat(document.getElementById("retornoPrevisto").value.replace("R$ ", "").replace(/\./g, "").replace(",", "."));

  const projeto = {
    id: projetoEditando?.id,
    nomeProjeto: document.getElementById("nomeProjeto").value,
    objetivo: document.getElementById("objetivo").value,
    atividades: document.getElementById("atividades").value,
    responsavel: document.getElementById("responsavelId").value
      ? { id: parseInt(document.getElementById("responsavelId").value) }
      : null,
    prioridade: document.getElementById("prioridade").value,
    custoAnualPrevisto: custo,
    retornoPrevisto: retorno,
    status: document.getElementById("status").value,
    observacao: document.getElementById("observacao").value,
    previsaoInicio: document.getElementById("previsaoInicio").value,
    previsaoTermino: document.getElementById("previsaoTermino").value,
    dataRealFinalizacao: document.getElementById("dataRealFinalizacao").value
  };

  const metodo = projeto.id ? "PUT" : "POST";
  const url = projeto.id ? `/projetos/api/${projeto.id}` : "/projetos/api";

  const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
  const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

  fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      [csrfHeader]: csrfToken
    },
    body: JSON.stringify(projeto)
  })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(() => {
      alert(projeto.id ? "Projeto atualizado com sucesso!" : "Projeto cadastrado com sucesso!");
      document.getElementById("modalProjeto").style.display = "none";
      projetoEditando = null;
      return fetch("/projetos/api");
    })
    .then(r => r.json())
    .then(data => {
      projetosGlobais = data;
      aplicarFiltros();
    })
    .catch(() => alert("Erro ao salvar projeto."));
});

function editarProjeto(p) {
  projetoEditando = p;

  document.getElementById("tituloModal").textContent = "Editar Projeto";
  document.getElementById("nomeProjeto").value = p.nomeProjeto;
  document.getElementById("objetivo").value = p.objetivo;
  document.getElementById("atividades").value = p.atividades;
  document.getElementById("responsavelId").value = p.responsavelId || "";
  document.getElementById("prioridade").value = p.prioridade;
  document.getElementById("custoAnualPrevisto").value = formatarParaRealValor(p.custoAnualPrevisto);
  document.getElementById("retornoPrevisto").value = formatarParaRealValor(p.retornoPrevisto);
  document.getElementById("status").value = p.status;
  document.getElementById("observacao").value = p.observacao;
  document.getElementById("previsaoInicio").value = p.previsaoInicio || "";
  document.getElementById("previsaoTermino").value = p.previsaoTermino || "";
  document.getElementById("dataRealFinalizacao").value = p.dataRealFinalizacao || "";

  document.getElementById("modalProjeto").style.display = "block";

  // Remove o botão antigo, se existir
  const btnAntigo = document.getElementById("btnExcluirProjeto");
  if (btnAntigo) btnAntigo.remove();

  // Cria um novo botão de exclusão
  const btn = document.createElement("button");
  btn.id = "btnExcluirProjeto";
  btn.textContent = "Excluir Projeto";
  btn.style.backgroundColor = "#dc3545";
  btn.style.marginTop = "10px";
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.padding = "10px";
  btn.style.borderRadius = "5px";
  btn.style.cursor = "pointer";

  btn.onclick = () => {
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
      const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

      fetch(`/projetos/api/${p.id}`, {
        method: "DELETE",
        headers: {
          [csrfHeader]: csrfToken
        }
      })
        .then(res => res.ok ? res.text() : Promise.reject())
        .then(() => {
          alert("Projeto excluído com sucesso!");
          document.getElementById("modalProjeto").style.display = "none";
          projetoEditando = null;
          return fetch("/projetos/api");
        })
        .then(r => r.json())
        .then(data => {
          projetosGlobais = data;
          aplicarFiltros();
        })
        .catch(() => alert("Erro ao excluir projeto."));
    }
  };

  document.getElementById("formProjeto").appendChild(btn);
}

function formatarParaReal(input) {
  let valor = input.value.replace(/\D/g, "");
  valor = (parseInt(valor, 10) / 100).toFixed(2) + "";
  valor = valor.replace(".", ",");
  valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  input.value = "R$ " + valor;
}

function formatarParaRealValor(valor) {
  valor = (parseFloat(valor) || 0).toFixed(2).toString().replace(".", ",");
  return "R$ " + valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}

function configurarModalProjeto() {
  const modal = document.getElementById("modalProjeto");
  const btnAbrirModal = document.getElementById("btnAbrirModal");
  const spanFechar = modal.querySelector(".fechar");
  const form = document.getElementById("formProjeto");

  btnAbrirModal.onclick = () => {
    form.reset();
    projetoEditando = null;
    document.getElementById("tituloModal").textContent = "Cadastrar Projeto";
    const btnExcluir = document.getElementById("btnExcluirProjeto");
    if (btnExcluir) btnExcluir.remove();
    modal.style.display = "block";
  };

  spanFechar.onclick = () => {
    modal.style.display = "none";
    form.reset();
    projetoEditando = null;
    const btnExcluir = document.getElementById("btnExcluirProjeto");
    if (btnExcluir) btnExcluir.remove();
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      form.reset();
      projetoEditando = null;
      const btnExcluir = document.getElementById("btnExcluirProjeto");
      if (btnExcluir) btnExcluir.remove();
    }
  };
}

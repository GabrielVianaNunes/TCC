let usuariosGlobais = [];
let paginaAtual = 1;
const itensPorPagina = 10;

const modal = document.getElementById("modal");
const btnAbrirModal = document.getElementById("btnAbrirModal");
const btnFecharModal = document.getElementById("fecharModal");
const form = document.getElementById("formUsuario");
const tabelaBody = document.querySelector("#tabelaUsuarios tbody");

const filtroRole = document.getElementById("filtroRole");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");

const btnAnterior = document.getElementById("btnAnterior");
const btnProximo = document.getElementById("btnProximo");
const paginacaoInfo = document.getElementById("paginacaoInfo");

const roleSelect = document.getElementById("role");
const campoSenha = document.getElementById("campoSenha");
const senhaInput = document.getElementById("senha");

const modalSenhaConfirmacao = document.getElementById("modalSenhaConfirmacao");
const senhaConfirmacaoInput = document.getElementById("senhaConfirmacaoInput");
const btnConfirmarSenha = document.getElementById("btnConfirmarSenha");
const btnCancelarSenha = document.getElementById("btnCancelarSenha");
const btnExcluirUsuario = document.getElementById("btnExcluirUsuario");

// CSRF Token
const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');

let usuarioSendoEditado = null;

// Eventos
window.onload = carregarUsuarios;
btnAbrirModal.onclick = () => {
  abrirModal();
  form.setAttribute("data-modo", "criar");
};
btnFecharModal.onclick = fecharModal;
window.onclick = e => { if (e.target === modal) fecharModal(); };

filtroRole.addEventListener("change", () => {
  paginaAtual = 1;
  carregarUsuarios();
});
btnLimparFiltros.onclick = () => {
  filtroRole.value = "";
  paginaAtual = 1;
  carregarUsuarios();
};

btnAnterior.onclick = () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    renderizarTabelaPaginada(usuariosGlobais);
  }
};

btnProximo.onclick = () => {
  const total = Math.ceil(usuariosGlobais.length / itensPorPagina);
  if (paginaAtual < total) {
    paginaAtual++;
    renderizarTabelaPaginada(usuariosGlobais);
  }
};

roleSelect.addEventListener("change", () => {
  campoSenha.style.display = (roleSelect.value === "ADMIN") ? "block" : "none";
  senhaInput.required = (roleSelect.value === "ADMIN");
});

function abrirModal() {
  modal.style.display = "block";
  senhaInput.value = "";
  form.setAttribute("data-modo", "criar");
  campoSenha.style.display = (roleSelect.value === "ADMIN") ? "block" : "none";
  btnExcluirUsuario.style.display = "none";
}

function fecharModal() {
  modal.style.display = "none";
  form.reset();
}

function carregarUsuarios() {
  const role = filtroRole.value;
  const url = role ? `/usuarios/api?role=${role}` : `/usuarios/api`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      usuariosGlobais = data;
      renderizarTabelaPaginada(data);
    })
    .catch(err => console.error("Erro ao buscar usuários:", err));
}

function renderizarTabelaPaginada(lista) {
  tabelaBody.innerHTML = "";

  const totalPaginas = Math.ceil(lista.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const pagina = lista.slice(inicio, fim);

  pagina.forEach(usuario => adicionarLinha(usuario));

  paginacaoInfo.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  btnAnterior.disabled = paginaAtual === 1;
  btnProximo.disabled = paginaAtual === totalPaginas;
}

function adicionarLinha(usuario) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${usuario.nome}</td>
    <td>${usuario.email}</td>
    <td>${usuario.role}</td>
    <td>
      <button class="btn btn-edit" onclick="editarUsuario(${usuario.id})">Editar</button>
    </td>
  `;

  tabelaBody.appendChild(tr);
}


form.onsubmit = function (e) {
  e.preventDefault();

  const modo = form.getAttribute("data-modo");
  const id = form.getAttribute("data-id");

  const usuario = {
    nome: form.nome.value,
    email: form.email.value,
    role: form.role.value
  };

  if (form.role.value === "ADMIN") {
    usuario.senha = senhaInput.value;
  }

  const url = (modo === "editar") ? `/usuarios/api/${id}` : "/usuarios/api";
  const method = (modo === "editar") ? "PUT" : "POST";

  fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      [csrfHeader]: csrfToken
    },    
    body: JSON.stringify(usuario)
  })
    .then(res => {
      if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);
      return res.json();
    })
    .then(() => {
      carregarUsuarios();
      fecharModal();
    })
    .catch(err => console.error("Erro ao adicionar/atualizar usuário:", err));
};

function deletarUsuario(id) {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    fetch(`/usuarios/api/${id}`, {
      method: "DELETE",
      headers: {
        [csrfHeader]: csrfToken
      }
    })
  
    .then(() => carregarUsuarios())
    .catch(err => console.error("Erro ao deletar:", err));
}

function editarUsuario(id) {
  fetch(`/usuarios/api/${id}`)
    .then(res => res.json())
    .then(usuario => {
      if (!usuario) return alert("Usuário não encontrado");

      if (usuario.role === "ADMIN") {
        usuarioSendoEditado = usuario;
        abrirModalSenhaConfirmacao();
      } else {
        preencherFormularioEdicao(usuario);
      }
    });
}

function preencherFormularioEdicao(usuario) {
  form.setAttribute("data-modo", "editar");
  form.setAttribute("data-id", usuario.id);
  form.nome.value = usuario.nome;
  form.email.value = usuario.email;
  form.role.value = usuario.role;
  campoSenha.style.display = (usuario.role === "ADMIN") ? "block" : "none";
  modal.style.display = "block";
  btnExcluirUsuario.style.display = "inline-block";

  btnExcluirUsuario.onclick = () => {
  if (confirm("Tem certeza que deseja excluir este usuário?")) {
    fetch(`/usuarios/api/${usuario.id}`, {
      method: "DELETE",
      headers: {
        [csrfHeader]: csrfToken
      }
    })
    .then(() => {
      carregarUsuarios();
      fecharModal();
      exibirNotificacao("Usuário excluído com sucesso.");
    })
    .catch(err => {
      exibirNotificacao("Erro ao excluir usuário.");
      console.error(err);
    });
  }
};

}

// Modal de confirmação de senha
btnConfirmarSenha.onclick = () => {
  const senhaDigitada = senhaConfirmacaoInput.value.trim();

  if (senhaDigitada.length < 3) {
    alert("Senha muito curta.");
    return;
  }

  fetch("/usuarios/api/validar-senha-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [csrfHeader]: csrfToken
    },
    body: JSON.stringify({ senha: senhaDigitada })
  })
  .then(res => res.json())
  .then(isValido => {
    if (!isValido) {
      exibirNotificacao("Senha incorreta. Ação cancelada.");
      return;
    }
    // Agora que está validado, podemos abrir o modal de edição
    modalSenhaConfirmacao.style.display = "none";
    preencherFormularioEdicao(usuarioSendoEditado);
  })
  .catch(err => {
    exibirNotificacao("Erro ao validar senha do administrador.");
    console.error(err);
  });
};


btnCancelarSenha.onclick = () => {
  modalSenhaConfirmacao.style.display = "none";
  senhaConfirmacaoInput.value = "";
  usuarioSendoEditado = null;
};

// ESC fecha modais
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (modalSenhaConfirmacao.style.display === "block") {
      modalSenhaConfirmacao.style.display = "none";
      senhaConfirmacaoInput.value = "";
      usuarioSendoEditado = null;
    } else if (modal.style.display === "block") {
      fecharModal();
    }
  }
});

function abrirModalSenhaConfirmacao() {
  senhaConfirmacaoInput.value = "";
  modalSenhaConfirmacao.style.display = "block";
  setTimeout(() => senhaConfirmacaoInput.focus(), 100);
}

function exibirNotificacao(mensagem, duracao = 3000) {
  const notificacao = document.getElementById("notificacao");
  notificacao.textContent = mensagem;
  notificacao.classList.add("mostrar");

  setTimeout(() => {
    notificacao.classList.remove("mostrar");
  }, duracao);
}

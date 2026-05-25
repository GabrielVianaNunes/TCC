document.addEventListener("DOMContentLoaded", () => {
  carregarPastas();

  document.getElementById("btnFecharModalSubpastas").addEventListener("click", () => {
    modalSubpastas.style.display = "none";
  });

  document.getElementById("btnCriarSubpasta").addEventListener("click", () => {
    const nome = document.getElementById("nomeSubpasta").value.trim();
    const tipo = document.getElementById("tipoSubpasta").value;

    if (!nome) {
      alert("Informe o nome da subpasta.");
      return;
    }

    const subpastaDTO = {
      nome: nome,
      tipoAcesso: tipo,
      pastaPaiId: pastaPaiAtualId
    };

    const csrfToken = window.csrfToken || '';
    const csrfHeader = window.csrfHeader || '';

    const headers = {
      "Content-Type": "application/json"
    };
    if (csrfToken && csrfHeader) {
      headers[csrfHeader] = csrfToken;
    }

    fetch("/api/pastas", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(subpastaDTO)
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(msg => { throw new Error(msg); });
        }
        return response.json();
      })
      .then(() => {
        document.getElementById("nomeSubpasta").value = "";
        document.getElementById("tipoSubpasta").value = "PUBLICO";
        abrirModalSubpastas(pastaPaiAtualId, nomePastaPai);
      })
      .catch(err => {
        alert("Erro ao criar subpasta: " + err.message);
      });
  });

});

function carregarPastas() {
  fetch("/api/pastas")
    .then(response => {
      if (!response.ok) throw new Error("Erro ao buscar pastas");
      return response.json();
    })
    .then(pastas => {
      const internasContainer = document.getElementById("grid-internas");
      const publicasContainer = document.getElementById("grid-publicas");

      internasContainer.innerHTML = "";
      publicasContainer.innerHTML = "";

      pastas.forEach(pasta => {
        const card = criarCardPasta(pasta);
        if (pasta.tipoAcesso === "INTERNO") {
          internasContainer.appendChild(card);
        } else {
          publicasContainer.appendChild(card);
        }
      });

      atualizarBadges();
    })
    .catch(erro => console.error("Erro ao carregar pastas:", erro));
}

function atualizarBadges() {
  const internas = document.querySelectorAll('#grid-internas .card').length;
  const publicas = document.querySelectorAll('#grid-publicas .card').length;
  const bInt = document.getElementById('badge-internas');
  const bPub = document.getElementById('badge-publicas');
  if (bInt) bInt.textContent = internas;
  if (bPub) bPub.textContent = publicas;
}

function criarCardPasta(pasta) {
  const div = document.createElement("div");
  div.className = "card"; // Uiverse card
  div.dataset.id = pasta.id;
  div.dataset.nome = pasta.nome;
  div.dataset.acesso = pasta.tipoAcesso;

  // Monta o HTML do card exatamente como no Uiverse
  div.innerHTML = `
    <div class="card-details">
      <p class="text-title">${escapeHtml(pasta.nome)}</p>
      <p class="text-body">${pasta.tipoAcesso === "INTERNO" ? "🔒 Interna" : "🔓 Pública"}</p>
    </div>
    <a class="card-button" href="#" data-id="${pasta.id}">Subpastas</a>
  `;

  // Clique em “Subpastas” abre o modal de subpastas
  const btn = div.querySelector(".card-button");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalSubpastas(pasta.id, pasta.nome);
  });

  return div;
}

// helper para evitar XSS em nome de pasta
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[s]));
}


// ------------------ MODAL DE SUBPASTAS ------------------
let pastaPaiAtualId = null;
let nomePastaPai = "";

const modalSubpastas = document.getElementById("modalSubpastas");
const tituloPastaPai = document.getElementById("tituloPastaPai");
const listaSubpastas = document.getElementById("listaSubpastas");

function abrirModalSubpastas(pastaId, nome) {
  pastaPaiAtualId = pastaId;
  nomePastaPai = nome;

  tituloPastaPai.textContent = nome;
  listaSubpastas.innerHTML = `<li>Carregando...</li>`;

  fetch(`/api/pastas/${pastaId}/subpastas`)
    .then(response => response.json())
    .then(subpastas => {
      if (subpastas.length === 0) {
        listaSubpastas.innerHTML = "<li><em>Nenhuma subpasta encontrada.</em></li>";
        return;
      }

      listaSubpastas.innerHTML = "";
      subpastas.forEach(sub => {
        const li = document.createElement("li");
        const tipo = sub.tipoAcesso === "INTERNO" ? "🔒" : "🔓";
        li.innerHTML = `
          <span class="nome-subpasta" style="cursor: pointer; text-decoration: underline; color: #007bff;" onclick="abrirDocumentosSubpasta(${sub.id})">
            ${sub.nome} ${tipo}
          </span>
          <button onclick="editarSubpasta(${sub.id}, '${sub.nome}', '${sub.tipoAcesso}')">✏️</button>
          <button onclick="excluirSubpasta(${sub.id})">🗑️</button>
        `;
        listaSubpastas.appendChild(li);
      });
    })
    .catch(err => {
      listaSubpastas.innerHTML = `<li><em>Erro ao carregar subpastas.</em></li>`;
      console.error("Erro ao carregar subpastas:", err);
    });

  modalSubpastas.style.display = "flex";
}

// --------- AÇÕES: EDITAR e EXCLUIR SUBPASTA ---------
window.editarSubpasta = function (id, nomeAtual, tipoAtual) {
  const novoNome = prompt("Novo nome da subpasta:", nomeAtual);
  if (novoNome === null || novoNome.trim() === "") return;

  const novoTipo = confirm("Deseja que esta subpasta seja INTERNA?\n(Clique em Cancelar para tornar PÚBLICA)")
    ? "INTERNO"
    : "PUBLICO";

  const csrfToken = window.csrfToken || '';
  const csrfHeader = window.csrfHeader || '';

  const headers = {
    "Content-Type": "application/json"
  };
  if (csrfToken && csrfHeader) {
    headers[csrfHeader] = csrfToken;
  }

  fetch(`/api/pastas/${id}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({ nome: novoNome, tipoAcesso: novoTipo })
  })
    .then(resp => {
      if (resp.ok) {
        abrirModalSubpastas(pastaPaiAtualId, nomePastaPai);
      } else if (resp.status === 409) {
        alert("Já existe uma subpasta com esse nome neste nível.");
      } else {
        alert("Erro ao atualizar subpasta.");
      }
    })
    .catch(err => {
      console.error("Erro ao editar:", err);
      alert("Erro ao atualizar subpasta.");
    });
};

window.excluirSubpasta = function (id) {
  if (!confirm("Tem certeza que deseja excluir esta subpasta?")) return;

  const csrfToken = window.csrfToken || '';
  const csrfHeader = window.csrfHeader || '';

  const headers = {};
  if (csrfToken && csrfHeader) {
    headers[csrfHeader] = csrfToken;
  }

  fetch(`/api/pastas/${id}`, {
    method: "DELETE",
    headers: headers
  })
    .then(resp => {
      if (resp.ok) {
        abrirModalSubpastas(pastaPaiAtualId, nomePastaPai);
      } else if (resp.status === 409) {
        alert("Não é possível excluir: esta subpasta possui documentos ou subpastas.");
      } else {
        alert("Erro ao excluir subpasta.");
      }
    })
    .catch(err => {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir subpasta.");
    });
};

document.getElementById("btnAbrirModalPasta").addEventListener("click", () => {
  document.getElementById("modalNovaPasta").style.display = "flex";
});

document.getElementById("btnFecharModalPasta").addEventListener("click", () => {
  document.getElementById("modalNovaPasta").style.display = "none";
});

document.getElementById("btnCriarPasta").addEventListener("click", () => {
  const nome = document.getElementById("nomeNovaPasta").value.trim();
  const tipo = document.getElementById("tipoNovaPasta").value;

  if (!nome) {
    alert("Informe o nome da pasta.");
    return;
  }

  const dto = { nome, tipoAcesso: tipo };

  const csrfToken = window.csrfToken || '';
  const csrfHeader = window.csrfHeader || '';
  const headers = { "Content-Type": "application/json" };
  if (csrfToken && csrfHeader) headers[csrfHeader] = csrfToken;

  fetch("/api/pastas", {
    method: "POST",
    headers,
    body: JSON.stringify(dto)
  })
    .then(res => {
      if (!res.ok) return res.text().then(msg => { throw new Error(msg); });
      return res.json();
    })
    .then(() => {
      alert("Pasta criada com sucesso!");
      document.getElementById("nomeNovaPasta").value = "";
      document.getElementById("modalNovaPasta").style.display = "none";
      carregarPastas(); // recarrega interface
    })
    .catch(err => alert("Erro: " + err.message));
});


window.abrirDocumentosSubpasta = function (idSubpasta) {
  window.location.href = `/documentosPorSubpasta?id=${idSubpasta}`;
};

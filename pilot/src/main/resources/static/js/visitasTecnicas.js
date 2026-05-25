document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");
    const btnNovaVisita = document.getElementById("btnNovaVisita");
    const modal = document.getElementById("modalVisita");
    const closeModal = document.querySelector(".close");
    const visitasContainer = document.getElementById("visitasContainer");
    const visitaForm = document.getElementById("visitaForm");
    const campoPesquisa = document.getElementById("campoPesquisa");
    const visitaIdInput = document.getElementById("visitaId");

    const visitasPorPagina = 6;
    let paginaAtual = 1;
    let visitas = [];
    let visitasFiltradas = [];

    function configurarValidacoesCampos() {
        const campoResponsavel = document.getElementById("responsavel");
        const campoQuantidade = document.getElementById("quantidade");
        const campoTelefones = document.getElementById("telefones");

        campoResponsavel.addEventListener("input", () => {
            campoResponsavel.value = campoResponsavel.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
        });

        campoQuantidade.addEventListener("keydown", (e) => {
            const permitido =
                e.key >= '0' && e.key <= '9' ||
                e.key === 'Backspace' ||
                e.key === 'Delete' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'Tab';
            if (!permitido) e.preventDefault();
        });

        campoQuantidade.addEventListener("paste", (e) => {
            const texto = (e.clipboardData || window.clipboardData).getData('text');
            if (!/^\d+$/.test(texto)) e.preventDefault();
        });

        let ultimaTeclaTelefone = "";
        campoTelefones.addEventListener("keydown", (e) => {
            ultimaTeclaTelefone = e.key;
        });

        campoTelefones.addEventListener("input", () => {
            if (ultimaTeclaTelefone === "Backspace") return;
            let valor = campoTelefones.value.replace(/\D/g, "").slice(0, 11);
            if (valor.length <= 10) {
                valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
            } else {
                valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
            }
            campoTelefones.value = valor.trim();
        });
    }

    btnNovaVisita.onclick = () => {
        modal.style.display = "flex";
        visitaForm.reset();
        visitaIdInput.value = "";
        configurarValidacoesCampos();
    };

    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };

    function carregarVisitas() {
        fetch("/visitas-tecnicas/api")
            .then(response => response.json())
            .then(data => {
                visitas = data;
                visitasFiltradas = visitas;
                paginaAtual = 1;
                renderizarVisitas();
                renderizarPaginacao();
            })
            .catch(error => console.error("Erro ao carregar visitas:", error));
    }

    function formatarData(dataIso) {
        const data = new Date(dataIso);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear(); // Agora mostra o ano completo
        return `${dia}/${mes}/${ano}`;
    }

    function renderizarVisitas() {
        const tabelaCorpo = document.getElementById("tabelaCorpo");
        tabelaCorpo.innerHTML = "";
        const inicio = (paginaAtual - 1) * visitasPorPagina;
        const fim = inicio + visitasPorPagina;
        const visitasPagina = visitasFiltradas.slice(inicio, fim);

        visitasPagina.forEach(visita => {
            const linha = document.createElement("tr");

            linha.innerHTML = `
        <td>${visita.responsavel}</td>
        <td>${visita.empresaInstituicao}</td>
        <td>${formatarData(visita.dataSolicitada)}</td>
        <td>${visita.dataAgendada ? formatarData(visita.dataAgendada) : "-"}</td>
        <td>${visita.visitaRealizada ? "Sim" : "Não"}</td>
        <td>${visita.quantidadeVisitantes}</td>
        <td>${visita.localVisita}</td>
        <td>${visita.telefones}</td>
        <td>${visita.observacao}</td>
        <td>
            <button class="btn-edit" onclick="editarVisita(${visita.id})">Editar</button>
            <button class="btn-delete" onclick="deletarVisita(${visita.id})">Excluir</button>
        </td>
    `;

            tabelaCorpo.appendChild(linha);
        });
    }

    function renderizarPaginacao() {
        let paginacao = document.querySelector(".paginacao");
        if (!paginacao) {
            paginacao = document.createElement("div");
            paginacao.className = "paginacao";
            visitasContainer.after(paginacao);
        }

        paginacao.innerHTML = "";
        const totalPaginas = Math.ceil(visitasFiltradas.length / visitasPorPagina);

        const btnAnterior = document.createElement("button");
        btnAnterior.textContent = "Anterior";
        btnAnterior.disabled = paginaAtual === 1;
        btnAnterior.onclick = () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                renderizarVisitas();
                renderizarPaginacao();
            }
        };

        const btnProximo = document.createElement("button");
        btnProximo.textContent = "Próximo";
        btnProximo.disabled = paginaAtual === totalPaginas;
        btnProximo.onclick = () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                renderizarVisitas();
                renderizarPaginacao();
            }
        };

        const paginaAtualSpan = document.createElement("span");
        paginaAtualSpan.textContent = `Página ${paginaAtual} de ${totalPaginas}`;

        paginacao.appendChild(btnAnterior);
        paginacao.appendChild(paginaAtualSpan);
        paginacao.appendChild(btnProximo);
    }

    campoPesquisa.addEventListener("input", () => {
        const termo = campoPesquisa.value.toLowerCase();

        if (termo === "") {
            visitasFiltradas = visitas;
        } else {
            visitasFiltradas = visitas.filter(visita =>
                visita.responsavel.toLowerCase().includes(termo) ||
                visita.empresaInstituicao.toLowerCase().includes(termo) ||
                visita.localVisita.toLowerCase().includes(termo)
            );
        }

        paginaAtual = 1;
        renderizarVisitas();
        renderizarPaginacao();
    });

    document.getElementById("dataSolicitadaInicio").addEventListener("change", aplicarFiltrosAvancados);
    document.getElementById("dataSolicitadaFim").addEventListener("change", aplicarFiltrosAvancados);
    document.getElementById("dataAgendadaInicio").addEventListener("change", aplicarFiltrosAvancados);
    document.getElementById("dataAgendadaFim").addEventListener("change", aplicarFiltrosAvancados);
    document.getElementById("filtroVisitaRealizada").addEventListener("change", aplicarFiltrosAvancados);

    function aplicarFiltrosAvancados() {
        const termo = campoPesquisa.value.toLowerCase();
        const dataSolicitadaInicio = document.getElementById("dataSolicitadaInicio").value;
        const dataSolicitadaFim = document.getElementById("dataSolicitadaFim").value;
        const dataAgendadaInicio = document.getElementById("dataAgendadaInicio").value;
        const dataAgendadaFim = document.getElementById("dataAgendadaFim").value;
        const filtroRealizada = document.getElementById("filtroVisitaRealizada").value;

        visitasFiltradas = visitas.filter(visita => {
            const termoMatch =
                visita.responsavel.toLowerCase().includes(termo) ||
                visita.empresaInstituicao.toLowerCase().includes(termo) ||
                visita.localVisita.toLowerCase().includes(termo) ||
                (visita.observacao || "").toLowerCase().includes(termo);

            const dataSolicitada = visita.dataSolicitada;
            const dataAgendada = visita.dataAgendada;

            const dataSolicitadaValida = (
                (!dataSolicitadaInicio || dataSolicitada >= dataSolicitadaInicio) &&
                (!dataSolicitadaFim || dataSolicitada <= dataSolicitadaFim)
            );

            const dataAgendadaValida = (
                (!dataAgendadaInicio || (dataAgendada && dataAgendada >= dataAgendadaInicio)) &&
                (!dataAgendadaFim || (dataAgendada && dataAgendada <= dataAgendadaFim))
            );

            const realizadaValida = (
                !filtroRealizada ||
                String(visita.visitaRealizada) === filtroRealizada
            );

            return termoMatch && dataSolicitadaValida && dataAgendadaValida && realizadaValida;
        });

        paginaAtual = 1;
        renderizarVisitas();
        renderizarPaginacao();
    }

    window.editarVisita = function (id) {
        const visita = visitas.find(v => v.id === id);
        if (!visita) return;

        document.getElementById("visitaId").value = visita.id;
        document.getElementById("responsavel").value = visita.responsavel;
        document.getElementById("empresa").value = visita.empresaInstituicao;
        document.getElementById("dataSolicitada").value = visita.dataSolicitada;
        document.getElementById("dataAgendada").value = visita.dataAgendada;
        document.getElementById("visitaRealizada").value = visita.visitaRealizada;
        document.getElementById("quantidade").value = visita.quantidadeVisitantes;
        document.getElementById("local").value = visita.localVisita;
        document.getElementById("telefones").value = visita.telefones;
        document.getElementById("observacao").value = visita.observacao;

        modal.style.display = "flex";
        configurarValidacoesCampos();
    };

    window.deletarVisita = function (id) {
        if (!confirm("Tem certeza que deseja excluir esta visita?")) return;

        fetch(`/visitas-tecnicas/api/${id}`, {
            method: "DELETE",
            headers: {
                [csrfHeader]: csrfToken
            }
        })


            .then(res => {
                if (!res.ok) throw new Error("Erro ao deletar visita");
                carregarVisitas(); // Atualiza tela
            })
            .catch(err => console.error(err));
    };

    carregarVisitas();

    visitaForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const visita = {
            id: visitaIdInput.value ? parseInt(visitaIdInput.value, 10) : null,
            responsavel: document.getElementById("responsavel").value,
            empresaInstituicao: document.getElementById("empresa").value,
            dataSolicitada: document.getElementById("dataSolicitada").value || null,
            dataAgendada: document.getElementById("dataAgendada").value || null,
            visitaRealizada: document.getElementById("visitaRealizada").value === "true",
            quantidadeVisitantes: parseInt(document.getElementById("quantidade").value || "0", 10),
            localVisita: document.getElementById("local").value,
            telefones: document.getElementById("telefones").value,
            observacao: document.getElementById("observacao").value
        };

        const metodo = visita.id ? "PUT" : "POST";
        const url = visita.id
            ? `/visitas-tecnicas/api/${visita.id}`
            : `/visitas-tecnicas/api`;

        const headers = {
            "Content-Type": "application/json",
            [csrfHeader]: csrfToken
        };

        fetch(url, {
            method: metodo,
            headers,
            body: JSON.stringify(visita)
        })

            .then(res => {
                if (!res.ok) throw new Error("Erro ao salvar visita");
                return res.json();
            })
            .then(() => {
                modal.style.display = "none";
                carregarVisitas(); // Atualiza a tela
            })
            .catch(err => console.error(err));
    });

});
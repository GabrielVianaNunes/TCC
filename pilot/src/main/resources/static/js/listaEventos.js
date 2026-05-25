document.addEventListener("DOMContentLoaded", () => {
    // Elementos da interface
    const modal = document.getElementById("modalEvento");
    const btnNovoEvento = document.getElementById("btnNovoEvento");
    const btnDashboard = document.getElementById("btnDashboard");
    const closeModal = document.querySelector(".close");
    const eventoForm = document.getElementById("eventoForm");
    const eventosContainer = document.getElementById("eventosContainer");
    const numConvidadosInput = document.getElementById("numConvidados");
    const numPresentesInput = document.getElementById("numPresentes");
    const adesaoInput = document.getElementById("adesao");
    const barraPesquisa = document.getElementById("searchInput");

    // Variáveis de estado
    let ultimoValorPresentes = 0;
    let todosEventos = [];

    // CSRF Token configuration
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;
    
    // Inicialização
    modal.style.display = "none";

    // Função para calcular a adesão
    function calcularAdesao() {
        const convidados = parseInt(numConvidadosInput.value) || 0;
        let presentes = parseInt(numPresentesInput.value) || 0;

        if (presentes > convidados) {
            alert("O número de presentes não pode ser maior que o número de convidados.");
            numPresentesInput.value = ultimoValorPresentes;
            presentes = ultimoValorPresentes;
        } else {
            ultimoValorPresentes = presentes;
        }

        adesaoInput.value = convidados > 0 
            ? `${((presentes / convidados) * 100).toFixed(2)}%` 
            : "0%";
    }

    // Event listeners para cálculos
    numConvidadosInput.addEventListener("input", calcularAdesao);
    numPresentesInput.addEventListener("input", calcularAdesao);

    // Renderização dos eventos
    function renderizarEventos(eventos) {
        eventosContainer.innerHTML = "";

        if (eventos.length === 0) {
            eventosContainer.innerHTML = '<p class="no-events">Nenhum evento encontrado</p>';
            return;
        }

        eventos.forEach(evento => {
            const adesaoCalculada = evento.numeroConvidados > 0
                ? `${((evento.numeroPresentes / evento.numeroConvidados) * 100).toFixed(2)}%`
                : "0%";

            const dataFormatada = new Date(evento.dataEvento).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });

            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <div class="face front">
                    <b>${evento.nome}</b>
                </div>
                <div class="face back">
                    <div class="content">
                        <p><strong>Tipo:</strong> ${evento.tipo}</p>
                        <p><strong>Data:</strong> ${dataFormatada}</p>
                        <p><strong>Convidados:</strong> ${evento.numeroConvidados}</p>
                        <p><strong>Presentes:</strong> ${evento.numeroPresentes}</p>
                        <p><strong>Adesão:</strong> ${adesaoCalculada}</p>
                        <div class="card-actions">
                            <button class="btn btn-edit" data-id="${evento.id}">Editar</button>
                            <button class="btn btn-delete" data-id="${evento.id}">Excluir</button>
                        </div>
                    </div>
                </div>
            `;
            eventosContainer.appendChild(card);
        });

        // Adiciona event listeners para os botões dinâmicos
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editarEvento(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deletarEvento(btn.dataset.id));
        });
    }

    // Carregar eventos do servidor
    async function carregarEventos() {
        try {
            const response = await fetch("/eventos/api");
            if (!response.ok) throw new Error("Erro ao carregar eventos");
            
            todosEventos = await response.json();
            renderizarEventos(todosEventos);
        } catch (error) {
            console.error("Erro:", error);
            eventosContainer.innerHTML = '<p class="error">Erro ao carregar eventos</p>';
        }
    }

    // Filtro de busca
    barraPesquisa.addEventListener("input", () => {
        const termo = barraPesquisa.value.toLowerCase();
        const eventosFiltrados = todosEventos.filter(evento =>
            evento.nome.toLowerCase().includes(termo) ||
            evento.tipo.toLowerCase().includes(termo) ||
            new Date(evento.dataEvento).toLocaleDateString('pt-BR').includes(termo)
        );
        renderizarEventos(eventosFiltrados);
    });

    // Modal functions
    btnNovoEvento.onclick = () => {
        modal.style.display = "flex";
        document.getElementById("eventoId").value = "";
        eventoForm.reset();
        adesaoInput.value = "0%";
        ultimoValorPresentes = 0;
    };

    closeModal.onclick = () => modal.style.display = "none";

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Form submission
    eventoForm.onsubmit = async (e) => {
        e.preventDefault();

        const eventoId = document.getElementById("eventoId").value;
        const convidados = parseInt(numConvidadosInput.value) || 0;
        const presentes = parseInt(numPresentesInput.value) || 0;

        if (presentes > convidados) {
            alert("O número de presentes não pode ser maior que o número de convidados.");
            return;
        }

        const eventoData = {
            nome: document.getElementById("nomeEvento").value,
            tipo: document.getElementById("tipoEvento").value,
            dataEvento: document.getElementById("dataEvento").value,
            numeroConvidados: convidados,
            numeroPresentes: presentes
        };

        const url = eventoId ? `/eventos/api/${eventoId}` : "/eventos/api";
        const method = eventoId ? "PUT" : "POST";

        try {
            const headers = {
                "Content-Type": "application/json"
            };

            // Adiciona CSRF token se existir
            if (csrfHeader && csrfToken) {
                headers[csrfHeader] = csrfToken;
            }

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(eventoData)
            });

            if (!response.ok) throw new Error("Erro ao salvar evento");

            modal.style.display = "none";
            await carregarEventos();
        } catch (error) {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao salvar o evento");
        }
    };

    // Editar evento
    async function editarEvento(id) {
        try {
            const response = await fetch(`/eventos/api/${id}`);
            if (!response.ok) throw new Error("Erro ao carregar evento");
            
            const evento = await response.json();
            
            document.getElementById("eventoId").value = evento.id;
            document.getElementById("nomeEvento").value = evento.nome;
            document.getElementById("tipoEvento").value = evento.tipo;
            
            const dataOriginal = new Date(evento.dataEvento);
            document.getElementById("dataEvento").value = dataOriginal.toISOString().split('T')[0];
            
            document.getElementById("numConvidados").value = evento.numeroConvidados;
            document.getElementById("numPresentes").value = evento.numeroPresentes;
            
            adesaoInput.value = evento.numeroConvidados > 0 
                ? `${((evento.numeroPresentes / evento.numeroConvidados) * 100).toFixed(2)}%` 
                : "0%";
                
            ultimoValorPresentes = evento.numeroPresentes;
            modal.style.display = "flex";
        } catch (error) {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao carregar o evento para edição");
        }
    }

    // Deletar evento
    async function deletarEvento(id) {
        if (!confirm("Tem certeza que deseja excluir este evento?")) return;

        try {
            const headers = {};
            
            // Adiciona CSRF token se existir
            if (csrfHeader && csrfToken) {
                headers[csrfHeader] = csrfToken;
            }

            const response = await fetch(`/eventos/api/${id}`, {
                method: "DELETE",
                headers: headers
            });

            if (!response.ok) throw new Error("Erro ao excluir evento");
            
            await carregarEventos();
        } catch (error) {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao excluir o evento");
        }
    }

    // Navegação para dashboard
    if (btnDashboard) {
        btnDashboard.addEventListener("click", () => {
            window.location.href = "/eventos/dashboard";
        });
    }

    // Carregar eventos inicialmente
    carregarEventos();
});
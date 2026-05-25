document.addEventListener("DOMContentLoaded", function () {
    fetch("/servicos/relatorio-servicos/api")
        .then(response => response.json())
        .then(data => {
            // Garante que todos os meses apareçam, mesmo sem dados
            const mesesDoAno = Array.from({ length: 12 }, (_, i) => i + 1);
            const dadosCorrigidos = mesesDoAno.map(mes => {
                const dadoExistente = data.find(d => d.mes === mes);
                return dadoExistente || { ano: new Date().getFullYear(), mes, valorTotal: 0, quantidadeServicos: 0 };
            });

            atualizarIndicadores(dadosCorrigidos);
            desenharGrafico(dadosCorrigidos);
        })
        .catch(error => console.error("Erro ao carregar os dados:", error));
});

function atualizarIndicadores(data) {
    let totalServicos = data.reduce((acc, item) => acc + item.quantidadeServicos, 0);
    let valorTotal = data.reduce((acc, item) => acc + item.valorTotal, 0).toFixed(2);

    document.getElementById("totalServicos").textContent = totalServicos;
    document.getElementById("valorArrecadado").textContent = `R$ ${valorTotal}`;
}

function desenharGrafico(data) {
    const svg = d3.select("#graficoServicos");
    svg.selectAll("*").remove();

    const width = 700;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    svg.attr("width", width).attr("height", height);

    const x = d3.scaleBand()
        .domain(["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"])
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const maxValor = d3.max(data, d => d.valorTotal) || 0;

    // Ajuste dinâmico do eixo Y
    let step;
    if (maxValor > 100000) step = 100000;
    else if (maxValor > 10000) step = 10000;
    else if (maxValor > 1000) step = 1000;
    else step = 100;

    const y = d3.scaleLinear()
        .domain([0, Math.ceil(maxValor / step) * step])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const g = svg.append("g");

    // Eixo X
    g.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle");

    // Eixo Y com ajustes dinâmicos
    g.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(Math.ceil(maxValor / step)));

    // Barras do gráfico
    const bars = g.selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][d.mes - 1]))
        .attr("y", d => y(d.valorTotal))
        .attr("height", d => y(0) - y(d.valorTotal))
        .attr("width", x.bandwidth())
        .attr("fill", "#007bff");

    // Adiciona os valores no topo das barras APENAS quando valorTotal > 0
    g.selectAll("text.valor")
        .data(data)
        .enter().append("text")
        .filter(d => d.valorTotal > 0) // 🔹 Filtra apenas os meses com arrecadação
        .attr("class", "valor")
        .attr("x", d => x(["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][d.mes - 1]) + x.bandwidth() / 2)
        .attr("y", d => y(d.valorTotal) - 5) // Pequeno deslocamento para cima
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d => d.valorTotal.toFixed(2));
}

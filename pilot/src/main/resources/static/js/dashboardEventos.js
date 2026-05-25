document.addEventListener("DOMContentLoaded", () => {
    fetch("/eventos/relatorios")
        .then(response => response.json())
        .then(data => {
            atualizarMetricas(data);
            desenharGrafico(data.distribuicaoMensal);
        })
        .catch(error => console.error("Erro ao carregar dados do relatório:", error));
});

function atualizarMetricas(data) {
    document.getElementById("totalEventos").innerText = data.totalEventos;
    document.getElementById("adesaoMedia").innerText = data.adesaoMedia.toFixed(2) + "%";
}

function desenharGrafico(distribuicaoMensal) {
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select("#graficoEventos")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 🔹 Ordem correta dos meses
    const mesesOrdenados = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
                            "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    // 🔹 Criar escala para o eixo X (Meses)
    const x = d3.scaleBand()
        .domain(mesesOrdenados)
        .range([0, width])
        .padding(0.2);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // 🔹 Criar escala para o eixo Y (Quantidade de eventos)
    const maxEventos = d3.max(Object.values(distribuicaoMensal)) || 1;
    const step = maxEventos > 10 ? 10 : 1; // 🔹 Define intervalos de 10 se maior que 10
    const y = d3.scaleLinear()
        .domain([0, Math.ceil(maxEventos / step) * step])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y).ticks(maxEventos > 10 ? maxEventos / 10 : maxEventos));

    // 🔹 Criar os bars (barras do gráfico)
    svg.selectAll(".bar")
        .data(mesesOrdenados)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d))
        .attr("y", d => y(distribuicaoMensal[d] || 0))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(distribuicaoMensal[d] || 0))
        .attr("fill", "blue");
}

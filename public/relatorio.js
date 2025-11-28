// Carregar vendas com filtros
async function carregarVendas(filtros = {}) {
    try {
        let url = "/relatorios-vendas?";
        const params = [];

        if (filtros.cpf) {
            params.push(`cli_cpf=${encodeURIComponent(filtros.cpf)}`);
        }
        if (filtros.produto) {
            params.push(`pro_nome=${encodeURIComponent(filtros.produto)}`);
        }
        if (filtros.data) {
            params.push(`data=${encodeURIComponent(filtros.data)}`);
        }

        url += params.join("&");

        const response = await fetch(url);
        if (!response.ok) throw new Error("Erro ao buscar vendas");
        
        const dados = await response.json();
        let tbody = document.getElementById("tabela-vendas");
        tbody.innerHTML = "";
        
        if (!dados || dados.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma venda encontrada</td></tr>';
            return;
        }
        
        dados.forEach((item) => {
            const tr = document.createElement('tr');
            const precoTotal = item.preco_total ? parseFloat(item.preco_total).toFixed(2) : '0.00';
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.cli_cpf}</td>
                <td>${item.pro_nome || item.id_produto}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${precoTotal}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro:", error);
    }
}

// Buscar vendas com filtros
function buscarVendas() {
    const cpf = document.getElementById("filtro-cpf").value.replace(/\D/g, "");
    const produto = document.getElementById("filtro-produto").value;
    const data = document.getElementById("filtro-data").value;

    carregarVendas({
        cpf: cpf,
        produto: produto,
        data: data
    });
}

// Limpar filtros
function limparFiltros() {
    document.getElementById("filtro-cpf").value = "";
    document.getElementById("filtro-produto").value = "";
    document.getElementById("filtro-data").value = "";
    carregarVendas();
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById("filtro-cpf");
    
    if (cpfInput) {
        cpfInput.addEventListener("input", function(e) {
            let value = e.target.value.replace(/\D/g, "");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = value;
        });
        
        cpfInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") buscarVendas();
        });
    }

    carregarVendas();
});

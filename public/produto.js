async function cadastrarProduto(event) {
    event.preventDefault();

    const produto = {
        pro_nome: document.getElementById("pro_nome").value,
        pro_preco: parseFloat(document.getElementById("pro_preco").value),
        pro_descricao: document.getElementById("pro_descricao").value,
        pro_categoria: document.getElementById("pro_categoria").value,
        pro_quantidade_estoque: document.getElementById("pro_quantidade_estoque").value,
    };

    try {
        const response = await fetch("/produtos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(produto),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Produto cadastrado com sucesso!");
            document.getElementById("produto-form").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar produto.");
    }
}
async function listarProdutos() {
    try {
        const response = await fetch("/produtos");

        if (response.ok) {
            const produtos = await response.json();

            const tabela = document.getElementById("tabela-clientes");
            tabela.innerHTML = ""; // Limpa a tabela antes de preencher

            produtos.forEach((produto) => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${produto.id_pro}</td>
                    <td>${produto.pro_nome}</td>
                    <td>${produto.pro_preco.toFixed(2)}</td>
                    <td>${produto.pro_descricao}</td>
                    <td>${produto.pro_categoria}</td>
                    <td>${produto.pro_quantidade_estoque}</td>
                `;
                tabela.appendChild(linha);
            });
        } else {
            alert("Erro ao listar produtos.");
        }
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        alert("Erro ao listar produtos.");
    }
}

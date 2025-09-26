// Função para buscar cliente pelo CPF
function buscarCliente() {
    const cpf = document.getElementById("cli_cpf").value;

    if (!cpf) {
        alert("Por favor, insira o CPF do cliente.");
        return;
    }

    fetch(`/clientes/${cpf}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Cliente não encontrado.");
            }
            return response.json();
        })
        .then((cliente) => {
            const clienteInfo = document.getElementById("cliente-info");
            clienteInfo.innerHTML = `
        <p>nome: ${cliente.cli_nome}</p>
        <p>cpf: ${cliente.cli_cpf}</p>
        <p>email: ${cliente.cli_email}</p>
      `;
        })
        .catch((error) => {
            alert(error.message);
        });
}

function adicionarProdutoAoCarrinho() {
    const id = document.getElementById("produto-nome").value;
    const quantidade = parseInt(
        document.getElementById("produto-quantidade").value,
    );

    if (!id || isNaN(quantidade) || quantidade <= 0) {
        alert(
            "Por favor, insira um produto válido e uma quantidade maior que zero.",
        );
        return;
    }

    fetch(`/produtos_carrinho/${id}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Produto não encontrado.");
            }
            return response.json();
        })
        .then((produto) => {
            adicionarProdutoNaTabela(produto, quantidade);
        })
        .catch((error) => {
            alert(error.message);
        });
}

// Função para adicionar produto na tabela de carrinho
function adicionarProdutoNaTabela(produto, quantidade) {
    const carrinhoBody = document.querySelector("#carrinho");

    const subtotal = produto.pro_preco * quantidade;
    const novaLinha = document.createElement("tr");

    novaLinha.setAttribute("data-id", produto.id);
    novaLinha.innerHTML = `
    <td>${produto.id_pro}</td>  
    <td>${produto.pro_nome}</td>
    <td>${quantidade}</td>
    <td>R$ ${produto.pro_preco.toFixed(2)}</td>
    <td>R$ ${subtotal.toFixed(2)}</td>
    <td><button onclick="removerProduto(this, ${subtotal})">Remover</button></td>
  `;

    carrinhoBody.appendChild(novaLinha);

    atualizarTotalVenda(subtotal);
}

// Função para remover produto do carrinho
function removerProduto(botao, subtotal) {
    botao.closest("tr").remove();
    atualizarTotalVenda(-subtotal);
}

// Função para atualizar o total da venda
function atualizarTotalVenda(valor) {
    const totalVendaElement = document.getElementById("total-venda");
    const valorAtual =
        parseFloat(totalVendaElement.getAttribute("data-total")) || 0;
    const novoTotal = valorAtual + valor;

    totalVendaElement.setAttribute("data-total", novoTotal);
    totalVendaElement.textContent = `Total: R$ ${novoTotal.toFixed(2)}`;
}

// Função para finalizar a venda
function finalizarVenda() {
    const cpfCliente = document.getElementById("cli_cpf").value;
    const carrinhoRows = document.querySelectorAll("#carrinho tr");
    const totalVenda = parseFloat(
        document.getElementById("total-venda").getAttribute("data-total"));

    if (!cpfCliente) {
        alert("Por favor, insira o CPF do cliente.");
        return;
    }

    if (carrinhoRows.length === 0) {
        alert(
            "O carrinho está vazio. Adicione produtos para finalizar a venda.",
        );
        return;
    }

    const itens = [];
    carrinhoRows.forEach((row) => {
        const idProduto = row.getAttribute("data-id");
        const quantidade = parseInt(row.children[2].textContent); // Quantidade está na 3ª coluna
        if (!idProduto || isNaN(quantidade) || quantidade <= 0) {
            console.error(
                "Produto ou quantidade inválidos:",
                idProduto,
                quantidade
            );
            return;
        }
        itens.push({ idProduto, quantidade });
    });

    const venda = {
        cli_cpf: cpfCliente,
        itens
    };

    fetch("/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venda),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    "Erro ao finalizar a venda. Verifique os dados.");
            }
            return response.json();
        })
        .then((data) => {
            alert("Venda realizada com sucesso!");
            limparFormulario();
            //location.reload();
        })
        .catch((error) => {
            alert(error.message);
        });
}

function limparFormulario() {
    document.getElementById("cli_cpf").value = "";
    document.getElementById("cliente-info").innerHTML = "";
    document.querySelector("#carrinho").innerHTML = "";
    const totalVendaElement = document.getElementById("total-venda");
    totalVendaElement.setAttribute("data-total", "0");
    totalVendaElement.textContent = "Total: R$ 0,00";
}

function buscarProdutos() {
    fetch("/buscar-produtos")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao buscar produtos");
            }
            return response.json();
        })
        .then((servicos) => {
            const select = document.getElementById("produto-nome");
            servicos.forEach((servico) => {
                const option = document.createElement("option");
                option.value = servico.id_pro; // Usa o id como valor
                option.textContent = `${servico.pro_nome} ------------- Disponível: ${servico.pro_quantidade_estoque}`; // Nome do serviço exibido
                select.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar os serviços:", error);
        });
}

// Função para buscar o relatório com filtros

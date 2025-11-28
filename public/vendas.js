// Função para buscar cliente pelo CPF
async function buscarCliente() {
    const cpfEl = document.getElementById("cli_cpf");
    if (!cpfEl) {
        console.error("Campo CPF não encontrado");
        return;
    }

    const cpf = cpfEl.value.replace(/\D/g, "");

    if (!cpf || cpf.length < 11) {
        alert("Por favor, insira um CPF válido.");
        return;
    }

    try {
        const response = await fetch(`/clientes?cpf=${cpf}`);
        if (!response.ok) {
            throw new Error("Cliente não encontrado.");
        }
        const clientes = await response.json();

        if (!clientes || clientes.length === 0) {
            alert("Cliente não encontrado. Cadastre o cliente primeiro!");
            return;
        }

        const cliente = clientes[0];
        const clienteInfo = document.getElementById("cliente-info");
        clienteInfo.innerHTML = `
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin-top: 10px;">
                <h3>Informações do Cliente</h3>
                <p><strong>Nome:</strong> ${cliente.cli_nome}</p>
                <p><strong>CPF:</strong> ${cliente.cli_cpf}</p>
                <p><strong>Email:</strong> ${cliente.cli_email || "N/A"}</p>
                <p><strong>Telefone:</strong> ${cliente.cli_telefone || "N/A"}</p>
                <p><strong>Moto:</strong> ${cliente.id_mt ? "Sim (ID: " + cliente.id_mt + ")" : "Sem moto registrada"}</p>
            </div>
        `;

        carregarServicos();
    } catch (error) {
        console.error("Erro:", error);
        alert(error.message);
    }
}

// Função para carregar serviços
async function carregarServicos() {
    try {
        const response = await fetch("/buscar-servicos");
        console.log("Resposta status:", response.status);
        
        if (!response.ok) {
            throw new Error("Erro ao buscar serviços - Status: " + response.status);
        }
        
        const servicos = await response.json();
        console.log("Serviços carregados:", servicos);

        const select = document.getElementById("produto-nome");
        if (!select) {
            console.error("Elemento produto-nome não encontrado");
            return;
        }
        
        select.innerHTML = '<option value="">Selecione o serviço</option>';

        if (Array.isArray(servicos) && servicos.length > 0) {
            servicos.forEach((servico) => {
                const option = document.createElement("option");
                option.value = servico.id;
                option.textContent = servico.serv_nome;
                select.appendChild(option);
            });
            console.log("Serviços adicionados ao dropdown");
        } else {
            console.log("Nenhum serviço encontrado");
        }
    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
    }
}

// Função para adicionar serviço ao carrinho
function adicionarProdutoAoCarrinho() {
    const servicoEl = document.getElementById("produto-nome");
    const duracaoEl = document.getElementById("produto-quantidade");

    if (!servicoEl || !duracaoEl) {
        alert("Formulário incompleto");
        return;
    }

    const servicoId = servicoEl.value;
    const servicoNome = servicoEl.options[servicoEl.selectedIndex].text;
    const duracao = parseInt(duracaoEl.value);

    if (!servicoId || !duracao || duracao <= 0) {
        alert("Por favor, selecione um serviço e informe a duração.");
        return;
    }

    const carrinho = document.getElementById("carrinho");
    const novaLinha = document.createElement("tr");

    novaLinha.setAttribute("data-servico-id", servicoId);
    novaLinha.setAttribute("data-duracao", duracao);
    novaLinha.innerHTML = `
        <td>${servicoId}</td>
        <td>${servicoNome}</td>
        <td>${duracao}h</td>
        <td>R$ ${(duracao * 50).toFixed(2)}</td>
        <td>R$ ${(duracao * 50).toFixed(2)}</td>
        <td><button type="button" onclick="removerProduto(this, ${duracao * 50})">Remover</button></td>
    `;

    carrinho.appendChild(novaLinha);
    atualizarTotalVenda(duracao * 50);
    duracaoEl.value = "";
}

// Função para remover serviço do carrinho
function removerProduto(botao, subtotal) {
    botao.closest("tr").remove();
    atualizarTotalVenda(-subtotal);
}

// Função para atualizar total
function atualizarTotalVenda(valor) {
    const totalVendaElement = document.getElementById("total-venda");
    const valorAtual =
        parseFloat(totalVendaElement.getAttribute("data-total")) || 0;
    const novoTotal = valorAtual + valor;

    totalVendaElement.setAttribute("data-total", novoTotal);
    totalVendaElement.textContent = `Total: R$ ${novoTotal.toFixed(2)}`;
}

// Função para finalizar venda
async function finalizarVenda() {
    const cpfEl = document.getElementById("cli_cpf");
    const carrinhoRows = document.querySelectorAll("#carrinho tr");
    const totalVenda = parseFloat(
        document.getElementById("total-venda").getAttribute("data-total")
    );

    if (!cpfEl || !cpfEl.value) {
        alert("Por favor, selecione um cliente.");
        return;
    }

    if (carrinhoRows.length === 0) {
        alert(
            "O carrinho está vazio. Adicione serviços para finalizar a venda.",
        );
        return;
    }

    const cpf = cpfEl.value.replace(/\D/g, "");
    const itens = [];

    carrinhoRows.forEach((row) => {
        const servicoId = row.getAttribute("data-servico-id");
        const duracao = parseInt(row.getAttribute("data-duracao"));

        if (servicoId && duracao) {
            itens.push({ idProduto: servicoId, quantidade: duracao });
        }
    });

    if (itens.length === 0) {
        alert("Nenhum serviço válido no carrinho.");
        return;
    }

    try {
        const response = await fetch("/vendas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cli_cpf: cpf,
                itens: itens,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Erro ao finalizar venda");
        }

        alert("Venda realizada com sucesso!");
        limparFormulario();
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao finalizar venda: " + error.message);
    }
}

// Função para limpar formulário
function limparFormulario() {
    document.getElementById("cli_cpf").value = "";
    document.getElementById("cliente-info").innerHTML = "";
    document.querySelector("#carrinho").innerHTML = "";
    document.getElementById("produto-nome").value = "";
    document.getElementById("produto-quantidade").value = "";
    const totalVendaElement = document.getElementById("total-venda");
    totalVendaElement.setAttribute("data-total", "0");
    totalVendaElement.textContent = "Total: R$ 0,00";
}

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
    const cpfInput = document.getElementById("cli_cpf");

    if (cpfInput) {
        cpfInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                buscarCliente();
            }
        });
        cpfInput.addEventListener("input", function (e) {
            let value = e.target.value.replace(/\D/g, "");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = value;
        });
    }

    carregarServicos();
});

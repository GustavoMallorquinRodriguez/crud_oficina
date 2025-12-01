let carrinho = [];

// Buscar produtos/serviços ao carregar a página
async function buscarProdutos() {
    try {
        const response = await fetch("/buscar-servicos");
        const servicos = await response.json();
        
        const select = document.getElementById("produto-nome");
        select.innerHTML = '<option value="">Selecione o serviço</option>';
        
        if (!servicos || servicos.length === 0) {
            console.log("Nenhum serviço encontrado");
            return;
        }
        
        servicos.forEach((servico) => {
            const option = document.createElement("option");
            option.value = servico.id;
            const nome = servico.pro_nome || servico.serv_nome || servico.nome || "Sem nome";
            const preco = servico.pro_preco || servico.preco || "0";
            option.textContent = `${nome} - R$ ${preco}`;
            option.dataset.preco = preco;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
    }
}

// Buscar cliente por CPF
async function buscarCliente() {
    const cpf = document.getElementById("cli_cpf").value.replace(/\D/g, "");
    
    if (!cpf) {
        alert("Digite um CPF válido");
        return;
    }

    try {
        const response = await fetch(`/cliente/${cpf}`);
        if (!response.ok) {
            document.getElementById("cliente-info").innerHTML = "<p>Cliente não encontrado</p>";
            return;
        }
        
        const cliente = await response.json();
        const info = document.getElementById("cliente-info");
        info.innerHTML = `
            <div class="client-info">
                <p><strong>Nome:</strong> ${cliente.cli_nome}</p>
                <p><strong>Telefone:</strong> ${cliente.cli_telefone || "N/A"}</p>
                <p><strong>Email:</strong> ${cliente.cli_email || "N/A"}</p>
            </div>
        `;
    } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        alert("Erro ao buscar cliente");
    }
}

// Adicionar produto ao carrinho
function adicionarProdutoAoCarrinho() {
    const select = document.getElementById("produto-nome");
    const quantidade = parseFloat(document.getElementById("produto-quantidade").value);
    
    if (!select.value || !quantidade || quantidade <= 0) {
        alert("Selecione um serviço e quantidade válida");
        return;
    }

    const servicoId = select.value;
    const servicoNome = select.options[select.selectedIndex].textContent;
    const preco = parseFloat(select.options[select.selectedIndex].dataset.preco);
    const subtotal = preco * quantidade;

    const item = {
        id: Date.now(),
        servicoId: servicoId,
        nome: servicoNome,
        quantidade: quantidade,
        preco: preco,
        subtotal: subtotal
    };

    carrinho.push(item);
    atualizarCarrinho();
    
    select.value = "";
    document.getElementById("produto-quantidade").value = "";
}

// Atualizar exibição do carrinho
function atualizarCarrinho() {
    const tbody = document.getElementById("carrinho");
    tbody.innerHTML = "";
    let total = 0;

    carrinho.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.preco.toFixed(2)}</td>
            <td>R$ ${item.subtotal.toFixed(2)}</td>
            <td>
                <button type="button" class="btn-remove" onclick="removerDoCarrinho(${item.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        total += item.subtotal;
    });

    document.getElementById("total-venda").textContent = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById("total-venda").dataset.total = total;
}

// Remover item do carrinho
function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    atualizarCarrinho();
}

// Finalizar venda
async function finalizarVenda() {
    const cpf = document.getElementById("cli_cpf").value.replace(/\D/g, "");
    
    if (!cpf) {
        alert("Digite um CPF válido");
        return;
    }

    if (carrinho.length === 0) {
        alert("Adicione itens ao carrinho");
        return;
    }

    try {
        const response = await fetch("/vendas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cli_cpf: cpf,
                itens: carrinho
            }),
        });

        if (!response.ok) throw new Error("Erro ao finalizar venda");
        
        alert("Venda finalizada com sucesso!");
        carrinho = [];
        document.getElementById("cli_cpf").value = "";
        document.getElementById("cliente-info").innerHTML = "";
        atualizarCarrinho();
    } catch (error) {
        console.error("Erro ao finalizar venda:", error);
        alert("Erro ao finalizar venda");
    }
}

// Inicializar página
document.addEventListener("DOMContentLoaded", function() {
    buscarProdutos();
    
    const cpfInput = document.getElementById("cli_cpf");
    if (cpfInput) {
        cpfInput.addEventListener("input", function(e) {
            let value = e.target.value.replace(/\D/g, "");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = value;
        });
    }
});

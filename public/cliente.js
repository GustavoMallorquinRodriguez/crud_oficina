async function cadastrarCliente(event) {
    event.preventDefault();


    const cliente = {
        cli_nome: document.getElementById("cli_nome").value,
        cli_data_nascimento: document.getElementById("cli_data_nascimento").value,
        cli_telefone: document.getElementById("cli_telefone").value,
        cli_cpf: document.getElementById("cli_cpf").value,
        cli_cep: document.getElementById("cli_cep").value,
        cli_cidade: document.getElementById("cli_cidade").value,
        cli_bairro: document.getElementById("cli_bairro").value,
        cli_complemento: document.getElementById("cli_complemento").value,
        cli_nome_rua: document.getElementById("cli_nome_rua").value,
        cli_numero_casa: document.getElementById("cli_numero_casa").value,
        cli_email: document.getElementById("cli_email").value
    };

    try {
        const response = await fetch("/clientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cliente),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Cliente cadastrado com sucesso!");
            document.getElementById("clienteForm").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar cliente.");
    }
}


// Função para atualizar as informações do cliente
async function atualizarCliente() {
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const endereco = document.getElementById("endereco").value;

    const clienteAtualizado = {
        nome,
        email,
        telefone,
        endereco,
        cpf,
    };

    try {
        const response = await fetch(`/clientes/cpf/${cpf}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(clienteAtualizado),
        });

        if (response.ok) {
            alert("Cliente atualizado com sucesso!");
        } else {
            const errorMessage = await response.text();
            alert("Erro ao atualizar cliente: " + errorMessage);
        }
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        alert("Erro ao atualizar cliente.");
    }
}

async function limpaCliente() {
    document.getElementById("nome").value = "";
    document.getElementById("cpf").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("endereco").value = "";
}

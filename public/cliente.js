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
            cli_email: document.getElementById("cli_email").value,
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
    async function listarClientes() {
        const cli_cpf = document.getElementById("cli_cpf").value.trim(); // Pega o valor do CPF digitado no input
    
        let url = "/clientes"; // URL padrão para todos os clientes
    
        if (cli_cpf) {
            // Se CPF foi digitado, adiciona o parâmetro de consulta
            url += `?cpf=${cli_cpf}`;
        }
    
        try {
            const response = await fetch(url);
            const clientes = await response.json();
    
            const tabela = document.getElementById("tabela-clientes");
            tabela.innerHTML = ""; // Limpa a tabela antes de preencher
    
            if (clientes.length === 0) {
                // Caso não encontre clientes, exibe uma mensagem
                tabela.innerHTML =
                    '<tr><td colspan="6">Nenhum cliente encontrado.</td></tr>';
            } else {
                clientes.forEach((cliente) => {
                    const linha = document.createElement("tr");
                    linha.innerHTML = `
                        <td>${cliente.id_cli}</td>
                        <td>${cliente.cli_nome}</td>
                        <td>${cliente.cli_telefone}</td>
                        <td>${cliente.cli_cpf}</td>
                        <td>${cliente.cli_nome_rua}</td>
                        <td>${cliente.cli_numero_casa}</td>
                        <td>${cliente.cli_email}</td>
                    `;
                    tabela.appendChild(linha);
                });
            }
        } catch (error) {
            console.error("Erro ao listar clientes:", error);
        }
    }
    
    // Função para atualizar as informações do cliente
    async function atualizarCliente() {
        const cli_nome = document.getElementById("cli_nome").value;
        const cli_data_nascimento = document.getElementById("cli_data_nascimento").value;
        const cli_telefone = document.getElementById("cli_telefone").value;
        const cli_cpf = document.getElementById("cli_cpf").value;
        const cli_cep = document.getElementById("cli_cep").value;
        const cli_cidade = document.getElementById("cli_cidade").value;
        const cli_bairro = document.getElementById("cli_bairro").value;
        const cli_complemento = document.getElementById("cli_complemento").value;
        const cli_nome_rua = document.getElementById("cli_nome_rua").value;
        const cli_numero_casa = document.getElementById("cli_numero_casa").value;
        const cli_email = document.getElementById("cli_email").value;
    
        const clienteAtualizado = {
            cli_nome,
            cli_data_nascimento,
            cli_telefone,
            cli_cep,
            cli_cidade,
            cli_bairro,
            cli_complemento,
            cli_nome_rua,
            cli_numero_casa,
            cli_email
        };
        
        try {
            const response = await fetch(`/clientes/cpf/${cli_cpf}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(clienteAtualizado)
            });
    
            if (response.ok) {
                alert("Cliente atualizado com sucesso!");
            } else {
                const errorMessage = await response.text();
                alert("Erro ao atualizar clientecliente1: " + errorMessage);
            }
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            alert("Erro ao atualizar clientecliente.");
        }
    }
    
    async function limpaCliente() {
        document.getElementById("nome").value = "";
        document.getElementById("cpf").value = "";
        document.getElementById("email").value = "";
        document.getElementById("telefone").value = "";
        document.getElementById("endereco").value = "";
    }
    
async function cadastrarCliente(event) {
    event.preventDefault();

    const cliente = {
        fun_nome: document.getElementById("fun_nome").value,
        fun_cpf: document.getElementById("fun_cpf")
            .value,
        fun_telefone: document.getElementById("fun_telefone").value,
        fun_setor: document.getElementById("fun_setor").value,
        fun_cargo: document.getElementById("fun_cargo").value,
        fun_data_nascimento: document.getElementById("fun_data_nascimento").value,
        fun_endereco: document.getElementById("fun_endereco").value,
        
    };

    try {
        const response = await fetch("/funcionario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cliente),
        });

        const result = await response.json();
        if (response.ok) {
            alert("funcionario cadastrado com sucesso!");
            document.getElementById("funcionarioForm").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar funcionario.");
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
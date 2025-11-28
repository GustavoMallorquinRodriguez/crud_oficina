/* ===== FUNÇÃO PARA CADASTRAR CLIENTE ===== */
async function cadastrarCliente(event) {
    event.preventDefault();

    const cli_nome = document.getElementById("cli_nome").value;
    const cli_cpf = document.getElementById("cli_cpf").value.replace(/\D/g, "");
    
    const cliente = {
        cli_nome: cli_nome,
        cli_data_nascimento: document.getElementById("cli_data_nascimento").value,
        cli_telefone: document.getElementById("cli_telefone").value,
        cli_cpf: cli_cpf,
        cli_cep: document.getElementById("cli_cep").value,
        cli_cidade: document.getElementById("cli_cidade").value,
        cli_bairro: document.getElementById("cli_bairro").value,
        cli_complemento: document.getElementById("cli_complemento").value,
        cli_nome_rua: document.getElementById("cli_nome_rua").value,
        cli_numero_casa: document.getElementById("cli_numero_casa").value,
        cli_email: document.getElementById("cli_email").value,
        id_mt: null,
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
            alert("Cliente cadastrado com sucesso! Você será redirecionado para cadastro de moto.");
            document.getElementById("clienteForm").reset();
            
            const params = new URLSearchParams({
                cli_nome: cli_nome,
                cli_cpf: cli_cpf
            });
            window.location.href = `cadastromoto.html?${params.toString()}`;
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar cliente.");
    }
}

/* ===== FUNÇÃO PARA LISTAR CLIENTES ===== */
async function listarClientes() {
    const cli_cpf = document.getElementById("cli_cpf").value.trim();

    let url = "/clientes";

    if (cli_cpf) {
        url += `?cpf=${cli_cpf}`;
    }

    try {
        const response = await fetch(url);
        const clientes = await response.json();

        const tabela = document.getElementById("tabela-clientes");
        tabela.innerHTML = "";

        if (clientes.length === 0) {
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
                        <td>${cliente.id_mt}</td> 
                    `;

                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar clientes:", error);
    }
}

/* ===== FUNÇÃO PARA ATUALIZAR DADOS DO CLIENTE ===== */
async function atualizarCliente() {
    const cli_nome = document.getElementById("cli_nome").value;
    const cli_data_nascimento = document.getElementById(
        "cli_data_nascimento",
    ).value;
    const cli_telefone = document.getElementById("cli_telefone").value;
    const cli_cpf = document.getElementById("cli_cpf").value;
    const cli_cep = document.getElementById("cli_cep").value;
    const cli_cidade = document.getElementById("cli_cidade").value;
    const cli_bairro = document.getElementById("cli_bairro").value;
    const cli_complemento = document.getElementById("cli_complemento").value;
    const cli_nome_rua = document.getElementById("cli_nome_rua").value;
    const cli_numero_casa = document.getElementById("cli_numero_casa").value;
    const cli_email = document.getElementById("cli_email").value;
    const id_mt = document.getElementById("id_mt").value;

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
        cli_email,
        id_mt,
    };

    try {
        const response = await fetch(`/clientes/cpf/${cli_cpf}`, {
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
            alert("Erro ao atualizar clientecliente1: " + errorMessage);
        }
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        alert("Erro ao atualizar clientecliente.");
    }
}

/* ===== FUNÇÃO PARA LIMPAR CAMPOS DO FORMULÁRIO ===== */
async function limpaCliente() {
    document.getElementById("nome").value = "";
    document.getElementById("cpf").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("endereco").value = "";
}

/* ===== FUNÇÃO PARA BUSCAR ENDEREÇO PELO CEP (INTEGRAÇÃO COM VIACEP) ===== */
async function buscarEnderecoPorCEP() {
    const cep = document.getElementById("cli_cep").value.replace(/\D/g, "");

    if (cep.length !== 8) {
        alert("Digite um CEP válido com 8 dígitos.");
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert("CEP não encontrado.");
            return;
        }

        document.getElementById("cli_cidade").value = data.localidade;
        document.getElementById("cli_bairro").value = data.bairro;
        document.getElementById("cli_nome_rua").value = data.logradouro;
        document.getElementById("cli_complemento").value = data.complemento;
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        alert("Erro ao buscar o CEP.");
    }
}

/* ===== VALIDAÇÃO E FORMATAÇÃO DO CAMPO CPF ===== */
document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("cli_cpf");
    
    if (input) {
        input.addEventListener("input", () => {
            let s = input.value.replace(/\D/g, "");
            if (s.length > 14) s = s.slice(0, 14);
            input.value = s;
        });
    }
});

async function cadastrarfuncionario(event) {
    event.preventDefault();

    const funcionario = {
        fun_nome: document.getElementById("fun_nome").value,
        fun_cpf: document.getElementById("fun_cpf").value,
        fun_telefone: document.getElementById("fun_telefone").value,
        fun_setor: document.getElementById("fun_setor").value,
        fun_cargo: document.getElementById("fun_cargo").value,
        fun_data_nascimento: document.getElementById("fun_data_nascimento")
            .value,
        fun_endereco: document.getElementById("fun_endereco").value,
    };

    try {
        const response = await fetch("/funcionario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(funcionario),
        });

        const result = await response.json();
        if (response.ok) {
            alert("funcionario cadastrado com sucesso!");
            document.getElementById("cadastro-form").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar funcionario.");
    }
}
async function listarClientes() {
    const fun_cpf = document.getElementById("fun_cpf").value.trim(); // Pega o valor do CPF digitado no input

    let url = "/funcionario"; // URL padrão para todos os clientes

    if (fun_cpf) {
        // Se CPF foi digitado, adiciona o parâmetro de consulta
        url += `?cpf=${fun_cpf}`;
    }

    try {
        const response = await fetch(url);
        const funcionario = await response.json();

        const tabela = document.getElementById("tabela-funcionario");
        tabela.innerHTML = ""; // Limpa a tabela antes de preencher

        if (funcionario.length === 0) {
            // Caso não encontre clientes, exibe uma mensagem
            tabela.innerHTML =
                '<tr><td colspan="6">Nenhum funcionario encontrado.</td></tr>';
        } else {
            funcionario.forEach((funcionario) => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${funcionario.id_fun}</td>
                    <td>${funcionario.fun_nome}</td>
                    <td>${funcionario.fun_cpf}</td>
                    <td>${funcionario.fun_telefone}</td>
                    <td>${funcionario.fun_setor}</td>
                    <td>${funcionario.fun_cargo}</td>
                    <td>${funcionario.fun_data_nascimento}</td>
                    <td>${funcionario.fun_endereco}</td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar funcionario:", error);
    }
}
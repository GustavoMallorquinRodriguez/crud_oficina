async function cadastrarmoto(event) {
    event.preventDefault();

    const moto = {
        id_cli: document.getElementById("id_cli").value,
        mt_placa: document.getElementById("mt_placa").value,
        mt_modelo: document.getElementById("mt_modelo").value,
        mt_ano: document.getElementById("mt_ano").value,
        id_servico: document.getElementById("id_servico").value,
    };

    try {
        const response = await fetch("/moto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
    
            body: JSON.stringify(moto),
        });

        const result = await response.json();
        if (response.ok) {
            alert("moto cadastrado com sucesso!");
            document.getElementById("cadastro-form").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar moto.");
    }
}
async function listarfuncionario() {
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

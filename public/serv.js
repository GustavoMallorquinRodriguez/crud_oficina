async function cadastrarservicos(event) {
    event.preventDefault();

    const servicos = {
        id_fun: document.getElementById("id_fun").value,
        serv_tipo: document.getElementById("serv_tipo").value,
        id_mt: document.getElementById("id_mt").value,
        serv_data_entrada: document.getElementById("serv_data_entrada").value,
        serv_data_saida: document.getElementById("serv_data_saida").value,
        serv_orcamento: document.getElementById("serv_orcamento").value,
        serv_observacao: document.getElementById("serv_observacao").value,
    };

    try {
        const response = await fetch("/servicos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(servicos),
        });

        const result = await response.json();
        if (response.ok) {
            alert("servicos cadastrado com sucesso!");
            document.getElementById("servico-Form").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar servicos.");
    }
}

async function listarservicos() {
    const id_mt = document.getElementById("id_mt").value.trim(); // Pega o valor do CPF digitado no input

    let url = "/servicos"; // URL padrão para todos os servicos

    if (id_mt) {
        // Se CPF foi digitado, adiciona o parâmetro de consulta
        url += `?cpf=${id_mt}`;
    }

    try {
        const response = await fetch(url);
        const servicos = await response.json();

        const tabela = document.getElementById("tabela-servicos");
        tabela.innerHTML = ""; // Limpa a tabela antes de preencher

        if (servicos.length === 0) {
            // Caso não encontre servicos, exibe uma mensagem
            tabela.innerHTML =
                '<tr><td colspan="6">Nenhum servicos encontrado.</td></tr>';
        } else {
            servicos.forEach((servicos) => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${servicos.id_mt}</td>
                    <td>${servicos.id_fun}</td>
                    <td>${servicos.serv_orcamento}</td>
                    <td>${servicos.serv_data_entrada}</td>
                    <td>${servicos.serv_data_saida}</td>
                    <td>${servicos.serv_tipo}</td>
                    <td>${servicos.serv_observacao}</td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar servicos:", error);
    }
}
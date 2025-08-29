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
            document.getElementById("cadastro-moto").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar moto.");
    }
}
async function listarmoto() {
    const mt_placa = document.getElementById("mt_placa").value.trim(); // Pega o valor da placa digitado no input

    let url = "/moto"; // URL padrão para todos os clientes

    if (mt_placa) {
        // Se placa foi digitado, adiciona o parâmetro de consulta
        url += `?placa=${mt_placa}`;
    }

    try {
        const response = await fetch(url);
        const moto = await response.json();

        const tabela = document.getElementById("tabela-moto");
        tabela.innerHTML = ""; // Limpa a tabela antes de preencher

        if (moto.length === 0) {
            // Caso não encontre motos, exibe uma mensagem
            tabela.innerHTML =
                '<tr><td colspan="6">Nenhuma moto encontrado.</td></tr>';
        } else {
            moto.forEach((moto) => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${moto.id_mt}</td>
                    <td>${moto.id_cli}</td>
                    <td>${moto.mt_placa}</td>
                    <td>${moto.mt_modelo}</td>
                    <td>${moto.mt_ano}</td>
                    <td>${moto.id_servico}</td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar funcionario:", error);
    }
}

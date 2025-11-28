function carregarDadosCliente() {
    const params = new URLSearchParams(window.location.search);
    const cli_nome = params.get('cli_nome');
    const cli_cpf = params.get('cli_cpf');
    
    if (cli_nome) {
        document.getElementById("cli_nome").value = cli_nome;
    }
    if (cli_cpf) {
        document.getElementById("cli_cpf").value = cli_cpf;
    }
}

async function cadastrarmoto() {
    const cli_nome = document.getElementById("cli_nome").value.trim();
    const cli_cpf = document.getElementById("cli_cpf").value.replace(/\D/g, "");
    const mt_placa = document.getElementById("mt_placa").value.trim();
    const mt_modelo = document.getElementById("mt_modelo").value.trim();
    const mt_ano = document.getElementById("mt_ano").value.trim();

    if (!cli_cpf || !mt_placa || !mt_modelo || !mt_ano) {
        alert("Por favor, preencha todos os campos de moto.");
        return;
    }

    try {
        const motoData = {
            mt_placa,
            mt_modelo,
            mt_ano,
        };

        const motoResponse = await fetch("/moto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(motoData),
        });

        if (!motoResponse.ok) {
            const errorResult = await motoResponse.json();
            alert(`Erro ao cadastrar moto: ${errorResult.message}`);
            return;
        }

        const motoResult = await motoResponse.json();
        const motoId = motoResult.id;

        const clienteResponse = await fetch(`/clientes?cpf=${cli_cpf}`);
        const clientes = await clienteResponse.json();

        if (clientes.length === 0) {
            alert("Cliente não encontrado. Moto registrada mas não associada a cliente.");
            document.getElementById("cadastro-moto").reset();
            listarmoto();
            return;
        }

        const cliente = clientes[0];
        const clienteUpdateData = {
            cli_nome: cliente.cli_nome,
            cli_data_nascimento: cliente.cli_data_nascimento,
            cli_telefone: cliente.cli_telefone,
            cli_cep: cliente.cli_cep,
            cli_cidade: cliente.cli_cidade,
            cli_bairro: cliente.cli_bairro,
            cli_complemento: cliente.cli_complemento,
            cli_nome_rua: cliente.cli_nome_rua,
            cli_numero_casa: cliente.cli_numero_casa,
            cli_email: cliente.cli_email,
            id_mt: motoId,
        };

        const updateResponse = await fetch(`/clientes/cpf/${cli_cpf}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(clienteUpdateData),
        });

        if (updateResponse.ok) {
            alert("Moto cadastrada com sucesso!");
            document.getElementById("cadastro-moto").reset();
            carregarDadosCliente();
            listarmoto();
        } else {
            alert("Moto cadastrada, mas houve erro ao associar ao cliente.");
            listarmoto();
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar moto.");
    }
}

async function listarmoto() {
    try {
        const response = await fetch("/moto");
        const motos = await response.json();

        const tabela = document.getElementById("tabela-moto");
        tabela.innerHTML = "";

        document.getElementById("totalClientes").textContent = motos.length;

        if (motos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="3">Nenhuma moto cadastrada.</td></tr>';
        } else {
            motos.forEach((moto) => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${moto.mt_placa || '-'}</td>
                    <td>${moto.mt_modelo || '-'}</td>
                    <td>${moto.mt_ano || '-'}</td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar motos:", error);
    }
}

async function cadastrarmoto(event) {
    event.preventDefault();

    const moto = {
        mt_placa: document.getElementById("mt_placa").value,
        mt_modelo: document.getElementById("mt_modelo").value,
        mt_ano: document.getElementById("mt_ano").value,
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
            alert("Moto cadastrada com sucesso!");
            document.getElementById("cadastro-moto").reset();
            listarmoto();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitacao:", err);
        alert("Erro ao cadastrar moto.");
    }
}

async function listarmoto() {
    try {
        const response = await fetch("/moto");
        const motos = await response.json();

        const tabela = document.getElementById("tabela-moto");
        const totalMotos = document.getElementById("totalClientes");
        tabela.innerHTML = "";

        if (motos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhuma moto encontrada.</td></tr>';
            if (totalMotos) totalMotos.textContent = "0";
        } else {
            if (totalMotos) totalMotos.textContent = motos.length;
            motos.forEach((moto) => {
                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td>${moto.id_mt}</td>
                    <td>${moto.mt_placa || ''}</td>
                    <td>${moto.mt_modelo || ''}</td>
                    <td>${moto.mt_ano || ''}</td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar motos:", error);
    }
}

async function atualizarMoto() {
    const mt_placa = document.getElementById("mt_placa").value;
    const mt_modelo = document.getElementById("mt_modelo").value;
    const mt_ano = document.getElementById("mt_ano").value;

    if (!mt_placa) {
        alert("Por favor, informe a placa da moto para atualizar.");
        return;
    }

    const motoAtualizado = {
        mt_modelo,
        mt_ano,
    };

    try {
        const response = await fetch(`/moto/placa/${mt_placa}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(motoAtualizado),
        });

        if (response.ok) {
            alert("Moto atualizada com sucesso!");
            document.getElementById("cadastro-moto").reset();
            listarmoto();
        } else {
            const errorMessage = await response.text();
            alert("Erro ao atualizar moto: " + errorMessage);
        }
    } catch (error) {
        console.error("Erro ao atualizar moto:", error);
        alert("Erro ao atualizar moto.");
    }
}

function limpaCliente() {
    document.getElementById("cadastro-moto").reset();
}

document.addEventListener("DOMContentLoaded", function() {
    listarmoto();
});

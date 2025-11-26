document.addEventListener("DOMContentLoaded", function() {
    loadClients();
});

async function loadClients() {
    try {
        const response = await fetch("/clientes");
        const clientes = await response.json();

        const tabela = document.getElementById("clientTableBody");
        const totalClientes = document.getElementById("totalClientes");
        const noClientsMessage = document.getElementById("noClientsMessage");
        
        tabela.innerHTML = "";

        if (clientes.length === 0) {
            noClientsMessage.style.display = "block";
            totalClientes.textContent = "0";
        } else {
            noClientsMessage.style.display = "none";
            totalClientes.textContent = clientes.length;
            
            clientes.forEach((cliente) => {
                const linha = document.createElement("tr");
                const motoInfo = cliente.mt_placa 
                    ? `${cliente.mt_placa} - ${cliente.mt_modelo || ''}`
                    : 'Sem moto';
                    
                linha.innerHTML = `
                    <td>${cliente.id_cli}</td>
                    <td>${cliente.cli_nome || ''}</td>
                    <td>${cliente.cli_telefone || ''}</td>
                    <td>${cliente.cli_cpf || ''}</td>
                    <td>${cliente.cli_nome_rua || ''}</td>
                    <td>${cliente.cli_numero_casa || ''}</td>
                    <td>${cliente.cli_email || ''}</td>
                    <td>${motoInfo}</td>
                    <td>
                        <button class="edit-btn" onclick="editClient('${cliente.cli_cpf}')">Editar</button>
                    </td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar clientes:", error);
    }
}

function editClient(cpf) {
    fetch(`/clientes?cpf=${cpf}`)
        .then(response => response.json())
        .then(clientes => {
            if (clientes.length > 0) {
                const cliente = clientes[0];
                document.getElementById("editClientId").value = cliente.id_cli;
                document.getElementById("editClientName").value = cliente.cli_nome || '';
                document.getElementById("editClientPhone").value = cliente.cli_telefone || '';
                document.getElementById("editClientCpf").value = cliente.cli_cpf || '';
                document.getElementById("editClientStreet").value = cliente.cli_nome_rua || '';
                document.getElementById("editClientNumber").value = cliente.cli_numero_casa || '';
                document.getElementById("editClientEmail").value = cliente.cli_email || '';
                
                document.getElementById("editModal").style.display = "flex";
            }
        })
        .catch(error => console.error("Erro ao buscar cliente:", error));
}

function closeModal() {
    document.getElementById("editModal").style.display = "none";
}

async function saveClient() {
    const cpf = document.getElementById("editClientCpf").value;
    const clientData = {
        cli_nome: document.getElementById("editClientName").value,
        cli_telefone: document.getElementById("editClientPhone").value,
        cli_nome_rua: document.getElementById("editClientStreet").value,
        cli_numero_casa: document.getElementById("editClientNumber").value,
        cli_email: document.getElementById("editClientEmail").value
    };

    try {
        const response = await fetch(`/clientes/cpf/${cpf}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(clientData)
        });

        if (response.ok) {
            alert("Cliente atualizado com sucesso!");
            closeModal();
            loadClients();
        } else {
            alert("Erro ao atualizar cliente.");
        }
    } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        alert("Erro ao salvar cliente.");
    }
}

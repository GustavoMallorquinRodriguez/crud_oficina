async function cadastrarfuncionario(event) {
    event.preventDefault();

    const funcionario = {
        fun_nome: document.getElementById("fun_nome").value,
        fun_cpf: document.getElementById("fun_cpf").value,
        fun_telefone: document.getElementById("fun_telefone").value,
        fun_endereco: document.getElementById("fun_endereco").value,
        fun_salario: parseFloat(document.getElementById("fun_salario").value) || 0,
        fun_cargo: document.getElementById("fun_cargo").value,
        fun_senha: document.getElementById("fun_senha").value,
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
            alert("Funcionário cadastrado com sucesso!");
            document.getElementById("cadastro-form").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar funcionário.");
    }
}

async function listarfuncionario() {
    const fun_cpf = document.getElementById("fun_cpf").value.trim();

    let url = "/funcionario";

    if (fun_cpf) {
        url += `?cpf=${fun_cpf}`;
    }

    try {
        const response = await fetch(url);
        const funcionarios = await response.json();

        const tabela = document.getElementById("tabela-funcionario");
        tabela.innerHTML = "";

        document.getElementById("totalFuncionarios").textContent = funcionarios.length;

        if (funcionarios.length === 0) {
            tabela.innerHTML =
                '<tr><td colspan="7">Nenhum funcionário encontrado.</td></tr>';
        } else {
            funcionarios.forEach((funcionario) => {
                const linha = document.createElement("tr");
                const salarioFormatado = funcionario.fun_salario 
                    ? `R$ ${funcionario.fun_salario.toFixed(2).replace('.', ',')}` 
                    : '-';
                linha.innerHTML = `
                    <td>${funcionario.id_fun}</td>
                    <td>${funcionario.fun_nome || '-'}</td>
                    <td>${funcionario.fun_cpf || '-'}</td>
                    <td>${funcionario.fun_telefone || '-'}</td>
                    <td>${funcionario.fun_endereco || '-'}</td>
                    <td>${salarioFormatado}</td>
                    <td>${funcionario.fun_cargo || '-'}</td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error("Erro ao listar funcionários:", error);
    }
}

async function atualizarfuncionario() {
    const fun_cpf = document.getElementById("fun_cpf").value;
    
    if (!fun_cpf) {
        alert("CPF é obrigatório para atualizar.");
        return;
    }

    const funcionarioAtualizado = {
        fun_nome: document.getElementById("fun_nome").value,
        fun_telefone: document.getElementById("fun_telefone").value,
        fun_endereco: document.getElementById("fun_endereco").value,
        fun_salario: parseFloat(document.getElementById("fun_salario").value) || 0,
        fun_cargo: document.getElementById("fun_cargo").value,
    };

    const senha = document.getElementById("fun_senha").value;
    if (senha) {
        funcionarioAtualizado.fun_senha = senha;
    }

    try {
        const response = await fetch(`/funcionario/cpf/${fun_cpf}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(funcionarioAtualizado),
        });

        if (response.ok) {
            alert("Funcionário atualizado com sucesso!");
        } else {
            const errorMessage = await response.text();
            alert("Erro ao atualizar funcionário: " + errorMessage);
        }
    } catch (error) {
        console.error("Erro ao atualizar funcionário:", error);
        alert("Erro ao atualizar funcionário.");
    }
}

function limparFormulario() {
    document.getElementById("cadastro-form").reset();
}

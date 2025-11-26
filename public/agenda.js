async function carregarClientes() {
    try {
        const response = await fetch('/clientes');
        const clientes = await response.json();
        const select = document.getElementById('cli_cpf');
        
        select.innerHTML = '<option value="">Selecione o cliente</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.cli_cpf;
            option.textContent = `${cliente.cli_nome} (${cliente.cli_cpf})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
}

async function carregarMotos() {
    try {
        const response = await fetch('/moto');
        const motos = await response.json();
        const select = document.getElementById('mt_placa');
        
        select.innerHTML = '<option value="">Selecione a moto</option>';
        motos.forEach(moto => {
            const option = document.createElement('option');
            option.value = moto.mt_placa;
            option.textContent = `${moto.mt_placa} - ${moto.mt_modelo || 'Sem modelo'}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar motos:', error);
    }
}

async function carregarServicos() {
    try {
        const response = await fetch('/servico');
        const servicos = await response.json();
        const select = document.getElementById('id_servico');
        
        select.innerHTML = '<option value="">Selecione o serviço</option>';
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = servico.serv_nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

async function carregarFuncionarios() {
    try {
        const response = await fetch('/funcionario');
        const funcionarios = await response.json();
        const select = document.getElementById('fun_cpf');
        
        select.innerHTML = '<option value="">Selecione o funcionário</option>';
        funcionarios.forEach(func => {
            const option = document.createElement('option');
            option.value = func.fun_cpf;
            option.textContent = `${func.fun_nome} (${func.fun_cpf})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
    }
}

async function adicionarServico() {
    const novoServico = document.getElementById('novo_servico').value.trim();
    
    if (!novoServico) {
        alert('Digite o nome do serviço.');
        return;
    }
    
    try {
        const response = await fetch('/servico', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ serv_nome: novoServico })
        });
        
        if (response.ok) {
            document.getElementById('novo_servico').value = '';
            await carregarServicos();
            alert('Serviço adicionado com sucesso!');
        } else {
            const result = await response.json();
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao adicionar serviço:', error);
        alert('Erro ao adicionar serviço.');
    }
}

async function cadastrarAgendamento() {
    const cli_cpf = document.getElementById('cli_cpf').value;
    const mt_placa = document.getElementById('mt_placa').value;
    const age_entrada = document.getElementById('age_entrada').value;
    const id_servico = document.getElementById('id_servico').value;
    const fun_cpf = document.getElementById('fun_cpf').value;
    const age_saida = document.getElementById('age_saida').value;
    
    if (!cli_cpf || !mt_placa || !age_entrada || !id_servico || !fun_cpf) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const agendamento = {
        cli_cpf,
        mt_placa,
        age_entrada,
        id_servico: parseInt(id_servico),
        fun_cpf,
        age_saida: age_saida || null
    };
    
    try {
        const response = await fetch('/agendamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(agendamento)
        });
        
        if (response.ok) {
            document.getElementById('successMessage').style.display = 'block';
            setTimeout(() => {
                document.getElementById('successMessage').style.display = 'none';
            }, 3000);
            document.getElementById('agendaForm').reset();
            listarAgendamentos();
        } else {
            const result = await response.json();
            alert('Erro: ' + result.message);
        }
    } catch (error) {
        console.error('Erro ao cadastrar agendamento:', error);
        alert('Erro ao cadastrar agendamento.');
    }
}

async function listarAgendamentos() {
    try {
        const response = await fetch('/agendamento');
        const agendamentos = await response.json();
        const tabela = document.getElementById('tabela-agendamentos');
        
        if (agendamentos.length === 0) {
            tabela.innerHTML = '<tr><td colspan="8">Nenhum agendamento cadastrado.</td></tr>';
            return;
        }
        
        tabela.innerHTML = '';
        agendamentos.forEach(ag => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ag.id}</td>
                <td>${ag.cli_nome || ag.cli_cpf}</td>
                <td>${ag.mt_placa} ${ag.mt_modelo ? '(' + ag.mt_modelo + ')' : ''}</td>
                <td>${formatarData(ag.age_entrada)}</td>
                <td>${ag.serv_nome || '-'}</td>
                <td>${ag.fun_nome || ag.fun_cpf}</td>
                <td>${ag.age_saida ? formatarData(ag.age_saida) : '-'}</td>
                <td>
                    <button class="btn-excluir" onclick="excluirAgendamento(${ag.id})">Excluir</button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
    }
}

async function excluirAgendamento(id) {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
        return;
    }
    
    try {
        const response = await fetch(`/agendamento/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Agendamento excluído com sucesso!');
            listarAgendamentos();
        } else {
            alert('Erro ao excluir agendamento.');
        }
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        alert('Erro ao excluir agendamento.');
    }
}

function formatarData(dataStr) {
    if (!dataStr) return '-';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
}

document.addEventListener('DOMContentLoaded', function() {
    carregarClientes();
    carregarMotos();
    carregarServicos();
    carregarFuncionarios();
    listarAgendamentos();
});

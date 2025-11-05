async function buscaServico() {

    fetch('/buscar-servicos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar serviços');
            }
            return response.json();
        })
        .then(servicos => {
            const select = document.getElementById('servicoSelecionado');
            servicos.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id; // Usa o id como valor
                option.textContent = servico.nome; // Nome do serviço exibido
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os serviços:', error);
        });
}
async function buscaHorariosDisponiveis() {
    const data = document.getElementById("data").value;
    const id = document.getElementById("servicoSelecionado").value;
    // Verifica se ambos os campos estão preenchidos
    if (!data || !id) {
        return; // Aguarde até que ambos os campos estejam preenchidos
    }

    fetch(`/horarios-disponiveis?data=${data}&id=${id}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erro ao buscar horários disponíveis");
            }

            return response.json();
        })
        .then((horariosDisponiveis) => {
            const selectHorario = document.getElementById("horaSelecionada");
            selectHorario.innerHTML =
                '<option value="">Selecione o Horário</option>';

            if (horariosDisponiveis.length > 0) {
                horariosDisponiveis.forEach((horario) => {
                    const option = document.createElement("option");
                    option.value = horario;
                    option.textContent = horario;
                    selectHorario.appendChild(option);
                });
            } else {
                alert("Não há horários disponíveis para esta data e serviço.");
            }
        })
        .catch((error) => {
            console.error("Erro ao carregar horários disponíveis:", error);
        });
}

async function cadastrarAgendamento(event) {
    event.preventDefault();

    const age_entrada = document.getElementById("age_entrada").value;
    const age_saida = document.getElementById("age_saida").value;
    const cli_cpf = document.getElementById("cli_cpf").value;
    const fun_cpf = document.getElementById("fun_cpf").value;
    const id_servico = document.getElementById("id_servico").value;
    const mt_placa = document.getElementById("mt_placa").value;

    if (
        !age_entrada ||
        !age_saida ||
        !cli_cpf ||
        !fun_cpf ||
        !id_servico ||
        !mt_placa
    ) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const resp = await fetch("/cadastrar-agendamento", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                age_entrada,
                age_saida,
                cli_cpf,
                fun_cpf,
                id_servico,
                mt_placa,
            }),
        });

        const texto = await resp.text();

        if (!resp.ok) {
            console.error("Falha no cadastro:", texto);
            alert(`Erro ao cadastrar: ${texto}`);
            return;
        }

        alert("Agendamento cadastrado com sucesso!");
        document.getElementById("agendaForm").reset();
    } catch (e) {
        console.error("Erro ao cadastrar agendamento:", e);
        alert("Erro de rede ao cadastrar.");
    }
}
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/* ===== FUNÇÃO PARA CADASTRAR CLIENTE ===== */
async function cadastrarCliente(event) {
    event.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)

    // Cria um objeto com todos os dados do cliente coletados do formulário
    const cliente = {
        cli_nome: document.getElementById("cli_nome").value, // Nome completo do cliente
        cli_data_nascimento: document.getElementById("cli_data_nascimento")
            .value, // Data de nascimento
        cli_telefone: document.getElementById("cli_telefone").value, // Telefone de contato
        cli_cpf: document.getElementById("cli_cpf").value, // CPF (documento)
        cli_cep: document.getElementById("cli_cep").value, // CEP (código postal)
        cli_cidade: document.getElementById("cli_cidade").value, // Cidade
        cli_bairro: document.getElementById("cli_bairro").value, // Bairro
        cli_complemento: document.getElementById("cli_complemento").value, // Complemento do endereço
        cli_nome_rua: document.getElementById("cli_nome_rua").value, // Nome da rua
        cli_numero_casa: document.getElementById("cli_numero_casa").value, // Número da casa/apto
        cli_email: document.getElementById("cli_email").value, // E-mail
        id_mt: document.getElementById("id_mt").value, // Moto(s)
    };

    try {
        // Envia uma requisição POST para o servidor com os dados do cliente
        const response = await fetch("/clientes", {
            method: "POST", // Método HTTP para criação de recursos
            headers: {
                "Content-Type": "application/json", // Indica que está enviando JSON
            },
            body: JSON.stringify(cliente), // Converte o objeto cliente para string JSON
        });

        const result = await response.json(); // Converte a resposta do servidor para objeto JavaScript

        if (response.ok) {
            // Verifica se a resposta foi bem-sucedida (status 200-299)
            alert("Cliente cadastrado com sucesso!"); // Exibe mensagem de sucesso
            document.getElementById("clienteForm").reset(); // Limpa todos os campos do formulário
        } else {
            alert(`Erro: ${result.message}`); // Exibe mensagem de erro retornada pelo servidor
        }
    } catch (err) {
        // Captura erros de rede ou outros erros inesperados
        console.error("Erro na solicitação:", err); // Registra o erro no console
        alert("Erro ao cadastrar cliente."); // Exibe mensagem genérica de erro
    }
}

/* ===== FUNÇÃO PARA LISTAR CLIENTES ===== */
async function listarClientes() {
    // Pega o valor do CPF digitado no input e remove espaços em branco
    const cli_cpf = document.getElementById("cli_cpf").value.trim();

    let url = "/clientes"; // URL padrão para buscar todos os clientes

    if (cli_cpf) {
        // Se um CPF foi digitado, adiciona como parâmetro de consulta na URL
        // Isso permite filtrar clientes por CPF específico
        url += `?cpf=${cli_cpf}`;
    }

    try {
        // Faz uma requisição GET para buscar os clientes
        const response = await fetch(url);
        const clientes = await response.json(); // Converte a resposta para array de objetos

        // Seleciona o corpo da tabela onde os clientes serão exibidos
        const tabela = document.getElementById("tabela-clientes");
        tabela.innerHTML = ""; // Limpa o conteúdo anterior da tabela

        if (clientes.length === 0) {
            // Se não encontrou nenhum cliente, exibe mensagem informativa
            tabela.innerHTML =
                '<tr><td colspan="6">Nenhum cliente encontrado.</td></tr>';
        } else {
            // Itera sobre cada cliente retornado
            clientes.forEach((cliente) => {
                const linha = document.createElement("tr"); // Cria uma nova linha da tabela

                // Preenche a linha com os dados do cliente usando template literal
                linha.innerHTML = `
                        <td>${cliente.id_cli}</td>           <!-- ID do cliente -->
                        <td>${cliente.cli_nome}</td>         <!-- Nome -->
                        <td>${cliente.cli_telefone}</td>     <!-- Telefone -->
                        <td>${cliente.cli_cpf}</td>          <!-- CPF -->
                        <td>${cliente.cli_nome_rua}</td>     <!-- Rua -->
                        <td>${cliente.cli_numero_casa}</td>  <!-- Número -->
                        <td>${cliente.cli_email}</td>        <!-- E-mail -->
                        <td>${cliente.id_mt}</td> 
                    `;

                tabela.appendChild(linha); // Adiciona a linha preenchida à tabela
            });
        }
    } catch (error) {
        // Captura erros na requisição ou processamento
        console.error("Erro ao listar clientes:", error);
    }
}

/* ===== FUNÇÃO PARA ATUALIZAR DADOS DO CLIENTE ===== */
async function atualizarCliente() {
    // Coleta todos os valores atualizados dos campos do formulário
    const cli_nome = document.getElementById("cli_nome").value;
    const cli_data_nascimento = document.getElementById(
        "cli_data_nascimento",
    ).value;
    const cli_telefone = document.getElementById("cli_telefone").value;
    const cli_cpf = document.getElementById("cli_cpf").value; // CPF usado como identificador
    const cli_cep = document.getElementById("cli_cep").value;
    const cli_cidade = document.getElementById("cli_cidade").value;
    const cli_bairro = document.getElementById("cli_bairro").value;
    const cli_complemento = document.getElementById("cli_complemento").value;
    const cli_nome_rua = document.getElementById("cli_nome_rua").value;
    const cli_numero_casa = document.getElementById("cli_numero_casa").value;
    const cli_email = document.getElementById("cli_email").value;
    const id_mt = document.getElementById("id_mt").value;

    // Cria objeto com os dados atualizados (não inclui CPF pois é usado na URL)
    const clienteAtualizado = {
        cli_nome,
        cli_data_nascimento,
        cli_telefone,
        cli_cep,
        cli_cidade,
        cli_bairro,
        cli_complemento,
        cli_nome_rua,
        cli_numero_casa,
        cli_email,
        id_mt,
    };

    try {
        // Envia requisição PUT para atualizar o cliente identificado pelo CPF
        const response = await fetch(`/clientes/cpf/${cli_cpf}`, {
            method: "PUT", // Método HTTP para atualização de recursos
            headers: {
                "Content-Type": "application/json", // Indica envio de JSON
            },
            body: JSON.stringify(clienteAtualizado), // Converte dados para JSON
        });

        if (response.ok) {
            // Verifica se a atualização foi bem-sucedida
            alert("Cliente atualizado com sucesso!");
        } else {
            // Se houver erro, pega a mensagem de erro do servidor
            const errorMessage = await response.text();
            // Nota: há um erro de digitação "clientecliente1" no texto original
            alert("Erro ao atualizar clientecliente1: " + errorMessage);
        }
    } catch (error) {
        // Captura erros de rede ou outros problemas
        console.error("Erro ao atualizar cliente:", error);
        // Nota: há um erro de digitação "clientecliente" no texto original
        alert("Erro ao atualizar clientecliente.");
    }
}

/* ===== FUNÇÃO PARA LIMPAR CAMPOS DO FORMULÁRIO ===== */
async function limpaCliente() {
    // Limpa o valor de cada campo do formulário
    // OBSERVAÇÃO: Os IDs aqui não correspondem aos usados nas outras funções
    // Parece haver uma inconsistência no código original
    document.getElementById("nome").value = ""; // Deveria ser "cli_nome"
    document.getElementById("cpf").value = ""; // Deveria ser "cli_cpf"
    document.getElementById("email").value = ""; // Deveria ser "cli_email"
    document.getElementById("telefone").value = ""; // Deveria ser "cli_telefone"
    document.getElementById("endereco").value = ""; // Este campo não existe nas outras funções
}

/* ===== FUNÇÃO PARA BUSCAR ENDEREÇO PELO CEP (INTEGRAÇÃO COM VIACEP) ===== */
async function buscarEnderecoPorCEP() {
    // Pega o valor do CEP e remove todos os caracteres não numéricos (hífen, pontos, etc)
    const cep = document.getElementById("cli_cep").value.replace(/\D/g, "");

    // Valida se o CEP tem exatamente 8 dígitos
    if (cep.length !== 8) {
        alert("Digite um CEP válido com 8 dígitos.");
        return; // Interrompe a execução se o CEP for inválido
    }

    try {
        // Faz uma requisição à API pública do ViaCEP
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json(); // Converte a resposta para objeto

        if (data.erro) {
            // A API retorna {erro: true} quando o CEP não existe
            alert("CEP não encontrado.");
            return;
        }

        // Preenche automaticamente os campos do formulário com os dados retornados
        document.getElementById("cli_cidade").value = data.localidade; // Cidade
        document.getElementById("cli_bairro").value = data.bairro; // Bairro
        document.getElementById("cli_nome_rua").value = data.logradouro; // Nome da rua
        document.getElementById("cli_complemento").value = data.complemento; // Complemento (se houver)
    } catch (error) {
        // Captura erros na requisição à API
        console.error("Erro ao buscar CEP:", error);
        alert("Erro ao buscar o CEP.");
    }
}

/* ===== VALIDAÇÃO E FORMATAÇÃO DO CAMPO CPF ===== */
// Seleciona o campo de input do CPF
const input = document.getElementById("cli_cpf");

// Adiciona um event listener que é executado toda vez que o usuário digita algo
input.addEventListener("input", () => {
    // Remove todos os caracteres não numéricos do valor digitado
    let s = input.value.replace(/\D/g, ""); // \D = qualquer caractere que NÃO seja dígito

    // Limita o tamanho máximo a 14 caracteres (11 dígitos do CPF + 3 caracteres de formatação)
    if (s.length > 14) s = s.slice(0, 14); // Corta o excesso

    // Atualiza o valor do input com apenas números e no máximo 14 caracteres
    input.value = s;
});

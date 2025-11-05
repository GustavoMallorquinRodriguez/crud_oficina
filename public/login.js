function logar() {
    const nome = document.getElementById("fun_nome").value;
    const cpf = document.getElementById("fun_cpf").value;

    // Verifica se o nome e CPF correspondem aos valores cadastrados
    if (nome && cpf) {
        alert("Bem-vindo");
        location.href = "index.html";  // Redireciona para a página principal
    } else {
        alert("Usuário ou senha incorretos");
    }
}
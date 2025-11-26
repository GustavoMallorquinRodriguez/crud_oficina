function togglePassword() {
    const passwordInput = document.getElementById("fun_senha");
    const eyeIcon = document.getElementById("eye-icon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.remove("bi-eye-fill");
        eyeIcon.classList.add("bi-eye-slash-fill");
    } else {
        passwordInput.type = "password";
        eyeIcon.classList.remove("bi-eye-slash-fill");
        eyeIcon.classList.add("bi-eye-fill");
    }
}

function showError(message) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    errorElement.classList.add("show");
}

function hideError() {
    const errorElement = document.getElementById("error-message");
    errorElement.classList.remove("show");
}

function setLoading(isLoading) {
    const btn = document.getElementById("btn-login");
    const btnText = document.getElementById("btn-text");

    if (isLoading) {
        btn.disabled = true;
        btnText.innerHTML = '<span class="loading"></span>';
    } else {
        btn.disabled = false;
        btnText.textContent = "Entrar";
    }
}

function logar(event) {
    event.preventDefault();

    const nome = document.getElementById("fun_nome").value.trim();
    const cpf = document.getElementById("fun_senha").value.trim();

    hideError();

    if (!nome || !cpf) {
        showError("Por favor, preencha todos os campos.");
        return;
    }

    setLoading(true);

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fun_nome: nome, fun_senha: senha }),
    })
        .then((response) => response.json())
        .then((data) => {
            setLoading(false);

            if (data.success) {
                localStorage.setItem("usuario_nome", data.nome);
                localStorage.setItem("usuario_cargo", data.cargo);

                const cargo = data.cargo ? data.cargo.toLowerCase() : "";

                if (cargo === "chefe") {
                    window.location.href = "index.html";
                } else if (cargo === "mecanico") {
                    window.location.href = "index2.html";
                } else {
                    window.location.href = "index2.html";
                }
            } else {
                showError(data.message || "Usuário ou senha incorretos.");
            }
        })
        .catch((error) => {
            setLoading(false);
            console.error("Erro ao fazer login:", error);
            showError("Erro ao conectar com o servidor. Tente novamente.");
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
        input.addEventListener("input", hideError);
    });
});

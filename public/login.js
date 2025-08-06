function logar(){
    var Usuario = document.getElementById('Usuario').value;
    var Senha = document.getElementById('Senha').value;
    
    if(Usuario == "gustavo" && Senha == "gustavo"){
        alert('bem-vindo');
        location.href = "index.html";
    }else if(Usuario == "iudy" && Senha == "iudy"){
        alert('bem-vindo');
        location.href = "index.html";
    }else if(Usuario == "arthur" && Senha == "arthur"){
        alert('bem-vindo');
        location.href = "index.html";
    }else if(Usuario == "alexandre" && Senha == "alexandre"){
        alert('bem-vindo');
        location.href = "index.html";
    }else if(Usuario == "vinicius" && Senha == "vinicius"){
        alert('bem-vindo');
        location.href = "index.html";
    }else{
        alert('usuario ou senha incorreto');
    }
}
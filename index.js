const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


const app = express();
const port = process.env.PORT || 3000;

// Serve os arquivos estáticos da pasta "public"
app.use(express.static('public'));

// Configura o body-parser para ler JSON
app.use(bodyParser.json());

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criação das tabelas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS cliente (
	        id_cli INTEGER PRIMARY KEY AUTOINCREMENT,
            cli_nome VARCHAR(100) not NULL,
            cli_data_nascimento DATE,
            cli_telefone VARCHAR(15),
            cli_cpf VARCHAR(14) NOT NULL UNIQUE,
            cli_cep TEXT,
            cli_cidade TEXT,
            cli_bairro TEXT,
            cli_complemento TEXT,
            cli_nomeRua TEXT,
            cli_numeroCasa NUMBER,
            cli_email VARCHAR(100)

        )
    `);
    

    console.log('Tabelas criadas com sucesso.');
});


///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////

// Cadastrar cliente
app.post('/clientes', (req, res) => {
    const {cli_nome, cli_data_nascimento, cli_telefone, cli_cpf, cli_cep, cli_cidade, cli_bairro, cli_complemento, cli_nomeRua, cli_numeroCasa, cli_email} = req.body;

    if (!nome || !cpf) {
        return res.status(400).send('Nome e CPF são obrigatórios.');
    }

    const query = `INSERT INTO clientes (cli_nome, cli_data_nascimento, cli_telefone, cli_cpf, cli_cep, cli_cidade, cli_bairro, cli_complemento, cli_nomeRua, cli_numeroCasa, cli_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [cli_nome, cli_data_nascimento, cli_telefone, cli_cpf, cli_cep, cli_cidade, cli_bairro, cli_complemento, cli_nomeRua, cli_numeroCasa, cli_email], function (err) {
        if (err) {
            return res.status(500).send('Erro ao cadastrar cliente.');
        }
        res.status(201).send({ id: this.lastID, message: 'Cliente cadastrado com sucesso.' });
    });
});

async function cadastrarCliente(event) {
    event.preventDefault();

    let nome_cliente = document.getElementById("nomeCliente").value;

    const cliente = {
        nome: nomeCliente,
        dataNascimento: document.getElementById("dataNascimento").value,
        telefone: document.getElementById("telefone").value,
        cpf: document.getElementById("cpf").value,
        cep: document.getElementById("cep").value,
        cidade: document.getElementById("cidade").value,
        bairro: document.getElementById("bairro").value,
        complememnto: document.getElementById("complemento").value,
        nomeRua: document.getElementById("nomeRua").value,
        numeroCasa: document.getElementById("numeroCasa").value,
        email: document.getElementById("email").value
        
    };

    try {
        const response = await fetch('/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Cliente cadastrado com sucesso!");
            document.getElementById("clienteForm").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar cliente.");
    }
}
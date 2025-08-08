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
            cli_cpf VARCHAR(14) NOT NULL UNIQUE,
            cli_telefone VARCHAR(15),
            cli_email VARCHAR(100),
            cli_data_nascimento DATE,
            cli_endereco TEXT
        )
    `);
    

    console.log('Tabelas criadas com sucesso.');
});


///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////

// Cadastrar cliente
app.post('/clientes', (req, res) => {
    const { nome, cpf, email, telefone, endereco } = req.body;

    if (!nome || !cpf) {
        return res.status(400).send('Nome e CPF são obrigatórios.');
    }

    const query = `INSERT INTO clientes (cli_nome, cli_cpf, cli_telefone, cli_email, cli_endereco) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [cli_nome, cli_cpf, cli_email, cli_telefone, cli_endereco], function (err) {
        if (err) {
            return res.status(500).send('Erro ao cadastrar cliente.');
        }
        res.status(201).send({ id: this.lastID, message: 'Cliente cadastrado com sucesso.' });
    });
});
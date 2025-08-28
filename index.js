const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

// Serve os arquivos estáticos da pasta "public"
app.use(express.static("public"));

// Configura o body-parser para ler JSON
app.use(bodyParser.json());

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
        console.log("Conectado ao banco de dados SQLite.");
    }
});

// Criação das tabelas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
	        id_cli INTEGER PRIMARY KEY AUTOINCREMENT,
            cli_nome VARCHAR(100) not NULL,
            cli_data_nascimento text,
            cli_telefone VARCHAR(15),
            cli_cpf VARCHAR(14) NOT NULL UNIQUE,
            cli_cep TEXT,
            cli_cidade TEXT,
            cli_bairro TEXT,
            cli_complemento TEXT,
            cli_nome_rua TEXT,
            cli_numero_casa NUMBER,
            cli_email VARCHAR(100)

        )
    `);

    console.log("Tabelas criadas com sucesso.");
});
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS funcionario (
            id_fun INTEGER PRIMARY KEY AUTOINCREMENT,
            fun_nome VARCHAR(100) not NULL,
            fun_cpf VARCHAR(14) NOT NULL UNIQUE,
            fun_telefone VARCHAR(15),
            fun_setor VARCHAR(100),
            fun_cargo VARCHAR(100),
            fun_data_nascimento DATE,
            fun_endereco TEXT
        );

        )
    `);

    console.log("Tabelas criadas com sucesso.");
});
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS funcionario (
            id_mt INTEGER PRIMARY KEY AUTOINCREMENT,
            id_cli INTEGER,
            mt_placa VARCHAR(7) NOT NULL UNIQUE,
            mt_modelo VARCHAR(100),
            mt_ano VARCHAR(4),
            id_servico INTEGER
            
        );

        )
    `);

    console.log("Tabelas criadas com sucesso.");
});

///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////

// Cadastrar cliente
app.post("/clientes", (req, res) => {
    const {
        cli_nome,
        cli_data_nascimento,
        cli_telefone,
        cli_cpf,
        cli_cep,
        cli_cidade,
        cli_bairro,
        cli_complemento,
        cli_nome_rua,
        cli_numero_casa,
        cli_email,
    } = req.body;

    if (!cli_nome || !cli_cpf) {
        return res.status(400).send("Nome e CPF são obrigatórios.");
    }

    const query = `INSERT INTO clientes (cli_nome, cli_data_nascimento, cli_telefone, cli_cpf, cli_cep, cli_cidade, cli_bairro, cli_complemento, cli_nome_rua, cli_numero_casa, cli_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(
        query,
        [
            cli_nome,
            cli_data_nascimento,
            cli_telefone,
            cli_cpf,
            cli_cep,
            cli_cidade,
            cli_bairro,
            cli_complemento,
            cli_nome_rua,
            cli_numero_casa,
            cli_email,
        ],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao cadastrar cliente.");
            }
            res.status(201).send({
                id: this.lastID,
                message: "Cliente cadastrado com sucesso.",
            });
        },
    );
});

// Listar clientes
// Endpoint para listar todos os clientes ou buscar por CPF
app.get("/clientes", (req, res) => {
    const cpf = req.query.cpf || ""; // Recebe o CPF da query string (se houver)

    if (cpf) {
        // Se CPF foi passado, busca clientes que possuam esse CPF ou parte dele
        const query = `SELECT * FROM clientes WHERE cpf LIKE ?`;

        db.all(query, [`%${cli_cpf}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar clientes." });
            }
            res.json(rows); // Retorna os clientes encontrados ou um array vazio
        });
    } else {
        // Se CPF não foi passado, retorna todos os clientes
        const query = `SELECT * FROM clientes`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar clientes." });
            }
            res.json(rows); // Retorna todos os clientes
        });
    }
});
///////////////////////////// Rotas para Funcionario /////////////////////////////
///////////////////////////// Rotas para Funcionario /////////////////////////////
///////////////////////////// Rotas para Funcionario /////////////////////////////
// Cadastrar Funcionario
app.post("/funcionario", (req, res) => {
    const {
        fun_nome,
        fun_cpf,
        fun_telefone,
        fun_setor,
        fun_cargo,
        fun_data_nascimento,
        fun_endereco,
    } = req.body;

    if (!fun_nome || !fun_cpf) {
        return res.status(400).send("Nome e CPF são obrigatórios.");
    }

    const query = `INSERT INTO funcionario (fun_nome, fun_cpf, fun_telefone, fun_setor, fun_cargo, fun_data_nascimento, fun_endereco) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(
        query,
        [
            fun_nome,
            fun_cpf,
            fun_telefone,
            fun_setor,
            fun_cargo,
            fun_data_nascimento,
            fun_endereco,
        ],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao cadastrar funcionario.");
            }
            res.status(201).send({
                id: this.lastID,
                message: "funcionario cadastrado com sucesso.",
            });
        },
    );
});
// Listar funcionario
// Endpoint para listar todos os funcionario ou buscar por CPF
app.get("/funcionario", (req, res) => {
    const cpf = req.query.cpf || ""; // Recebe o CPF da query string (se houver)

    if (cpf) {
        // Se CPF foi passado, busca funcionario que possuam esse CPF ou parte dele
        const query = `SELECT * FROM funcionario WHERE cpf LIKE ?`;

        db.all(query, [`%${fun_cpf}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar funcionario." });
            }
            res.json(rows); // Retorna os funcionario encontrados ou um array vazio
        });
    } else {
        // Se CPF não foi passado, retorna todos os funcionario
        const query = `SELECT * FROM funcionario`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar funcionario." });
            }
            res.json(rows); // Retorna todos os funcionario
        });
    }
});

app.get("/", (req, res) => {
    res.send("Servidor está rodando e tabelas criadas!");
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
///////////////////////////// Rotas para Moto /////////////////////////////
///////////////////////////// Rotas para Moto /////////////////////////////
///////////////////////////// Rotas para Moto /////////////////////////////
// Cadastrar moto
app.post("/moto", (req, res) => {
    const { id_cli, mt_placa, mt_modelo, mt_ano, id_servico } = req.body;

    if (!id_cliente || !mt_placa) {
        return res.status(400).send("Nome e CPF são obrigatórios.");
    }

    const query = `INSERT INTO moto (id_cli, mt_placa, mt_modelo, mt_ano, id_servico) VALUES (?, ?, ?, ?, ?)`;
    db.run(
        query,
        [id_cli, mt_placa, mt_modelo, mt_ano, id_servico],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao cadastrar moto.");
            }
            res.status(201).send({
                id: this.lastID,
                message: "moto cadastrado com sucesso.",
            });
        },
    );
});
// Listar moto
// Endpoint para listar todos os moto ou buscar por CPF
app.get("/moto", (req, res) => {
    const cpf = req.query.cpf || ""; // Recebe o CPF da query string (se houver)

    if (cpf) {
        // Se CPF foi passado, busca funcionario que possuam esse CPF ou parte dele
        const query = `SELECT * FROM moto WHERE cpf LIKE ?`;

        db.all(query, [`%${fun_cpf}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar moto." });
            }
            res.json(rows); // Retorna os moto encontrados ou um array vazio
        });
    } else {
        // Se CPF não foi passado, retorna todos os moto
        const query = `SELECT * FROM moto`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar moto." });
            }
            res.json(rows); // Retorna todos os moto
        });
    }
});

app.get("/", (req, res) => {
    res.send("Servidor está rodando e tabelas criadas!");
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


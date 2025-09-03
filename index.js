const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 5000;

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

    db.run(`
        CREATE TABLE IF NOT EXISTS funcionario (
            id_fun INTEGER PRIMARY KEY AUTOINCREMENT,
            fun_nome VARCHAR(100) NOT NULL,
            fun_cpf VARCHAR(14) NOT NULL UNIQUE,
            fun_telefone VARCHAR(15),
            fun_setor VARCHAR(100),
            fun_cargo VARCHAR(100),
            fun_data_nascimento DATE,
            fun_endereco TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS moto (
            id_mt INTEGER PRIMARY KEY AUTOINCREMENT,
            id_cli INTEGER,
            mt_placa VARCHAR(7) NOT NULL UNIQUE,
            mt_modelo VARCHAR(100),
            mt_ano INTEGER,
            id_servico INTEGER,
            FOREIGN KEY (id_cli) REFERENCES clientes (id_cli)
            FOREIGN KEY (id_servico) REFERENCES servicos (id_servico)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS servicos (
            id_serv INTEGER PRIMARY KEY AUTOINCREMENT,
            id_fun INTEGER,
            serv_tipo VARCHAR(100),
            id_mt INTEGER,
            serv_data_entrada DATE,
            serv_data_saida DATE,
            serv_orcamento DECIMAL(10, 2),
            serv_observacao TEXt,
            FOREIGN KEY (id_mt) REFERENCES moto (id_mt)
            FOREIGN KEY (id_fun) REFERENCES moto (id_fun)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data DATE NOT NULL,
            horario TIME NOT NULL,
            cpf_cliente VARCHAR(11) NOT NULL,
            cnpj_fornecedor VARCHAR(14) NOT NULL,
            id_servico INTEGER NOT NULL,
            FOREIGN KEY (cpf_cliente) REFERENCES clientes (cpf),
            FOREIGN KEY (cnpj_fornecedor) REFERENCES fornecedores (cnpj),
            FOREIGN KEY (id_servico) REFERENCES servicos (id)
        )
    `);

    console.log("Tabela de serviços criada com sucesso.");
});

///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para C///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////

// ROTA PARA BUSCAR TODOS OS SERVIÇOS NO ATENDAMENTO
app.get("/buscar-servicos", (req, res) => {
    db.all("SELECT id, nome FROM servicos", [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar serviços:", err);
            res.status(500).send("Erro ao buscar serviços");
        } else {
            res.json(rows); // Retorna os serviços em formato JSON
        }
    });
});

// ROTA PARA BUSCAR HORÁRIOS DISPONÍVEIS
app.get("/horarios-disponiveis", (req, res) => {
    const { data, id } = req.query; // id = id do serviço

    const todosHorarios = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
    ];

    const sql = `SELECT horario FROM agendamentos WHERE data = ? AND id_servico = ?`;

    db.all(sql, [data, id], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar horários ocupados:", err);
            return res.status(500).send("Erro ao buscar horários ocupados");
        }

        const ocupados = rows.map((r) => String(r.horario).slice(0, 5));
        const disponiveis = todosHorarios.filter((h) => !ocupados.includes(h));
        res.json(disponiveis);
    });
});

// ROTA PRA CADASTRAR UM AGENDAMENTO
app.post("/cadastrar-agendamento", (req, res) => {
    const { data, horario, cpf_cliente, cnpj_fornecedor, id_servico } =
        req.body;
    db.run(
        "INSERT INTO agendamentos (data, horario, cpf_cliente, cnpj_fornecedor, id_servico) VALUES (?, ?, ?, ?, ?)",
        [data, horario, cpf_cliente, cnpj_fornecedor, id_servico],
        function (err) {
            if (err) {
                console.error("Erro ao cadastrar agendamento:", err);
                res.status(500).send("Erro ao cadastrar agendamento");
            } else {
                res.send("Agendamento cadastrado com sucesso!");
            }
        },
    );
});
lientes; /////////////////////////////
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
        const query = `SELECT * FROM clientes WHERE cli_cpf LIKE ?`;

        db.all(query, [`%${cpf}%`], (err, rows) => {
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
// Atualizar cliente
app.put("/clientes/cpf/:cli_cpf", (req, res) => {
    const { cli_cpf } = req.params;

    const {
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
    } = req.body;
    alert(
        cli_bairro,
        cli_cidade,
        cli_complemento,
        cli_nome_rua,
        cli_numero_casa,
        cli_email,
        cli_nome,
        cli_data_nascimento,
        cli_telefone,
        cli_cep,
        cli_cpf,
    );

    const query = `UPDATE clientes SET cli_nome = ?, cli_data_nascimento = ?, cli_telefone = ?, cli_cep = ?, cli_cidade = ?, cli_bairro = ?, cli_complemento = ?, cli_nome_rua = ?, cli_numero_casa = ?, cli_email = ?, WHERE cli_cpf = ?`;

    db.run(
        query,
        [
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
            cli_cpf,
        ],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao atualizar cliente.");
            }
            if (this.changes === 0) {
                return res.status(404).send("Cliente não encontrado.");
            }
            res.send("Cliente atualizado com sucesso.");
        },
    );
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
        const query = `SELECT * FROM funcionario WHERE fun_cpf LIKE ?`;

        db.all(query, [`%${cpf}%`], (err, rows) => {
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

///////////////////////////// Rotas para Moto /////////////////////////////
///////////////////////////// Rotas para Moto /////////////////////////////
///////////////////////////// Rotas para Moto /////////////////////////////
// Cadastrar moto
app.post("/moto", (req, res) => {
    const { id_cli, mt_modelo, mt_placa, mt_ano, id_servico } = req.body;

    if (!id_cli || !mt_placa) {
        return res.status(400).send("Nome e Placa são obrigatórios.");
    }

    const query = `INSERT INTO moto (id_cli, mt_modelo, mt_placa, mt_ano, id_servico) VALUES (?, ?, ?, ?, ?)`;
    db.run(
        query,
        [id_cli, mt_modelo, mt_placa, mt_ano, id_servico],
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
        const query = `SELECT * FROM moto WHERE mt_placa LIKE ?`;

        db.all(query, [`%${mt_placa}%`], (err, rows) => {
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

///////////////////////////// Rotas para Serviços /////////////////////////////
///////////////////////////// Rotas para Serviços /////////////////////////////
///////////////////////////// Rotas para Serviços /////////////////////////////

// Cadastrar serviço
app.post("/servicos", (req, res) => {
    const {
        id_fun,
        serv_tipo,
        id_mt,
        serv_data_entrada,
        serv_data_saida,
        serv_orcamento,
        serv_observacao,
    } = req.body;

    if (!serv_data_entrada || !serv_tipo || !id_fun || !id_mt) {
        return res
            .status(400)
            .send(
                "Data de entrada, tipo de serviço, mecânico e ID da moto são obrigatórios.",
            );
    }

    const query = `INSERT INTO servicos (id_fun, serv_tipo, id_mt, serv_data_entrada, serv_data_saida, serv_orcamento, serv_observacao) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(
        query,
        [
            id_fun,
            serv_tipo,
            id_mt,
            serv_data_entrada,
            serv_data_saida,
            serv_orcamento,
            serv_observacao,
        ],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao cadastrar serviço.");
            }
            res.status(201).send({
                id: this.lastID,
                message: "Serviço cadastrado com sucesso.",
            });
        },
    );
});

// Listar serviços
app.get("/servicos", (req, res) => {
    const query = `SELECT * FROM servicos`;

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err);
            return res
                .status(500)
                .json({ message: "Erro ao buscar serviços." });
        }
        res.json(rows);
    });
});

///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////

// ROTA PARA BUSCAR TODOS OS SERVIÇOS NO ATENDAMENTO
app.get("/buscar-servicos", (req, res) => {
    db.all("SELECT id, nome FROM servicos", [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar serviços:", err);
            res.status(500).send("Erro ao buscar serviços");
        } else {
            res.json(rows); // Retorna os serviços em formato JSON
        }
    });
});

// ROTA PARA BUSCAR HORÁRIOS DISPONÍVEIS
app.get("/horarios-disponiveis", (req, res) => {
    const { data, id } = req.query; // id = id do serviço

    const todosHorarios = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
    ];

    const sql = `SELECT horario FROM agendamentos WHERE data = ? AND id_servico = ?`;

    db.all(sql, [data, id], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar horários ocupados:", err);
            return res.status(500).send("Erro ao buscar horários ocupados");
        }

        const ocupados = rows.map((r) => String(r.horario).slice(0, 5));
        const disponiveis = todosHorarios.filter((h) => !ocupados.includes(h));
        res.json(disponiveis);
    });
});

// ROTA PRA CADASTRAR UM AGENDAMENTO
app.post("/cadastrar-agendamento", (req, res) => {
    const { data, horario, cpf_cliente, cnpj_fornecedor, id_servico } =
        req.body;
    db.run(
        "INSERT INTO agendamentos (data, horario, cpf_cliente, cnpj_fornecedor, id_servico) VALUES (?, ?, ?, ?, ?)",
        [data, horario, cpf_cliente, cnpj_fornecedor, id_servico],
        function (err) {
            if (err) {
                console.error("Erro ao cadastrar agendamento:", err);
                res.status(500).send("Erro ao cadastrar agendamento");
            } else {
                res.send("Agendamento cadastrado com sucesso!");
            }
        },
    );
});

//nao mexa!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Rota principal para verificar se o servidor está funcionando
app.get("/api/status", (req, res) => {
    res.json({
        message: "Servidor está rodando e tabelas criadas!",
        status: "ok",
    });
});

// Iniciando o servidor
app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${port}`);
});

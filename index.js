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
        // Enable foreign key enforcement
        db.run("PRAGMA foreign_keys = ON");
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
            FOREIGN KEY (id_cli) REFERENCES clientes (id_cli),
            FOREIGN KEY (id_servico) REFERENCES servico (id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            age_entrada DATETIME NOT NULL,
            age_saida DATETIME NOT NULL,
            cli_cpf VARCHAR(14) NOT NULL,
            fun_cpf VARCHAR(14) NOT NULL,
            id_servico INTEGER NOT NULL,
            mt_placa VARCHAR(7) NOT NULL,
            FOREIGN KEY (cli_cpf) REFERENCES clientes (cli_cpf),
            FOREIGN KEY (fun_cpf) REFERENCES funcionario (fun_cpf),
            FOREIGN KEY (id_servico) REFERENCES servico (id),
            FOREIGN KEY (mt_placa) REFERENCES moto (mt_placa)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS servico (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            serv_nome VARCHAR(100) NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cli_cpf TEXT NOT NULL,
            id_produto INTEGER NOT NULL,
            quantidade INTEGER NOT NULL,
            data_venda TEXT NOT NULL,
            FOREIGN KEY (cli_cpf) REFERENCES clientes (cli_cpf),
            FOREIGN KEY (id_produto) REFERENCES produtos (id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            descricao TEXT,
            categoria TEXT,
            quantidade_estoque INTEGER NOT NULL,
            dimensoes TEXT,
        )
    `);

    console.log("Tabela de serviços criada com sucesso.");
});

///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////

// ROTA PARA BUSCAR TODOS OS SERVIÇOS NO ATENDAMENTO
app.get("/buscar-servicos", (req, res) => {
    db.all("SELECT id, serv_nome FROM servico", [], (err, rows) => {
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

    // Query using age_entrada and extracting just the date part for comparison
    const sql = `SELECT age_entrada FROM agendamentos WHERE DATE(age_entrada) = ? AND id_servico = ?`;

    db.all(sql, [data, id], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar horários ocupados:", err);
            return res.status(500).send("Erro ao buscar horários ocupados");
        }

        // Extract time portion from age_entrada datetime
        const ocupados = rows.map((r) => {
            const datetime = new Date(r.age_entrada);
            return datetime.toTimeString().slice(0, 5); // Get HH:MM format
        });

        const disponiveis = todosHorarios.filter((h) => !ocupados.includes(h));
        res.json(disponiveis);
    });
});

// ROTA PRA CADASTRAR UM AGENDAMENTO
app.post("/cadastrar-agendamento", (req, res) => {
    const { age_entrada, age_saida, cli_cpf, fun_cpf, id_servico, mt_placa } =
        req.body;
    db.run(
        "INSERT INTO agendamentos (age_entrada, age_saida, cli_cpf, fun_cpf, id_servico, mt_placa) VALUES (?, ?, ?, ?, ?, ?)",
        [age_entrada, age_saida, cli_cpf, fun_cpf, id_servico, mt_placa],
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
    console.log("Updating client:", {
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
    });

    const query = `UPDATE clientes SET cli_nome = ?, cli_data_nascimento = ?, cli_telefone = ?, cli_cep = ?, cli_cidade = ?, cli_bairro = ?, cli_complemento = ?, cli_nome_rua = ?, cli_numero_casa = ?, cli_email = ? WHERE cli_cpf = ?`;

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
    const placa = req.query.placa || ""; // Recebe a placa da query string (se houver)

    if (placa) {
        // Se placa foi passada, busca motos que possuam essa placa ou parte dela
        const query = `SELECT * FROM moto WHERE mt_placa LIKE ?`;

        db.all(query, [`%${placa}%`], (err, rows) => {
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

//vendas///////////////////////////////////////////////////////////////////////////
app.post("/vendas", (req, res) => {
    const { cli_cpf, itens } = req.body;

    if (!cli_cpf || !itens || itens.length === 0) {
        return res.status(400).send("Dados da venda incompletos.");
    }

    // Validate items first
    for (const item of itens) {
        if (!item.idProduto || !item.quantidade || item.quantidade <= 0) {
            return res
                .status(400)
                .send(
                    `Dados inválidos para o produto ID: ${item.idProduto}, quantidade: ${item.quantidade}`,
                );
        }
    }

    const dataVenda = new Date().toISOString();

    // Use transaction for data integrity
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        let operationsLeft = itens.length * 2; // Insert + update per item
        let hasError = false;

        const completeOperation = () => {
            operationsLeft--;
            if (operationsLeft === 0) {
                if (hasError) {
                    db.run("ROLLBACK", () => {
                        res.status(500).send("Erro ao processar a venda.");
                    });
                } else {
                    db.run("COMMIT", () => {
                        res.status(201).send({
                            message: "Venda registrada com sucesso.",
                        });
                    });
                }
            }
        };

        // Check stock availability first
        let stockChecksPending = itens.length;
        let stockErrors = [];

        itens.forEach(({ idProduto, quantidade }) => {
            db.get(
                "SELECT quantidade_estoque FROM produtos WHERE id = ?",
                [idProduto],
                (err, row) => {
                    stockChecksPending--;

                    if (err || !row) {
                        stockErrors.push(`Produto ${idProduto} não encontrado`);
                    } else if (row.quantidade_estoque < quantidade) {
                        stockErrors.push(
                            `Estoque insuficiente para produto ${idProduto}. Disponível: ${row.quantidade_estoque}, Solicitado: ${quantidade}`,
                        );
                    }

                    if (stockChecksPending === 0) {
                        if (stockErrors.length > 0) {
                            return res
                                .status(400)
                                .send(
                                    `Erros de estoque: ${stockErrors.join(", ")}`,
                                );
                        }

                        // Proceed with operations
                        itens.forEach(({ idProduto, quantidade }) => {
                            // Insert sale record
                            db.run(
                                "INSERT INTO vendas (cli_cpf, id_produto, quantidade, data_venda) VALUES (?, ?, ?, ?)",
                                [cli_cpf, idProduto, quantidade, dataVenda],
                                function (err) {
                                    if (err) {
                                        console.error(
                                            "Erro ao registrar venda:",
                                            err.message,
                                        );
                                        hasError = true;
                                    }
                                    completeOperation();
                                },
                            );

                            // Update stock
                            db.run(
                                "UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?",
                                [quantidade, idProduto],
                                function (err) {
                                    if (err) {
                                        console.error(
                                            "Erro ao atualizar estoque:",
                                            err.message,
                                        );
                                        hasError = true;
                                    }
                                    completeOperation();
                                },
                            );
                        });
                    }
                },
            );
        });
    });
});

app.get("/clientes/:cli_cpf", (req, res) => {
    const cli_cpf = req.params.cli_cpf;
    db.get(
        "SELECT * FROM clientes WHERE cli_cpf = ?",
        [cli_cpf],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: "Erro no servidor." });
            } else if (!row) {
                res.status(404).json({ error: "Cliente não encontrado." });
            } else {
                res.json(row);
            }
        },
    );
});
app.get("/produtos_carrinho/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM produtos WHERE id = ? ", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: "Erro no servidor." });
        } else if (!row) {
            res.status(404).json({ error: "Produto não encontrado.." });
        } else {
            res.json(row);
        }
    });
});

// ROTA PARA BUSCAR TODOS OS PRODUTOS PÁGINA DE VENDAS
app.get("/buscar-produtos", (req, res) => {
    db.all(
        "SELECT id, nome, quantidade_estoque FROM produtos",
        [],
        (err, rows) => {
            if (err) {
                console.error("Erro ao buscar produtos:", err);
                res.status(500).send("Erro ao buscar produtos");
            } else {
                res.json(rows); // Retorna os serviços em formato JSON
            }
        },
    );
});

///////////////////////////// Rotas para consulta /////////////////////////////
///////////////////////////// Rotas para consulta /////////////////////////////
///////////////////////////// Rotas para consulta /////////////////////////////

// Rota para buscar vendas com filtros (cpf, produto, data)
app.get("/relatorios", (req, res) => {
    const { cli_cpf, produto, dataInicio, dataFim } = req.query;

    let query = `SELECT
                    vendas.id,
                    vendas.cli_cpf,
                    vendas.id_serv,
                    vendas.quantidade,
                    vendas.data, 
                    produtos.nome AS produto_nome,
                    clientes.nome AS cliente_nome
                 FROM vendas
                 JOIN produtos ON vendas.produto_id = produtos.id
                 JOIN clientes ON vendas.cli_cpf = cli.cpf
                 WHERE 1=1`; // Começar com um WHERE sempre verdadeiro (1=1)

    const params = [];

    // Filtro por CPF do cliente
    if (cli_cpf) {
        query += ` AND vendas.cli_cpf = ?`;
        params.push(cli_cpf);
    }

    // Filtro por nome do produto
    if (produto) {
        query += ` AND produtos.nome LIKE ?`;
        params.push(`%${produto}%`);
    }

    // Filtro por data
    if (dataInicio && dataFim) {
        query += ` AND vendas.data BETWEEN ? AND ?`;
        params.push(dataInicio, dataFim);
    }

    // Executa a query com os filtros aplicados
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Erro ao buscar relatórios.",
                error: err.message,
            });
        }

        res.json(rows); // Retorna os resultados da query
    });
});

///////////////////////////// Rotas para servico /////////////////////////////
///////////////////////////// Rotas para servico /////////////////////////////
///////////////////////////// Rotas para servico /////////////////////////////

// ROTA PRA CADASTRAR UM SERVIÇO
app.post("/cadastrar-servico", (req, res) => {
    const { serv_nome } = req.body;
    db.run(
        "INSERT INTO servico (serv_nome) VALUES (?)",
        [serv_nome],
        function (err) {
            if (err) {
                console.error("Erro ao cadastrar serviço:", err);
                res.status(500).send("Erro ao cadastrar serviço");
            } else {
                res.send("Serviço cadastrado com sucesso!");
            }
        },
    );
});

///////////////////////////// Rotas para produtos /////////////////////////////
///////////////////////////// Rotas para Produtos /////////////////////////////
///////////////////////////// Rotas para Produtos /////////////////////////////
///////////////////////////// Rotas para Produtos /////////////////////////////

// Cadastrar produto
app.post("/produtos", (req, res) => {
    const { nome, preco, descricao, categoria, quantidade_estoque, dimensoes } =
        req.body;
    const sql = `INSERT INTO produtos (nome, preco, descricao, categoria, quantidade_estoque, dimensoes) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(
        sql,
        [nome, preco, descricao, categoria, quantidade_estoque, dimensoes],
        function (err) {
            if (err) {
                return res
                    .status(500)
                    .json({ message: "Erro ao cadastrar produto", error: err });
            }
            res.status(200).json({
                message: "Produto cadastrado com sucesso",
                id: this.lastID,
            });
        },
    );
});

// Listar produtos
app.get("/produtos", (req, res) => {
    const query = `SELECT * FROM produtos`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).send("Erro ao listar produtos.");
        }
        res.send(rows);
    });
});

// Atualizar produto
app.put("/produtos/:id", (req, res) => {
    const { id } = req.params;
    const { nome, preco, descricao, categoria, quantidade_estoque, dimensoes } =
        req.body;

    const query = `UPDATE produtos SET nome = ?, preco = ?, descricao = ?, categoria = ?, quantidade_estoque = ?, dimensoes = ?, WHERE id = ?`;
    db.run(
        query,
        [nome, preco, descricao, categoria, quantidade_estoque, dimensoes, id],
        function (err) {
            if (err) {
                return res.status(500).send("Erro ao atualizar produto.");
            }
            if (this.changes === 0) {
                return res.status(404).send("Produto não encontrado.");
            }
            res.send("Produto atualizado com sucesso.");
        },
    );
});

//nao mexa!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Rota principal para verificar se o servidor está funcionando

// Teste para verificar se o servidor está rodando
app.get("/", (req, res) => {
    res.send("Servidor está rodando e tabelas criadas!");
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

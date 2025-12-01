const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 5000;
const host = '0.0.0.0';

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
                cli_nome VARCHAR(100) NOT NULL,
                cli_data_nascimento TEXT,
                cli_telefone VARCHAR(15),
                cli_cpf VARCHAR(14) NOT NULL UNIQUE,
                cli_cep TEXT,
                cli_cidade TEXT,
                cli_bairro TEXT,
                cli_complemento TEXT,
                cli_nome_rua TEXT,
                cli_numero_casa NUMBER,
                cli_email VARCHAR(100),
                id_mt INTEGER,
                FOREIGN KEY (id_mt) REFERENCES moto (id_mt)
            )
        `);

    db.run(`
            CREATE TABLE IF NOT EXISTS funcionario (
                id_fun INTEGER PRIMARY KEY AUTOINCREMENT,
                fun_nome VARCHAR(100) NOT NULL,
                fun_cpf VARCHAR(14) NOT NULL UNIQUE,
                fun_telefone VARCHAR(15),
                fun_senhas VARCHAR(100),
                fun_cargo VARCHAR(100),
                fun_data_nascimento DATE,
                fun_endereco TEXT
            )
        `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS moto (
            id_mt INTEGER PRIMARY KEY AUTOINCREMENT,
            mt_placa VARCHAR(7) NOT NULL UNIQUE,
            mt_modelo VARCHAR(100),
            mt_ano VARCHAR(4)
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
                FOREIGN KEY (cli_cpf) REFERENCES clientes (cli_cpf),
                FOREIGN KEY (id_produto) REFERENCES produtos (id_pro)
            )
        `);

    db.run(`
            CREATE TABLE IF NOT EXISTS produtos (
                id_pro INTEGER PRIMARY KEY AUTOINCREMENT,
                pro_nome TEXT NOT NULL,
                pro_preco REAL NOT NULL,
                pro_descricao TEXT,
                pro_categoria TEXT,
                pro_quantidade_estoque INTEGER NOT NULL
            )
        `);

    // Inserir usuário admin padrão
    db.run(`
        INSERT OR IGNORE INTO funcionario (fun_nome, fun_cpf, fun_senhas, fun_cargo)
        VALUES ('adm', '00000000000', '123', 'chef')
    `, function(err) {
        if (err) {
            console.error("Erro ao inserir usuário admin:", err);
        } else {
            console.log("Usuário admin verificado/criado com sucesso.");
        }
    });

    console.log("Tabela de serviços criada com sucesso.");
});

///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////

// ROTA PARA BUSCAR TODOS OS SERVIÇOS NO ATENDAMENTO
app.get("/buscar-servicos", (req, res) => {
    const sql = `
        SELECT id, serv_nome FROM servico
        UNION
        SELECT id_pro as id, pro_nome as serv_nome FROM produtos
        ORDER BY serv_nome
    `;
    db.all(sql, [], (err, rows) => {
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

// ROTA PARA LISTAR AGENDAMENTOS
app.get("/agendamentos", (req, res) => {
    const query = `SELECT agendamentos.*, clientes.cli_nome, funcionario.fun_nome, moto.mt_modelo, servico.serv_nome
                   FROM agendamentos
                   LEFT JOIN clientes ON agendamentos.cli_cpf = clientes.cli_cpf
                   LEFT JOIN funcionario ON agendamentos.fun_cpf = funcionario.fun_cpf
                   LEFT JOIN moto ON agendamentos.mt_placa = moto.mt_placa
                   LEFT JOIN servico ON agendamentos.id_servico = servico.id`;
    
    db.all(query, (err, rows) => {
        if (err) {
            console.error("Erro ao listar agendamentos:", err);
            return res.status(500).json({ message: "Erro ao listar agendamentos." });
        }
        res.json(rows);
    });
});

// ROTA PARA DELETAR AGENDAMENTO
app.delete("/agendamentos/:id", (req, res) => {
    const { id } = req.params;
    
    const query = `DELETE FROM agendamentos WHERE id = ?`;
    db.run(query, [id], function (err) {
        if (err) {
            console.error("Erro ao deletar agendamento:", err);
            return res.status(500).json({ message: "Erro ao deletar agendamento." });
        }
        res.json({ message: "Agendamento deletado com sucesso." });
    });
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
        id_mt
    } = req.body;

    if (!cli_nome || !cli_cpf) {
        return res.status(400).send("Nome e CPF são obrigatórios.");
    }

    const query = `INSERT INTO clientes (cli_nome, cli_data_nascimento, cli_telefone, cli_cpf, cli_cep, cli_cidade, cli_bairro, cli_complemento, cli_nome_rua, cli_numero_casa, cli_email, id_mt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
            id_mt
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
        const query = `SELECT clientes.*, moto.mt_placa, moto.mt_modelo, moto.mt_ano 
                       FROM clientes 
                       LEFT JOIN moto ON clientes.id_mt = moto.id_mt 
                       WHERE cli_cpf LIKE ?`;

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
        const query = `SELECT clientes.*, moto.mt_placa, moto.mt_modelo, moto.mt_ano 
                       FROM clientes 
                       LEFT JOIN moto ON clientes.id_mt = moto.id_mt`;

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
        id_mt
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
        id_mt
    });

    const query = `UPDATE clientes SET cli_nome = ?, cli_data_nascimento = ?, cli_telefone = ?, cli_cep = ?, cli_cidade = ?, cli_bairro = ?, cli_complemento = ?, cli_nome_rua = ?, cli_numero_casa = ?, cli_email = ?, id_mt = ? WHERE cli_cpf = ?`;

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
            id_mt,
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
        fun_senhas,
        fun_cargo,
        fun_data_nascimento,
        fun_endereco,
    } = req.body;

    if (!fun_nome || !fun_cpf) {
        return res.status(400).json({ message: "Nome e CPF são obrigatórios." });
    }

    const query = `INSERT INTO funcionario (fun_nome, fun_cpf, fun_telefone, fun_senhas, fun_cargo, fun_data_nascimento, fun_endereco) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(
        query,
        [
            fun_nome,
            fun_cpf,
            fun_telefone,
            fun_senhas,
            fun_cargo,
            fun_data_nascimento,
            fun_endereco,
        ],
        function (err) {
            if (err) {
                console.error("Erro ao cadastrar funcionario:", err);
                return res.status(500).json({ message: "Erro ao cadastrar funcionario." });
            }
            res.status(201).json({
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
// Atualizar funcionario
app.put("/funcionario/cpf/:fun_cpf", (req, res) => {
    const { fun_cpf } = req.params;
    const {
        fun_nome,
        fun_telefone,
        fun_senhas,
        fun_cargo,
        fun_data_nascimento,
        fun_endereco,
    } = req.body;

    const query = `UPDATE funcionario SET fun_nome = ?, fun_telefone = ?, fun_senhas = ?, fun_cargo = ?, fun_data_nascimento = ?, fun_endereco = ? WHERE fun_cpf = ?`;
    db.run(
        query,
        [
            fun_nome,
            fun_telefone,
            fun_senhas,
            fun_cargo,
            fun_data_nascimento,
            fun_endereco,
            fun_cpf,
        ],
        function (err) {
            if (err) {
                console.error("Erro ao atualizar funcionario:", err);
                return res.status(500).json({ message: "Erro ao atualizar funcionario." });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "funcionario não encontrado." });
            }
            res.json({ message: "funcionario atualizado com sucesso." });
        },
    );
});

////////////////////////////////////////vendas////////////////////////////////////////////////////////////////
////////////////////////////////////////vendas////////////////////////////////////////////////////////////////
////////////////////////////////////////vendas////////////////////////////////////////////////////////////////
////////////////////////////////////////vendas////////////////////////////////////////////////////////////////

// GET VENDAS - RELATÓRIO
app.get("/relatorios-vendas", (req, res) => {
    const { cli_cpf, pro_nome, data_inicio, data_fim } = req.query;
    
    let query = `SELECT 
                        vendas.id,
                        vendas.cli_cpf,
                        vendas.id_produto,
                        vendas.quantidade,
                        produtos.pro_nome,
                        produtos.pro_preco,
                        (vendas.quantidade * produtos.pro_preco) as preco_total,
                        datetime('now') as data_vendas
                   FROM vendas
                   LEFT JOIN produtos ON vendas.id_produto = produtos.id_pro
                   WHERE 1=1`;
    
    const params = [];
    
    if (cli_cpf) {
        query += ` AND vendas.cli_cpf LIKE ?`;
        params.push(`%${cli_cpf}%`);
    }
    
    if (pro_nome) {
        query += ` AND produtos.pro_nome LIKE ?`;
        params.push(`%${pro_nome}%`);
    }
    
    if (data_inicio && data_fim) {
        query += ` AND DATE(vendas.rowid) BETWEEN ? AND ?`;
        params.push(data_inicio, data_fim);
    } else if (data_inicio) {
        query += ` AND DATE(vendas.rowid) >= ?`;
        params.push(data_inicio);
    } else if (data_fim) {
        query += ` AND DATE(vendas.rowid) <= ?`;
        params.push(data_fim);
    }
    
    query += ` ORDER BY vendas.id DESC`;
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Erro ao buscar vendas:", err);
            res.status(500).json({ error: "Erro ao buscar vendas" });
        } else {
            res.json(rows || []);
        }
    });
});

app.post("/vendas", (req, res) => {
    const { cli_cpf, itens } = req.body;

    if (!cli_cpf || !itens || itens.length === 0) {
        return res.status(400).send("Dados da venda incompletos.");
    }

    const dataVenda = new Date().toISOString();

    db.serialize(() => {
        const insertSaleQuery = `INSERT INTO vendas (cli_cpf, id_produto, quantidade) VALUES (?, ?, ?)`;
        const updateStockQuery = `UPDATE produtos SET pro_quantidade_estoque = pro_quantidade_estoque - ? WHERE id_pro = ?`;

        let erroOcorrido = false;

        itens.forEach(({ idProduto, quantidade }) => {
            if (!idProduto || !quantidade || quantidade <= 0) {
                console.error(
                    `Dados inválidos para o produto ID: ${idProduto}, quantidade: ${quantidade}`,
                );
                erroOcorrido = true;
                return;
            }

            // Registrar a venda
            db.run(
                insertSaleQuery,
                [cli_cpf, idProduto, quantidade],
                function (err) {
                    if (err) {
                        console.error("Erro ao registrar venda:", err.message);
                        erroOcorrido = true;
                    }
                },
            );

            // Atualizar o estoque
            db.run(updateStockQuery, [quantidade, idProduto], function (err) {
                if (err) {
                    console.error("Erro ao atualizar estoque:", err.message);
                    erroOcorrido = true;
                }
            });
        });

        if (erroOcorrido) {
            res.status(500).send("Erro ao processar a venda.");
        } else {
            res.status(201).send({ message: "Venda registrada com sucesso." });
        }
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
app.get("/produtos_carrinho/:id_pro", (req, res) => {
    const id_pro = req.params.id_pro;
    db.get("SELECT * FROM produtos WHERE id_pro = ? ", [id_pro], (err, row) => {
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
        "SELECT id_pro, pro_nome, pro_quantidade_estoque FROM produtos",
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

// Rota para buscar relatório de agendamentos/serviços
app.get("/relatorios", (req, res) => {
    const { cli_cpf } = req.query;

    let query = `SELECT
                    agendamentos.id,
                    clientes.cli_cpf,
                    clientes.cli_nome,
                    servico.serv_nome,
                    agendamentos.age_entrada,
                    agendamentos.age_saida,
                    moto.mt_placa,
                    funcionario.fun_nome
                 FROM agendamentos
                 JOIN clientes ON agendamentos.cli_cpf = clientes.cli_cpf
                 JOIN servico ON agendamentos.id_servico = servico.id
                 JOIN moto ON agendamentos.mt_placa = moto.mt_placa
                 JOIN funcionario ON agendamentos.fun_cpf = funcionario.fun_cpf
                 WHERE 1=1`;

    const params = [];

    if (cli_cpf) {
        query += ` AND clientes.cli_cpf = ?`;
        params.push(cli_cpf);
    }

    query += ` ORDER BY agendamentos.age_entrada DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Erro ao buscar relatório:", err);
            res.status(500).json({ error: "Erro ao buscar relatório" });
        } else {
            res.json(rows || []);
        }
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
    const {
        pro_nome,
        pro_preco,
        pro_descricao,
        pro_categoria,
        pro_quantidade_estoque,
    } = req.body;
    const sql = `INSERT INTO produtos (pro_nome, pro_preco, pro_descricao, pro_categoria, pro_quantidade_estoque) VALUES (?, ?, ?, ?, ?)`;

    db.run(
        sql,
        [
            pro_nome,
            pro_preco,
            pro_descricao,
            pro_categoria,
            pro_quantidade_estoque,
        ],
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
app.put("/produtos/:id_pro", (req, res) => {
    const { id_pro } = req.params;
    const {
        pro_nome,
        pro_preco,
        pro_descricao,
        pro_categoria,
        pro_quantidade_estoque,
    } = req.body;

    const query = `UPDATE produtos SET pro_nome = ?, pro_preco = ?, pro_descricao = ?, pro_categoria = ?, pro_quantidade_estoque = ?, WHERE id_pro = ?`;
    db.run(
        query,
        [
            pro_nome,
            pro_preco,
            pro_descricao,
            pro_categoria,
            pro_quantidade_estoque,
            id_pro,
        ],
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

///////////////////////////// Rotas para Moto /////////////////////////////
///////////////////////////// Rotas para Moto /////////////////////////////
///////////////////////////// Rotas para Moto /////////////////////////////

// Cadastrar moto
app.post("/moto", (req, res) => {
    const { mt_placa, mt_modelo, mt_ano } = req.body;

    if (!mt_placa) {
        return res.status(400).json({ message: "Placa é obrigatória." });
    }

    const query = `INSERT INTO moto (mt_placa, mt_modelo, mt_ano) VALUES (?, ?, ?)`;
    db.run(query, [mt_placa, mt_modelo, mt_ano], function (err) {
        if (err) {
            console.error("Erro ao cadastrar moto:", err);
            return res.status(500).json({ message: "Erro ao cadastrar moto." });
        }
        res.status(201).json({
            id: this.lastID,
            message: "Moto cadastrada com sucesso.",
        });
    });
});

// Listar motos
app.get("/moto", (req, res) => {
    const placa = req.query.placa || "";

    if (placa) {
        const query = `SELECT * FROM moto WHERE mt_placa LIKE ?`;
        db.all(query, [`%${placa}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar motos." });
            }
            res.json(rows);
        });
    } else {
        const query = `SELECT * FROM moto`;
        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar motos." });
            }
            res.json(rows);
        });
    }
});

// Alias para /motos (plural)
app.get("/motos", (req, res) => {
    const placa = req.query.placa || "";

    if (placa) {
        const query = `SELECT * FROM moto WHERE mt_placa LIKE ?`;
        db.all(query, [`%${placa}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar motos." });
            }
            res.json(rows);
        });
    } else {
        const query = `SELECT * FROM moto`;
        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Erro ao buscar motos." });
            }
            res.json(rows);
        });
    }
});

// Atualizar moto
app.put("/moto/placa/:mt_placa", (req, res) => {
    const { mt_placa } = req.params;
    const { mt_modelo, mt_ano } = req.body;

    const query = `UPDATE moto SET mt_modelo = ?, mt_ano = ? WHERE mt_placa = ?`;
    db.run(query, [mt_modelo, mt_ano, mt_placa], function (err) {
        if (err) {
            return res.status(500).send("Erro ao atualizar moto.");
        }
        if (this.changes === 0) {
            return res.status(404).send("Moto não encontrada.");
        }
        res.send("Moto atualizada com sucesso.");
    });
});

///////////////////////////// Rota para Login /////////////////////////////
///////////////////////////// Rota para Login /////////////////////////////
///////////////////////////// Rota para Login /////////////////////////////

app.post("/login", (req, res) => {
    const { fun_nome, fun_senha } = req.body;

    if (!fun_nome || !fun_senha) {
        return res.status(400).json({ success: false, message: "Nome e senha são obrigatórios." });
    }

    const query = `SELECT fun_nome, fun_cargo FROM funcionario WHERE fun_nome = ? AND fun_senhas = ?`;
    
    db.get(query, [fun_nome, fun_senha], (err, row) => {
        if (err) {
            console.error("Erro ao fazer login:", err);
            return res.status(500).json({ success: false, message: "Erro no servidor." });
        }
        
        if (!row) {
            return res.status(401).json({ success: false, message: "Usuário ou senha incorretos." });
        }
        
        res.json({ 
            success: true, 
            message: "Login realizado com sucesso!", 
            cargo: row.fun_cargo,
            nome: row.fun_nome
        });
    });
});

//nao mexa!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Rota principal para verificar se o servidor está funcionando

// Teste para verificar se o servidor está rodando
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

// Iniciando o servidor
app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${port}`);
});

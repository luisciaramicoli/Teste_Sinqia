const mysql = require("mysql2/promise");
const { Client } = require('pg');

// Configurações do PostgreSQL (Neon)
const pg_config = {
  host: 'ep-ancient-surf-a5kssiji.us-east-2.aws.neon.tech', // Host do PostgreSQL
  port: 5432, // Porta padrão do PostgreSQL
  user: 'banco_teste_owner', // Usuário
  password: 'CYJNegd4Mv9i', // Senha
  database: 'banco_mysql', // Nome do banco
  ssl: { rejectUnauthorized: false }, // Necessário para conexões seguras no Neon
};

// Configurações do MySQL (Railway ou local)
const mysql_config = {
  host: 'autorack.proxy.rlwy.net', // Host do MySQL
  port: 46667, // Porta padrão do MySQL
  user: 'root', // Usuário
  password: 'EzvkQzvBxsVKKFuOiPkVtBfJJTTOdWHi', // Senha
  database: 'railway', // Nome do banco
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }, // Necessário para conexões seguras
};

// Variável de controle para selecionar o banco (use 'postgres' ou 'mysql')
const DB_ENGINE = 'postgres'; // Altere para 'mysql' se quiser usar o MySQL

let connection;

if (DB_ENGINE === 'postgres') {
  try {
    // Configuração do PostgreSQL
    connection = new Client(pg_config);

    const testPostgresConnection = async () => {
      try {
        await connection.connect(); // Conecta ao banco PostgreSQL
        console.log('Banco de dados PostgreSQL conectado com sucesso!');

        // Teste de conexão com uma consulta simples
        const res = await connection.query('SELECT NOW()');
        console.log('Hora atual do PostgreSQL:', res.rows[0]);
      } catch (err) {
        console.error('Erro ao conectar ao PostgreSQL:', err);
      }
    };

    testPostgresConnection(); // Testa a conexão PostgreSQL
  } catch (error) {
    console.error('Erro na configuração do PostgreSQL:', error);
  }
} else if (DB_ENGINE === 'mysql') {
  try {
    // Configuração do MySQL
    connection = mysql.createPool(mysql_config);

    const testMySQLConnection = async () => {
      try {
        const [rows] = await connection.query('SELECT 1'); // Consulta simples
        console.log('Banco de dados MySQL conectado com sucesso:', rows);
      } catch (err) {
        console.error('Erro ao consultar banco de dados MySQL:', err);
      }
    };

    testMySQLConnection(); // Testa a conexão MySQL
  } catch (error) {
    console.error('Erro na configuração do MySQL:', error);
  }
} else {
  console.error('Nenhum banco de dados configurado! Verifique a variável DB_ENGINE.');
}

module.exports = connection;

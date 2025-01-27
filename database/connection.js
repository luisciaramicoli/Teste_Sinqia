const sql = require('mssql');

// Configuração do banco de dados
const config = {
  user: 'luis',
  password: '123408',
  server: 'localhost',
  database: 'pontos_turisticos_db',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Função para obter a conexão com o banco
async function connect() {
  try {
    const pool = await sql.connect(config); // Conecta ao banco
    return pool;
  } catch (err) {
    console.error('Erro ao conectar ao SQL Server:', err);
    throw err;
  }
}

// Função para fechar a conexão depois de terminar
async function closeConnection(pool) {
  try {
    await pool.close();  // Fecha a conexão com o banco
  } catch (err) {
    console.error('Erro ao fechar a conexão:', err);
  }
}

module.exports = { connect, closeConnection };

const sql = require('mssql');

// Configurações de conexão para SQL Server com autenticação do Windows
const config = {
  user: '', // Deixe vazio, pois a autenticação do Windows será usada
  password: '', // Deixe vazio também
  server: 'localhost',  // 
  database: 'pontos_turisticos_db', // O banco de dados que você deseja acessar
  options: {
    encrypt: true, // Se necessário, use true para conexões seguras
    trustServerCertificate: true, // Necessário para evitar erro com certificados em alguns casos
  },
  trustedConnection: true // Habilita a autenticação do Windows
};

// Teste de conexão
async function testConnection() {
  try {
    const pool = await sql.connect(config);
    console.log('Conexão bem-sucedida ao SQL Server com Autenticação do Windows!');
  } catch (err) {
    console.error('Erro ao conectar ao SQL Server:', err);
  }
}

testConnection();

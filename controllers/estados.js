const { connect, closeConnection } = require('../database/connection');
const sql = require('mssql'); // Certifique-se de importar o sql

module.exports = {
  // Lista todos os estados
  async listarEstados(request, response) {
    let pool;
    try {
      // Obtem a conexão com o banco de dados
      pool = await connect();

      // Executa a query para buscar os estados
      const result = await pool.request().query('SELECT * FROM Estados;');
      const estados = result.recordset; // Lista de estados
      const nItens = estados.length; // Quantidade de itens

      // Retorna a resposta com sucesso
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de Estados.',
        dados: estados,
        nItens,
      });
    } catch (error) {
      // Retorna erro em caso de falha na requisição
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message,
      });
    } finally {
      // Garante que a conexão seja fechada
      if (pool) {
        await closeConnection(pool);
      }
    }
  },
};

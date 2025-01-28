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

  async listarEndereco(request, response) {
    let pool;
    try {
      pool = await connect(); // Obtém a conexão
  
      // Consulta para incluir os dados do endereço e pontos turísticos
      const result = await pool.request().query(`
        SELECT * FROM endereco
      `);
  
      const enderecos = result.recordset;
      const nItens = enderecos.length;
  
      // Formatação dos dados de endereço, se necessário
      const enderecosFormatados = enderecos.map((endereco) => {
        return {
          end_id: endereco.end_id,
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.cidade, // Cidade como VARCHAR
          estado_id: endereco.estado_id,
          cep: endereco.cep
        };
      });
  
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de Endereços.',
        dados: enderecosFormatados,
        nItens
      });
  
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message,
      });
    } finally {
      if (pool) {
        await closeConnection(pool); // Garantir que a conexão seja fechada
      }
    }
  }
  
  
  
};

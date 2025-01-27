const { connect, closeConnection } = require('../database/connection');
const sql = require('mssql');  // Certifique-se de importar o sql
module.exports = {
  // Lista todos os pontos turísticos
  async listarPontosTuristicos(request, response) {
    let pool;
    try {
      pool = await connect();  // Obtemos a conexão
      const result = await pool.request().query('SELECT * FROM PontosTuristicos;');
      const pontosTuristicos = result.recordset;
      const nItens = pontosTuristicos.length;

      // Formatação de data (caso necessário)
      const pontosFormatados = pontosTuristicos.map(ponto => {
        return {
          ...ponto,
          DataInclusao: ponto.DataInclusao.toISOString().split('T')[0],
        };
      });

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de Pontos Turísticos.',
        dados: pontosFormatados,
        nItens,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message,
      });
    } finally {
      if (pool) {
        await closeConnection(pool);  // Garantir que a conexão seja fechada
      }
    }
  },

  // Cadastra um novo ponto turístico
  async cadastrarPontoTuristico(request, response) {
    let pool;
    try {
      const { nome, descricao, localizacao, cidade, estadoID, dataInclusao } = request.body;

      // Verifica se o campo 'cidade' não está vazio ou nulo
      if (!cidade || cidade.trim() === "") {
        return response.status(400).json({
          sucesso: false,
          mensagem: "O campo 'Cidade' é obrigatório.",
          dados: null
        });
      }

      pool = await connect();  // Obtemos a conexão

      // Verificar se o EstadoID existe na tabela Estados
      const estadoResult = await pool.request()
        .input('estadoID', sql.Int, estadoID)
        .query('SELECT 1 FROM Estados WHERE EstadoID = @estadoID;');

      if (estadoResult.recordset.length === 0) {
        return response.status(400).json({
          sucesso: false,
          mensagem: `EstadoID ${estadoID} não encontrado na tabela de Estados.`,
          dados: null
        });
      }

      const query = `
        INSERT INTO PontosTuristicos (Nome, Descricao, Localizacao, Cidade, EstadoID, DataInclusao)
        OUTPUT INSERTED.PontoID
        VALUES (@nome, @descricao, @localizacao, @cidade, @estadoID, @dataInclusao);
      `;
      
      const result = await pool.request()
        .input('nome', sql.NVarChar, nome)
        .input('descricao', sql.NVarChar, descricao)
        .input('localizacao', sql.NVarChar, localizacao)
        .input('cidade', sql.NVarChar, cidade)
        .input('estadoID', sql.Int, estadoID)
        .input('dataInclusao', sql.Date, dataInclusao)
        .query(query);

      const pontoID = result.recordset[0].PontoID;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Ponto turístico cadastrado com sucesso.',
        dados: pontoID,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message,
      });
    } finally {
      if (pool) {
        await closeConnection(pool);  // Garantir que a conexão seja fechada
      }
    }
  },


  // Edita um ponto turístico
  async editarPontoTuristico(request, response) {
    let pool;
    try {
      const { nome, descricao, localizacao, cidade, estadoID, dataInclusao } = request.body;
      const { pontoID } = request.params;
      pool = await connect();  // Obtemos a conexão

      const query = `
        UPDATE PontosTuristicos 
        SET Nome = @nome, Descricao = @descricao, Localizacao = @localizacao, Cidade = @cidade, EstadoID = @estadoID, DataInclusao = @dataInclusao
        WHERE PontoID = @pontoID;
      `;
      
      const result = await pool.request()
        .input('nome', sql.NVarChar, nome)
        .input('descricao', sql.NVarChar, descricao)
        .input('localizacao', sql.NVarChar, localizacao)
        .input('cidade', sql.NVarChar, cidade)
        .input('estadoID', sql.Int, estadoID)
        .input('dataInclusao', sql.Date, dataInclusao)
        .input('pontoID', sql.Int, pontoID)
        .query(query);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Ponto turístico ${pontoID} atualizado com sucesso!`,
        dados: result.rowsAffected,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message,
      });
    } finally {
      if (pool) {
        await closeConnection(pool);  // Garantir que a conexão seja fechada
      }
    }
  },

  // Apaga um ponto turístico
  async apagarPontoTuristico(request, response) {
    let pool;
    try {
      const { pontoID } = request.params;
      pool = await connect();  // Obtemos a conexão

      const query = 'DELETE FROM PontosTuristicos WHERE PontoID = @pontoID;';
      
      const result = await pool.request()
        .input('pontoID', sql.Int, pontoID)
        .query(query);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Ponto turístico ${pontoID} excluído com sucesso.`,
        dados: result.rowsAffected,
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message,
      });
    } finally {
      if (pool) {
        await closeConnection(pool);  // Garantir que a conexão seja fechada
      }
    }
  },
};

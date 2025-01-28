const { connect, closeConnection } = require('../database/connection');
const sql = require('mssql');  // Certifique-se de importar o sql
module.exports = {
  // Lista todos os pontos turísticos
  async listarPontosTuristicos(request, response) {
    let pool;
    try {
      pool = await connect(); // Obtemos a conexão
      const result = await pool.request().query('SELECT * FROM PontosTuristicos;');
      const pontosTuristicos = result.recordset;
      const nItens = pontosTuristicos.length;
  
      // Formatação de data e hora
      const pontosFormatados = pontosTuristicos.map(ponto => {
        let dataFormatada = null;
        if (ponto.data_inclusao) {
          try {
            // Converte a string do banco para uma data
            const data = new Date(ponto.data_inclusao);
            if (!isNaN(data)) {
              // Formata a data no formato `YYYY-MM-DD HH:mm:ss`
              const ano = data.getFullYear();
              const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês inicia em 0
              const dia = String(data.getDate()).padStart(2, '0');
              const horas = String(data.getHours()).padStart(2, '0');
              const minutos = String(data.getMinutes()).padStart(2, '0');
              const segundos = String(data.getSeconds()).padStart(2, '0');
              dataFormatada = `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
            }
          } catch {
            dataFormatada = null; // Caso a conversão falhe
          }
        }
  
        return {
          ...ponto,
          data_inclusao: dataFormatada,
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
        await closeConnection(pool); // Garantir que a conexão seja fechada
      }
    }
  },
  
  
  
  // Cadastra um novo ponto turístico
  async cadastrarPontoTuristico(request, response) {
    let pool;
    try {
      const { nome, descricao, localizacao, cidade, estado_id, data_inclusao } = request.body;
      
      // Verifica se o campo 'cidade' não está vazio ou nulo
      if (!cidade || cidade.trim() === "") {
        return response.status(400).json({
          sucesso: false,
          mensagem: "O campo 'Cidade' é obrigatório.",
          dados: null
        });
      }
  
      pool = await connect();  // Obtemos a conexão
  
      // Verificar se o estado_id existe na tabela Estados
      const estadoResult = await pool.request()
        .input('estado_id', sql.Int, estado_id)
        .query('SELECT 1 FROM Estados WHERE estado_id = @estado_id;');
  
      if (estadoResult.recordset.length === 0) {
        return response.status(400).json({
          sucesso: false,
          mensagem: `estado_id ${estado_id} não encontrado na tabela de Estados.`,
          dados: null
        });
      }
  
      // Se a data_inclusao não for fornecida, usar a data e hora atuais
      const dataAtual = data_inclusao || new Date().toISOString();  // Pega a data atual no formato ISO
  
      const query = `
        INSERT INTO PontosTuristicos (nome, descricao, localizacao, cidade, estado_id, data_inclusao)
        OUTPUT INSERTED.ponto_id
        VALUES (@nome, @descricao, @localizacao, @cidade, @estado_id, @data_inclusao);
      `;
      
      const result = await pool.request()
        .input('nome', sql.NVarChar, nome)
        .input('descricao', sql.NVarChar, descricao)
        .input('localizacao', sql.NVarChar, localizacao)
        .input('cidade', sql.NVarChar, cidade)
        .input('estado_id', sql.Int, estado_id)
        .input('data_inclusao', sql.DateTime, dataAtual)  // Usando data atual
        .query(query);
  
      const ponto_id = result.recordset[0].ponto_id;
  
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Ponto turístico cadastrado com sucesso.',
        dados: ponto_id,
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
      const { nome, descricao, localizacao, cidade, estado_id, data_inclusao } = request.body;
      const { ponto_id } = request.params;
      pool = await connect();  // Obtemos a conexão

      const query = `
        UPDATE PontosTuristicos 
        SET Nome = @nome, Descricao = @descricao, Localizacao = @localizacao, Cidade = @cidade, estado_id = @estado_id, data_inclusao = @data_inclusao
        WHERE ponto_id = @ponto_id;
      `;
      
      const result = await pool.request()
        .input('nome', sql.NVarChar, nome)
        .input('descricao', sql.NVarChar, descricao)
        .input('localizacao', sql.NVarChar, localizacao)
        .input('cidade', sql.NVarChar, cidade)
        .input('estado_id', sql.Int, estado_id)
        .input('data_inclusao', sql.Date, data_inclusao)
        .input('ponto_id', sql.Int, ponto_id)
        .query(query);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Ponto turístico ${ponto_id} atualizado com sucesso!`,
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
      const { ponto_id } = request.params;
      pool = await connect();  // Obtemos a conexão

      const query = 'DELETE FROM PontosTuristicos WHERE ponto_id = @ponto_id;';
      
      const result = await pool.request()
        .input('ponto_id', sql.Int, ponto_id)
        .query(query);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Ponto turístico ${ponto_id} excluído com sucesso.`,
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

const { connect, closeConnection } = require('../database/connection');
const sql = require('mssql');  // Certifique-se de importar o sql
module.exports = {
  // Lista todos os pontos turísticos
  async listarPontosTuristicos(request, response) {
    let pool;
    try {
      pool = await connect(); // Obtemos a conexão
      const result = await pool.request().query('SELECT * FROM pontos_turisticos');
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
// Cadastra um novo ponto turístico
async cadastrarPontoTuristico(request, response) {
  let pool;
  try {
    // Desestruturando os dados recebidos na requisição
    const { nome, descricao, logradouro, bairro, cidade, estado_id, cep } = request.body;

    // Verifica se o campo 'cidade' não está vazio ou nulo
    if (!cidade || cidade.trim() === "") {
      return response.status(400).json({
        sucesso: false,
        mensagem: "O campo 'Cidade' é obrigatório.",
        dados: null
      });
    }

    pool = await connect();  // Obtemos a conexão

    // Verificar se o estado_id existe na tabela de estados
    const estadoResult = await pool.request()
      .input('estado_id', sql.Int, estado_id)
      .query('SELECT 1 FROM estados WHERE estado_id = @estado_id;');

    if (estadoResult.recordset.length === 0) {
      return response.status(400).json({
        sucesso: false,
        mensagem: `estado_id ${estado_id} não encontrado na tabela de Estados.`,
        dados: null
      });
    }

    // Inserir o novo endereço na tabela 'enderecos'
    const enderecoInsert = await pool.request()
      .input('logradouro', sql.NVarChar, logradouro)
      .input('bairro', sql.NVarChar, bairro)
      .input('cidade', sql.NVarChar, cidade)
      .input('estado_id', sql.Int, estado_id)
      .input('cep', sql.Char(8), cep)
      .query(`
        INSERT INTO endereco (logradouro, bairro, cidade, estado_id, cep)
        OUTPUT INSERTED.end_id
        VALUES (@logradouro, @bairro, @cidade, @estado_id, @cep);
      `);

    // Verifica se o endereço foi inserido
    if (enderecoInsert.recordset.length === 0) {
      return response.status(400).json({
        sucesso: false,
        mensagem: "Erro ao inserir o endereço.",
        dados: null
      });
    }

    const endereco_id = enderecoInsert.recordset[0].end_id;
    console.log('Novo endereço inserido com ID:', endereco_id);  // Depuração

    // Inserir ponto turístico na tabela 'pontos_turisticos'
    const query = `
      INSERT INTO pontos_turisticos (nome, descricao, end_id)
      OUTPUT INSERTED.ponto_id
      VALUES (@nome, @descricao, @end_id);
    `;

    console.log('Inserindo ponto turístico com endereço ID:', endereco_id);  // Depuração
    const result = await pool.request()
      .input('nome', sql.NVarChar, nome)
      .input('descricao', sql.NVarChar, descricao)
      .input('end_id', sql.Int, endereco_id)  // Referencia o novo endereço inserido
      .query(query);

    console.log('Resultado da inserção do ponto turístico:', result.recordset);  // Depuração
    const ponto_id = result.recordset[0].ponto_id;

    return response.status(200).json({
      sucesso: true,
      mensagem: 'Ponto turístico cadastrado com sucesso.',
      dados: ponto_id,
    });
  } catch (error) {
    console.error(error); // Para depuração
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
  async listarTudo(request, response) {
    let pool;
    try {
      pool = await connect(); // Obtemos a conexão
  
      // Query para fazer JOIN nas tabelas pontos_turisticos, endereco e estados
      const query = `
        SELECT 
          pt.nome, 
          pt.descricao, 
          pt.data_inclusao, 
          es.nome AS estado_nome,
          e.logradouro, 
          e.bairro, 
          e.cidade, 
          e.cep
        FROM pontos_turisticos pt
        JOIN endereco e ON pt.end_id = e.end_id
        JOIN Estados es ON e.estado_id = es.estado_id;  -- Relacionamento corrigido
      `;
  
      const result = await pool.request().query(query);
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
        mensagem: 'Lista de Pontos Turísticos, Endereços e Estados.',
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
  
  
  
  
};

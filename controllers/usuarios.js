const bcrypt = require('bcrypt');
const { connect, closeConnection } = require('../database/connection');
const sql = require('mssql');  // Certifique-se de importar o sql

module.exports = {
  // Cadastrar um novo usuário
  async cadastrarUsuario(request, response) {
    let pool;
    try {
      const { nome, email, senha, data_nascimento } = request.body;  // Incluindo 'data_nascimento' caso necessário

      // Verifica se todos os campos obrigatórios estão presentes
      if (!nome || !email || !senha || !data_nascimento) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nome, e-mail, senha e data de nascimento são obrigatórios.',
          dados: null,
        });
      }

      pool = await connect();  // Obtém a conexão com o banco de dados

      // Criptografa a senha
      const hashedSenha = await bcrypt.hash(senha, 10);

      // Consulta para inserir o novo usuário
      const query = `
        INSERT INTO Usuarios (Nome, Email, Senha, Data_Nascimento, Data_Cadastro)
        OUTPUT INSERTED.usu_id
        VALUES (@nome, @email, @senha, @data_nascimento, GETDATE());
      `;

      const result = await pool.request()
        .input('nome', sql.NVarChar, nome)
        .input('email', sql.NVarChar, email)
        .input('senha', sql.NVarChar, hashedSenha)
        .input('data_nascimento', sql.Date, data_nascimento)  // Assegura que o tipo de dado seja 'Date'
        .query(query);

      const usuarioID = result.recordset[0].usu_id;  // Pegando o ID do novo usuário inserido

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário cadastrado com sucesso.',
        dados: { usuarioID },  // Retorna o ID do usuário
      });
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);

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

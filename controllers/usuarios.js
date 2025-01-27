const bcrypt = require('bcrypt');
const { connect, closeConnection } = require('../database/connection');
const sql = require('mssql');  // Certifique-se de importar o sql
module.exports = {
  // Cadastrar um novo usuário
  async cadastrarUsuario(request, response) {
    let pool;
    try {
      const { nome, email, senha } = request.body;
      pool = await connect();  // Obtém a conexão

      // Criptografa a senha
      const hashedSenha = await bcrypt.hash(senha, 10);

      const query = `
        INSERT INTO Usuarios (Nome, Email, Senha)
        OUTPUT INSERTED.UsuarioID
        VALUES (@nome, @email, @senha);
      `;

      const result = await pool.request()
        .input('nome', sql.NVarChar, nome)
        .input('email', sql.NVarChar, email)
        .input('senha', sql.NVarChar, hashedSenha)
        .query(query);

      const usuarioID = result.recordset[0].UsuarioID;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário cadastrado com sucesso.',
        dados: usuarioID,
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

const bcrypt = require('bcrypt');
const { connect, closeConnection } = require('../database/connection');
const sql = require('mssql');  // Certifique-se de importar o sql
module.exports = {
  // Realizar o login do usuário
  async login(request, response) {
    let pool;
    try {
      const { email, senha } = request.body;
      pool = await connect();  // Obtém a conexão

      // Consulta para buscar o usuário pelo e-mail
      const query = 'SELECT UsuarioID, Nome, Senha, Ativo FROM Usuarios WHERE Email = @email;';
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query(query);

      if (result.recordset.length === 0) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado.',
          dados: null,
        });
      }

      const usuario = result.recordset[0];

      // Compara a senha fornecida com a senha armazenada
      const isMatch = await bcrypt.compare(senha, usuario.Senha);

      if (!isMatch) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Senha incorreta.',
          dados: null,
        });
      }

      if (!usuario.Ativo) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Usuário inativo.',
          dados: null,
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso.',
        dados: { usuarioID: usuario.UsuarioID, nome: usuario.Nome },
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

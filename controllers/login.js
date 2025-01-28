const bcrypt = require('bcrypt');
const { connect, closeConnection } = require('../database/connection');
const sql = require('mssql');  // Certifique-se de importar o sql corretamente

module.exports = {
  // Realizar o login do usuário
  async login(request, response) {
    let pool;
    try {
      const { email, senha } = request.body;

      // Verifica se o email e a senha foram fornecidos
      if (!email || !senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'E-mail e senha são obrigatórios.',
          dados: null,
        });
      }

      pool = await connect();  // Obtém a conexão com o banco de dados

      // Consulta para buscar o usuário pelo e-mail
      const query = 'SELECT usu_id, nome, senha FROM usuarios WHERE email = @email;';
      const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query(query);

      // Verifica se o usuário foi encontrado
      if (result.recordset.length === 0) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Usuário não encontrado.',
          dados: null,
        });
      }

      const usuario = result.recordset[0];

      // Compara a senha fornecida com a senha armazenada
      const isMatch = await bcrypt.compare(senha, usuario.senha);

      if (!isMatch) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Senha incorreta.',
          dados: null,
        });
      }

      // Retorna sucesso no login
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso.',
        dados: {
          usuarioID: usuario.usu_id,  // Usando 'usu_id' que é o nome da coluna no banco
          nome: usuario.nome,         // Usando 'nome' que é o nome da coluna no banco
        },
      });
    } catch (error) {
      console.error('Erro ao realizar login:', error);

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

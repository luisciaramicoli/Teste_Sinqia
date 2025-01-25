const db = require('../database/connection');

module.exports = {
    async listarCompras(request, response) {
        try {
            const sql = 'SELECT * FROM COMPRAS;';
            const compras = await db.query(sql);
            const nItens = compras[0].length;

            // Formatando a data para cada compra
            const comprasFormatadas = compras[0].map(compra => {
                return {
                    ...compra,
                    comp_data: compra.comp_data.toISOString().split('T')[0]
                };
            });

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de Compras.',
                dados: comprasFormatadas,
                nItens
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },

    async cadastrarCompra(request, response) {
        try {
            const { comp_data, forn_id, comp_nota } = request.body;
            const sql = 'INSERT INTO COMPRAS (comp_data, forn_id, comp_nota) VALUES (?, ?, ?);';
            const values = [comp_data, forn_id, comp_nota];
            const execSql = await db.query(sql, values);
            const comp_id = execSql[0].insertId;

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Compra cadastrada com sucesso.',
                dados: comp_id
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },

    async editarCompra(request, response) {
        try {
            const { comp_data, forn_id, comp_nota } = request.body;
            const { comp_id } = request.params;
            const sql = 'UPDATE COMPRAS SET comp_data = ?, forn_id = ?, comp_nota = ? WHERE comp_id = ?;';
            const values = [comp_data, forn_id, comp_nota, comp_id];
            const atualizaDados = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: `Compra ${comp_id} atualizada com sucesso!`,
                dados: atualizaDados[0].affectedRows
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },

    async apagarCompra(request, response) {
        try {
            const { comp_id } = request.params;
            const sql = 'DELETE FROM COMPRAS WHERE comp_id = ?;';
            const values = [comp_id];
            const excluir = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: `Compra ${comp_id} excluída com sucesso.`,
                dados: excluir[0].affectedRows
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    }
};

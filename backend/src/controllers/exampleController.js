const db = require('../db/connection');

module.exports = {
    hello: async (req, res) => {
        try {
            const [rows] = await db.query("SELECT 'Olá do MySQL!' AS msg");

            return res.status(200).json({
                status: true,
                message: 'Retornado com sucesso!',
                data: rows
            });

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: 'Erro interno no servidor.',
                data: error
            });
        }
    }
};

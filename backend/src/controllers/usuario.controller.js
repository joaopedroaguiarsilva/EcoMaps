const db = require("../db/connection");

// ===============================
// CONTAR USUÁRIOS
// ===============================
async function contarUsuarios(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM USUARIO
    `);

    res.json({ total: rows[0].total });
  } catch (error) {
    console.error("Erro ao contar usuários:", error);
    res.status(500).json({ erro: "Erro ao contar usuários" });
  }
}

module.exports = {
  contarUsuarios,
};

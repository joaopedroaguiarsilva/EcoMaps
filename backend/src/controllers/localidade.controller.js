const db = require("../db/connection");
const fs = require("fs");
const path = require("path");

// ===============================
// LIMITES GEOGRÁFICOS DE SABARÁ
// ===============================
function isInsideSabara(lat, lng) {
  return (
    lat >= -19.98 &&
    lat <= -19.75 &&
    lng >= -43.95 &&
    lng <= -43.65
  );
}

// =====================================================
// CRIAR LOCALIDADE
// =====================================================
async function criarLocalidade(req, res) {
  try {
    const {
      nome,
      descricao,
      latitude,
      longitude,
      tipoLocalidade,
      usuarioId,
    } = req.body;

    const imagem = req.file?.filename;

    // ===============================
    // VALIDAÇÕES BÁSICAS
    // ===============================
    if (!nome || !latitude || !longitude || !imagem || !tipoLocalidade) {
      return res.status(400).json({
        erro: "Dados obrigatórios faltando",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const tipo = Number(tipoLocalidade);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      Number.isNaN(tipo)
    ) {
      return res.status(400).json({
        erro: "Latitude, longitude ou tipo inválidos",
      });
    }

    // ===============================
    // VALIDAÇÃO GEOGRÁFICA
    // ===============================
    if (!isInsideSabara(lat, lng)) {
      return res.status(400).json({
        erro: "A localidade precisa estar dentro do município de Sabará.",
      });
    }

    // ===============================
    // VALIDAÇÃO DO TIPO_LOCALIDADE
    // ===============================
    const [tipoRows] = await db.query(
      "SELECT CODIGO_TLOCALIDADE FROM TIPO_LOCALIDADE WHERE CODIGO_TLOCALIDADE = ?",
      [tipo]
    );

    if (!tipoRows.length) {
      return res.status(400).json({
        erro: "Tipo de localidade inválido",
      });
    }

    // ===============================
    // INSERT NO BANCO
    // ===============================
    await db.query(
      `
      INSERT INTO LOCALIDADE
      (
        NOME_LOCALIDADE,
        DESCRICAO_LOCALIDADE,
        LATITUDE_LOCALIDADE,
        LONGITUDE_LOCALIDADE,
        IMAGEM_LOCALIDADE,
        CODUSUARIO_LOCALIDADE,
        CTLOCALIDADE_LOCALIDADE
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nome,
        descricao || null,
        lat,
        lng,
        `uploads/localidades/${imagem}`,
        usuarioId || 1, // temporário
        tipo,
      ]
    );

    return res.status(201).json({
      mensagem: "Localidade criada com sucesso",
    });

  } catch (error) {
    console.error("Erro ao criar localidade:", error);

    // 🧹 REMOVE IMAGEM SE DER ERRO
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        "../../uploads/localidades",
        req.file.filename
      );

      fs.unlink(imagePath, () => {});
    }

    return res.status(500).json({
      erro: "Erro ao criar localidade",
    });
  }
}

// =====================================================
// LISTAR LOCALIDADES → MAPA
// =====================================================
async function listarLocalidades(req, res) {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        l.CODIGO_LOCALIDADE,
        l.NOME_LOCALIDADE,
        l.LATITUDE_LOCALIDADE,
        l.LONGITUDE_LOCALIDADE,
        l.IMAGEM_LOCALIDADE,
        COALESCE(ROUND(AVG(v.VALOR_VOTO), 1), 0) AS RELEVANCIA,
        COUNT(v.CODIGO_VOTO) AS TOTAL_VOTOS
      FROM LOCALIDADE l
      LEFT JOIN VOTO_LOCALIDADE v 
        ON v.CODLOCALIDADE_VOTO = l.CODIGO_LOCALIDADE
      GROUP BY l.CODIGO_LOCALIDADE
      ORDER BY l.CODIGO_LOCALIDADE DESC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar localidades" });
  }
}

// =====================================================
// DETALHE DA LOCALIDADE
// =====================================================
async function detalheLocalidade(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        l.CODIGO_LOCALIDADE,
        l.NOME_LOCALIDADE,
        l.DESCRICAO_LOCALIDADE,
        l.IMAGEM_LOCALIDADE,
        COALESCE(ROUND(AVG(v.VALOR_VOTO), 1), 0) AS RELEVANCIA,
        COUNT(v.CODIGO_VOTO) AS TOTAL_VOTOS
      FROM LOCALIDADE l
      LEFT JOIN VOTO_LOCALIDADE v 
        ON v.CODLOCALIDADE_VOTO = l.CODIGO_LOCALIDADE
      WHERE l.CODIGO_LOCALIDADE = ?
      GROUP BY l.CODIGO_LOCALIDADE
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Localidade não encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar localidade" });
  }
}

// =====================================================
// VOTAR EM LOCALIDADE
// =====================================================
async function votarLocalidade(req, res) {
  try {
    const { id } = req.params;
    const { usuarioId, valor } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ erro: "Usuário não informado" });
    }

    const nota = Number(valor);

    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      return res.status(400).json({ erro: "Nota inválida" });
    }

    await db.query(
      `
      INSERT INTO VOTO_LOCALIDADE 
        (CODUSUARIO_VOTO, CODLOCALIDADE_VOTO, VALOR_VOTO)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE VALOR_VOTO = ?
      `,
      [usuarioId, id, nota, nota]
    );

    res.json({ mensagem: "Voto registrado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao votar" });
  }
}

// ===============================
// EXPORTS
// ===============================
module.exports = {
  criarLocalidade,
  listarLocalidades,
  detalheLocalidade,
  votarLocalidade,
};

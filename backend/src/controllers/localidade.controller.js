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

    if (!nome || !latitude || !longitude || !imagem || !tipoLocalidade) {
      return res.status(400).json({ erro: "Dados obrigatórios faltando" });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const tipo = Number(tipoLocalidade);

    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(tipo)) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    if (!isInsideSabara(lat, lng)) {
      return res.status(400).json({
        erro: "A localidade precisa estar dentro do município de Sabará.",
      });
    }

    const [tipoRows] = await db.query(
      "SELECT CODIGO_TLOCALIDADE FROM TIPO_LOCALIDADE WHERE CODIGO_TLOCALIDADE = ?",
      [tipo]
    );

    if (!tipoRows.length) {
      return res.status(400).json({ erro: "Tipo de localidade inválido" });
    }

    await db.query(
      `
      INSERT INTO LOCALIDADE (
        NOME_LOCALIDADE,
        DESCRICAO_LOCALIDADE,
        LATITUDE_LOCALIDADE,
        LONGITUDE_LOCALIDADE,
        IMAGEM_LOCALIDADE,
        CODUSUARIO_LOCALIDADE,
        CTLOCALIDADE_LOCALIDADE
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nome,
        descricao || null,
        lat,
        lng,
        `uploads/localidades/${imagem}`,
        usuarioId || 1,
        tipo,
      ]
    );

    res.status(201).json({ mensagem: "Localidade criada com sucesso" });
  } catch (error) {
    console.error(error);

    if (req.file) {
      fs.unlink(
        path.join(__dirname, "../../uploads/localidades", req.file.filename),
        () => {}
      );
    }

    res.status(500).json({ erro: "Erro ao criar localidade" });
  }
}

// =====================================================
// LISTAR LOCALIDADES
// =====================================================
async function listarLocalidades(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.CODIGO_LOCALIDADE,
        l.NOME_LOCALIDADE,
        l.DESCRICAO_LOCALIDADE,
        l.LATITUDE_LOCALIDADE,
        l.LONGITUDE_LOCALIDADE,
        l.IMAGEM_LOCALIDADE,
        t.NOME_TLOCALIDADE,
        COALESCE(ROUND(AVG(v.VALOR_VOTO), 1), 0) AS RELEVANCIA,
        COUNT(v.CODIGO_VOTO) AS TOTAL_VOTOS
      FROM LOCALIDADE l
      JOIN TIPO_LOCALIDADE t 
        ON t.CODIGO_TLOCALIDADE = l.CTLOCALIDADE_LOCALIDADE
      LEFT JOIN VOTO_LOCALIDADE v 
        ON v.CODLOCALIDADE_VOTO = l.CODIGO_LOCALIDADE
      GROUP BY l.CODIGO_LOCALIDADE
      ORDER BY l.CODIGO_LOCALIDADE DESC
    `);

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
        l.LATITUDE_LOCALIDADE,
        l.LONGITUDE_LOCALIDADE,
        t.NOME_TLOCALIDADE,
        COALESCE(ROUND(AVG(v.VALOR_VOTO), 1), 0) AS RELEVANCIA,
        COUNT(v.CODIGO_VOTO) AS TOTAL_VOTOS
      FROM LOCALIDADE l
      JOIN TIPO_LOCALIDADE t 
        ON t.CODIGO_TLOCALIDADE = l.CTLOCALIDADE_LOCALIDADE
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
// EXPORTS
// =====================================================
module.exports = {
  criarLocalidade,
  listarLocalidades,
  detalheLocalidade,
};

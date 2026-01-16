const db = require("../db/connection");
const fs = require("fs");
const path = require("path");

// ===============================
// LIMITES GEOGRÁFICOS DE SABARÁ
// ===============================
function isInsideSabara(lat, lng) {
  return lat >= -19.98 && lat <= -19.75 && lng >= -43.95 && lng <= -43.65;
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
        usuarioId,
        tipo,
      ]
    );

    return res.status(201).json({ mensagem: "Localidade criada com sucesso" });

  } catch (error) {
    console.error(error);

    if (req.file) {
      fs.unlink(
        path.join(__dirname, "../../uploads/localidades", req.file.filename),
        () => {}
      );
    }

    return res.status(500).json({ erro: "Erro ao criar localidade" });
  }
}

// =====================================================
// LISTAR LOCALIDADES (COM FILTRO DE CATEGORIA CORRETO)
// =====================================================
async function listarLocalidades(req, res) {
  try {
    const { nome, categoria } = req.query;

    let where = [];
    let params = [];

    if (nome) {
      where.push("l.NOME_LOCALIDADE LIKE ?");
      params.push(`%${nome}%`);
    }

    // 🔴 CORREÇÃO DEFINITIVA DO BUG DO NaN
    if (categoria && !isNaN(Number(categoria))) {
      where.push("l.CTLOCALIDADE_LOCALIDADE = ?");
      params.push(Number(categoria));
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await db.query(
      `
      SELECT 
        l.CODIGO_LOCALIDADE,
        l.NOME_LOCALIDADE,
        l.DESCRICAO_LOCALIDADE,
        l.LATITUDE_LOCALIDADE,
        l.LONGITUDE_LOCALIDADE,
        l.IMAGEM_LOCALIDADE,
        t.NOME_TLOCALIDADE,
        COALESCE(SUM(v.VALOR_VOTO), 0) AS SCORE,
        COUNT(v.CODIGO_VOTO) AS TOTAL_VOTOS
      FROM LOCALIDADE l
      INNER JOIN TIPO_LOCALIDADE t 
        ON t.CODIGO_TLOCALIDADE = l.CTLOCALIDADE_LOCALIDADE
      LEFT JOIN VOTO_LOCALIDADE v 
        ON v.CODLOCALIDADE_VOTO = l.CODIGO_LOCALIDADE
      ${whereClause}
      GROUP BY l.CODIGO_LOCALIDADE
      ORDER BY SCORE DESC
      `,
      params
    );

    return res.json(rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao listar localidades" });
  }
}

// =====================================================
// DETALHE DE UMA LOCALIDADE
// =====================================================
async function detalheLocalidade(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.query.usuarioId || null;

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
        COALESCE(SUM(v.VALOR_VOTO), 0) AS SCORE,
        COUNT(v.CODIGO_VOTO) AS TOTAL_VOTOS,
        (
          SELECT v2.VALOR_VOTO
          FROM VOTO_LOCALIDADE v2
          WHERE v2.CODLOCALIDADE_VOTO = l.CODIGO_LOCALIDADE
          AND v2.CODUSUARIO_VOTO = ?
          LIMIT 1
        ) AS userVote
      FROM LOCALIDADE l
      INNER JOIN TIPO_LOCALIDADE t 
        ON t.CODIGO_TLOCALIDADE = l.CTLOCALIDADE_LOCALIDADE
      LEFT JOIN VOTO_LOCALIDADE v 
        ON v.CODLOCALIDADE_VOTO = l.CODIGO_LOCALIDADE
      WHERE l.CODIGO_LOCALIDADE = ?
      GROUP BY l.CODIGO_LOCALIDADE
      `,
      [usuarioId, id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Localidade não encontrada" });
    }

    return res.json(rows[0]);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar localidade" });
  }
}

// =====================================================
// VOTAR EM LOCALIDADE
// =====================================================
async function votarLocalidade(req, res) {
  try {
    const { localidadeId, valor } = req.body;
    const usuarioId = req.usuarioId || 1;

    if (![1, -1].includes(valor)) {
      return res.status(400).json({ erro: "Valor de voto inválido" });
    }

    const [rows] = await db.query(
      `
      SELECT CODIGO_VOTO, VALOR_VOTO
      FROM VOTO_LOCALIDADE
      WHERE CODUSUARIO_VOTO = ? AND CODLOCALIDADE_VOTO = ?
      `,
      [usuarioId, localidadeId]
    );

    if (!rows.length) {
      await db.query(
        `
        INSERT INTO VOTO_LOCALIDADE 
        (CODUSUARIO_VOTO, CODLOCALIDADE_VOTO, VALOR_VOTO)
        VALUES (?, ?, ?)
        `,
        [usuarioId, localidadeId, valor]
      );

      return res.json({ mensagem: "Voto registrado" });
    }

    const votoAtual = rows[0];

    if (votoAtual.VALOR_VOTO === valor) {
      await db.query(
        `DELETE FROM VOTO_LOCALIDADE WHERE CODIGO_VOTO = ?`,
        [votoAtual.CODIGO_VOTO]
      );

      return res.json({ mensagem: "Voto removido" });
    }

    await db.query(
      `
      UPDATE VOTO_LOCALIDADE 
      SET VALOR_VOTO = ?, DATA_VOTO = CURRENT_TIMESTAMP
      WHERE CODIGO_VOTO = ?
      `,
      [valor, votoAtual.CODIGO_VOTO]
    );

    return res.json({ mensagem: "Voto atualizado" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao votar" });
  }
}

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  criarLocalidade,
  listarLocalidades,
  detalheLocalidade,
  votarLocalidade,
};

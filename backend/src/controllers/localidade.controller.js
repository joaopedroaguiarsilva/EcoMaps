const db = require("../db/connection");

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

    // arquivo salvo pelo multer
    const imagem = req.file?.filename;

    if (!nome || !latitude || !longitude || !imagem) {
      return res.status(400).json({ erro: "Dados obrigatórios faltando" });
    }

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
        latitude,
        longitude,
        `uploads/localidades/${imagem}`, // caminho público servido por /uploads
        usuarioId || 1, // temporário (substituir pelo id do usuário autenticado)
        tipoLocalidade || 1, // temporário (substituir por opção do front)
      ]
    );

    res.status(201).json({ mensagem: "Localidade criada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar localidade" });
  }
}

// =====================================================
// LISTAR LOCALIDADES → Mapa (nome + relevância + total votos)
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
        COALESCE(ROUND(AVG(v.VALOR_VOTO), 1), 0) AS RELEVANCIA,
        COUNT(v.CODIGO_VOTO) AS TOTAL_VOTOS,
        l.IMAGEM_LOCALIDADE
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
// DETALHE DA LOCALIDADE (CLIQUE)
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

    const localidade = rows[0];
    if (!localidade) {
      return res.status(404).json({ erro: "Localidade não encontrada" });
    }

    res.json(localidade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar localidade" });
  }
}

// =====================================================
// VOTAR EM LOCALIDADE (1 a 5 estrelas)
// =====================================================
async function votarLocalidade(req, res) {
  try {
    const { id } = req.params;
    const { usuarioId, valor } = req.body;

    if (!usuarioId) {
      return res.status(400).json({ erro: "Usuário não informado" });
    }

    if (!Number.isInteger(Number(valor)) || valor < 1 || valor > 5) {
      return res.status(400).json({ erro: "Nota inválida" });
    }

    await db.query(
      `
      INSERT INTO VOTO_LOCALIDADE 
        (CODUSUARIO_VOTO, CODLOCALIDADE_VOTO, VALOR_VOTO)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE VALOR_VOTO = ?
      `,
      [usuarioId, id, valor, valor]
    );

    res.json({ mensagem: "Voto registrado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao votar" });
  }
}

module.exports = {
  criarLocalidade,
  listarLocalidades,
  detalheLocalidade,
  votarLocalidade,
};

import db from "../db/connection.js";

export async function criarLocalidade(req, res) {
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

    if (!nome || !latitude || !longitude || !imagem) {
      return res.status(400).json({ erro: "Dados obrigatórios faltando" });
    }

    await db.query(
      `
      INSERT INTO LOCALIDADE
      (NOME_LOCALIDADE, DESCRICAO_LOCALIDADE, LATITUDE_LOCALIDADE, LONGITUDE_LOCALIDADE, IMAGEM_LOCALIDADE, CODUSUARIO_LOCALIDADE, CTLOCALIDADE_LOCALIDADE)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nome,
        descricao,
        latitude,
        longitude,
        `localidades/${imagem}`,
        usuarioId,
        tipoLocalidade,
      ]
    );

    res.status(201).json({ mensagem: "Localidade criada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar localidade" });
  }
}

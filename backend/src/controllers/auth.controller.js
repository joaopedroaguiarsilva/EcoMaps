const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isValidEmail, isValidCPF } = require('../utils/validators');

module.exports = {
  // ======================
  // LOGIN
  // ======================
  login: async (req, res) => {
    let { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        status: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // normaliza email
    email = email.toLowerCase().trim();

    try {
      const [rows] = await db.query(
        `SELECT 
          CODIGO_USUARIO,
          NOME_USUARIO,
          EMAIL_USUARIO,
          SENHA_USUARIO,
          CARGO_USUARIO
        FROM USUARIO
        WHERE EMAIL_USUARIO = ?`,
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          status: false,
          message: 'Email ou senha inválidos'
        });
      }

      const usuario = rows[0];

      const senhaValida = await bcrypt.compare(
        senha,
        usuario.SENHA_USUARIO
      );

      if (!senhaValida) {
        return res.status(401).json({
          status: false,
          message: 'Email ou senha inválidos'
        });
      }

      const token = jwt.sign(
        {
          id: usuario.CODIGO_USUARIO,
          cargo: usuario.CARGO_USUARIO
        },
        process.env.JWT_SECRET || 'ecoMapsSecret',
        { expiresIn: '1d' }
      );

      delete usuario.SENHA_USUARIO;

      return res.status(200).json({
        status: true,
        message: 'Login realizado com sucesso',
        user: usuario,
        token
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: 'Erro interno no servidor'
      });
    }
  },

  // ======================
  // REGISTER
  // ======================
  register: async (req, res) => {
    let { nome, email, cpf, senha, confirmarSenha } = req.body;

    if (!nome || !email || !cpf || !senha || !confirmarSenha) {
      return res.status(400).json({
        status: false,
        message: 'Preencha todos os campos'
      });
    }

    // normalizações
    email = email.toLowerCase().trim();

    // validações
    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: false,
        message: 'Email inválido'
      });
    }

    if (!isValidCPF(cpf)) {
      return res.status(400).json({
        status: false,
        message: 'CPF inválido'
      });
    }

    // remove máscara do CPF (SALVA SEM FORMATAÇÃO)
    cpf = cpf.replace(/\D/g, '');

    if (senha.length < 5) {
      return res.status(400).json({
        status: false,
        message: 'A senha deve ter ao menos 5 caracteres'
      });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({
        status: false,
        message: 'As senhas não coincidem'
      });
    }

    try {
      const [existente] = await db.query(
        `SELECT CODIGO_USUARIO
         FROM USUARIO
         WHERE EMAIL_USUARIO = ? OR CPF_USUARIO = ?`,
        [email, cpf]
      );

      if (existente.length > 0) {
        return res.status(409).json({
          status: false,
          message: 'Email ou CPF já cadastrados'
        });
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      await db.query(
        `INSERT INTO USUARIO
          (NOME_USUARIO, EMAIL_USUARIO, CPF_USUARIO, SENHA_USUARIO, CARGO_USUARIO)
         VALUES (?, ?, ?, ?, ?)`,
        [nome, email, cpf, senhaHash, 'user']
      );

      return res.status(201).json({
        status: true,
        message: 'Usuário cadastrado com sucesso'
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: 'Erro interno no servidor'
      });
    }
  },

  // ======================
// RESET PASSWORD
// ======================
resetPassword: async (req, res) => {
  let { email, cpf, senha, confirmarSenha } = req.body;

  if (!email || !cpf || !senha || !confirmarSenha) {
    return res.status(400).json({
      status: false,
      message: 'Preencha todos os campos'
    });
  }

  email = email.toLowerCase().trim();
  cpf = cpf.replace(/\D/g, '');

  if (!isValidEmail(email)) {
    return res.status(400).json({
      status: false,
      message: 'Email inválido'
    });
  }

  if (!isValidCPF(cpf)) {
    return res.status(400).json({
      status: false,
      message: 'CPF inválido'
    });
  }

  if (senha.length < 5) {
    return res.status(400).json({
      status: false,
      message: 'A senha deve ter ao menos 5 caracteres'
    });
  }

  if (senha !== confirmarSenha) {
    return res.status(400).json({
      status: false,
      message: 'As senhas não coincidem'
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT CODIGO_USUARIO
       FROM USUARIO
       WHERE EMAIL_USUARIO = ? AND CPF_USUARIO = ?`,
      [email, cpf]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Usuário não encontrado com esses dados'
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await db.query(
      `UPDATE USUARIO
       SET SENHA_USUARIO = ?
       WHERE EMAIL_USUARIO = ? AND CPF_USUARIO = ?`,
      [senhaHash, email, cpf]
    );

    return res.status(200).json({
      status: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Erro interno no servidor'
    });
  }
}
};

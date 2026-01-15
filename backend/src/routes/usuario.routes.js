const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");

// contador de usuários
router.get("/count", usuarioController.contarUsuarios);

module.exports = router;

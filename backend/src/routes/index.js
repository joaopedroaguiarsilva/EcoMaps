const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const localidadeRoutes = require("./localidade.routes");
const usuarioRoutes = require("./usuario.routes");

router.use("/auth", authRoutes);
router.use("/localidades", localidadeRoutes);
router.use("/usuarios", usuarioRoutes);

module.exports = router;

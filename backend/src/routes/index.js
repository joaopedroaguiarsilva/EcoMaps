const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const localidadeRoutes = require("./localidade.routes");

router.use("/auth", authRoutes);
router.use("/localidades", localidadeRoutes);

module.exports = router;

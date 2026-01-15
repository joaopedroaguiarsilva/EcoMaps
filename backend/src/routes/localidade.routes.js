const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const localidadeController = require("../controllers/localidade.controller");

// listar todas (para o mapa)
router.get("/", localidadeController.listarLocalidades);

// detalhe por id
router.get("/:id", localidadeController.detalheLocalidade);

// criar localidade com upload da imagem
router.post(
  "/",
  upload.single("imagem"),
  localidadeController.criarLocalidade
);

router.post('/vote', localidadeController.votarLocalidade);

module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // multer instance
const localidadeController = require("../controllers/localidade.controller");

// listar todas (para o mapa)
router.get("/", localidadeController.listarLocalidades);

// detalhe por id
router.get("/:id", localidadeController.detalheLocalidade);

// criar localidade com upload da imagem (campo "imagem")
router.post("/", upload.single("imagem"), localidadeController.criarLocalidade);

// votar (1-5)
router.post("/:id/voto", localidadeController.votarLocalidade);

module.exports = router;

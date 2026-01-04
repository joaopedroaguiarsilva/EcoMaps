import { Router } from "express";
import upload from "../middlewares/upload.js";
import { criarLocalidade } from "../controllers/localidade.controller.js";

const router = Router();

router.post("/", upload.single("imagem"), criarLocalidade);

export default router;

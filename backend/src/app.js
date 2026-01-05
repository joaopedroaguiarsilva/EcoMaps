const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const routes = require("./routes"); // index.js na pasta routes

app.use(cors());
app.use(express.json());

// Servir imagens de localidades (rota: /uploads/...)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

// API routes
app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

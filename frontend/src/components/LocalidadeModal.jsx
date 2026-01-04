import { useState } from "react";
import axios from "axios";

function LocalidadeModal({ latitude, longitude, onClose }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!imagem) {
      alert("Selecione uma imagem");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("descricao", descricao);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("imagem", imagem);

      await axios.post("http://localhost:3000/api/localidades", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // Authorization: `Bearer ${token}` ← se tiver auth
        },
      });

      alert("Localidade cadastrada com sucesso!");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar localidade");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Cadastrar Localidade</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome da localidade"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={3}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagem(e.target.files[0])}
            required
          />

          <p>
            <strong>Latitude:</strong> {latitude.toFixed(6)} <br />
            <strong>Longitude:</strong> {longitude.toFixed(6)}
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== estilos ===== */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

export default LocalidadeModal;

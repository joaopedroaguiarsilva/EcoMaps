import { useState } from "react";
import axios from "axios";

function LocalidadeModal({ latitude, longitude, onClose }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoLocalidade, setTipoLocalidade] = useState("");
  const [imagem, setImagem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImagem(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImagem(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nome || !tipoLocalidade || !imagem) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setErro("");
      setLoading(true);

      const formData = new FormData();

      formData.append("nome", nome);
      formData.append("descricao", descricao);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("tipoLocalidade", tipoLocalidade);
      formData.append("imagem", imagem);
      formData.append("usuarioId", localStorage.getItem("usuarioId"));

      await axios.post("http://localhost:3000/api/localidades", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onClose();
    } catch (error) {
      setErro(error.response?.data?.erro || "Erro ao cadastrar localidade.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <style>
        {`
          ::placeholder {
            color: rgba(255,255,255,0.7);
          }

          select option {
            color: #000;
          }
        `}
      </style>

      <div style={styles.modal}>
        <h2 style={styles.title}>📍 Nova Localidade</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Nome da localidade *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={styles.input}
          />

          {/* SELECT MOBILE FRIENDLY */}
          <select
            value={tipoLocalidade}
            onChange={(e) => setTipoLocalidade(e.target.value)}
            style={{
              ...styles.select,
              color: tipoLocalidade ? "#fff" : "rgba(255,255,255,0.7)",
            }}
          >
            <option value="" disabled>
              Selecione a categoria *
            </option>
            <option value="1">Turismo ecológico / Parque</option>
            <option value="2">Problema ambiental / Poluição</option>
            <option value="3">Ponto de coleta seletiva</option>
          </select>

          <textarea
            placeholder="Descrição do local"
            rows={4}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={styles.textarea}
          />

          <label style={styles.uploadBox}>
            <input type="file" hidden accept="image/*" onChange={handleImagem} />
            {preview ? (
              <img src={preview} alt="preview" style={styles.previewImg} />
            ) : (
              <span>📷 Adicionar foto *</span>
            )}
          </label>

          <p style={styles.coords}>
            Lat: {latitude.toFixed(6)} | Lng: {longitude.toFixed(6)}
          </p>

          {erro && <div style={styles.erro}>{erro}</div>}

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancel}>
              Cancelar
            </button>

            <button type="submit" disabled={loading} style={styles.submit}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ====== STYLES ====== */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: 14,
    padding: 30,
    border: "1px solid rgba(255,255,255,0.2)",
  },

  title: {
    textAlign: "center",
    color: "#fff",
    marginBottom: 20,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  input: {
    height: 48,
    borderRadius: 30,
    border: "2px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
    padding: "0 18px",
    fontSize: 15,
    outline: "none",
  },

  select: {
    height: 48,
    borderRadius: 30,
    border: "2px solid rgba(255,255,255,0.2)",
    background: "transparent",
    padding: "0 18px",
    fontSize: 15,
    outline: "none",
    appearance: "none",
  },

  textarea: {
    borderRadius: 20,
    border: "2px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
    padding: 16,
    fontSize: 15,
    outline: "none",
    resize: "none",
  },

  uploadBox: {
    border: "2px dashed #4caf50",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
    color: "#fff",
    cursor: "pointer",
  },

  previewImg: {
    width: "100%",
    borderRadius: 12,
  },

  coords: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },

  erro: {
    background: "#b71c1c",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    textAlign: "center",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10,
  },

  cancel: {
    background: "#050505",
    border: "none",
    borderRadius: 30,
    padding: "10px 22px",
    cursor: "pointer",
  },

  submit: {
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: 30,
    padding: "10px 26px",
    cursor: "pointer",
  },
};

export default LocalidadeModal;

import { useEffect, useState } from "react";
import axios from "axios";

function LocalidadeDetailsModal({ localidade, onClose }) {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/localidades/${localidade.CODIGO_LOCALIDADE}`)
      .then(res => setDados(res.data));
  }, [localidade]);

  if (!dados) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{dados.NOME_LOCALIDADE}</h2>

        <img
          src={`http://localhost:3000/${dados.IMAGEM_LOCALIDADE}`}
          alt={dados.NOME_LOCALIDADE}
          style={{ width: "100%", borderRadius: 12 }}
        />

        <p style={{ color: "#fff", marginTop: 12 }}>
          {dados.DESCRICAO_LOCALIDADE}
        </p>

        <p style={{ color: "#ccc", marginTop: 10 }}>
          ⭐ {dados.RELEVANCIA} ({dados.TOTAL_VOTOS} votos)
        </p>

        <button onClick={onClose} style={styles.submit}>
          Fechar
        </button>
      </div>
    </div>
  );
}


const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
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
  submit: {
    marginTop: 20,
    width: "100%",
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: 30,
    padding: "10px 26px",
    cursor: "pointer",
  },
};

export default LocalidadeDetailsModal;

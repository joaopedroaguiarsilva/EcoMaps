import { useEffect, useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import axios from "axios";

function LocalidadeDetailsModal({ localidade, onClose }) {
    const [dados, setDados] = useState(null);
    const [loadingVoto, setLoadingVoto] = useState(false);

    async function carregarDetalhes() {
        const usuarioId = localStorage.getItem("usuarioId");
    
        const res = await axios.get(
            `http://localhost:3000/api/localidades/${localidade.CODIGO_LOCALIDADE}`,
            {
                params: {
                    usuarioId
                }
            }
        );
    
        setDados(res.data);
    }

    useEffect(() => {
        carregarDetalhes();
    }, [localidade]);

    async function votar(valor) {
        if (loadingVoto) return;

        try {
            setLoadingVoto(true);

            await axios.post(
                "http://localhost:3000/api/localidades/vote",
                {
                    localidadeId: dados.CODIGO_LOCALIDADE,
                    valor,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            await carregarDetalhes();
        } catch (err) {
            alert(err.response?.data?.erro || "Erro ao votar");
        } finally {
            setLoadingVoto(false);
        }
    }

    if (!dados) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>{dados.NOME_LOCALIDADE}</h2>

                <img
                    src={`http://localhost:3000/${dados.IMAGEM_LOCALIDADE}`}
                    alt={dados.NOME_LOCALIDADE}
                    style={styles.image}
                />

                <p style={styles.description}>
                    {dados.DESCRICAO_LOCALIDADE}
                </p>
                
                <p style={styles.voteQuestion}>
                  Esta marcação foi útil?
                </p>

                <div style={styles.scoreBox}>
                  <button onClick={() => votar(1)} disabled={loadingVoto} title="Upvote"
                    style={{
                      ...styles.voteButton,
                      color: dados.userVote === 1 ? "#2196f3" : "#ccc",
                      transform: dados.userVote === 1 ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    <FaArrowUp />
                  </button>
                
                  <span style={styles.score}>{dados.SCORE}</span>
                
                  <button onClick={() => votar(-1)} disabled={loadingVoto} title="Downvote"
                    style={{
                      ...styles.voteButton,
                      color: dados.userVote === -1 ? "#e53935" : "#ccc",
                      transform: dados.userVote === -1 ? "scale(1.2)" : "scale(1)",
                    }}
                  >
                    <FaArrowDown />
                  </button>
                </div>


                <p style={styles.totalVotes}>
                    {dados.TOTAL_VOTOS} votos
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
    image: {
        width: "100%",
        borderRadius: 12,
    },
    description: {
        color: "#fff",
        marginTop: 12,
    },
    scoreBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginTop: 16,
    },
    voteButton: {
        fontSize: 22,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        transition: "all 0.2s ease",
    },
    score: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    totalVotes: {
        color: "#ccc",
        textAlign: "center",
        marginTop: 6,
    },
    voteQuestion: {
        textAlign: "center",
        color: "#ddd",
        marginTop: 20,
        marginBottom: 6,
        fontSize: 14,
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

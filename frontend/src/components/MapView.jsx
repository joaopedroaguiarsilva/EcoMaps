import { useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import axios from "axios";

import LocalidadeModal from "./LocalidadeModal";
import LocalidadeDetailsModal from "./LocalidadeDetailsModal";
import MapLegend from "./MapLegend";
import UserCount from "./UserCount";

import "leaflet/dist/leaflet.css";
import { iconsByCategoria } from "../utils/mapIcons";

/* ===== CONFIG ===== */
const sabaraBounds = [
  [-19.98, -43.95],
  [-19.75, -43.65],
];

/* ===== HELPERS ===== */
function isInsideSabara(lat, lng) {
  return lat >= -19.98 && lat <= -19.75 && lng >= -43.95 && lng <= -43.65;
}

function MapClickHandler({ onValidClick, onError }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      if (!isInsideSabara(lat, lng)) {
        onError("Você só pode marcar localidades dentro de Sabará.");
        return;
      }

      onError("");
      onValidClick(lat, lng);
    },
  });

  return null;
}

/* 🔴 NORMALIZA CATEGORIA (CORREÇÃO REAL DO BUG) */
function normalizeCategoria(nome) {
  if (!nome) return "Parque";

  const n = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (n.includes("polu")) return "Área de Poluição";
  if (n.includes("coleta")) return "Coleta Seletiva";
  if (n.includes("parque")) return "Parque";

  return "Parque";
}

/* ===== COMPONENT ===== */
function MapView() {
  const mapRef = useRef(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [posicao, setPosicao] = useState(null);
  const [localidades, setLocalidades] = useState([]);
  const [erroMapa, setErroMapa] = useState("");
  const [localidadeSelecionada, setLocalidadeSelecionada] = useState(null);

  const [filtros, setFiltros] = useState({
    nome: "",
    categoria: "",
    endereco: "",
  });

  /* recarrega ao mudar nome ou categoria */
  useEffect(() => {
    carregarLocalidades();
  }, [filtros.nome, filtros.categoria]);

  /* escuta filtros do header */
  useEffect(() => {
    function onFilters(e) {
      console.log("[MapView] mapFilters event:", e.detail);
      setFiltros((prev) => ({ ...prev, ...e.detail }));

      if (e.detail.endereco) {
        buscarEndereco(e.detail.endereco);
      }
    }

    window.addEventListener("mapFilters", onFilters);
    return () => window.removeEventListener("mapFilters", onFilters);
  }, []);

  async function carregarLocalidades() {
    try {
      const params = {};
      if (filtros.nome) params.nome = filtros.nome;
      if (filtros.categoria) params.categoria = filtros.categoria;

      console.log("[MapView] carregando localidades com params:", params);

      const res = await axios.get("http://localhost:3000/api/localidades", {
        params,
      });

      console.log(
        "[MapView] localidades recebidas:",
        res.data?.length || 0
      );

      setLocalidades(res.data || []);
    } catch (error) {
      console.error("[MapView] erro ao carregar localidades", error);
    }
  }

  /* busca endereço (Nominatim) */
  async function buscarEndereco(endereco) {
    if (!endereco) return;

    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: `${endereco}, Sabará, MG`,
            format: "json",
            limit: 1,
          },
        }
      );

      if (res.data?.length && mapRef.current) {
        const { lat, lon } = res.data[0];
        mapRef.current.setView([+lat, +lon], 16, { animate: true });
      }
    } catch (error) {
      console.error("[MapView] erro buscarEndereco:", error);
    }
  }

  function handleValidClick(lat, lng) {
    setPosicao({ lat, lng });
    setModalAberto(true);
  }

  return (
    <>
      {/* 🗺 MAPA */}
      <MapContainer
        center={[-19.884, -43.826]}
        zoom={13}
        minZoom={12}
        maxZoom={18}
        maxBounds={sabaraBounds}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          onValidClick={handleValidClick}
          onError={setErroMapa}
        />

        {localidades.map((loc) => {
          const categoriaCanonica = normalizeCategoria(
            loc.NOME_TLOCALIDADE
          );

          const icon =
            iconsByCategoria[categoriaCanonica] ||
            iconsByCategoria["Parque"];


          console.log({
            nomeLocalidade: loc.NOME_LOCALIDADE,
            nomeTipo: loc.NOME_TLOCALIDADE,
            tipoRaw: typeof loc.NOME_TLOCALIDADE,
          });

          return (
            <Marker
              key={loc.CODIGO_LOCALIDADE}
              position={[
                loc.LATITUDE_LOCALIDADE,
                loc.LONGITUDE_LOCALIDADE,
              ]}
              icon={icon}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div style={{ width: 200 }}>
                  <img
                    src={`http://localhost:3000/${loc.IMAGEM_LOCALIDADE}`}
                    alt={loc.NOME_LOCALIDADE}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  />

                  <strong style={{ display: "block" }}>
                    {loc.NOME_LOCALIDADE}
                  </strong>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FaArrowUp /> {loc.SCORE ?? 0} votos
                  </div>
                </div>
              </Tooltip>

              <Popup>
                <strong>{loc.NOME_LOCALIDADE}</strong>

                <p style={{ margin: "6px 0" }}>
                  <FaArrowUp /> {loc.SCORE ?? 0}
                  <br />
                  <span style={{ fontSize: 12, color: "#777" }}>
                    {loc.TOTAL_VOTOS ?? 0} votos
                  </span>
                </p>

                <button
                  onClick={() => setLocalidadeSelecionada(loc)}
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: "#1976d2",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Ver detalhes
                </button>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* UI fixa */}
      <UserCount />
      <MapLegend />

      {/* Erro */}
      {erroMapa && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#d32f2f",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            fontWeight: "bold",
            zIndex: 1000,
          }}
        >
          {erroMapa}
        </div>
      )}

      {/* Modais */}
      {modalAberto && posicao && (
        <LocalidadeModal
          latitude={posicao.lat}
          longitude={posicao.lng}
          onClose={() => {
            setModalAberto(false);
            carregarLocalidades();
          }}
        />
      )}

      {localidadeSelecionada && (
        <LocalidadeDetailsModal
          localidade={localidadeSelecionada}
          onClose={() => {
            setLocalidadeSelecionada(null);
            carregarLocalidades();
          }}
        />
      )}
    </>
  );
}

export default MapView;

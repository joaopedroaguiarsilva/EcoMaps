import { useEffect, useRef, useState, useMemo } from "react";
import { FaArrowUp } from "react-icons/fa";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
  GeoJSON,
} from "react-leaflet";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import buffer from "@turf/buffer";
import { point } from "@turf/helpers";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LocalidadeModal from "./LocalidadeModal";
import LocalidadeDetailsModal from "./LocalidadeDetailsModal";
import MapLegend from "./MapLegend";
import UserCount from "./UserCount";
import { iconsByCategoria, userLocationIcon } from "../utils/mapIcons";

import "leaflet/dist/leaflet.css";

const sabaraBounds = [
  [-20.00, -44.00],
  [-19.67, -43.60],
];

/* ===== HELPERS ===== */

function isInsideSabara(lat, lng, bufferedGeoJson) {
  if (!bufferedGeoJson) return false;
  const pt = point([lng, lat]);
  return booleanPointInPolygon(pt, bufferedGeoJson);
}

function MapClickHandler({ bufferedGeoJson, onValidClick, onError }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      if (!isInsideSabara(lat, lng, bufferedGeoJson)) {
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
  const [sabaraGeoJson, setSabaraGeoJson] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([-19.884, -43.826]);

  const bufferedGeoJson = useMemo(() => {
    if (!sabaraGeoJson) return null;
    return buffer(sabaraGeoJson, 0.3, { units: "kilometers" });
  }, [sabaraGeoJson]);

  /* ===== LOADERS ===== */

  useEffect(() => {
    carregarLocalidades();
    carregarGeoJson();
  }, []);

  async function carregarLocalidades() {
    try {
      const res = await axios.get("http://localhost:3000/api/localidades");
      setLocalidades(res.data || []);
    } catch (error) {
      console.error("Erro ao carregar localidades:", error);
      toast.error("Erro ao carregar localidades.");
    }
  }

  async function carregarGeoJson() {
    try {
      const res = await fetch("/sabara.geojson"); // arquivo em /public
      const data = await res.json();
      setSabaraGeoJson(data);
    } catch (err) {
      console.error("Erro ao carregar GeoJSON:", err);
      toast.error("Erro ao carregar mapa de Sabará.");
    }
  }

  function handleValidClick(lat, lng) {
    setPosicao({ lat, lng });
    setModalAberto(true);
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
        mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 16, { animate: true });
      }
    } catch (error) {
      console.error("[MapView] erro buscarEndereco:", error);
      toast.error("Erro ao buscar endereço.");
    }
  }

  function isInsideSabaraBounds(lat, lng) {
    return (
      lat >= sabaraBounds[0][0] &&
      lat <= sabaraBounds[1][0] &&
      lng >= sabaraBounds[0][1] &&
      lng <= sabaraBounds[1][1]
    );
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.warn("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setUserLocation({ lat: latitude, lng: longitude });

        if (isInsideSabaraBounds(latitude, longitude)) {
          setMapCenter([latitude, longitude]);
        } else {
          toast.info(
            "Sua localização atual não está em Sabará. O mapa foi centralizado na cidade."
          );
        }
      },
      () => {
        toast.warn("Não foi possível obter sua localização.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />

      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={13}
        minZoom={12}
        maxZoom={18}
        style={{ height: "100%", width: "100%" }}
        maxBounds={sabaraBounds}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          bufferedGeoJson={bufferedGeoJson}
          onValidClick={handleValidClick}
          onError={setErroMapa}
        />

        {/* LIMITE DE SABARÁ */}
        {bufferedGeoJson && (
          <GeoJSON
            data={bufferedGeoJson}
            interactive={false}
            style={{
              color: "#1976d2",
              weight: 2,
              fillColor: "#1976d2",
              fillOpacity: 0.08,
            }}
          />
        )}

        {localidades.map((loc) => {
          const categoriaNome = normalizeCategoria(loc.NOME_TLOCALIDADE?.trim());

          return (
            <Marker
              key={loc.CODIGO_LOCALIDADE}
              position={[
                loc.LATITUDE_LOCALIDADE,
                loc.LONGITUDE_LOCALIDADE,
              ]}
              icon={
                iconsByCategoria[categoriaNome] ||
                iconsByCategoria["Parque"]
              }
            >
              {/* HOVER */}
              <Tooltip
                direction="top"
                offset={[0, -20]}
                opacity={1}
              >
                <div style={{ width: 180 }}>
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

                  <strong
                    style={{
                      display: "block",
                      wordWrap: "break-word",
                    }}
                  >
                    {loc.NOME_LOCALIDADE}
                  </strong>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FaArrowUp /> {loc.SCORE ?? 0}
                  </div>
                </div>
              </Tooltip>

              {/* CLICK */}
              <Popup>
                <strong>{loc.NOME_LOCALIDADE}</strong>

                <p style={{ margin: "6px 0" }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FaArrowUp /> {loc.SCORE ?? 0}
                  </span>
                  ({loc.TOTAL_VOTOS ?? 0} votos)
                </p>

                <button
                  onClick={() =>
                    setLocalidadeSelecionada(loc)
                  }
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

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>Você está aqui</Popup>
          </Marker>
        )}
      </MapContainer>

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
import { useEffect, useState } from "react";
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
import "leaflet/dist/leaflet.css";
import { iconsByCategoria } from "../utils/mapIcons";

/* ===== CONFIG ===== */

const sabaraBounds = [
    [-19.98, -43.95],
    [-19.75, -43.65],
];

const categoriaMap = {
    1: "Parque",
    2: "Área de Poluição",
    3: "Coleta Seletiva",
};

/* ===== HELPERS ===== */

function isInsideSabara(lat, lng) {
    return (
        lat >= -19.98 &&
        lat <= -19.75 &&
        lng >= -43.95 &&
        lng <= -43.65
    );
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

/* ===== COMPONENT ===== */

function MapView() {
    const [modalAberto, setModalAberto] = useState(false);
    const [posicao, setPosicao] = useState(null);
    const [localidades, setLocalidades] = useState([]);
    const [erroMapa, setErroMapa] = useState("");
    const [localidadeSelecionada, setLocalidadeSelecionada] = useState(null);

    useEffect(() => {
        carregarLocalidades();
    }, []);

    async function carregarLocalidades() {
        const res = await axios.get("http://localhost:3000/api/localidades");
        setLocalidades(res.data);
    }

    function handleValidClick(lat, lng) {
        setPosicao({ lat, lng });
        setModalAberto(true);
    }

    return (
        <>
            <MapContainer
                center={[-19.884, -43.826]}
                zoom={13}
                minZoom={12}
                maxZoom={18}
                maxBounds={sabaraBounds}
                maxBoundsViscosity={1.0}
                style={{ height: "100%", width: "100%" }}
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
                    const categoriaNome = loc.NOME_TLOCALIDADE?.trim() || "Parque";

                    return (
                        <Marker
                            key={loc.CODIGO_LOCALIDADE}
                            position={[loc.LATITUDE_LOCALIDADE, loc.LONGITUDE_LOCALIDADE]}
                            icon={iconsByCategoria[categoriaNome] ?? iconsByCategoria["Parque"]}
                        >

                            {/* HOVER */}
                            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
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

                                    <strong style={{ display: "block", wordWrap: "break-word" }}>
                                        {loc.NOME_LOCALIDADE}
                                    </strong>

                                    <div style={{ fontSize: 12, color: "#555" }}>
                                        <div style={{ fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 4 }}>
                                            <FaArrowUp /> {loc.SCORE ?? 0}
                                        </div>
                                    </div>
                                </div>
                            </Tooltip>

                            {/* CLICK */}
                            <Popup>
                                <strong>{loc.NOME_LOCALIDADE}</strong>

                                <p style={{ margin: "6px 0" }}>
                                    <div style={{ fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 4 }}>
                                        <FaArrowUp /> {loc.SCORE ?? 0}
                                    </div> ({loc.TOTAL_VOTOS} votos)
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

            <MapLegend />

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

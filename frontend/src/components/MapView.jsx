import { useEffect, useState } from "react";
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

import LocalidadeModal from "./LocalidadeModal";
import LocalidadeDetailsModal from "./LocalidadeDetailsModal";
import MapLegend from "./MapLegend";
import UserCount from "./UserCount";
import { iconsByCategoria } from "../utils/mapIcons";

import "leaflet/dist/leaflet.css";

/* ===== CONFIG ===== */

const sabaraBounds = [
    [-19.98, -43.95],
    [-19.75, -43.65],
];

/* ===== HELPERS ===== */

function isInsideSabara(lat, lng, geoJson) {
    const pt = point([lng, lat]);

    const bufferedPolygon = buffer(geoJson, 0.3, {
        units: "kilometers",
    });

    return booleanPointInPolygon(pt, bufferedPolygon);
}

function MapClickHandler({ geoJson, onValidClick, onError }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;

            if (!isInsideSabara(lat, lng, geoJson)) {
                onError("Você só pode marcar localidades dentro de Sabará (com tolerância de 100m).");
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
    const [sabaraGeoJson, setSabaraGeoJson] = useState(null);

    /* ===== LOADERS ===== */

    useEffect(() => {
        carregarLocalidades();
        carregarGeoJson();
    }, []);

    async function carregarLocalidades() {
        const res = await axios.get("http://localhost:3000/api/localidades");
        setLocalidades(res.data);
    }

    async function carregarGeoJson() {
        try {
            const res = await fetch("/sabara.geojson"); // arquivo em /public
            const data = await res.json();
            setSabaraGeoJson(data);
        } catch (err) {
            console.error("Erro ao carregar GeoJSON:", err);
        }
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
                style={{ height: "100%", width: "100%" }}
                maxBounds={sabaraBounds}
            >
                <TileLayer
                    attribution="© OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler
                    geoJson={sabaraGeoJson}
                    onValidClick={handleValidClick}
                    onError={setErroMapa}
                />

                {/* LIMITE DE SABARÁ */}
                {sabaraGeoJson && (
                    <GeoJSON
                    data={buffer(sabaraGeoJson, 0.3, { units: "kilometers" })}
                        interactive={false}
                        style={{
                            color: "#1976d2",
                            weight: 2,
                            fillColor: "#1976d2",
                            fillOpacity: 0.08,
                        }}
                    />
                )}


                {/* MARCADORES */}
                {localidades.map((loc) => {
                    const categoriaNome =
                        loc.NOME_TLOCALIDADE?.trim() || "Parque";

                    return (
                        <Marker
                            key={loc.CODIGO_LOCALIDADE}
                            position={[
                                loc.LATITUDE_LOCALIDADE,
                                loc.LONGITUDE_LOCALIDADE,
                            ]}
                            icon={
                                iconsByCategoria[categoriaNome] ??
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
                                    ({loc.TOTAL_VOTOS} votos)
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
            </MapContainer>

            <UserCount />
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

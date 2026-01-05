import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import axios from "axios";
import LocalidadeModal from "./LocalidadeModal";
import "leaflet/dist/leaflet.css";

const sabaraBounds = [
  [-19.98, -43.95],
  [-19.75, -43.65],
];

function isInsideSabara(lat, lng) {
  return (
    lat >= -19.98 &&
    lat <= -19.75 &&
    lng >= -43.95 &&
    lng <= -43.65
  );
}

function MapClickHandler({ onValidClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (!isInsideSabara(lat, lng)) {
        alert("Você só pode marcar localidades dentro de Sabará.");
        return;
      }
      onValidClick(lat, lng);
    },
  });
  return null;
}

function MapView() {
  const [modalAberto, setModalAberto] = useState(false);
  const [posicao, setPosicao] = useState(null);
  const [localidades, setLocalidades] = useState([]);

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

        <MapClickHandler onValidClick={handleValidClick} />

        {localidades.map((loc) => (
          <Marker
            key={loc.CODIGO_LOCALIDADE}
            position={[
              loc.LATITUDE_LOCALIDADE,
              loc.LONGITUDE_LOCALIDADE,
            ]}
          >
            <Popup>
              <strong>{loc.NOME_LOCALIDADE}</strong>

              <p style={{ margin: "6px 0" }}>
                ⭐ {loc.RELEVANCIA ?? "0.0"} ({loc.TOTAL_VOTOS} votos)
              </p>

              <button
                onClick={() => {
                  // aqui depois você abre modal ou navega
                  console.log("Abrir detalhe da localidade", loc.CODIGO_LOCALIDADE);
                }}
              >
                Ver detalhes
              </button>
            </Popup>

          </Marker>
        ))}
      </MapContainer>

      {modalAberto && posicao && (
        <LocalidadeModal
          latitude={posicao.lat}
          longitude={posicao.lng}
          onClose={() => {
            setModalAberto(false);
            carregarLocalidades(); // 🔄 atualiza mapa
          }}
        />
      )}
    </>
  );
}

export default MapView;

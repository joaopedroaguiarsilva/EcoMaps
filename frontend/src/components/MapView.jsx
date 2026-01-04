import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocalidadeModal from "./LocalidadeModal";

// Limites de Sabará
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

// Captura clique no mapa
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
      </MapContainer>

      {modalAberto && posicao && (
        <LocalidadeModal
          latitude={posicao.lat}
          longitude={posicao.lng}
          onClose={() => setModalAberto(false)}
        />
      )}
    </>
  );
}

export default MapView;

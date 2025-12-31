import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Limites geográficos de Sabará
const sabaraBounds = [
  [-19.98, -43.95], // sudoeste
  [-19.75, -43.65], // nordeste
];

// Validação se o ponto está dentro de Sabará
function isInsideSabara(lat, lng) {
  return (
    lat >= -19.98 &&
    lat <= -19.75 &&
    lng >= -43.95 &&
    lng <= -43.65
  );
}

// Componente para capturar clique no mapa
function MapClickHandler() {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      if (!isInsideSabara(lat, lng)) {
        alert("Você só pode marcar localidades dentro da cidade de Sabará.");
        return;
      }

      alert(
        `Local válido em Sabará!\nLatitude: ${lat.toFixed(
          6
        )}\nLongitude: ${lng.toFixed(6)}`
      );

      // 🔜 Aqui depois você abre o modal de cadastro
    },
  });

  return null;
}

function MapView() {
  return (
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

      <MapClickHandler />

      {/* Exemplo de ponto */}
      <Marker position={[-19.884, -43.826]}>
        <Popup>
          <strong>Ponto de coleta seletiva</strong>
          <br />
          Avaliação: ⭐⭐⭐⭐☆
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapView;

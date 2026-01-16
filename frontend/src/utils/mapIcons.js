import L from "leaflet";

const iconSize = [36, 36];
const iconAnchor = [18, 36];
const popupAnchor = [0, -36];

function createIcon(iconUrl) {
  return new L.Icon({
    iconUrl,
    iconSize,
    iconAnchor,
    popupAnchor,
  });
}

export const iconsByCategoria = {
  "Parque": createIcon("/map-icons/parque.svg"),
  "Área de Poluição": createIcon("/map-icons/problema.svg"),
  "Coleta Seletiva": createIcon("/map-icons/coleta.svg"),

  default: createIcon("/map-icons/parque.svg"),
};

export const userLocationIcon = createIcon("/map-icons/usuario.svg");

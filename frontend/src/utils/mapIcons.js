import L from "leaflet";

function createIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

export const iconsByCategoria = {
  Parque: createIcon("green"),
  "Área de Poluição": createIcon("red"),
  "Coleta Seletiva": createIcon("blue"),
};

/**
 * Normaliza qualquer texto de categoria vindo do backend
 */
export function normalizeCategoria(nome) {
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

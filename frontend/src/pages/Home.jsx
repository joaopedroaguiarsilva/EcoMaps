import MapView from "../components/MapView";
import AdminBadge from "../components/AdminBadge";
import MapFilters from "../components/MapFilters";

function Home() {
  const nome = localStorage.getItem("nome");
  const cargo = localStorage.getItem("cargo")?.toLowerCase();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <h2>🌱 EcoMaps</h2>
        </div>

        {/* filtros ficam no centro do header */}
        <div className="header-filters">
          <MapFilters />
        </div>

        <div className="header-right">
          <span>Olá, {nome}</span>
          {cargo === "admin" && <AdminBadge />}
        </div>
      </header>

      {/* MAPA */}
      <div style={{ flex: 1 }}>
        <MapView />
      </div>
    </div>
  );
}

export default Home;

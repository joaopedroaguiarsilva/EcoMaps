import MapView from "../components/MapView";
import AdminBadge from "../components/AdminBadge";

function Home() {
  const nome = localStorage.getItem("nome");
  const cargo = localStorage.getItem("cargo")?.toLowerCase();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* HEADER */}
      <header
        style={{
          height: "60px",
          backgroundColor: "#1B5E20", // verde escuro
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <h2>🌱 EcoMaps</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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

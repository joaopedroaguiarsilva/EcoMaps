import MapView from "../components/MapView";
import AdminBadge from "../components/AdminBadge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Home() {
	const nome = localStorage.getItem("nome");
	const cargo = localStorage.getItem("cargo")?.toLowerCase();
	const navigate = useNavigate();

	useEffect(() => {
		if (!nome || !cargo) {
			navigate("/login");
		}
	}, [nome, cargo, navigate]);

	function handleLogout() {
		localStorage.clear();
		navigate("/login");
	}

	return (
		<div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
			<header
				style={{
					height: "60px",
					backgroundColor: "#1B5E20",
					color: "#fff",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 20px",
				}}
			>
				<h2 style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
					<img
						src="/eco.svg"
						alt="Ecológico"
						style={{ width: 32, height: 32 }}
					/>
					EcoMaps
				</h2>

				<div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<span>Olá, {nome}</span>

					{cargo === "admin" && <AdminBadge />}

					<button
						onClick={handleLogout}
						style={{
							background: "transparent",
							border: "1px solid rgba(255,255,255,0.5)",
							color: "#fff",
							padding: "6px 10px",
							borderRadius: "6px",
							cursor: "pointer",
							fontSize: "13px",
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background = "rgba(255,255,255,0.15)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background = "transparent")
						}
					>
						Sair
					</button>
				</div>
			</header>

			<div style={{ flex: 1 }}>
				<MapView />
			</div>
		</div>
	);
}

export default Home;

import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { useState } from "react";

/**
 * MapFilters
 * - Mantém estado local e lança um CustomEvent "mapFilters" com detail {endereco, nome, categoria}
 * - Usado no header (apenas uma vez).
 */
function MapFilters() {
  const [endereco, setEndereco] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");

  function aplicarFiltros() {
    window.dispatchEvent(
      new CustomEvent("mapFilters", {
        detail: {
          endereco: endereco.trim(),
          nome: nome.trim(),
          categoria: categoria,
        },
      })
    );
  }

  return (
    <div className="header-filters" role="search" aria-label="Filtros do mapa">
      {/* <div className="filter-input" style={{ border: "1px solid rgba(0,0,0,0.6)" }}>
        <FaMapMarkerAlt className="filter-icon" />
        <input
          type="text"
          placeholder="Buscar rua ou endereço em Sabará"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
          aria-label="Buscar por rua"
        />
        <button className="btn-ghost" onClick={aplicarFiltros} aria-label="Buscar endereço">
          Buscar
        </button>
      </div> */}

      <div className="filter-input" style={{ minWidth: 240 }}>
        <FaSearch className="filter-icon" />
        <input
          type="text"
          placeholder="Nome da localidade"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
          aria-label="Buscar por nome da localidade"
        />
      </div>

      <select
        className="filter-select"
        value={categoria}
        onChange={(e) => {
          const newCategoria = e.target.value;
          setCategoria(newCategoria);
          window.dispatchEvent(
            new CustomEvent("mapFilters", {
              detail: {
                endereco: endereco.trim(),
                nome: nome.trim(),
                categoria: newCategoria,
              },
            })
          );
        }}
      >
        <option value="">Todas categorias</option>
        <option value="1">Parque</option>
        <option value="2">Área de Poluição</option>
        <option value="3">Coleta Seletiva</option>
      </select>
    </div>
  );
}

export default MapFilters;
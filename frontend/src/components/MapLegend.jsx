const MapLegend = () => {
  return (
    <div className="map-legend">
      <h4>Legenda</h4>

      <div>
        <span style={{ backgroundColor: "green" }}></span>
        Parque / Turismo Ecológico
      </div>

      <div>
        <span style={{ backgroundColor: "red" }}></span>
        Problema Ambiental
      </div>

      <div>
        <span style={{ backgroundColor: "blue" }}></span>
        Coleta Seletiva
      </div>
    </div>
  );
};

export default MapLegend;

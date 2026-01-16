import "./MapLegend.css";

import parqueIcon from "../../public/map-icons/parque.svg";
import problemaIcon from "../../public/map-icons/problema.svg";
import coletaIcon from "../../public/map-icons/coleta.svg";
import usuarioIcon from "../../public/map-icons/usuario.svg";

const MapLegend = () => {
    return (
        <div className="map-legend">
            <h4>Legenda</h4>

            <div className="legend-item">
                <img src={parqueIcon} alt="Parque" />
                Parque / Turismo Ecológico
            </div>

            <div className="legend-item">
                <img src={problemaIcon} alt="Problema Ambiental" />
                Problema Ambiental
            </div>

            <div className="legend-item">
                <img src={coletaIcon} alt="Coleta Seletiva" />
                Coleta Seletiva
            </div>

            <div className="legend-item">
                <img src={usuarioIcon} alt="Você" />
                Sua localização
            </div>
        </div>
    );
};

export default MapLegend;

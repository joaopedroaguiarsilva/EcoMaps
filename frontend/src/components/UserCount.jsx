import { useEffect, useState } from "react";
import axios from "axios";

function UserCount() {
    const [total, setTotal] = useState(null);

    function formatNumber(value) {
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
        return value;
    }

    useEffect(() => {
        axios
            .get("http://localhost:3000/api/usuarios/count")
            .then((res) => setTotal(res.data.total))
            .catch(() => setTotal(0));
    }, []);

    return (
        <div className="user-count">
            👥 {total !== null ? `${formatNumber(total)} usuários` : "Carregando..."}
        </div>
    );
}

export default UserCount;

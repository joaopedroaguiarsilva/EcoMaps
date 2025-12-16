import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    console.log("Dados de Login:", { email, senha });
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Acesse o EcoMaps 🌱</h1>

        <div className="input-field">
          <input
            type="email"
            placeholder="E-mail"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaUser className="icon" />
        </div>

        <div className="input-field">
          <input
            type="password"
            placeholder="Senha"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <FaLock className="icon" />
        </div>

        <div className="recall-forget">
          <label>
            <input type="checkbox" />
            Lembre de mim
          </label>
          <a href="#">Esqueceu sua senha?</a>
        </div>

        <button type="submit">Login</button>

        <div className="signup-link">
          <p>
            Não tem uma conta? <Link to="/register">Registrar</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;

import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Login.css";
import bgImage from "../assets/login-bg.jpg";



function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ email, senha });
  }

  return (
    <div
      className="login-background"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="container">
        <form onSubmit={handleSubmit}>

          {/* Identidade do sistema */}
          <div className="brand">
            <div className="brand-icon">🌍</div>
            <h1>EcoMaps</h1>
            <h2 className="login-subtitle">Faça login</h2>
            <p>Mapeando impacto ambiental em tempo real em Sabará</p>
          </div>

          <div className="input-field">
            <FaUser className="icon icon-user" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-field">
            <FaLock className="icon icon-user" />

            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <span
              className="icon toggle-password"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>



          <div className="recall-forget">
            <a href="#">Esqueci minha senha</a>
          </div>

          <button type="submit">Entrar</button>

          <div className="signup-link">
            <p>
              Ainda não tenho uma conta? <Link to="/register">Registrar</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

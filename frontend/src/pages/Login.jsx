import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Login.css";
import bgImage from "../assets/login-bg.jpg";


function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

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
          <h1>Faça seu login<span>.</span></h1>

          <div className="input-field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <FaLock className="icon" />
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

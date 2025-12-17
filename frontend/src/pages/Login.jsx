import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ email, senha });
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        {/* Identidade */}
        <div className="brand">
          <div className="brand-icon">🌍</div>
          <h1>EcoMaps</h1>
          <h2 className="login-subtitle">Faça login</h2>
          <p>Mapeando impacto ambiental em tempo real em Sabará</p>
        </div>

        <InputField
          icon={FaUser}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          icon={FaLock}
          type={mostrarSenha ? "text" : "password"}
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          rightIcon={mostrarSenha ? <FaEyeSlash /> : <FaEye />}
          onRightIconClick={() => setMostrarSenha(!mostrarSenha)}
        />

        <div className="recall-forget">
          <a href="#">Esqueci minha senha</a>
        </div>

        <button type="submit">Entrar</button>

        <div className="signup-link">
          <p>
            Ainda não tenho uma conta?{" "}
            <Link to="/register">Registrar</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Login;

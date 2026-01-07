import { useState } from "react";
import { FaEnvelope, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import { toast } from "react-toastify";
import axios from "axios";
import { isValidEmail } from "../utils/email";
import { formatCPF, isValidCPF } from "../utils/cpf";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();

  function handleCPFChange(e) {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Email inválido");
      return;
    }

    if (!isValidCPF(cpf)) {
      toast.error("CPF inválido");
      return;
    }

    if (senha.length < 5) {
      toast.error("A senha deve ter ao menos 5 caracteres");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/auth/reset-password", {
        email,
        cpf,
        senha,
        confirmarSenha
      });

      toast.success("Senha redefinida com sucesso!");
      navigate("/login");

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erro ao redefinir senha"
      );
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <div className="brand">
          <div className="brand-icon">🔐</div>
          <h1>EcoMaps</h1>
          <h2 className="login-subtitle">Redefinir senha</h2>
          <p>Informe seus dados para criar uma nova senha</p>
        </div>

        <InputField
          icon={FaEnvelope}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          icon={FaUser}
          placeholder="CPF"
          value={cpf}
          onChange={handleCPFChange}
        />

        <InputField
          icon={FaLock}
          type={mostrarSenha ? "text" : "password"}
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          rightIcon={mostrarSenha ? <FaEyeSlash /> : <FaEye />}
          onRightIconClick={() => setMostrarSenha(!mostrarSenha)}
        />

        <InputField
          icon={FaLock}
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        <button type="submit">Redefinir senha</button>

        <div className="signup-link">
          <p>
            Lembrou da senha? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;

import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                "http://localhost:3000/api/auth/login",
                { email, senha }
            );

            localStorage.setItem("token", data.token);
            localStorage.setItem("cargo", data.user.CARGO_USUARIO);
            localStorage.setItem("nome", data.user.NOME_USUARIO);


            toast.success(`Bem-vindo, ${data.user.NOME_USUARIO.trim().split(' ')[0]}!`);

            navigate("/home");

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Erro ao conectar com o servidor"
            );
        }
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
                    <Link to="/forgot-password">Esqueci minha senha</Link>
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

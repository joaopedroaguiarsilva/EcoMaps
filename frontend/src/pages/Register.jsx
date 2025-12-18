import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import { toast } from "react-toastify";

function Register() {
	const [form, setForm] = useState({});
	const [mostrarSenha, setMostrarSenha] = useState(false);

	function handleChange(e) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSubmit(e) {
		e.preventDefault();

		try {
			const response = await fetch(
				"http://localhost:3000/api/auth/register",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(form),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.message || "Erro ao realizar cadastro");
				return;
			}

			toast.success("Cadastro realizado com sucesso!");

			navigate("/home");

		} catch (error) {
			toast.error("Erro ao conectar com o servidor");
		}
	}

	return (
		<AuthLayout>
			<form onSubmit={handleSubmit}>
				<div className="brand">
					<div className="brand-icon">🌍</div>
					<h1>EcoMaps</h1>
					<h2 className="login-subtitle">Criar conta</h2>
					<p>Cadastro de usuário</p>
				</div>

				<InputField
					icon={FaUser}
					placeholder="Nome completo"
					value={form.nome || ""}
					onChange={handleChange}
					name="nome"
				/>

				<InputField
					icon={FaEnvelope}
					placeholder="Email"
					value={form.email || ""}
					onChange={handleChange}
					name="email"
				/>

				<InputField
					icon={FaUser}
					placeholder="CPF"
					value={form.cpf || ""}
					onChange={handleChange}
					name="cpf"
				/>

				<InputField
					icon={FaLock}
					type={mostrarSenha ? "text" : "password"}
					placeholder="Senha"
					value={form.senha || ""}
					onChange={handleChange}
					name="senha"
					rightIcon={mostrarSenha ? <FaEyeSlash /> : <FaEye />}
					onRightIconClick={() => setMostrarSenha(!mostrarSenha)}
				/>

				<InputField
					icon={FaLock}
					type="password"
					placeholder="Confirmar senha"
					value={form.confirmarSenha || ""}
					onChange={handleChange}
					name="confirmarSenha"
				/>


				<button type="submit">Cadastrar</button>

				<div className="signup-link">
					<p>
						Já tenho conta? <Link to="/login">Entrar</Link>
					</p>
				</div>
			</form>
		</AuthLayout>
	);
}

export default Register;

import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Senha:", senha);
  }

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Senha</label><br />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;

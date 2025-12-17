import bgImage from "../assets/login-bg.jpg";
import "./AuthLayout.css";

function AuthLayout({ children }) {
  return (
    <div
      className="login-background"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="container">{children}</div>
    </div>
  );
}

export default AuthLayout;

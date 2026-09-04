import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      if (onLogin) onLogin();
      navigate("/tasks");
    } catch (err) {
      const message =
        err.response?.data?.msg || "Échec de la connexion. Veuillez réessayer.";
      setError(message);
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn">
          Login
        </button>
      </form>
      <p className="auth-switch">
        Pas encore de compte ?{" "}
        <Link to="/register" className="btn btn-secondary">
          Inscription
        </Link>
      </p>
    </div>
  );
};

export default Login;

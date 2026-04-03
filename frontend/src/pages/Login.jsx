import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:8081/api";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Try API login via AuthContext
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate("/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

    return (
  <div
    className="container d-flex justify-content-center align-items-center"
    style={{ minHeight: "85vh", marginTop: "5%" }}
  >
    <div
      className="card border-0 shadow rounded-4 p-4"
      style={{
        maxWidth: 420,
        width: "100%",
        backgroundColor: "#fff8f0",
      }}
    >
      <h3 className="mb-2 text-center fw-bold" style={{ color: "#4b2e2b" }}>
        Welcome Back
      </h3>

      <p className="text-muted text-center mb-4">
        Login to continue your placement preparation
      </p>

      <form onSubmit={handleLogin} className="d-grid gap-3">
        <input
          type="email"
          className="form-control rounded-pill px-3"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-control rounded-pill px-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="btn btn-primary rounded-pill py-2"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center text-muted small mt-3">
  Practice daily. Improve steadily. Succeed confidently.
</p>

      </form>

      <div className="text-center mt-4">
        <p className="text-muted mb-1">Don’t have an account?</p>
        <Link
          to="/signup"
          className="fw-semibold text-decoration-none"
          style={{ color: "#6f4e37" }}
        >
          Create one here
        </Link>
      </div>
      <hr className="my-4" />

<div className="text-center">
  <Link
    to="/admin"
    className="text-decoration-none small"
    style={{ color: "#8a6f5a"  }}
  >
    🔐 Admin Access
  </Link>
  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
    For administrators only
  </div>
</div>

    </div>
  </div>
);

}

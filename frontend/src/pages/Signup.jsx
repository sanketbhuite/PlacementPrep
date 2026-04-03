import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth(); // or const { signUp: signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      return setError("Please fill all fields.");
    }

    setLoading(true);
    const ok = await signup(form);
    setLoading(false);

    if (ok) {
      navigate("/dashboard");
    } else {
      setError("Signup failed. Try a different email or try again.");
    }
  };
return (
  <div
    className="container d-flex justify-content-center align-items-center"
    style={{ minHeight: "85vh" }}
  >
    <div
      className="card border-0 shadow rounded-4 p-4"
      style={{
        maxWidth: 450,
        width: "100%",
        backgroundColor: "#fff8f0",
      }}
    >
      <h3 className="mb-2 text-center fw-bold" style={{ color: "#4b2e2b" }}>
        Create Account ✨
      </h3>

      <p className="text-muted text-center mb-4">
        Start your placement journey today
      </p>

      {error && (
        <div
          className="alert rounded-3 py-2 text-center"
          style={{ backgroundColor: "#f3dcdc", color: "#842029" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <input
          className="form-control rounded-pill px-3"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          className="form-control rounded-pill px-3"
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          className="form-control rounded-pill px-3"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button
          className="btn btn-primary rounded-pill py-2"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
        <p className="text-center text-muted small mt-3">
  Practice daily. Improve steadily. Succeed confidently.
</p>

      </form>

      <div className="text-center mt-4">
        <p className="text-muted mb-1">Already have an account?</p>
        <Link
          to="/login"
          className="fw-semibold text-decoration-none"
          style={{ color: "#6f4e37" }}
        >
          Login here
        </Link>
      </div>
    </div>
  </div>
);
}

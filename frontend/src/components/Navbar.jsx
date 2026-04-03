import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg bg-lights shadow-sm sticky-top rounded-4 mt-3 mx-3 px-3">
      <div className="container-fluid">

        {/* Brand */}
        <Link className="navbar-brand fw-bold text-dark" to="/">
          <div>
          <img src="/src/assets/logo.jpg" alt="Logo" style={{ width: 45, marginRight: 8, borderRadius: 5}} />
          PlacementPrep
          </div>
        </Link>

        {/* Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div id="nav" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

            {[
              { to: "/", label: "Home" },
              { to: "/practice", label: "Practice" },
              { to: "/mock", label: "Mock Test" },
              { to: "/dashboard", label: "Dashboard" },
              // { to: "/admin", label: "Admin" },
            ].map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
  className={({ isActive }) =>
    `nav-link px-3 rounded-pill ${
      isActive ? "active-pill" : "text-dark"
    }`
  }
  to={item.to}
>

                  {item.label}
                </NavLink>
              </li>
            ))}

            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link text-dark" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="btn btn-primary rounded-pill px-4" to="/signup">
                    Sign up
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="nav-link text-muted">
                    Hi, {user.name.split(" ")[0]}
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-primary rounded-pill px-4"
                    onClick={() => {
                      logout();
                      nav("/");
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_URL = "http://localhost:8081/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ===== ADMIN AUTH STATE =====
  const [adminAuthed, setAdminAuthed] = useState(false);

  // Restore Admin Login on Refresh
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) setAdminAuthed(true);
  }, []);

  // ===== USER SIGNUP =====
  const signup = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Signup failed");

      const data = await res.json();

      localStorage.removeItem("user");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));

      return true;
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    }
  };

  // ===== USER LOGIN =====
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();

      localStorage.removeItem("user");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // ===== USER LOGOUT =====
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // ===========================================================
  //                     ADMIN LOGIN LOGIC
  // ===========================================================

  const adminLogin = async (password) => {
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!data.ok) return false;

      // Save admin token
      localStorage.setItem("adminToken", data.token);
      setAdminAuthed(true);
      return true;
    } catch (err) {
      console.error("Admin login error:", err);
      return false;
    }
  };

  const adminLogout = () => {
    setAdminAuthed(false);
    localStorage.removeItem("adminToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
        // Admin auth
        adminAuthed,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

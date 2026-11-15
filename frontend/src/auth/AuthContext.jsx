import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("access");
      if (savedUser && token) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn("Failed to parse saved user:", e);
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Validate stored session integrity
    const token = localStorage.getItem("access");
    if (!token && user) {
      setUser(null);
      localStorage.removeItem("user");
    }
  }, []);

  const signup = async (data) => {
    return await api.post("/auth/signup/", data);
  };

  const login = async (data) => {
    const payload = {
      ...data,
      email: data.email ? data.email.trim().toLowerCase() : "",
    };
    const res = await api.post("/auth/login/", payload);

    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    const newUser = {
      id: res.data.user_id,
      email: res.data.email,
      username: res.data.username || "",
      first_name: res.data.first_name || "",
      last_name: res.data.last_name || "",
      role: (res.data.role || "").toLowerCase(),
      is_hr: res.data.is_hr,
      company_id: res.data.company_id,
      company_name: res.data.company_name,
      company_verification_status: res.data.company_verification_status,
    };

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
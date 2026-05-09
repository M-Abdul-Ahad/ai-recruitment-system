import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log("AUTH INIT START");
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    console.log("LOCAL STORAGE USER:", savedUser);
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log("PARSED USER:", parsedUser);
      return parsedUser;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true);
  console.log("AUTH LOADING:", loading);

  useEffect(() => {
    console.log("USER STATE SET:", user);
    
    // We already read the user from localStorage synchronously.
    // Ensure if access token doesn't exist, we clear out bad state
    const token = localStorage.getItem("access");
    if (!token && user) {
        setUser(null);
        localStorage.removeItem("user");
    }
    
    setLoading(false);
  }, []);

  const signup = async (data) => {
    await api.post("/auth/signup/", data);
  };

  const login = async (data) => {
    const res = await api.post("/auth/login/", data);
    console.log("LOGIN RESPONSE:", res.data);

    console.log("STORING USER + TOKEN");
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    const newUser = {
        id: res.data.user_id,
        email: res.data.email,
        role: res.data.role,
        is_hr: res.data.is_hr
    };

    console.log("FINAL USER:", newUser);
    
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
    console.log("USER CLEARED FROM CONTEXT");
  };

  const updateUser = (patch) => {
    setUser((current) => {
      const next = current ? { ...current, ...patch } : current;
      if (next) {
        localStorage.setItem("user", JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

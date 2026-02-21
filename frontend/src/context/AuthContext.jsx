import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// Add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch current user from backend when token exists
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await API.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.data;
      setUser({
        _id: userData._id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar || null,
        role: "User", // Default role; update from backend if available
      });
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      // If token is invalid, clear it
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, userToken) => {
    localStorage.setItem("token", userToken);
    setToken(userToken);
    setUser(userData);
    navigate("/dashboard");
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await API.post(
        "/users/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear local state regardless of API response
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);

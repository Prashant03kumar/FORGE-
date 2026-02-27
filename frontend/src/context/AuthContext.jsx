import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

const API = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

// add token to every request
// config is the request configuration object.It contains everything about the request before it is sent.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // we are modifying headers before request goes out. then the request is sent to server with token attached to it
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
        fullName: userData.fullName || "",
        bio: userData.bio || "",
        avatar: userData.avatar || null,
        role: userData.role || "User",
        // expose registration info for heatmap logic
        registrationYear:
          userData.registrationYear ||
          (userData.createdAt && new Date(userData.createdAt).getFullYear()),
        createdAt: userData.createdAt,
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
    <AuthContext.Provider
      value={{ user, setUser, token, login, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);

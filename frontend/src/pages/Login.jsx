import React, { useState } from "react";
import api from "../api/axios";
// logo stored in public folder
const forgeLogo = "/forge-logo.png";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/users/login", formData);

      // Based on your ApiResponse class, the data is inside response.data.data
      const userData = response.data?.data?.user;
      const token = response.data?.data?.accessToken;

      if (token) {
        login(userData, token); // This will save to localStorage and redirect
      } else {
        console.log("Response received:", response.data);
        alert("Login successful, but token missing in body. Check console.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-[#FAD5A5] to-white p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-10 rounded-4xl shadow-2xl w-full max-w-[92%] sm:max-w-md text-center border border-white/50">
        {/* Logo - Adaptive size */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <img
            src={forgeLogo}
            alt="Forge Logo"
            className="w-28 sm:w-40 h-auto object-contain drop-shadow-md"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#FF6B00] mb-1 tracking-tight">
          Welcome back
        </h1>
        <p className="text-[10px] sm:text-sm text-gray-400 mb-6 sm:mb-8 font-medium">
          Ignite your productivity and discipline.
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-3 sm:space-y-5 text-left"
        >
          <div className="group flex items-center bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 transition-all focus-within:border-[#FF6B00] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#FF6B00]">
            <Mail
              size={18}
              className="text-gray-400 group-focus-within:text-[#FF6B00] shrink-0"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 sm:p-4 bg-transparent outline-none text-sm sm:text-base text-gray-800"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="group flex items-center bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 transition-all focus-within:border-[#FF6B00] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#FF6B00]">
            <Lock
              size={18}
              className="text-gray-400 group-focus-within:text-[#FF6B00] shrink-0"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 sm:p-4 bg-transparent outline-none text-sm sm:text-base text-gray-800"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-[#FF6B00] p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#1A1A1A] text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            {loading ? "Forging Access..." : "Get Started"}
          </button>
        </form>

        <div className="mt-6 sm:mt-10 text-[10px] sm:text-sm text-gray-500 font-bold">
          New to Forge?{" "}
          <span className="text-[#FF6B00] cursor-pointer hover:underline decoration-2">
            <Link to="/register" className="text-[#FF6B00] hover:underline">
              Create Account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;

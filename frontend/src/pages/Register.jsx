import React, { useState } from "react";
import api from "../api/axios";
// logo stored in public folder
const forgeLogo = "/forge-logo.png";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/register", formData);
      alert("Account Created!");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-[#FAD5A5] to-white p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-4xl shadow-2xl w-full max-w-[92%] sm:max-w-md text-center border border-white">
        <div className="flex justify-center mb-3 sm:mb-5">
          <img
            src={forgeLogo}
            alt="Forge Logo"
            className="w-24 sm:w-32 h-auto object-contain"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#FF6B00] mb-1">
          Create Account
        </h1>
        <p className="text-[10px] sm:text-xs text-gray-400 mb-5 sm:mb-6 font-medium">
          Join the Forge.
        </p>

        <form
          onSubmit={handleRegister}
          className="space-y-2.5 sm:space-y-3 text-left"
        >
          {/* Inputs use compact padding p-3 on mobile, p-4 on desktop */}
          {[
            {
              id: "fullName",
              placeholder: "Full Name",
              icon: User,
              type: "text",
            },
            {
              id: "username",
              placeholder: "Username",
              icon: User,
              type: "text",
            },
            { id: "email", placeholder: "Email", icon: Mail, type: "email" },
          ].map((field) => (
            <div
              key={field.id}
              className="group flex items-center bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-3 transition-all focus-within:border-[#FF6B00]"
            >
              <field.icon
                size={16}
                className="text-gray-400 group-focus-within:text-[#FF6B00]"
              />
              <input
                type={field.type}
                placeholder={field.placeholder}
                className="w-full p-3 sm:p-4 bg-transparent outline-none text-xs sm:text-sm text-gray-800"
                onChange={(e) =>
                  setFormData({ ...formData, [field.id]: e.target.value })
                }
                required
              />
            </div>
          ))}

          <div className="group flex items-center bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-3 transition-all focus-within:border-[#FF6B00]">
            <Lock
              size={16}
              className="text-gray-400 group-focus-within:text-[#FF6B00]"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 sm:p-4 bg-transparent outline-none text-xs sm:text-sm text-gray-800"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-[#1A1A1A] text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg active:scale-95 transition-all shadow-lg"
          >
            {loading ? "Forging Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-[10px] sm:text-sm text-gray-500 font-bold">
          Already a member?{" "}
          <span className="text-[#FF6B00] cursor-pointer hover:underline">
            <Link to="/login" className="text-[#FF6B00] hover:underline">
              Log In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;

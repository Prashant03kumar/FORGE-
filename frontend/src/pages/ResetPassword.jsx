import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
const forgeLogo = "/forge-logo.png";
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Reset token is missing.");
      return;
    }

    setLoading(true);
    setStatus("loading");
    try {
      const response = await api.post("/users/reset-password", { token, newPassword });
      setStatus("success");
      setMessage(response.data?.message || "Password reset successful!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to reset password. The link may be expired.");
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-[#FAD5A5] to-white p-4 sm:p-6">
        <div className="bg-white p-6 sm:p-10 rounded-4xl shadow-2xl w-full max-w-[92%] sm:max-w-md text-center border border-white/50">
          <div className="flex justify-center mb-6">
            <img src={forgeLogo} alt="Forge Logo" className="w-28 sm:w-40 h-auto object-contain drop-shadow-md" />
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-black text-[#FF6B00] mb-2">Success!</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-[#FAD5A5] to-white p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-10 rounded-4xl shadow-2xl w-full max-w-[92%] sm:max-w-md text-center border border-white/50">
        <div className="flex justify-center mb-6">
          <img src={forgeLogo} alt="Forge Logo" className="w-28 sm:w-40 h-auto object-contain drop-shadow-md" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#FF6B00] mb-1 tracking-tight">Set New Password</h1>
        <p className="text-[10px] sm:text-sm text-gray-400 mb-8 font-medium">Almost there! Forge your new secure password.</p>

        <form onSubmit={handleResetPassword} className="space-y-5 text-left">
          <div className="group flex items-center bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 transition-all focus-within:border-[#FF6B00] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#FF6B00]">
            <Lock size={18} className="text-gray-400 group-focus-within:text-[#FF6B00] shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full p-3 sm:p-4 bg-transparent outline-none text-sm sm:text-base text-gray-800"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            disabled={loading || !token}
            className="w-full bg-[#1A1A1A] text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
          </button>
        </form>

        {status === "error" && (
          <p className="mt-4 text-sm text-red-500 font-bold">{message}</p>
        )}

        <div className="mt-8 text-[10px] sm:text-sm text-gray-500 font-bold">
          Remembered your password?{" "}
          <Link to="/login" className="text-[#FF6B00] hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

import React, { useState } from "react";
import api from "../api/axios";
const forgeLogo = "/forge-logo.png";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/users/forgot-password", { email });
      setSubmitted(true);
      setMessage(response.data?.message || "If an account with that email exists, a reset link has been sent.");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-[#FAD5A5] to-white p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-10 rounded-4xl shadow-2xl w-full max-w-[92%] sm:max-w-md text-center border border-white/50">
        <div className="flex justify-center mb-6">
          <img src={forgeLogo} alt="Forge Logo" className="w-28 sm:w-40 h-auto object-contain drop-shadow-md" />
        </div>

        {!submitted ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-black text-[#FF6B00] mb-1 tracking-tight">Forgot Password?</h1>
            <p className="text-[10px] sm:text-sm text-gray-400 mb-8 font-medium">No worries! We'll send you a link to reset your spark.</p>

            <form onSubmit={handleForgotPassword} className="space-y-5 text-left">
              <div className="group flex items-center bg-gray-50 border border-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 transition-all focus-within:border-[#FF6B00] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#FF6B00]">
                <Mail size={18} className="text-gray-400 group-focus-within:text-[#FF6B00] shrink-0" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 sm:p-4 bg-transparent outline-none text-sm sm:text-base text-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A1A1A] text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? "Sending link..." : (
                  <>
                    <Send size={18} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <Send className="w-16 h-16 text-[#FF6B00] mb-4 animate-bounce" />
            <h1 className="text-2xl font-black text-[#FF6B00] mb-2">Check Your Email</h1>
            <p className="text-gray-400 mb-8">{message}</p>
          </div>
        )}

        <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 font-bold hover:text-[#FF6B00] transition-colors">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

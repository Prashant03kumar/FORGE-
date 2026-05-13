import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
const forgeLogo = "/forge-logo.png";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await api.get(`/users/verify-email?token=${token}`);
        setStatus("success");
        setMessage(response.data?.message || "Email verified successfully!");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may be expired.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-[#FAD5A5] to-white p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-10 rounded-4xl shadow-2xl w-full max-w-[92%] sm:max-w-md text-center border border-white/50">
        <div className="flex justify-center mb-6">
          <img src={forgeLogo} alt="Forge Logo" className="w-28 sm:w-40 h-auto object-contain drop-shadow-md" />
        </div>

        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin mb-4" />
            <h1 className="text-2xl font-black text-[#FF6B00] mb-2">Verifying Email</h1>
            <p className="text-gray-400">Please wait while we ignite your account...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-black text-[#FF6B00] mb-2">Verified!</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-400 mb-8">Redirecting to login...</p>
            <Link to="/login" className="w-full bg-[#1A1A1A] text-white p-3 sm:p-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg text-center">
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-black text-[#FF6B00] mb-2">Oops!</h1>
            <p className="text-gray-400 mb-8">{message}</p>
            <Link to="/login" className="w-full bg-[#1A1A1A] text-white p-3 sm:p-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg text-center">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

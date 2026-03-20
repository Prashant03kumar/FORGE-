import React, { useState } from "react";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";
import api from "../api/axios";

const SecuritySection = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Basic Validation
    if (!passwords.oldPassword || !passwords.newPassword) {
      setMessage({ type: "error", text: "All fields are required." });
      setLoading(false);
      return;
    }

    try {
      // Call backend API to change password
      const res = await api.post("/users/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      // Success feedback
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update password. Try again.";
      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent rounded-3xl p-6 sm:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-orange-500" />
          Security Vault
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Update your access credentials below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Old Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
            />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
            New Password
          </label>
          <div className="relative">
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all"
            />
          </div>
        </div>

        {/* Feedback Message */}
        {message.text && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Updating...
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default SecuritySection;

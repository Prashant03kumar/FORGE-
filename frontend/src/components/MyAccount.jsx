import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const MyAccount = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form with user data
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
  });

  // Sync form if user data loads late
  useEffect(() => {
    if (user) {
      setFormData({ fullName: user.fullName, bio: user.bio || "" });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(
        "http://localhost:8000/api/v1/users/update-account",
        formData,
        { withCredentials: true },
      );

      if (response.data.success) {
        setUser(response.data.data); // Update global state
        setIsEditing(false);
        alert("Identity Forged Successfully!");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 transition-all">
      <div className="flex flex-col sm:row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Warrior Identity
          </h2>
          <p className="text-orange-600 font-semibold text-sm">
            Update your public presence.
          </p>
        </div>

        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={loading}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            isEditing ? "bg-orange-500 text-white" : "bg-white/10 text-white"
          }`}
        >
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Full Name
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={`w-full bg-black/20 border rounded-2xl px-4 py-3 text-white outline-none ${
              isEditing ? "border-orange-500" : "border-white/5"
            }`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Warrior Bio
          </label>
          <textarea
            disabled={!isEditing}
            rows="4"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className={`w-full bg-black/20 border rounded-2xl px-4 py-3 text-white outline-none resize-none ${
              isEditing ? "border-orange-500" : "border-white/5"
            }`}
          />
        </div>

        <div className="space-y-2 opacity-50">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Email (Fixed)
          </label>
          <input
            type="email"
            disabled
            value={user?.email || ""}
            className="w-full bg-black/10 border border-white/5 rounded-2xl px-4 py-3 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default MyAccount;

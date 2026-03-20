import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Zap, Calendar, User as UserIcon } from "lucide-react";
import api from "../api/axios";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users/u/${username}`);
        setProfile(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "User not found");
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
            <UserIcon size={28} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">User Not Found</h3>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div className="w-full max-w-[90vw] min-h-screen bg-[#FCF9F6] p-4 md:p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FF6B00] transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-br from-[#FF6B00] via-[#ffae75] to-[#FAD5A5] relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
          </div>

          {/* Avatar & Info */}
          <div className="px-6 md:px-10 pb-8 -mt-12 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ffae75] to-[#FF6B00] flex items-center justify-center text-white font-black text-3xl shadow-xl border-4 border-white">
                  {(profile?.username || "U").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="text-center sm:text-left pb-1">
                <h1 className="text-2xl font-black text-gray-800">
                  {profile?.fullName || profile?.username}
                </h1>
                <p className="text-sm text-gray-400 font-bold">
                  @{profile?.username}
                </p>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="mt-5 text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-2xl p-4 border border-gray-100">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-orange-50 rounded-2xl p-4 text-center">
                <Flame size={20} className="text-[#FF6B00] mx-auto mb-2" />
                <p className="text-xl font-black text-gray-800">
                  {profile?.currentStreak || 0}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Current Streak
                </p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 text-center">
                <Zap size={20} className="text-[#FF6B00] mx-auto mb-2" />
                <p className="text-xl font-black text-gray-800">
                  {profile?.maxStreak || 0}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Max Streak
                </p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 text-center">
                <Flame size={20} className="text-[#FF6B00] mx-auto mb-2" />
                <p className="text-xl font-black text-gray-800">
                  {profile?.totalSpark || 0}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Total Sparks
                </p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 text-center">
                <Calendar size={20} className="text-[#FF6B00] mx-auto mb-2" />
                <p className="text-sm font-black text-gray-800">{joinDate}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  Joined
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

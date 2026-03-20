import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Zap, Calendar, User as UserIcon } from "lucide-react";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";

const UserProfile = () => {
  const { theme } = useTheme();
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
          <p className="text-sm dark:text-gray-400 text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <UserIcon size={28} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">User Not Found</h3>
          <p className="text-sm text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-white transition-colors"
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

  // Prepare heatmap data
  const generateHeatmapData = () => {
    if (!profile?.activityLog) return [];
    const dates = profile.activityLog;
    // Activity calendar requires dates in YYYY-MM-DD
    // and ideally a continuous range or just the data points.
    // react-activity-calendar needs at least one full year or it auto-scales to the data provided.
    // Let's create an array of {date, count, level}
    const dataObj = {};
    dates.forEach(d => {
      // Ensure date only has YYYY-MM-DD
      const dateStr = d.split('T')[0];
      dataObj[dateStr] = { date: dateStr, count: 1, level: 1 };
    });
    
    // Fill in a full year back from today to make it look like a standard heatmap if there's no data
    const today = new Date();
    const result = [];
    for (let i = 365; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (dataObj[dateStr]) {
        result.push(dataObj[dateStr]);
      } else {
        result.push({ date: dateStr, count: 0, level: 0 });
      }
    }
    return result;
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FF6B00] dark:text-gray-400 dark:hover:text-[#FF6B00] transition-colors mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-8">
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
                className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-white dark:border-gray-800 bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ffae75] to-[#FF6B00] flex items-center justify-center text-white font-black text-3xl shadow-xl border-4 border-white dark:border-gray-800">
                {(profile?.username || "U").charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-center sm:text-left pb-1">
              <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100">
                {profile?.fullName || profile?.username}
              </h1>
              <p className="text-sm text-gray-400 font-bold">
                @{profile?.username}
              </p>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="mt-5 text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-orange-50 dark:bg-gray-700/50 dark:border-orange-500/20 dark:border border-transparent rounded-2xl p-4 text-center">
              <Flame size={20} className="text-[#FF6B00] mx-auto mb-2" />
              <p className="text-xl font-black text-gray-800 dark:text-gray-100">
                {profile?.currentStreak || 0}
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Current Streak
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-gray-700/50 dark:border-orange-500/20 dark:border border-transparent rounded-2xl p-4 text-center">
              <Zap size={20} className="text-[#FF6B00] mx-auto mb-2" />
              <p className="text-xl font-black text-gray-800 dark:text-gray-100">
                {profile?.maxStreak || 0}
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Max Streak
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-gray-700/50 dark:border-orange-500/20 dark:border border-transparent rounded-2xl p-4 text-center">
              <Flame size={20} className="text-[#FF6B00] mx-auto mb-2" />
              <p className="text-xl font-black text-gray-800 dark:text-gray-100">
                {profile?.totalSpark || 0}
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Total Sparks
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-gray-700/50 dark:border-orange-500/20 dark:border border-transparent rounded-2xl p-4 text-center">
              <Calendar size={20} className="text-[#FF6B00] mx-auto mb-2" />
              <p className="text-sm font-black text-gray-800 dark:text-gray-100">{joinDate}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Joined
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Heatmap Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 md:p-8">
        <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Flame className="text-[#FF6B00]" size={20} />
          Activity Heatmap
        </h3>
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px]">
            <ActivityCalendar
              data={heatmapData}
              theme={{
                light: ['#f3f4f6', '#fed7aa', '#fdba74', '#fb923c', '#ea580c'],
                dark: ['#374151', '#7c2d12', '#9a3412', '#c2410c', '#ea580c'],
              }}
              colorScheme={theme === "dark" ? "dark" : "light"}
              labels={{
                legend: {
                  less: "Less",
                  more: "More",
                  colors: ['#f3f4f6', '#fed7aa', '#fdba74', '#fb923c', '#ea580c']
                }
              }}
              blockSize={14}
              blockMargin={4}
              fontSize={14}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

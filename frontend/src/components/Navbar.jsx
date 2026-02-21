import React, { useState } from "react";
import { Search, User, Bell, LogOut } from "lucide-react";
import forgeLogo from "../assets/forge-logo.jpg";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  // Default avatar if user has no avatar
  const avatarUrl = user?.avatar || null;

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <img
          src={forgeLogo}
          alt="Forge Logo"
          className="w-10 h-10 object-contain rounded-lg"
        />
        <span className="text-xl font-black text-[#FF6B00] tracking-tighter hidden sm:block">
          FORGE
        </span>
      </div>

      {/* Center: Search Bar (hidden on small screens) */}
      <div className="hidden sm:flex flex-1 max-w-md mx-6">
        <div className="relative group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B00] transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search users or tasks..."
            className="w-full bg-gray-50 border border-gray-100 py-2.5 pl-12 pr-4 rounded-2xl outline-none focus:bg-white focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all text-sm"
          />
        </div>
      </div>

      {/* Right: Actions & Profile - always show icons on mobile */}
      <div className="flex items-center gap-3 sm:gap-6">
        <button className="text-gray-400 hover:text-[#FF6B00] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF6B00] rounded-full border-2 border-white"></span>
        </button>

        <button className="sm:hidden text-gray-400 hover:text-[#FF6B00] transition-colors">
          <Search size={20} />
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l sm:border-gray-100 hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">
                  {user.username || "User"}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">User</p>
              </div>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#ffae75] to-[#FAD5A5] flex items-center justify-center text-white shadow-md">
                  <User size={18} />
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">
                    {user.username || "User"}
                  </p>
                  <p className="text-[10px] text-gray-400">User</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l sm:border-gray-100">
            <p className="text-sm text-gray-600">Login</p>
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#ffae75] to-[#FAD5A5] flex items-center justify-center text-white shadow-md">
              <User size={18} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

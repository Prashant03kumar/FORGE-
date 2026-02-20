import React from "react";
import { Search, User, Bell } from "lucide-react";
import forgeLogo from "../assets/forge-logo.jpg"; // Adjust path as needed

const Navbar = () => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-6 sm:px-10 justify-between sticky top-0 z-50">
      {/* Left: Logo & Branding */}
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

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative group">
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

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button className="text-gray-400 hover:text-[#FF6B00] transition-colors relative">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF6B00] rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 leading-none">
              User Name
            </p>
            <p className="text-[10px] text-gray-400 font-medium">Pro Member</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#ffae75] to-[#FAD5A5] flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-105 transition-transform">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

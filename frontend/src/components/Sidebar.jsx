import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ForgeOracle from "./ForgeOracle";

const Sidebar = ({ mobile = false, onClose = () => {} }) => {
  const { logout } = useAuth();

  // Top Item
  const topItem = {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={22} />,
  };

  // Middle Items
  const middleItems = [
    {
      name: "History",
      path: "/dashboard/history",
      icon: <History size={22} />,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: <Settings size={22} />,
    },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-900 h-screen border-r border-gray-100 dark:border-gray-800 flex flex-col p-6 ${
        mobile
          ? "h-full shadow-md rounded-r-xl overflow-auto"
          : "w-64 sticky top-0"
      }`}
    >
      {mobile && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <p className="text-lg font-black text-[#FF6B00]">FORGE</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="bg-gray-100 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
          >
            &lt;
          </button>
        </div>
      )}
      {/* 1. Dashboard (Top) */}
      <div className="mb-8">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
          Main Menu
        </p>
        <NavLink
          to={topItem.path}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              isActive
                ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#FF6B00] dark:hover:text-[#FF6B00]"
            }`
          }
        >
          {topItem.icon}
          <span className="font-bold text-sm">{topItem.name}</span>
        </NavLink>
      </div>

      {/* 2. Other Tools (Middle) */}
      <div className="flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
          Workspace
        </p>
        <nav className="space-y-2">
          {middleItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-[#FF6B00]/10 text-[#FF6B00] font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#FF6B00] dark:hover:text-[#FF6B00]"
                }`
              }
            >
              {item.icon}
              <span className="text-sm font-semibold">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        <ForgeOracle />
      </div>

      {/* 3. Logout (Bottom) */}
      <div className="pt-6 mt-auto border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-2xl"
        >
          <LogOut size={22} />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  History,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
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
      name: "My Tasks",
      path: "/dashboard/tasks",
      icon: <CheckSquare size={22} />,
    },
    {
      name: "History",
      path: "/dashboard/history",
      icon: <History size={22} />,
    },
    {
      name: "Calendar",
      path: "/dashboard/calendar",
      icon: <Calendar size={22} />,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: <Settings size={22} />,
    },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col p-6 sticky top-0">
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
                : "text-gray-500 hover:bg-gray-50 hover:text-[#FF6B00]"
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
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#FF6B00]"
                }`
              }
            >
              {item.icon}
              <span className="text-sm font-semibold">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* 3. Logout (Bottom) */}
      <div className="pt-6 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-2xl"
        >
          <LogOut size={22} />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState } from "react";
import SecuritySection from "../components/SecuritySection"; // This will contain ChangePassword
import MyAccount from "../components/MyAccount";
import { useTheme } from "../context/ThemeContext";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, toggleTheme } = useTheme();

  // Helper to make the list items look active
  const tabClass = (tabName) => `
    border-b border-gray-100 dark:border-gray-800 font-semibold p-4 
    flex items-center justify-between
    cursor-pointer transition-all duration-200
    ${
      activeTab === tabName
        ? "bg-orange-50 dark:bg-gray-800 text-orange-600 dark:text-orange-500 pl-6 border-l-4 border-l-orange-500"
        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:pl-6"
    }
  `;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Manage your warrior profile and forge security.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        {/* Sidebar Navigation */}
        <aside>
          <ul className="flex flex-col space-y-1">
            <li
              className={tabClass("profile")}
              onClick={() => setActiveTab("profile")}
            >
              <button className="uppercase tracking-wider text-xs">
                My Account
              </button>
            </li>

            <li
              className={tabClass("security")}
              onClick={() => setActiveTab("security")}
            >
              <button className="uppercase tracking-wider text-xs">
                Privacy & Security
              </button>
            </li>

            <li
              className={tabClass("appearance")}
              onClick={() => setActiveTab("appearance")}
            >
              <button className="uppercase tracking-wider text-xs">
                Appearance
              </button>
            </li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className="bg-white dark:bg-gray-900 rounded-3xl min-h-100 border border-transparent dark:border-gray-800 shadow-sm dark:shadow-none">
          {activeTab === "profile" && <MyAccount />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "appearance" && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Theme Settings</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Light Theme Option */}
                <button
                  onClick={() => toggleTheme("light")}
                  className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-all ${
                    theme === "light"
                      ? "border-[#FF6B00] bg-orange-50/50 dark:bg-transparent"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-gray-100 to-white border border-gray-200 shadow-sm mb-4" />
                  <span className={`font-bold ${theme === "light" ? "text-orange-600" : "text-gray-600 dark:text-gray-400"}`}>
                    Light Mode
                  </span>
                </button>

                {/* Dark Theme Option */}
                <button
                  onClick={() => toggleTheme("dark")}
                  className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-all ${
                    theme === "dark"
                      ? "border-[#FF6B00] bg-gray-800"
                      : "border-gray-100 dark:border-gray-800 hover:border-[#FF6B00] hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-gray-700 to-gray-900 border border-gray-600 shadow-sm mb-4" />
                  <span className={`font-bold ${theme === "dark" ? "text-orange-500" : "text-gray-600 dark:text-gray-400"}`}>
                    Dark Mode
                  </span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Settings;

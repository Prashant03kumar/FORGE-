import React, { useState } from "react";
import SecuritySection from "../components/SecuritySection"; // This will contain ChangePassword
import MyAccount from "../components/MyAccount";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  // Helper to make the list items look active
  const tabClass = (tabName) => `
    border-b border-gray-100 font-semibold p-4 
    flex items-center justify-between
    cursor-pointer transition-all duration-200
    ${
      activeTab === tabName
        ? "bg-orange-50 text-orange-600 pl-6 border-l-4 border-l-orange-500"
        : "text-gray-500 hover:bg-gray-50 hover:pl-6"
    }
  `;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
          Settings
        </h1>
        <p className="text-gray-500 text-sm">
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
        <main className="bg-white rounded-3xl min-h-100">
          {activeTab === "profile" && <MyAccount />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "appearance" && (
            <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-gray-400">
                Appearance settings coming soon...
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Settings;

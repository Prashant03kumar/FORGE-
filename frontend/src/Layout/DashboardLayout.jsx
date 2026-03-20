import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const location = useLocation();
  const isProfileRoute = location.pathname.startsWith("/dashboard/profile");

  return (
    <div className="flex min-h-screen bg-[#FDF2E9] dark:bg-gray-900 transition-colors duration-300">
      {/* Desktop Sidebar (hidden on small screens) */}
      {!isProfileRoute && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Mobile: floating toggle to open sidebar (hidden while open) */}
      {!mobileSidebarOpen && (
        <button
          aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden fixed left-3 top-24 z-60 bg-white text-[#FF6B00] border border-gray-100 shadow-md rounded-full w-10 h-10 flex items-center justify-center"
        >
          &gt;
        </button>
      )}

      {/* Mobile Sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="fixed left-0 top-0 bottom-0 z-60 md:hidden w-72 transform transition-transform duration-300">
            <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <Navbar />

        {/* 3. Dynamic Page Content Area */}
        <main className="p-4 sm:p-6 md:p-10 flex flex-col flex-1">
          <div className="flex-1">
            {/* This is where your Dashboard.jsx components will render */}
            <Outlet />
          </div>

          {/* Bottom Footer (hidden on profile page) */}
          {!isProfileRoute && <Footer />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

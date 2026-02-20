import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#FDF2E9]">
      {/* 1. Fixed Sidebar on the left */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <Navbar />

        {/* 3. Dynamic Page Content Area */}
        <main className="p-6 sm:p-10 flex flex-col flex-1">
          <div className="flex-1">
            {/* This is where your Dashboard.jsx components will render */}
            <Outlet />
          </div>

          {/* Bottom Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

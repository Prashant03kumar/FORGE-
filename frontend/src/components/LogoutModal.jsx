import React from "react";
import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <LogOut size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
            Abandon Forge?
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Your anvil waits for no one. Are you sure you want to extinguish the flames and log out?
          </p>

          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold transition-colors"
            >
              Stay
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;

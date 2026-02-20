import React from "react";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-8 border-t border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500">
        {/* Left Side: Copyright */}
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#FF6B00]" />
          <p className="text-sm font-medium">
            © {currentYear}{" "}
            <span className="text-[#FF6B00] font-bold">Forge</span>. All rights
            reserved.
          </p>
        </div>

        {/* Center: Contact Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 hover:text-[#FF6B00] transition-colors cursor-pointer">
            <Mail size={16} />
            <span className="text-xs font-semibold">
              forgecontact@gmail.com
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span className="text-xs font-semibold">
              Jalandhar Office, India
            </span>
          </div>
        </div>

        {/* Right Side: Identity */}
        <div className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30 italic">
          Built for Discipline
        </div>
      </div>
    </footer>
  );
};

export default Footer;

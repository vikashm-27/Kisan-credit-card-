import React from "react";
import "./Footer.css";
import { Leaf, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200/80">
      <div className="flex items-center justify-between px-4 lg:px-6 h-12">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Leaf size={14} className="text-green-600" />
          <span className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} Draft KCC — Kisan Credit Card Portal
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <Phone size={12} className="text-gray-400" />
          <span className="text-xs text-gray-400">+843-226-75847</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
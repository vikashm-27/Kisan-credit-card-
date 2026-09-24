import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import {
  Users,
  ChevronDown,
} from "lucide-react";


const Sidebar = () => {
  const navigate = useNavigate();
  const [isKycOpen, setIsKycOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r border-gray-200/80 flex-col">
      {/* Section label */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Navigation
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 pb-4">
        <button
          onClick={() => setIsKycOpen(!isKycOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group mb-1
            ${isKycOpen
              ? "bg-green-50 text-green-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
          <Users
            size={18}
            className={`flex-shrink-0 transition-colors duration-200 ${isKycOpen ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
              }`}
          />
          <span className="flex-1 text-left">K Y C</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isKycOpen ? "rotate-180 text-green-500" : "text-gray-400"
              }`}
          />
        </button>

        {isKycOpen && (
          <div className="ml-3 pl-3 border-l-2 border-green-200">
            <button
              onClick={() => handleNavigation("/customer")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
            >
              <Users size={16} className="text-gray-400 flex-shrink-0" />
              <span>Customer</span>
            </button>
          </div>
        )}
      </nav>

      {/* Bottom indicator */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-gray-400 font-medium">
            System Online
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

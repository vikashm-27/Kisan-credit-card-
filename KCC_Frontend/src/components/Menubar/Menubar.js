import React from "react";
import { useForm } from "react-hook-form";
import { NavLink, Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import { useTranslation } from "react-i18next";
import "./Menubar.css";
import {
  Users,
  UserPlus,
  UserPen,
  Eraser,
  LayoutDashboard,
  FileText,
  Building2,
  Activity,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  UserCog,
  Settings,
  Monitor,
  Calculator,
} from "lucide-react";


const MenuItems = [
  {
    path: "/customer/dashboard",
    icon: LayoutDashboard,
    heading: "Dashboard",
    roles: ["admin"],
  },
  {
    path: "/customer/admin",
    icon: Settings,
    heading: "Admin",
    dropdownKey: "isAdminOpen",
    roles: ["admin"],
    submenus: [
      {
        path: "/customer/admin/user-management",
        icon: UserCog,
        subheading: "User Management",
        roles: ["admin"],
      },
      {
        path: "/customer/users",
        icon: Monitor,
        subheading: "User Sessions",
        roles: ["admin"],
      },
    ],
  },
  {
    path: "/customer/customer",
    icon: Users,
    heading: "Customer",
    dropdownKey: "isCustomerOpen",
    roles: ["admin", "user"],
    submenus: [
      {
        path: "/customer/kyc",
        icon: UserPlus,
        subheading: "Add Customer",
        roles: ["admin", "user"],
      },
      {
        path: "/customer/updatecustomer",
        icon: UserPen,
        subheading: "Update Customer",
        roles: ["admin", "user"],
      },
      {
        path: "/customer/deletecustomer",
        icon: Eraser,
        subheading: "Delete Customer",
        roles: ["admin"],
      },
    ],
  },
  {
    path: "/customer/loan-calculator",
    icon: Calculator,
    heading: "Loan Calculator",
    roles: ["admin", "user"],
  },
  {
    path: "/customer/reports",
    icon: BookOpen,
    heading: "Reports",
    dropdownKey: "isReportsOpen",
    roles: ["admin"],
    submenus: [
      {
        path: "/customer/kyclogs",
        icon: FileText,
        subheading: "KYC Reports",
        roles: ["admin"],
      },
      {
        path: "/customer/gstlogs",
        icon: Building2,
        subheading: "GSTIN Reports",
        roles: ["admin"],
      },
      {
        path: "/customer/user/logs",
        icon: Activity,
        subheading: "User Activity",
        roles: ["admin"],
      },
    ],
  },
];

const Menubar = () => {
  const { t } = useTranslation();
  const { watch, setValue } = useForm({
    defaultValues: {
      isCustomerOpen: false,
      isReportsOpen: false,
      isAdminOpen: false,
      isOpen: window.innerWidth > 768,
    },
  });

  const isOpen = watch("isOpen");

  // Track all dropdown states dynamically
  const dropdownStates = {
    isCustomerOpen: watch("isCustomerOpen"),
    isReportsOpen: watch("isReportsOpen"),
    isAdminOpen: watch("isAdminOpen"),
  };

  React.useEffect(() => {
    const handleResize = () => {
      setValue("isOpen", window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setValue]);

  const userRole = JSON.parse(localStorage.getItem("user"))?.role || "user";

  const toggleMenu = () => {
    setValue("isOpen", !isOpen);
    setValue("isCustomerOpen", false);
    setValue("isReportsOpen", false);
    setValue("isAdminOpen", false);
  };

  const toggleDropdown = (key) => {
    setValue(key, !dropdownStates[key]);
  };

  const renderMenuItems = () => {
    return MenuItems.map((item, index) => {
      if (!item.roles.includes(userRole)) return null;
      const IconComponent = item.icon;
      const isDropdownOpen = item.dropdownKey
        ? dropdownStates[item.dropdownKey]
        : false;
      const handleToggle = item.dropdownKey
        ? () => toggleDropdown(item.dropdownKey)
        : undefined;

      return (
        <div key={index} className="mb-1">
          {item.submenus ? (
            <button
              onClick={handleToggle}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isDropdownOpen
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <IconComponent
                size={18}
                className={`flex-shrink-0 transition-colors duration-200 ${isDropdownOpen ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
              />
              {isOpen && (
                <>
                  <span className="flex-1 text-left">{t(`menu.${item.heading.toLowerCase().replace(' ', '_')}`)}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                      } ${isDropdownOpen ? "text-green-500" : "text-gray-400"}`}
                  />
                </>
              )}
            </button>
          ) : (
            <NavLink
              to={item.path}
              onClick={() => sessionStorage.removeItem("kcc_verified_land")}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <IconComponent
                size={18}
                className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
              />
              {isOpen && <span>{item.heading === 'Verify Land' ? t('menu.land_verification') : t(`menu.${item.heading.toLowerCase().replace(' ', '_')}`)}</span>}
            </NavLink>
          )}

          {/* Submenus */}
          {item.submenus && isDropdownOpen && (
            <div
              className={`overflow-hidden transition-all duration-300 ${isOpen ? "ml-3 mt-1 pl-3 border-l-2 border-green-200" : "mt-1"
                }`}
            >
              {item.submenus.map((submenu, subIndex) => {
                if (!submenu.roles.includes(userRole)) return null;
                const SubIcon = submenu.icon;

                return (
                  <NavLink
                    key={subIndex}
                    to={submenu.path}
                    onClick={() => sessionStorage.removeItem("kcc_verified_land")}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group
                      ${isActive
                        ? "bg-green-100/60 text-green-700 font-semibold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`
                    }
                  >
                    <SubIcon
                      size={16}
                      className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                    />
                    {isOpen && <span>{t(`menu.${submenu.subheading.toLowerCase().replace(' ', '_')}`)}</span>}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <Header onToggleSidebar={toggleMenu} />
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside
          className={`flex-shrink-0 bg-white border-r border-gray-200/80 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? "w-64" : "w-[60px]"
            }`}
        >
          {/* Toggle button */}
          <div className="flex items-center justify-end px-3 pt-3 pb-1">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeft size={18} />
              )}
            </button>
          </div>

          {/* Menu section label */}
          {isOpen && (
            <div className="px-4 pt-2 pb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Navigation
              </p>
            </div>
          )}

          {/* Menu items */}
          <nav className="flex-1 px-2 pb-4 overflow-y-auto scrollbar-thin">
            {renderMenuItems()}
          </nav>

          {/* Sidebar footer */}
          {isOpen && (
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-400 font-medium">
                  System Online
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 min-w-0">
          <Outlet />
        </main>

      </div>
      <Footer />
    </>
  );
};

export default Menubar;

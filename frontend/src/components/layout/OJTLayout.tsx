import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OJTLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary-400/20 to-primary-400/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-primary-600/95 via-secondary-600/95 to-primary-600/95 backdrop-blur-xl border-0 border-b border-white/20 shadow-2xl px-6 py-4 relative z-20">
        <div className="flex items-center justify-between">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/ojt" className="flex items-center group">
                  <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <span className="ml-3 text-xl font-bold text-white tracking-tight drop-shadow-md">
                    MIP
                  </span>
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                <Link
                  to="/ojt"
                  className={`${
                    isActivePath("/ojt")
                      ? "bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 text-white shadow-xl"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  } inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/ojt/add-resource"
                  className={`${
                    isActivePath("/ojt/add-resource")
                      ? "bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 text-white shadow-xl"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  } inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg`}
                >
                  Add Resource
                </Link>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-white/80 font-medium">
                  Welcome, {user?.username}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200/50 shadow-sm">
                  OJT
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white/80 hover:text-red-300 hover:bg-red-500/20 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                >
                  Sign out
                </button>
              </div>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OJTLayout;

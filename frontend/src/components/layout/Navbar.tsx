import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  toggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Only admin users can search inventory, redirect OJT users to dashboard
      if (user?.role === "admin") {
        navigate(
          `/admin/inventory?search=${encodeURIComponent(searchTerm.trim())}`
        );
      } else {
        // For OJT users, show an alert or redirect to dashboard
        alert("Inventory search is only available to administrators.");
        navigate("/ojt");
      }
      // Clear search term after navigation
      setSearchTerm("");
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gradient-to-r from-primary-600/95 via-secondary-600/95 to-primary-600/95 backdrop-blur-xl border-0 border-b border-white/20 shadow-2xl px-6 py-4 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2.5 rounded-xl text-white/90 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 backdrop-blur-sm group"
            >
              <svg
                className="h-6 w-6 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <div className="ml-3 flex items-center space-x-3">
            {/* Logo and title removed as requested */}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                className="w-72 pl-12 pr-4 py-3 text-sm placeholder-white/60 bg-white/10 border border-white/20 rounded-xl shadow-sm focus:ring-2 focus:ring-white/30 focus:border-white/40 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm text-white hover:bg-white/15"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-white/60 group-focus-within:text-white/80 transition-colors duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center">
              <div className="hidden md:block text-right mr-4">
                <p className="text-sm font-semibold text-white tracking-tight">
                  {user?.username}
                </p>
                <p className="text-xs text-white/70 font-medium uppercase tracking-wider">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 backdrop-blur-sm group"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <svg
                  className="h-4 w-4 text-white/60 transition-all duration-300 group-hover:text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl py-2 z-50 border border-white/30 animate-fade-in">
                <button
                  onClick={handleLogout}
                  className="group flex items-center w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-red-500/20 hover:text-red-300 rounded-lg mx-1 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

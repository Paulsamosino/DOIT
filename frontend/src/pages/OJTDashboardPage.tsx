import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OJTDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header with Modern Glass Effect */}
      <div className="card-modern p-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <div className="ml-6 flex-1">
            <h1 className="text-sm font-medium text-gray-500 mb-1">
              Welcome back
            </h1>
            <h2 className="text-3xl font-bold text-gradient mb-2">
              {user?.username}
            </h2>
            <p className="text-gray-600 flex items-center">
              {" "}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mr-3">
                OJT Trainee
              </span>
              IT Inventory Management System
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions with Enhanced Design */}
      <div className="card-modern p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
          <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/ojt/add-resource"
            className="group relative bg-gradient-to-br from-red-50 to-red-50 p-8 rounded-xl border border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Add Resource
                </h4>
                <p className="text-sm text-gray-600">
                  Register new IT equipment
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
          </Link>

          <div className="group relative bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-xl border border-emerald-100">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  View Inventory
                </h4>
                <p className="text-sm text-gray-600">Browse all equipment</p>
                <p className="text-xs text-red-500 mt-1 font-medium">
                  Admin access only
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gray-50 bg-opacity-50 rounded-xl"></div>
          </div>

          <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-xl border border-amber-100">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg
                    className="h-6 w-6 text-white"
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
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Search Equipment
                </h4>
                <p className="text-sm text-gray-600">Find specific items</p>
                <p className="text-xs text-red-500 mt-1 font-medium">
                  Admin access only
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gray-50 bg-opacity-50 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card-modern p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
          <Link
            to="/ojt/inventory"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                Welcome to the IT Inventory System!
              </p>
              <p className="text-xs text-gray-500">
                Get started by adding your first resource
              </p>
            </div>
            <span className="text-xs text-gray-400">Just now</span>
          </div>
        </div>
      </div>

      {/* System Tips */}
      <div className="card-modern p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              💡 Pro Tips
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                <span>
                  Always double-check serial numbers when adding new equipment
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                <span>
                  Use clear, descriptive names for easy identification
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                <span>Keep warranty information up to date</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OJTDashboardPage;

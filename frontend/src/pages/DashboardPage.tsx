import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";
import { DashboardStats, DashboardActivity, DashboardAlert } from "../types";
import {
  formatNumber,
  formatRelativeTime,
  getStatusBadgeClass,
} from "../utils/helpers";

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [statsResponse, activitiesResponse, alertsResponse] =
        await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getRecentActivity(5),
          dashboardAPI.getAlerts(),
        ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (activitiesResponse.success && activitiesResponse.data) {
        setActivities(activitiesResponse.data.activities);
      }

      if (alertsResponse.success && alertsResponse.data) {
        setAlerts(alertsResponse.data.alerts);
      }

      setLastRefresh(new Date());
      setError("");
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh for alerts every 30 seconds
    const alertsInterval = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);

    return () => clearInterval(alertsInterval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Total Items",
      value: stats?.overview.totalItems || 0,
      icon: "📦",
      color: "bg-red-100",
    },
    {
      title: "Active Users",
      value: stats?.overview.activeUsers || 0,
      icon: "👥",
      color: "bg-red-100",
    },
    {
      title: "Recent Updates",
      value: stats?.overview.recentlyAdded || 0,
      icon: "🔄",
      color: "bg-red-100",
    },
    {
      title: "Expiring Warranties",
      value: stats?.overview.expiringWarranties || 0,
      icon: "⚠️",
      color: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to the IT Inventory Management System
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, index) => (
          <div
            key={index}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} rounded-md p-3`}>
                    <span className="text-red-700 text-2xl">{card.icon}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatNumber(card.value)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {" "}
                    <div
                      className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${
                        activity.type === "created"
                          ? "bg-green-400"
                          : "bg-primary-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span>{" "}
                        <span className="font-medium text-blue-600">
                          {activity.item.name}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.item.location} •{" "}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            activity.item.status
                          )}`}
                        >
                          {activity.item.status}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </div>
        </div>{" "}
        {/* System Alerts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                System Alerts
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
                <button
                  onClick={() => fetchDashboardData(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh alerts"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border-l-4 ${
                      alert.severity === "high"
                        ? "border-red-400 bg-red-50"
                        : alert.severity === "medium"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-blue-400 bg-blue-50"
                    }`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span
                          className={`text-lg ${
                            alert.severity === "high"
                              ? "text-red-400"
                              : alert.severity === "medium"
                              ? "text-yellow-400"
                              : "text-blue-400"
                          }`}
                        >
                          {alert.type === "warranty" ? "⚠️" : "🔧"}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h4
                          className={`text-sm font-medium ${
                            alert.severity === "high"
                              ? "text-red-800"
                              : alert.severity === "medium"
                              ? "text-yellow-800"
                              : "text-blue-800"
                          }`}
                        >
                          {alert.title}
                        </h4>
                        <p
                          className={`text-sm ${
                            alert.severity === "high"
                              ? "text-red-700"
                              : alert.severity === "medium"
                              ? "text-yellow-700"
                              : "text-blue-700"
                          }`}
                        >
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Item: {alert.item.name} - {alert.item.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <div className="text-green-400 text-4xl mb-2">✅</div>
                  <p className="text-sm font-medium text-gray-900">No alerts</p>
                  <p className="text-xs text-gray-500">
                    All systems are running smoothly
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      {stats && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Inventory Status Distribution
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {Object.entries(stats.statusStats).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(count)}
                  </div>
                  <div
                    className={`text-sm font-medium inline-flex items-center px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(
                      status
                    )}`}
                  >
                    {status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

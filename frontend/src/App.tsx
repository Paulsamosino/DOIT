import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import OJTLayout from "./components/layout/OJTLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryListPage from "./pages/InventoryListPage";
import AddResourcePage from "./pages/AddResourcePage";
import EditResourcePage from "./pages/EditResourcePage";
import ResourceDetailsPage from "./pages/ResourceDetailsPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import OJTDashboardPage from "./pages/OJTDashboardPage";
import OJTAddResourcePage from "./pages/OJTAddResourcePage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="inventory" element={<InventoryListPage />} />
              <Route path="inventory/add" element={<AddResourcePage />} />
              <Route path="inventory/edit/:id" element={<EditResourcePage />} />
              <Route
                path="inventory/view/:id"
                element={<ResourceDetailsPage />}
              />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Protected OJT Routes */}
            <Route
              path="/ojt"
              element={
                <ProtectedRoute allowedRoles={["ojt"]}>
                  <OJTLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OJTDashboardPage />} />
              <Route path="add-resource" element={<OJTAddResourcePage />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

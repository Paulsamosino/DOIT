import axios from "axios";
import {
  AuthResponse,
  LoginRequest,
  InventoryResponse,
  SingleInventoryResponse,
  InventoryItemRequest,
  InventoryQueryParams,
  DashboardStats,
  DashboardActivity,
  DashboardAlert,
  ApiResponse,
  User,
} from "../types";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (
    userData: LoginRequest & { email: string }
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/logout");
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await api.get<ApiResponse<{ users: User[] }>>("/users");
    return response.data;
  },

  create: async (userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>(
      "/users",
      userData
    );
    return response.data;
  },

  update: async (
    userId: string,
    userData: Partial<User>
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>(
      `/users/${userId}`,
      userData
    );
    return response.data;
  },

  delete: async (userId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/users/${userId}`);
    return response.data;
  },

  toggleStatus: async (
    userId: string
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put<ApiResponse<{ user: User }>>(
      `/users/${userId}/toggle-status`
    );
    return response.data;
  },
};

// Inventory API
export const inventoryAPI = {
  getAll: async (params?: InventoryQueryParams): Promise<InventoryResponse> => {
    const response = await api.get<InventoryResponse>("/inventory", { params });
    return response.data;
  },

  getById: async (id: string): Promise<SingleInventoryResponse> => {
    const response = await api.get<SingleInventoryResponse>(`/inventory/${id}`);
    return response.data;
  },

  create: async (
    data: InventoryItemRequest
  ): Promise<SingleInventoryResponse> => {
    const response = await api.post<SingleInventoryResponse>(
      "/inventory",
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<InventoryItemRequest>
  ): Promise<SingleInventoryResponse> => {
    const response = await api.put<SingleInventoryResponse>(
      `/inventory/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/inventory/${id}`);
    return response.data;
  },

  getStats: async (): Promise<
    ApiResponse<
      DashboardStats["overview"] & {
        statusStats: any[];
        expiringWarranties: number;
      }
    >
  > => {
    const response = await api.get<ApiResponse<any>>(
      "/inventory/stats/summary"
    );
    return response.data;
  },

  getRecentActivity: async (
    limit?: number
  ): Promise<ApiResponse<{ recentItems: any[] }>> => {
    const response = await api.get<ApiResponse<any>>(
      "/inventory/recent-activity",
      {
        params: { limit },
      }
    );
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>(
      "/dashboard/stats"
    );
    return response.data;
  },

  getRecentActivity: async (
    limit?: number
  ): Promise<ApiResponse<{ activities: DashboardActivity[] }>> => {
    const response = await api.get<
      ApiResponse<{ activities: DashboardActivity[] }>
    >("/dashboard/recent-activity", {
      params: { limit },
    });
    return response.data;
  },

  getAlerts: async (): Promise<ApiResponse<{ alerts: DashboardAlert[] }>> => {
    const response = await api.get<ApiResponse<{ alerts: DashboardAlert[] }>>(
      "/dashboard/alerts"
    );
    return response.data;
  },
};

// OJT API
export const ojtAPI = {
  createInventoryItem: async (
    data: InventoryItemRequest
  ): Promise<SingleInventoryResponse> => {
    const response = await api.post<SingleInventoryResponse>(
      "/ojt/inventory",
      data
    );
    return response.data;
  },
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>("/ojt/profile");
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getData: async (): Promise<
    ApiResponse<{
      totalItems: number;
      itemsByStatus: { [key: string]: number };
      itemsByBuilding: { [key: string]: number };
      itemsByFloor: { [key: string]: number };
      expiringWarranties: number;
      itemsByMonth: { month: string; count: number }[];
      statusBreakdown: any[];
    }>
  > => {
    const response = await api.get("/reports/data");
    return response.data;
  },

  getSummary: async (): Promise<
    ApiResponse<{
      totalItems: number;
      availableItems: number;
      inUseItems: number;
      maintenanceItems: number;
      addedThisMonth: number;
      updatedThisWeek: number;
      expiringIn30Days: number;
      expiringIn7Days: number;
      topBuilding: { name: string; count: number };
    }>
  > => {
    const response = await api.get("/reports/summary");
    return response.data;
  },

  exportCSV: async (): Promise<Blob> => {
    const response = await api.get("/reports/export/csv", {
      responseType: "blob",
    });
    return response.data;
  },

  exportPDF: async (): Promise<ApiResponse<any>> => {
    const response = await api.get("/reports/export/pdf");
    return response.data;
  },

  generatePDF: async (): Promise<void> => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    // Get the report data
    const reportResponse = await reportsAPI.getData();

    if (!reportResponse.success || !reportResponse.data) {
      throw new Error("Failed to fetch report data");
    }

    const data = reportResponse.data;

    // Create new PDF document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Inventory Report", 20, 20);

    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

    // Summary section
    doc.setFontSize(16);
    doc.text("Summary", 20, 55);

    const summaryData = [
      ["Total Items", data.totalItems.toString()],
      ["Available Items", (data.itemsByStatus.Available || 0).toString()],
      ["In Use Items", (data.itemsByStatus["In Use"] || 0).toString()],
      [
        "Under Maintenance",
        (data.itemsByStatus["Under Maintenance"] || 0).toString(),
      ],
      ["Expiring Warranties", data.expiringWarranties.toString()],
    ];

    autoTable(doc, {
      startY: 65,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [255, 0, 0] },
      margin: { left: 20 },
    });

    // Items by Status section
    const statusData = Object.entries(data.itemsByStatus).map(
      ([status, count]) => [
        status,
        count.toString(),
        `${((count / data.totalItems) * 100).toFixed(1)}%`,
      ]
    );

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Status", "Count", "Percentage"]],
      body: statusData,
      theme: "grid",
      headStyles: { fillColor: [255, 0, 0] },
      margin: { left: 20 },
    });

    // Items by Building section
    const buildingData = Object.entries(data.itemsByBuilding).map(
      ([building, count]) => [
        building,
        count.toString(),
        `${((count / data.totalItems) * 100).toFixed(1)}%`,
      ]
    );

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Building", "Count", "Percentage"]],
      body: buildingData,
      theme: "grid",
      headStyles: { fillColor: [255, 0, 0] },
      margin: { left: 20 },
    });

    // Save the PDF
    const fileName = `inventory_report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  },
};

export default api;

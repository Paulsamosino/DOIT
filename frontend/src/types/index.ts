// Authentication Types
export interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "ojt"; // Updated to match backend enum
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Inventory Types
export interface InventoryItem {
  _id: string;
  building: string;
  floor: string;
  roomNameOrNumber: string;
  computerNameOrId?: string;
  computerModel?: string;
  serialNumber?: string;
  operatingSystem?: string;
  osVersion?: string;
  processor?: string;
  memoryRAM?: string;
  ramSize?: string; // Alternative field name for compatibility
  storage?: string;
  storageSize?: string; // Alternative field name for compatibility
  monitorModelSN?: string;
  keyboardModelSN?: string;
  mouseModelSN?: string;
  otherPeripherals?: string;
  assignedTo?: string;
  notes?: string;
  status: "Available" | "In Use" | "Maintenance" | "Expiring Soon" | "Retired";
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  warrantyExpiration?: Date; // Alternative field name for compatibility
  submittedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  location?: string; // Virtual field
}

export interface InventoryItemRequest {
  building: string;
  floor: string;
  roomNameOrNumber: string;
  computerNameOrId?: string;
  computerModel?: string;
  serialNumber?: string;
  operatingSystem?: string;
  osVersion?: string;
  processor?: string;
  memoryRAM?: string;
  ramSize?: string;
  storage?: string;
  storageSize?: string;
  monitorModelSN?: string;
  keyboardModelSN?: string;
  mouseModelSN?: string;
  otherPeripherals?: string;
  assignedTo?: string;
  notes?: string;
  status?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  warrantyExpiration?: string;
}

export interface InventoryResponse {
  success: boolean;
  data: {
    items: InventoryItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface SingleInventoryResponse {
  success: boolean;
  data: {
    item: InventoryItem;
  };
}

// Dashboard Types
export interface DashboardStats {
  overview: {
    totalItems: number;
    activeUsers: number;
    recentlyAdded: number;
    expiringWarranties: number;
  };
  statusStats: {
    Available: number;
    "In Use": number;
    Maintenance: number;
    "Expiring Soon": number;
    Retired: number;
  };
  itemsByBuilding: Array<{
    _id: string;
    count: number;
  }>;
}

export interface DashboardActivity {
  id: string;
  type: "created" | "updated";
  action: string;
  item: {
    name: string;
    model?: string;
    location: string;
    status: string;
  };
  timestamp: Date;
}

export interface DashboardAlert {
  type: "warranty" | "maintenance";
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
  item: {
    _id: string;
    name: string;
    model?: string;
    location: string;
  };
  daysUntilExpiry?: number;
  daysSinceMaintenance?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: string[];
}

// Query Parameters
export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  building?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Form Types
export interface InventoryFormData {
  building: string;
  floor: string;
  roomNameOrNumber: string;
  computerNameOrId: string;
  computerModel: string;
  serialNumber: string;
  operatingSystem: string;
  processor: string;
  memoryRAM: string;
  storage: string;
  monitorModelSN: string;
  keyboardModelSN: string;
  mouseModelSN: string;
  otherPeripherals: string;
  notes: string;
  status: string;
  purchaseDate: string;
  warrantyExpiry: string;
}

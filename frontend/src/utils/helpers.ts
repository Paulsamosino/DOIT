// Date formatting utilities
export const formatDate = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
};

// String utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const capitalizeFirst = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const camelCaseToWords = (str: string): string => {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
};

// Status utilities
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "available":
      return "#c5a345"; // secondary color
    case "in use":
      return "#be2b1d"; // primary color
    case "maintenance":
      return "#c5a345"; // secondary color
    case "expiring soon":
      return "#be2b1d"; // primary color
    case "retired":
      return "#6b7280"; // gray
    default:
      return "#6b7280";
  }
};

// Status badge utility
export const getStatusBadgeClass = (status: string): string => {
  const statusClasses: Record<string, string> = {
    Available: "bg-green-100 text-green-800",
    "In Use": "bg-blue-100 text-blue-800",
    Maintenance: "bg-yellow-100 text-yellow-800",
    "Expiring Soon": "bg-orange-100 text-orange-800",
    Retired: "bg-red-100 text-red-800",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};

// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  return value !== null && value !== undefined;
};

// Data transformation utilities
export const transformInventoryItemForForm = (item: any) => {
  return {
    building: item.building || "",
    floor: item.floor || "",
    roomNameOrNumber: item.roomNameOrNumber || "",
    computerNameOrId: item.computerNameOrId || "",
    computerModel: item.computerModel || "",
    serialNumber: item.serialNumber || "",
    operatingSystem: item.operatingSystem || "",
    processor: item.processor || "",
    memoryRAM: item.memoryRAM || "",
    storage: item.storage || "",
    monitorModelSN: item.monitorModelSN || "",
    keyboardModelSN: item.keyboardModelSN || "",
    mouseModelSN: item.mouseModelSN || "",
    otherPeripherals: item.otherPeripherals || "",
    notes: item.notes || "",
    status: item.status || "Available",
    purchaseDate: item.purchaseDate
      ? new Date(item.purchaseDate).toISOString().split("T")[0]
      : "",
    warrantyExpiry: item.warrantyExpiry
      ? new Date(item.warrantyExpiry).toISOString().split("T")[0]
      : "",
  };
};

// URL utilities
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

// Error handling utilities
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.join(", ");
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Local storage utilities
export const safeJSONParse = (
  str: string | null,
  fallback: any = null
): any => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export const safeJSONStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch {
    return "";
  }
};

// Number utilities
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

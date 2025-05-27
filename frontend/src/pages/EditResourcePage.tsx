import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { inventoryAPI } from "../services/api";
import { InventoryItemRequest } from "../types";

interface FormData {
  computerNameOrId: string;
  computerModel: string;
  serialNumber: string;
  operatingSystem: string;
  osVersion: string;
  processor: string;
  ramSize: string;
  storageSize: string;
  building: string;
  floor: string;
  roomNameOrNumber: string;
  assignedTo: string;
  status: string;
  purchaseDate: string;
  warrantyExpiration: string;
  notes: string;
}

const EditResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    computerNameOrId: "",
    computerModel: "",
    serialNumber: "",
    operatingSystem: "",
    osVersion: "",
    processor: "",
    ramSize: "",
    storageSize: "",
    building: "",
    floor: "",
    roomNameOrNumber: "",
    assignedTo: "",
    status: "Available",
    purchaseDate: "",
    warrantyExpiration: "",
    notes: "",
  });

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        setError("Invalid item ID");
        setLoading(false);
        return;
      }
      try {
        const response = await inventoryAPI.getById(id);
        if (response.success && response.data) {
          const item = response.data.item;
          setFormData({
            computerNameOrId: item.computerNameOrId || "",
            computerModel: item.computerModel || "",
            serialNumber: item.serialNumber || "",
            operatingSystem: item.operatingSystem || "",
            osVersion: item.osVersion || "",
            processor: item.processor || "",
            ramSize: item.ramSize || item.memoryRAM || "",
            storageSize: item.storageSize || item.storage || "",
            building: item.building || "",
            floor: item.floor || "",
            roomNameOrNumber: item.roomNameOrNumber || "",
            assignedTo: item.assignedTo || "",
            status: item.status || "Available",
            purchaseDate: item.purchaseDate
              ? new Date(item.purchaseDate).toISOString().split("T")[0]
              : "",
            warrantyExpiration:
              item.warrantyExpiration || item.warrantyExpiry
                ? new Date(item.warrantyExpiration || item.warrantyExpiry!)
                    .toISOString()
                    .split("T")[0]
                : "",
            notes: item.notes || "",
          });
        }
      } catch (err: any) {
        console.error("Error fetching inventory item:", err);
        setError("Failed to load inventory item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError("");

    try {
      // Convert dates to proper format and prepare data
      const itemData: Partial<InventoryItemRequest> = {
        computerNameOrId: formData.computerNameOrId,
        computerModel: formData.computerModel,
        serialNumber: formData.serialNumber,
        operatingSystem: formData.operatingSystem,
        osVersion: formData.osVersion,
        processor: formData.processor,
        ramSize: formData.ramSize,
        memoryRAM: formData.ramSize, // Map to both field names for compatibility
        storageSize: formData.storageSize,
        storage: formData.storageSize, // Map to both field names for compatibility
        building: formData.building,
        floor: formData.floor,
        roomNameOrNumber: formData.roomNameOrNumber,
        assignedTo: formData.assignedTo,
        status: formData.status,
        notes: formData.notes,
        purchaseDate: formData.purchaseDate || undefined,
        warrantyExpiration: formData.warrantyExpiration || undefined,
        warrantyExpiry: formData.warrantyExpiration || undefined,
      };

      await inventoryAPI.update(id, itemData);
      navigate("/admin/inventory");
    } catch (err: any) {
      console.error("Error updating inventory item:", err);
      setError(
        err.response?.data?.message || "Failed to update inventory item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/inventory");
  };
  const handleDelete = async () => {
    if (!id) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await inventoryAPI.delete(id);
      navigate("/admin/inventory");
    } catch (err: any) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !formData.computerNameOrId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit Resource
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update IT resource information
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Resource
          </button>
        </div>
      </div>
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          {/* Basic Information Section */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Essential details about the device
            </p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="computerNameOrId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Device Name/ID *
                </label>
                <input
                  type="text"
                  id="computerNameOrId"
                  name="computerNameOrId"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., PC-001, LAPTOP-HR-01"
                  value={formData.computerNameOrId}
                  onChange={handleInputChange}
                />
              </div>{" "}
              <div>
                <label
                  htmlFor="serialNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Serial Number *
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Device serial number"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="computerModel"
                  className="block text-sm font-medium text-gray-700"
                >
                  Model *
                </label>
                <input
                  type="text"
                  id="computerModel"
                  name="computerModel"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Dell OptiPlex 7090, MacBook Pro 16"
                  value={formData.computerModel}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Technical Specifications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Hardware and software details
            </p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="operatingSystem"
                  className="block text-sm font-medium text-gray-700"
                >
                  Operating System
                </label>
                <select
                  id="operatingSystem"
                  name="operatingSystem"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.operatingSystem}
                  onChange={handleInputChange}
                >
                  <option value="">Select OS</option>
                  <option value="Windows">Windows</option>
                  <option value="macOS">macOS</option>
                  <option value="Linux">Linux</option>
                  <option value="ChromeOS">ChromeOS</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="osVersion"
                  className="block text-sm font-medium text-gray-700"
                >
                  OS Version
                </label>
                <input
                  type="text"
                  id="osVersion"
                  name="osVersion"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Windows 11, macOS 13.0"
                  value={formData.osVersion}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="processor"
                  className="block text-sm font-medium text-gray-700"
                >
                  Processor
                </label>
                <input
                  type="text"
                  id="processor"
                  name="processor"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Intel i7-12700, Apple M2"
                  value={formData.processor}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="ramSize"
                  className="block text-sm font-medium text-gray-700"
                >
                  RAM Size
                </label>
                <input
                  type="text"
                  id="ramSize"
                  name="ramSize"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 16GB, 32GB"
                  value={formData.ramSize}
                  onChange={handleInputChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="storageSize"
                  className="block text-sm font-medium text-gray-700"
                >
                  Storage Size
                </label>
                <input
                  type="text"
                  id="storageSize"
                  name="storageSize"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 512GB SSD, 1TB HDD"
                  value={formData.storageSize}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location & Assignment Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Location & Assignment
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Physical location and assignment details
            </p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="building"
                  className="block text-sm font-medium text-gray-700"
                >
                  Building *
                </label>
                <select
                  id="building"
                  name="building"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.building}
                  onChange={handleInputChange}
                >
                  <option value="">Select Building</option>
                  <option value="Main Building">Main Building</option>
                  <option value="Engineering Building">
                    Engineering Building
                  </option>
                  <option value="IT Building">IT Building</option>
                  <option value="Library Building">Library Building</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="floor"
                  className="block text-sm font-medium text-gray-700"
                >
                  Floor
                </label>
                <input
                  type="text"
                  id="floor"
                  name="floor"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 1, 2, G"
                  value={formData.floor}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="roomNameOrNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Room
                </label>
                <input
                  type="text"
                  id="roomNameOrNumber"
                  name="roomNameOrNumber"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 101, IT Lab 1"
                  value={formData.roomNameOrNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="assignedTo"
                className="block text-sm font-medium text-gray-700"
              >
                Assigned To
              </label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Employee name or department"
                value={formData.assignedTo}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Purchase & Warranty Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Purchase & Warranty
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Purchase and warranty information
            </p>
          </div>
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="purchaseDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Purchase Date
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="warrantyExpiration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Warranty Expiration
                </label>
                <input
                  type="date"
                  id="warrantyExpiration"
                  name="warrantyExpiration"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.warrantyExpiration}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Any additional information or notes..."
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Resource"
            )}
          </button>
        </div>
      </form>{" "}
    </div>
  );
};

export default EditResourcePage;

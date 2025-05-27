import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { inventoryAPI } from "../services/api";
import { InventoryItemRequest } from "../types";
import BarcodeScanner from "../components/shared/BarcodeScanner";

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

const AddResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
    setLoading(true);
    setError("");
    try {
      // Convert dates to proper format and prepare data
      const itemData: InventoryItemRequest = {
        building: formData.building,
        floor: formData.floor,
        roomNameOrNumber: formData.roomNameOrNumber,
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
        assignedTo: formData.assignedTo,
        status: formData.status,
        notes: formData.notes,
        purchaseDate: formData.purchaseDate || undefined,
        warrantyExpiration: formData.warrantyExpiration || undefined,
        warrantyExpiry: formData.warrantyExpiration || undefined,
      };

      await inventoryAPI.create(itemData);
      navigate("/admin/inventory");
    } catch (err: any) {
      console.error("Error creating inventory item:", err);
      setError(
        err.response?.data?.message || "Failed to create inventory item"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    navigate("/admin/inventory");
  };

  const handleScanSuccess = (scannedCode: string) => {
    setFormData((prev) => ({ ...prev, serialNumber: scannedCode }));
    setIsScannerOpen(false);
  };

  const handleScanError = (error: string) => {
    console.error("Scan error:", error);
    setError(`Scanner error: ${error}`);
  };
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header with Breadcrumb */}
      <div className="card-modern p-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <a
                href="/admin/dashboard"
                className="text-gray-500 hover:text-primary-600 transition-colors"
              >
                Dashboard
              </a>
            </li>
            <li>
              <span className="text-gray-400">&rsaquo;</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">Add Resource</span>
            </li>
          </ol>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
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
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Add New Resource
            </h1>
            <p className="text-gray-600">
              Register new IT equipment in the inventory system
            </p>
          </div>
        </div>
      </div>{" "}
      {/* Error/Success Messages */}
      {error && (
        <div className="alert-error flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}{" "}
      {/* Form */}
      <div className="card-modern p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Information */}
          <div className="bg-gradient-to-r from-red-50 to-red-50 p-6 rounded-xl border border-red-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Location Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="building"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Building *
                </label>
                <select
                  id="building"
                  name="building"
                  required
                  className="input-modern"
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
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Floor *
                </label>
                <input
                  type="text"
                  id="floor"
                  name="floor"
                  required
                  className="input-modern"
                  placeholder="e.g., 1st Floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="roomNameOrNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Room Name/Number *
                </label>
                <input
                  type="text"
                  id="roomNameOrNumber"
                  name="roomNameOrNumber"
                  required
                  className="input-modern"
                  placeholder="e.g., Room 101"
                  value={formData.roomNameOrNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Computer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Computer Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="computerNameOrId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Computer Name/ID *
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
              </div>
              <div>
                <label
                  htmlFor="computerModel"
                  className="block text-sm font-medium text-gray-700"
                >
                  Computer Model *
                </label>
                <input
                  type="text"
                  id="computerModel"
                  name="computerModel"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Dell OptiPlex 7090"
                  value={formData.computerModel}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="serialNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Serial Number *
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    id="serialNumber"
                    name="serialNumber"
                    type="text"
                    required
                    className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Device serial number"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    title="Scan Barcode/QR Code"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5m0 0v5m0 0h5M4 20h5m0 0v-5m0 0h5"
                      />
                    </svg>
                  </button>
                </div>
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

          {/* System Specifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              System Specifications
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="operatingSystem"
                  className="block text-sm font-medium text-gray-700"
                >
                  Operating System *
                </label>
                <input
                  type="text"
                  id="operatingSystem"
                  name="operatingSystem"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Windows 11 Pro"
                  value={formData.operatingSystem}
                  onChange={handleInputChange}
                />
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
                  placeholder="e.g., 22H2"
                  value={formData.osVersion}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="processor"
                  className="block text-sm font-medium text-gray-700"
                >
                  Processor *
                </label>
                <input
                  type="text"
                  id="processor"
                  name="processor"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Intel Core i5-10500"
                  value={formData.processor}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="ramSize"
                  className="block text-sm font-medium text-gray-700"
                >
                  Memory (RAM) *
                </label>
                <input
                  type="text"
                  id="ramSize"
                  name="ramSize"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 16GB DDR4"
                  value={formData.ramSize}
                  onChange={handleInputChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="storageSize"
                  className="block text-sm font-medium text-gray-700"
                >
                  Storage *
                </label>
                <input
                  type="text"
                  id="storageSize"
                  name="storageSize"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., 512GB SSD"
                  value={formData.storageSize}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
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

          {/* Purchase & Warranty Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Purchase & Warranty Information
            </h3>
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
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Additional information about this resource..."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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
                  Creating...
                </>
              ) : (
                "Create Resource"
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
      />
    </div>
  );
};

export default AddResourcePage;

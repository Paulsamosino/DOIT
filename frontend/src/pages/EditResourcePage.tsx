import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { inventoryAPI } from "../services/api";
import { InventoryItemRequest } from "../types";
import BarcodeScanner from "../components/shared/BarcodeScanner";

interface MapuaFormData {
  roomType: string;
  roomDescription: string;
  campusArea: string;
  computerType: string;
  computerBrand: string;
  computerModel: string;
  serialNumber: string;
  computerProcessor: string;
  computerMemory: string;
  storageDriveType: string;
  storageDriveSize: string;
  monitorBrandModel: string;
  monitorSerialNumber: string;
  upsBrandModel: string;
  upsSerialNumber: string;
  printerBrandModel: string;
  printerSerialNumber: string;
  remarks: string;
}

const EditResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [monitorScannerOpen, setMonitorScannerOpen] = useState(false);
  const [upsScannerOpen, setUpsScannerOpen] = useState(false);

  const [formData, setFormData] = useState<MapuaFormData>({
    roomType: "",
    roomDescription: "",
    campusArea: "",
    computerType: "",
    computerBrand: "",
    computerModel: "",
    serialNumber: "",
    computerProcessor: "",
    computerMemory: "",
    storageDriveType: "",
    storageDriveSize: "",
    monitorBrandModel: "",
    monitorSerialNumber: "",
    upsBrandModel: "",
    upsSerialNumber: "",
    printerBrandModel: "",
    printerSerialNumber: "",
    remarks: "",
  });

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await inventoryAPI.getById(id!);
        const item = response.data.item;

        // Parse the notes field to extract individual components
        const notes = item.notes || "";
        const roomTypeMatch = notes.match(/Room Type: (.*?)(?:\n|$)/);
        const computerTypeMatch = notes.match(/Computer Type: (.*?)(?:\n|$)/);
        const brandMatch = notes.match(/Brand: (.*?)(?:\n|$)/);
        const monitorMatch = notes.match(/Monitor: (.*?)(?:\n|$)/);
        const monitorSNMatch = notes.match(/Monitor SN: (.*?)(?:\n|$)/);
        const upsMatch = notes.match(/UPS: (.*?)(?:\n|$)/);
        const upsSNMatch = notes.match(/UPS SN: (.*?)(?:\n|$)/);
        const printerMatch = notes.match(/Printer: (.*?)(?:\n|$)/);
        const printerSNMatch = notes.match(/Printer SN: (.*?)(?:\n|$)/);
        const remarksMatch = notes.match(/Remarks: (.*?)(?:\n|$)/);

        // Parse room information
        const [roomType, roomDescription] = (item.roomNameOrNumber || "").split(
          " - "
        );

        // Parse storage information
        const [storageSize, storageType] = (item.storage || "").split(" ");

        setFormData({
          roomType: roomTypeMatch ? roomTypeMatch[1] : roomType,
          roomDescription: roomDescription || "",
          campusArea: item.floor || "",
          computerType: computerTypeMatch ? computerTypeMatch[1] : "",
          computerBrand: brandMatch
            ? brandMatch[1]
            : (item.computerNameOrId || "").split("-")[0],
          computerModel: item.computerModel || "",
          serialNumber: item.serialNumber || "",
          computerProcessor: item.processor || "",
          computerMemory: item.memoryRAM || "",
          storageDriveType: storageType || "",
          storageDriveSize: storageSize || "",
          monitorBrandModel: monitorMatch ? monitorMatch[1] : "",
          monitorSerialNumber: monitorSNMatch ? monitorSNMatch[1] : "",
          upsBrandModel: upsMatch ? upsMatch[1] : "",
          upsSerialNumber: upsSNMatch ? upsSNMatch[1] : "",
          printerBrandModel: printerMatch ? printerMatch[1] : "",
          printerSerialNumber: printerSNMatch ? printerSNMatch[1] : "",
          remarks: remarksMatch ? remarksMatch[1] : "",
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch resource details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Format the notes field
      const notes = [
        `Room Type: ${formData.roomType}`,
        `Computer Type: ${formData.computerType}`,
        `Brand: ${formData.computerBrand}`,
        `Monitor: ${formData.monitorBrandModel}`,
        `Monitor SN: ${formData.monitorSerialNumber}`,
        `UPS: ${formData.upsBrandModel}`,
        `UPS SN: ${formData.upsSerialNumber}`,
        `Printer: ${formData.printerBrandModel}`,
        `Printer SN: ${formData.printerSerialNumber}`,
        `Remarks: ${formData.remarks}`,
      ].join("\n");

      const updateData = {
        computerNameOrId: `${formData.computerBrand}-${formData.computerModel}`,
        computerModel: formData.computerModel,
        serialNumber: formData.serialNumber,
        processor: formData.computerProcessor,
        memoryRAM: formData.computerMemory,
        storage: `${formData.storageDriveSize} ${formData.storageDriveType}`,
        roomNameOrNumber: `${formData.roomType} - ${formData.roomDescription}`,
        floor: formData.campusArea,
        notes,
      };

      await inventoryAPI.update(id!, updateData);
      setSuccess("Resource updated successfully");
      setTimeout(() => {
        navigate("/admin/inventory");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update resource");
    }
  };

  const handleBack = () => {
    navigate("/admin/inventory");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              <a
                href="/admin/inventory"
                className="text-gray-500 hover:text-primary-600 transition-colors"
              >
                Inventory
              </a>
            </li>
            <li>
              <span className="text-gray-400">&rsaquo;</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">Edit Resource</span>
            </li>
          </ol>
        </nav>

        <div className="flex items-center justify-between">
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                Edit Resource
              </h1>
              <p className="text-gray-600">
                Update IT equipment information in the inventory system
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
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
      )}

      {/* Success Message */}
      {success && (
        <div className="alert-success flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Resource Form */}
      <form onSubmit={handleSubmit} className="card-modern p-8">
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Mapua Makati Office and Lecture Room IT Resources
            </h2>
            <p className="text-gray-600">
              Update IT equipment information in the inventory system
            </p>
          </div>

          {/* Room Information */}
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Room Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Type
                </label>
                <input
                  type="text"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Description
                </label>
                <input
                  type="text"
                  name="roomDescription"
                  value={formData.roomDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campus Area
                </label>
                <input
                  type="text"
                  name="campusArea"
                  value={formData.campusArea}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Computer Information */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
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
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Computer Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Computer Type
                </label>
                <select
                  name="computerType"
                  value={formData.computerType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Server">Server</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Computer Brand
                </label>
                <input
                  type="text"
                  name="computerBrand"
                  value={formData.computerBrand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Computer Model
                </label>
                <input
                  type="text"
                  name="computerModel"
                  value={formData.computerModel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Computer Processor
                </label>
                <input
                  type="text"
                  name="computerProcessor"
                  value={formData.computerProcessor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Computer Memory
                </label>
                <input
                  type="text"
                  name="computerMemory"
                  value={formData.computerMemory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Storage Information */}
          <div className="bg-gradient-to-r from-green-50 to-green-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
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
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Storage Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Storage Drive Type
                </label>
                <select
                  name="storageDriveType"
                  value={formData.storageDriveType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="HDD">HDD</option>
                  <option value="SSD">SSD</option>
                  <option value="NVMe">NVMe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Storage Drive Size
                </label>
                <input
                  type="text"
                  name="storageDriveSize"
                  value={formData.storageDriveSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Peripherals Information */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-50 p-6 rounded-xl border border-purple-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Peripherals Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monitor Brand/Model
                </label>
                <input
                  type="text"
                  name="monitorBrandModel"
                  value={formData.monitorBrandModel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monitor Serial Number
                </label>
                <input
                  type="text"
                  name="monitorSerialNumber"
                  value={formData.monitorSerialNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  UPS Brand/Model
                </label>
                <input
                  type="text"
                  name="upsBrandModel"
                  value={formData.upsBrandModel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  UPS Serial Number
                </label>
                <input
                  type="text"
                  name="upsSerialNumber"
                  value={formData.upsSerialNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Printer Brand/Model
                </label>
                <input
                  type="text"
                  name="printerBrandModel"
                  value={formData.printerBrandModel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Printer Serial Number
                </label>
                <input
                  type="text"
                  name="printerSerialNumber"
                  value={formData.printerSerialNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Update Resource
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditResourcePage;

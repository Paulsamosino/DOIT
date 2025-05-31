import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ojtAPI } from "../services/api";
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

const OJTAddResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [monitorScannerOpen, setMonitorScannerOpen] = useState(false);
  const [upsScannerOpen, setUpsScannerOpen] = useState(false);
  const [printerScannerOpen, setPrinterScannerOpen] = useState(false);
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
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Validate required fields
      const requiredFields = [
        "roomType",
        "roomDescription",
        "campusArea",
        "computerType",
        "computerBrand",
        "computerModel",
        "serialNumber",
        "computerProcessor",
        "computerMemory",
        "storageDriveType",
        "storageDriveSize",
      ];
      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof MapuaFormData]
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
      }

      // Prepare data for API - mapping to expected backend format
      const itemData: InventoryItemRequest = {
        building: "Mapua Makati",
        floor: formData.campusArea,
        roomNameOrNumber: `${formData.roomType} - ${formData.roomDescription}`,
        computerNameOrId: `${formData.computerBrand}-${formData.serialNumber}`,
        computerModel: formData.computerModel,
        serialNumber: formData.serialNumber,
        operatingSystem:
          formData.computerType === "Desktop" ? "Windows" : "Various",
        processor: formData.computerProcessor,
        memoryRAM: formData.computerMemory,
        storage: `${formData.storageDriveSize} ${formData.storageDriveType}`,
        status: "Available",
        notes: `Room Type: ${formData.roomType}\nComputer Type: ${formData.computerType}\nBrand: ${formData.computerBrand}\nMonitor: ${formData.monitorBrandModel}\nMonitor SN: ${formData.monitorSerialNumber}\nUPS: ${formData.upsBrandModel}\nUPS SN: ${formData.upsSerialNumber}\nPrinter: ${formData.printerBrandModel}\nPrinter SN: ${formData.printerSerialNumber}\nRemarks: ${formData.remarks}`,
      };

      await ojtAPI.createInventoryItem(itemData);
      setSuccess(
        "Resource added successfully! You can add another resource or return to dashboard."
      );

      // Reset form
      setFormData({
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
    } catch (err: any) {
      console.error("Error creating inventory item:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create inventory item"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/ojt");
  };
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header with Breadcrumb */}
      <div className="card-modern p-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                to="/ojt"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-900 font-medium">Add Resource</span>
            </li>
          </ol>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          </div>{" "}
          <div>
            <h1 className="text-3xl font-bold text-red-700">
              Mapua Makati Office and Lecture Room IT Resources
            </h1>
            <p className="text-gray-600 mt-1">
              Register new IT equipment in the inventory system
            </p>
          </div>
        </div>
      </div>
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
      )}
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}{" "}
      {/* Form */}
      <div className="card-modern p-8">
        {" "}
        <form onSubmit={handleSubmit} className="space-y-8">
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
                Room Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="roomType"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Room Type *
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  required
                  className="input-modern"
                  value={formData.roomType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Room Type</option>
                  <option value="Office">Office</option>
                  <option value="ILMO Laboratory">ILMO Laboratory</option>
                  <option value="Function Room">Function Room</option>
                  <option value="Lecture Room">Lecture Room</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="roomDescription"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Room Description *
                </label>
                <input
                  type="text"
                  id="roomDescription"
                  name="roomDescription"
                  required
                  className="input-modern"
                  placeholder="e.g., Room 101, IT Department"
                  value={formData.roomDescription}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="campusArea"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Campus Area *
                </label>
                <select
                  id="campusArea"
                  name="campusArea"
                  required
                  className="input-modern"
                  value={formData.campusArea}
                  onChange={handleInputChange}
                >
                  <option value="">Select Campus Area</option>
                  <option value="Basement 1">Basement 1</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3nd Floor">3nd Floor</option>
                  <option value="4nd Floor">4nd Floor</option>
                  <option value="5nd Floor">5nd Floor</option>
                  <option value="6nd Floor">6nd Floor</option>
                  <option value="7nd Floor">7nd Floor</option>
                </select>
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Computer Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="computerType"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Computer Type *
                </label>
                <select
                  id="computerType"
                  name="computerType"
                  required
                  className="input-modern"
                  value={formData.computerType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Computer Type</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Laptop">Laptop</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="computerBrand"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Computer Brand *
                </label>
                <select
                  id="computerBrand"
                  name="computerBrand"
                  required
                  className="input-modern"
                  value={formData.computerBrand}
                  onChange={handleInputChange}
                >
                  <option value="">Select Computer Brand</option>
                  <option value="DELL">DELL</option>
                  <option value="ACER">ACER</option>
                  <option value="LENOVO">LENOVO</option>
                  <option value="APPLE">APPLE</option>
                  <option value="HP">HP</option>
                  <option value="ASUS">ASUS</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="computerModel"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Computer Model *
                </label>
                <input
                  type="text"
                  id="computerModel"
                  name="computerModel"
                  required
                  className="input-modern"
                  placeholder="e.g., OptiPlex 7080"
                  value={formData.computerModel}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="serialNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Serial Number *
                </label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    required
                    className="flex-1 input-modern rounded-r-none"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    placeholder="Device serial number"
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
                  htmlFor="computerProcessor"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Computer Processor *
                </label>
                <input
                  type="text"
                  id="computerProcessor"
                  name="computerProcessor"
                  required
                  className="input-modern"
                  placeholder="e.g., Intel Core i5-10500"
                  value={formData.computerProcessor}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label
                  htmlFor="computerMemory"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Computer Memory *
                </label>
                <input
                  type="text"
                  id="computerMemory"
                  name="computerMemory"
                  required
                  className="input-modern"
                  placeholder="e.g., 16GB DDR4"
                  value={formData.computerMemory}
                  onChange={handleInputChange}
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
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Storage Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="storageDriveType"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Storage Drive Type *
                </label>
                <select
                  id="storageDriveType"
                  name="storageDriveType"
                  required
                  className="input-modern"
                  value={formData.storageDriveType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Storage Type</option>
                  <option value="HDD">HDD</option>
                  <option value="SSD">SSD</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="storageDriveSize"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Storage Drive Size *
                </label>
                <input
                  type="text"
                  id="storageDriveSize"
                  name="storageDriveSize"
                  required
                  className="input-modern"
                  placeholder="e.g., 512GB, 1TB"
                  value={formData.storageDriveSize}
                  onChange={handleInputChange}
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
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Peripherals Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="monitorBrandModel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Monitor Brand/Model
                </label>
                <input
                  type="text"
                  id="monitorBrandModel"
                  name="monitorBrandModel"
                  className="input-modern"
                  placeholder="e.g., Dell U2722DE"
                  value={formData.monitorBrandModel}
                  onChange={handleInputChange}
                />
              </div>{" "}
              <div>
                <label
                  htmlFor="monitorSerialNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Monitor Serial Number
                </label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="monitorSerialNumber"
                    name="monitorSerialNumber"
                    className="flex-1 input-modern rounded-r-none"
                    placeholder="Monitor serial number"
                    value={formData.monitorSerialNumber}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setMonitorScannerOpen(true)}
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
                  htmlFor="upsBrandModel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  UPS Brand/Model
                </label>
                <input
                  type="text"
                  id="upsBrandModel"
                  name="upsBrandModel"
                  className="input-modern"
                  placeholder="e.g., APC Back-UPS Pro 1500"
                  value={formData.upsBrandModel}
                  onChange={handleInputChange}
                />
              </div>{" "}
              <div>
                <label
                  htmlFor="upsSerialNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  UPS Serial Number
                </label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="upsSerialNumber"
                    name="upsSerialNumber"
                    className="flex-1 input-modern rounded-r-none"
                    placeholder="UPS serial number"
                    value={formData.upsSerialNumber}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setUpsScannerOpen(true)}
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
                  htmlFor="printerBrandModel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Printer Brand/Model
                </label>
                <input
                  type="text"
                  id="printerBrandModel"
                  name="printerBrandModel"
                  className="input-modern"
                  placeholder="e.g., HP LaserJet Pro M404n"
                  value={formData.printerBrandModel}
                  onChange={handleInputChange}
                />
              </div>{" "}
              <div>
                <label
                  htmlFor="printerSerialNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Printer Serial Number
                </label>
                <div className="flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="printerSerialNumber"
                    name="printerSerialNumber"
                    className="flex-1 input-modern rounded-r-none"
                    placeholder="Printer serial number"
                    value={formData.printerSerialNumber}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setPrinterScannerOpen(true)}
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
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows={4}
              className="input-modern"
              placeholder="Additional information about this resource..."
              value={formData.remarks}
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
              {loading ? "Adding..." : "Add Resource"}
            </button>
          </div>
        </form>
      </div>{" "}
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(result: string) => {
          setFormData((prev: MapuaFormData) => ({
            ...prev,
            serialNumber: result,
          }));
          setIsScannerOpen(false);
        }}
        onScanError={(error: string) => {
          console.error("Scan error:", error);
          setIsScannerOpen(false);
        }}
      />
      {/* Monitor Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={monitorScannerOpen}
        onClose={() => setMonitorScannerOpen(false)}
        onScanSuccess={(result: string) => {
          setFormData((prev: MapuaFormData) => ({
            ...prev,
            monitorSerialNumber: result,
          }));
          setMonitorScannerOpen(false);
        }}
        onScanError={(error: string) => {
          console.error("Monitor scan error:", error);
          setMonitorScannerOpen(false);
        }}
      />
      {/* UPS Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={upsScannerOpen}
        onClose={() => setUpsScannerOpen(false)}
        onScanSuccess={(result: string) => {
          setFormData((prev: MapuaFormData) => ({
            ...prev,
            upsSerialNumber: result,
          }));
          setUpsScannerOpen(false);
        }}
        onScanError={(error: string) => {
          console.error("UPS scan error:", error);
          setUpsScannerOpen(false);
        }}
      />
      {/* Printer Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={printerScannerOpen}
        onClose={() => setPrinterScannerOpen(false)}
        onScanSuccess={(result: string) => {
          setFormData((prev: MapuaFormData) => ({
            ...prev,
            printerSerialNumber: result,
          }));
          setPrinterScannerOpen(false);
        }}
        onScanError={(error: string) => {
          console.error("Printer scan error:", error);
          setPrinterScannerOpen(false);
        }}
      />
    </div>
  );
};

export default OJTAddResourcePage;

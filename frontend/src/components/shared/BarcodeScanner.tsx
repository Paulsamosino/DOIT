import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  BrowserMultiFormatReader,
  Result,
  NotFoundException,
} from "@zxing/library";

interface BarcodeScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError?: (error: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  isOpen,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [codeReader] = useState(() => new BrowserMultiFormatReader());

  // Get available cameras and select the best one
  const initializeCamera = useCallback(async () => {
    try {
      // Clear previous errors
      setError("");
      console.log("Initializing camera...");

      // List all available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      console.log("Available cameras:", videoDevices);

      if (videoDevices.length === 0) {
        throw new Error("No cameras detected on this device");
      }

      // Prefer back camera for mobile devices if available
      const backCamera = videoDevices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("environment")
      );

      // Use back camera if found, otherwise use the first camera
      const deviceId = backCamera
        ? backCamera.deviceId
        : videoDevices[0].deviceId;
      return deviceId;
    } catch (err: any) {
      console.error("Error initializing camera:", err);
      setError(`Camera initialization error: ${err.message}`);
      if (onScanError) {
        onScanError(err.message || "Failed to initialize camera");
      }
      return null;
    }
  }, [onScanError]);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!videoRef.current || !isOpen) return;

    try {
      setIsScanning(true);
      setError("");

      console.log("Starting barcode scanner...");

      // Get the best camera device ID
      const deviceId = await initializeCamera();

      if (!deviceId) {
        throw new Error("Failed to get camera device");
      }

      console.log(`Using camera with ID: ${deviceId}`);

      // Use the selected camera device
      codeReader.decodeFromVideoDevice(
        deviceId, // Use the selected camera instead of null
        videoRef.current,
        (result: Result | null, error?: any) => {
          if (result) {
            console.log("Barcode detected:", result.getText());
            onScanSuccess(result.getText());
            onClose();
          }

          // Only log NotFoundException errors, show others to user
          if (error) {
            if (!(error instanceof NotFoundException)) {
              console.warn("Scan error:", error);
              setError(error.message || "Unknown scanning error");
              if (onScanError) {
                onScanError(error.message || "Unknown scanning error");
              }
            }
          }
        }
      );

      console.log("Barcode scanner started successfully");
    } catch (err: any) {
      console.error("Failed to start camera:", err);
      setError(`Camera error: ${err.message}. Please check permissions.`);
      setIsScanning(false);
      if (onScanError) {
        onScanError(err.message || "Failed to start camera");
      }
    }
  }, [
    codeReader,
    isOpen,
    onClose,
    onScanError,
    onScanSuccess,
    initializeCamera,
  ]);

  // Clean up when component unmounts or modal closes
  const stopScanning = useCallback(() => {
    console.log("Stopping barcode scanner...");
    setIsScanning(false);
    codeReader.reset();
    console.log("Barcode scanner stopped");
  }, [codeReader]);

  // Handle manual input as fallback
  const handleManualInput = () => {
    const input = prompt("Enter barcode/serial number manually:");
    if (input && input.trim()) {
      onScanSuccess(input.trim());
      onClose();
    }
  };

  // Start/stop scanning based on modal state
  useEffect(() => {
    console.log("Scanner modal state changed:", isOpen ? "open" : "closed");

    if (isOpen) {
      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanning();
      }, 500);

      return () => {
        clearTimeout(timer);
        stopScanning();
      };
    } else {
      stopScanning();
    }
  }, [isOpen, startScanning, stopScanning]);

  // Effect to handle component unmount
  useEffect(() => {
    return () => {
      console.log("Barcode scanner component unmounting, cleaning up...");
      codeReader.reset();
    };
  }, [codeReader]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Barcode Scanner</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => {
                setError("");
                startScanning();
              }}
              className="mt-2 text-xs text-red-600 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Video preview */}
        <div className="relative mb-4">
          <div className="w-full h-64 bg-black rounded-md overflow-hidden">
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              playsInline
              muted
            />
          </div>

          {/* Scanning overlay - redesigned for barcode scanning */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-blue-500 w-11/12 h-32 bg-transparent rounded-lg opacity-70">
              {/* Corners for visual guidance */}
              <div className="absolute -top-2 -left-2 w-5 h-5 border-t-4 border-l-4 border-blue-500 rounded-tl"></div>
              <div className="absolute -top-2 -right-2 w-5 h-5 border-t-4 border-r-4 border-blue-500 rounded-tr"></div>
              <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-4 border-l-4 border-blue-500 rounded-bl"></div>
              <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-4 border-r-4 border-blue-500 rounded-br"></div>

              {/* Center scanning line (thicker and more visible) */}
              <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
                <div
                  className="mx-auto h-1.5 bg-red-500 animate-pulse"
                  style={{ width: "calc(100% - 8px)", maxWidth: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Scanning indicator */}
          {isScanning && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
              Scanning...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleManualInput}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Enter Manually
          </button>

          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Position the barcode/QR code within the red scanning area.</p>
          <p>Ensure good lighting and hold the device steady.</p>
          <p>Supports QR codes, UPC, EAN, Code128, and more.</p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;

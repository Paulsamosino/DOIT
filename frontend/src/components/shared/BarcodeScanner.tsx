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
  const [scanResult, setScanResult] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [codeReader] = useState(() => new BrowserMultiFormatReader());
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleScan = useCallback(
    (result: string) => {
      setScanResult(result);
      onScanSuccess(result);
      setIsScanning(false);
      onClose();
    },
    [onScanSuccess, onClose]
  );

  const handleError = useCallback(
    (error: any) => {
      console.error("Barcode scan error:", error);
      const errorMessage = error?.message || "Failed to scan barcode";
      setError(errorMessage);
      if (onScanError) {
        onScanError(errorMessage);
      }
    },
    [onScanError]
  );

  const handleManualInput = () => {
    const input = prompt("Enter barcode/serial number manually:");
    if (input && input.trim()) {
      onScanSuccess(input.trim());
      onClose();
    }
  };
  const clearError = () => {
    setError("");
  };

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setAvailableCameras(videoDevices);

      // Auto-select the best camera
      if (videoDevices.length > 0) {
        // Try to find back camera first (for mobile)
        const backCamera = videoDevices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("environment")
        );

        if (backCamera) {
          setSelectedCamera(backCamera.deviceId);
        } else {
          // Use the first available camera (usually the default webcam)
          setSelectedCamera(videoDevices[0].deviceId);
        }
      }
    } catch (err) {
      console.error("Error getting cameras:", err);
      setError("Could not access cameras");
    }
  }, []);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setError("");

      // Get video stream with improved constraints for both mobile and desktop
      const constraints: MediaStreamConstraints = {
        video: selectedCamera
          ? {
              deviceId: { exact: selectedCamera },
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
            }
          : {
              facingMode: { ideal: "environment" }, // Fallback for mobile
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
            },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();

        // Start ZXing barcode detection
        codeReader.decodeFromVideoDevice(
          selectedCamera || null,
          videoRef.current,
          (result: Result | null, error?: any) => {
            if (result) {
              handleScan(result.getText());
            }
            if (error && !(error instanceof NotFoundException)) {
              console.warn("Scan error:", error);
            }
          }
        );
      }
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      setError(
        "Failed to start camera. Please check permissions and ensure camera is available."
      );
      handleError(err);
    }
  }, [selectedCamera, codeReader, handleScan, handleError]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    codeReader.reset();

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [codeReader, stream]);
  // Effect to start/stop scanning based on modal state
  useEffect(() => {
    if (isOpen) {
      getCameras();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, getCameras, stopScanning]);

  // Start scanning when camera is selected
  useEffect(() => {
    if (isOpen && selectedCamera) {
      startScanning();
    }
  }, [isOpen, selectedCamera, startScanning]);

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
              onClick={clearError}
              className="text-xs text-red-500 underline mt-1"
            >
              Try again
            </button>
          </div>
        )}
        {scanResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">Scanned: {scanResult}</p>
          </div>
        )}{" "}
        {/* Camera selection */}
        {availableCameras.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Camera:
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {availableCameras.map((camera, index) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* QR/Barcode Scanner */}
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
          </div>{" "}
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-red-500 w-3/4 h-20 bg-transparent rounded">
              <div className="w-full h-0.5 bg-red-500 animate-pulse absolute top-1/2 transform -translate-y-1/2"></div>
            </div>
          </div>
          {/* Scanning status */}
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
            className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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

import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { inventoryAPI } from "../services/api";
import { InventoryItem } from "../types";
import {
  formatDate,
  formatRelativeTime,
  getStatusBadgeClass,
} from "../utils/helpers";

const ResourceDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setItem(response.data.item);
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

  const handleDelete = async () => {
    if (!id || !item) return;

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

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || "Item not found"}
        </div>
        <div className="mt-4">
          <Link
            to="/admin/inventory"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
          >
            ← Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link to="/admin/inventory" className="hover:text-gray-700">
              Inventory
            </Link>
            <span>→</span>
            <span className="text-gray-900">
              {item.computerNameOrId || "Unnamed Device"}
            </span>
          </nav>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {item.computerNameOrId || "Unnamed Device"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {item.computerModel} • Serial: {item.serialNumber}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Link
            to={`/admin/inventory/edit/${item._id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
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
            Delete
          </button>
        </div>
      </div>

      {/* Status and Quick Info */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated {formatRelativeTime(item.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Device Name/ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.computerNameOrId || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Model</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.computerModel || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Serial Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {item.serialNumber || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Technical Specifications
            </h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Operating System
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.operatingSystem ? (
                    <>
                      {item.operatingSystem}
                      {item.osVersion && (
                        <span className="text-gray-500"> {item.osVersion}</span>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Processor</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.processor || "-"}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">RAM</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {item.ramSize || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Storage</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {item.storageSize || "-"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        {/* Location & Assignment */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Location & Assignment
            </h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Building</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.building || "-"}
                </dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Floor</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {item.floor || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Room</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {item.roomNameOrNumber || "-"}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Assigned To
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.assignedTo || "Unassigned"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Purchase & Warranty */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Purchase & Warranty
            </h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Purchase Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.purchaseDate ? formatDate(item.purchaseDate) : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Warranty Expiration
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {item.warrantyExpiration ? (
                    <span
                      className={
                        new Date(item.warrantyExpiration) < new Date()
                          ? "text-red-600"
                          : "text-gray-900"
                      }
                    >
                      {formatDate(item.warrantyExpiration)}
                      {new Date(item.warrantyExpiration) < new Date() &&
                        " (Expired)"}
                    </span>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {item.notes && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Additional Notes
            </h3>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {item.notes}
            </p>
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            System Information
          </h3>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(item.createdAt)}
                <span className="text-gray-500">
                  {" "}
                  ({formatRelativeTime(item.createdAt)})
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Last Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(item.updatedAt)}
                <span className="text-gray-500">
                  {" "}
                  ({formatRelativeTime(item.updatedAt)})
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <Link
          to="/admin/inventory"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Inventory
        </Link>
      </div>
    </div>
  );
};

export default ResourceDetailsPage;

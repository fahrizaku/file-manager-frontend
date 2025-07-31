import { useState } from "react";
import {
  Download,
  Trash2,
  Edit2,
  Calendar,
  FileText,
  AlertCircle,
  Square,
  CheckSquare,
} from "lucide-react";
import fileService from "../services/fileService";

export default function FileList({
  files,
  onFileDeleted,
  onFileUpdated,
  selectedFiles = [],
  onFileSelect,
  onFileDeselect,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState({});
  const [error, setError] = useState("");

  const handleDownload = async (file) => {
    setLoading((prev) => ({ ...prev, [file.id]: "downloading" }));
    try {
      await fileService.downloadFile(file.id, file.originalName);
    } catch (error) {
      setError(error.error || "Download failed");
    } finally {
      setLoading((prev) => ({ ...prev, [file.id]: false }));
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      return;
    }

    setLoading((prev) => ({ ...prev, [file.id]: "deleting" }));
    try {
      const result = await fileService.deleteFile(file.id);
      if (result.success) {
        if (onFileDeleted) onFileDeleted(file.id);
      } else {
        setError(result.error || "Delete failed");
      }
    } catch (error) {
      setError(error.error || "Delete failed");
    } finally {
      setLoading((prev) => ({ ...prev, [file.id]: false }));
    }
  };

  const startEdit = (file) => {
    setEditingId(file.id);
    setEditDescription(file.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDescription("");
  };

  const saveEdit = async (fileId) => {
    setLoading((prev) => ({ ...prev, [fileId]: "updating" }));
    try {
      const result = await fileService.updateFile(fileId, {
        description: editDescription,
      });
      if (result.success) {
        setEditingId(null);
        setEditDescription("");
        if (onFileUpdated) onFileUpdated(result.data);
      } else {
        setError(result.error || "Update failed");
      }
    } catch (error) {
      setError(error.error || "Update failed");
    } finally {
      setLoading((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const handleFileSelect = (file, isSelected) => {
    if (isSelected) {
      if (onFileSelect) onFileSelect(file);
    } else {
      if (onFileDeselect) onFileDeselect(file);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearError = () => setError("");

  const isFileSelected = (fileId) => {
    return selectedFiles.some((f) => f.id === fileId);
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No files uploaded yet</p>
        <p className="text-gray-400 text-sm">
          Upload your first file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 ml-3"
          >
            ×
          </button>
        </div>
      )}

      {/* Files Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => {
          const isSelected = isFileSelected(file.id);

          return (
            <div
              key={file.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                isSelected ? "border-primary bg-primary/5" : "border-gray-200"
              }`}
            >
              {/* File Header with Checkbox */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => handleFileSelect(file, !isSelected)}
                    className="flex-shrink-0 p-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>

                  <span className="text-2xl flex-shrink-0">
                    {fileService.getFileIcon(file.mimetype)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-medium text-gray-900 truncate"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {fileService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                {editingId === file.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Add description..."
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveEdit(file.id)}
                        disabled={loading[file.id]}
                        className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading[file.id] === "updating" ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {file.description || "No description"}
                  </p>
                )}
              </div>

              {/* File Info */}
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(file.createdAt)}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={loading[file.id]}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    <Download className="h-3 w-3" />
                    <span>
                      {loading[file.id] === "downloading"
                        ? "Downloading..."
                        : "Download"}
                    </span>
                  </button>
                </div>

                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(file)}
                    disabled={loading[file.id] || editingId === file.id}
                    className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50"
                    title="Edit description"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    disabled={loading[file.id]}
                    className="p-1 text-gray-500 hover:text-red-600 disabled:opacity-50"
                    title="Delete file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

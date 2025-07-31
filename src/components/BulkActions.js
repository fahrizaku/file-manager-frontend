import { useState } from "react";
import {
  Download,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Archive,
} from "lucide-react";
import fileService from "../services/fileService";

export default function BulkActions({
  selectedFiles,
  allFiles,
  onFilesDeleted,
  onClearSelection,
  onSelectAll,
  onDeselectAll,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCount = selectedFiles.length;
  const allSelected =
    selectedFiles.length === allFiles.length && allFiles.length > 0;

  const handleBulkDownload = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const fileIds = selectedFiles.map((file) => file.id);
      const zipFilename = `files-${Date.now()}.zip`;

      await fileService.bulkDownloadFiles(fileIds, zipFilename);
      setSuccess(`${selectedFiles.length} files downloaded as ZIP`);

      // Auto-hide success message
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.error || "Download failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedFiles.length} selected files? This action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const fileIds = selectedFiles.map((file) => file.id);
      const result = await fileService.bulkDeleteFiles(fileIds);

      if (result.success) {
        setSuccess(result.message);
        if (onFilesDeleted) onFilesDeleted(fileIds);
        if (onClearSelection) onClearSelection();

        // Auto-hide success message
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || "Delete failed");
      }
    } catch (error) {
      setError(error.error || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      if (onDeselectAll) onDeselectAll();
    } else {
      if (onSelectAll) onSelectAll();
    }
  };

  const clearError = () => setError("");
  const clearSuccess = () => setSuccess("");

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 ml-2"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
          <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-green-800">{success}</p>
          </div>
          <button
            onClick={clearSuccess}
            className="text-green-400 hover:text-green-600 ml-2"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Bulk Actions Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} of {allFiles.length} files selected
            </span>
          </div>

          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear selection
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBulkDownload}
            disabled={loading || selectedCount === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Archive className="h-4 w-4" />
            )}
            <span>Download ZIP</span>
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={loading || selectedCount === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>Delete Selected</span>
          </button>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Total size:</span>
              <span className="bg-gray-100 px-2 py-1 rounded">
                {fileService.formatFileSize(
                  selectedFiles.reduce((total, file) => total + file.size, 0)
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">File types:</span>
              <div className="flex space-x-1">
                {getUniqueFileTypes(selectedFiles).map((type, index) => (
                  <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Files Preview */}
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-2">
              <span className="font-medium">Selected files:</span>
            </div>
            <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
              <div className="grid gap-1">
                {selectedFiles.slice(0, 10).map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center space-x-2 truncate">
                      <span>{fileService.getFileIcon(file.mimetype)}</span>
                      <span className="truncate">{file.originalName}</span>
                    </span>
                    <span className="text-gray-400 ml-2 flex-shrink-0">
                      {fileService.formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
                {selectedFiles.length > 10 && (
                  <div className="text-xs text-gray-400 mt-1 text-center">
                    ... and {selectedFiles.length - 10} more files
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleSelectAll()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={onClearSelection}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear Selection
            </button>
          </div>
          <div className="text-gray-500">Tip: Shift+Click to select range</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get unique file types
function getUniqueFileTypes(files) {
  const types = files.map((file) => {
    if (!file.mimetype) return "Unknown";

    if (file.mimetype.startsWith("image/")) return "Images";
    if (file.mimetype.startsWith("video/")) return "Videos";
    if (file.mimetype.startsWith("audio/")) return "Audio";
    if (file.mimetype.includes("pdf")) return "PDF";
    if (file.mimetype.includes("word") || file.mimetype.includes("document"))
      return "Documents";
    if (
      file.mimetype.includes("excel") ||
      file.mimetype.includes("spreadsheet")
    )
      return "Spreadsheets";
    if (
      file.mimetype.includes("powerpoint") ||
      file.mimetype.includes("presentation")
    )
      return "Presentations";
    if (file.mimetype.includes("zip") || file.mimetype.includes("rar"))
      return "Archives";
    if (file.mimetype.includes("text/")) return "Text";
    return "Other";
  });

  return [...new Set(types)].slice(0, 3); // Show max 3 types
}

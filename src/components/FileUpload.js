import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import fileService from "../services/fileService";

export default function FileUpload({ onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [batchDescription, setBatchDescription] = useState("");
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      // If multiple files, enable bulk mode
      if (acceptedFiles.length > 1) {
        setBulkMode(true);
        setSelectedFiles(acceptedFiles);
        return;
      }

      // Single file upload
      const file = acceptedFiles[0];
      setUploading(true);
      setError("");
      setUploadProgress(0);

      try {
        const result = await fileService.uploadFile(file, batchDescription);
        if (result.success) {
          setBatchDescription("");
          if (onUploadSuccess) onUploadSuccess(result.data);
        } else {
          setError(result.error || "Upload failed");
          if (onUploadError) onUploadError(result.error);
        }
      } catch (error) {
        const errorMessage = error.error || "Upload failed";
        setError(errorMessage);
        if (onUploadError) onUploadError(errorMessage);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [batchDescription, onUploadSuccess, onUploadError]
  );

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError("");
    setUploadProgress(0);
    setUploadResults(null);

    try {
      const result = await fileService.bulkUploadFiles(
        selectedFiles,
        batchDescription
      );

      if (result.success) {
        setUploadResults(result.data);
        setBatchDescription("");
        setSelectedFiles([]);
        setBulkMode(false);

        // Notify parent about successful uploads
        if (
          result.data &&
          result.data.uploaded &&
          result.data.uploaded.length > 0
        ) {
          if (onUploadSuccess) onUploadSuccess(result.data.uploaded);
        }
      } else {
        setError(result.error || "Bulk upload failed");
        if (onUploadError) onUploadError(result.error);
      }
    } catch (error) {
      const errorMessage = error.error || "Bulk upload failed";
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const cancelBulkMode = () => {
    setBulkMode(false);
    setSelectedFiles([]);
    setUploadResults(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10485760, // 10MB per file
    accept: {
      "*/*": [], // Accept all file types
    },
  });

  const clearError = () => setError("");
  const clearResults = () => setUploadResults(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Area */}
      {!bulkMode && (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary hover:bg-gray-50"
            }
            ${uploading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload
                className={`h-12 w-12 ${
                  isDragActive ? "text-primary" : "text-gray-400"
                }`}
              />
            </div>

            {uploading ? (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  Uploading...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">{uploadProgress}%</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive
                    ? "Drop the files here"
                    : "Drag & drop files here"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Single file or multiple files for bulk upload (max 10MB each)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Upload Mode */}
      {bulkMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-blue-900">
              Bulk Upload Mode - {selectedFiles.length} files selected
            </h3>
            <button
              onClick={cancelBulkMode}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Selected Files List */}
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded border"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({fileService.formatFileSize(file.size)})
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Bulk Upload Button */}
          <button
            onClick={handleBulkUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading
              ? "Uploading..."
              : `Upload ${selectedFiles.length} Files`}
          </button>
        </div>
      )}

      {/* Batch Description Input */}
      <div className="mt-4">
        <label
          htmlFor="batchDescription"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {bulkMode
            ? "Batch Description (applied to all files)"
            : "Description (optional)"}
        </label>
        <textarea
          id="batchDescription"
          value={batchDescription}
          onChange={(e) => setBatchDescription(e.target.value)}
          placeholder={
            bulkMode
              ? "Add a description for all files..."
              : "Add a description for your file..."
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows={3}
          disabled={uploading}
        />
      </div>

      {/* Upload Results */}
      {uploadResults && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Bulk Upload Results
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {uploadResults.summary?.successful || 0} files uploaded
                  successfully
                  {uploadResults.summary?.failed > 0 &&
                    `, ${uploadResults.summary.failed} failed`}
                </p>
                {uploadResults.errors && uploadResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-red-600 font-medium">Errors:</p>
                    {uploadResults.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-600">
                        • {error.filename}: {error.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={clearResults}
              className="text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 ml-3"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

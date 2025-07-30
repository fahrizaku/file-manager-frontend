import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, AlertCircle } from "lucide-react";
import fileService from "../services/fileService";

export default function FileUpload({ onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setError("");
      setUploadProgress(0);

      try {
        const result = await fileService.uploadFile(file, description);
        if (result.success) {
          setDescription("");
          onUploadSuccess && onUploadSuccess(result.data);
        } else {
          setError(result.error || "Upload failed");
          onUploadError && onUploadError(result.error);
        }
      } catch (error) {
        const errorMessage = error.error || "Upload failed";
        setError(errorMessage);
        onUploadError && onUploadError(errorMessage);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [description, onUploadSuccess, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 10485760, // 10MB
  });

  const clearError = () => setError("");

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
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
              <p className="text-lg font-medium text-gray-700">Uploading...</p>
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
                  ? "Drop the file here"
                  : "Drag & drop a file here"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to select a file (max 10MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description Input */}
      <div className="mt-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for your file..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows={3}
          disabled={uploading}
        />
      </div>

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

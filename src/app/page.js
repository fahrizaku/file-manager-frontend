"use client";

import { useState, useEffect } from "react";
import { RefreshCw, FolderOpen, CheckCircle } from "lucide-react";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import fileService from "../services/fileService";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  // Load all files from API
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fileService.getAllFiles();

      if (result.success) {
        setFiles(result.data || []);
      } else {
        setError(result.error || "Failed to load files");
      }
    } catch (error) {
      setError(error.error || "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  // Handle successful file upload
  const handleUploadSuccess = (newFile) => {
    setFiles((prev) => [newFile, ...prev]);
    showNotification("File uploaded successfully!");
  };

  // Handle upload error
  const handleUploadError = (error) => {
    setError(error);
  };

  // Handle file deletion
  const handleFileDeleted = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    showNotification("File deleted successfully!");
  };

  // Handle file update
  const handleFileUpdated = (updatedFile) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === updatedFile.id ? updatedFile : file))
    );
    showNotification("File updated successfully!");
  };

  // Show temporary notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Clear error message
  const clearError = () => setError("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FolderOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">
                File Management
              </h1>
            </div>

            <button
              onClick={loadFiles}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {notification && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            <p className="text-sm text-green-800">{notification}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
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

        <div className="space-y-8">
          {/* Upload Section */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Upload New File
              </h2>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          </section>

          {/* Files Section */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Files{" "}
                  {files.length > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      ({files.length} file{files.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </h2>
              </div>

              {loading && files.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">Loading files...</p>
                </div>
              ) : (
                <FileList
                  files={files}
                  onFileDeleted={handleFileDeleted}
                  onFileUpdated={handleFileUpdated}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Simple File Management System - Built with Next.js & Hono
          </p>
        </div>
      </footer>
    </div>
  );
}

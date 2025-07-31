import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

class FileService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
    });
  }

  // Get all files
  async getAllFiles() {
    try {
      const response = await this.api.get("/files");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get file by ID
  async getFileById(id) {
    try {
      const response = await this.api.get(`/files/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload single file
  async uploadFile(file, description = "") {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (description) {
        formData.append("description", description);
      }

      const response = await this.api.post("/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk upload files
  async bulkUploadFiles(files, batchDescription = "") {
    try {
      const formData = new FormData();

      // Add all files to form data with array notation
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      if (batchDescription) {
        formData.append("batchDescription", batchDescription);
      }

      const response = await this.api.post("/files/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Bulk Upload Progress: ${percentCompleted}%`);
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update file metadata
  async updateFile(id, data) {
    try {
      const response = await this.api.put(`/files/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete single file
  async deleteFile(id) {
    try {
      const response = await this.api.delete(`/files/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Download single file
  async downloadFile(id, filename) {
    try {
      const response = await this.api.get(`/files/${id}/download`, {
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: "File downloaded successfully" };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk download files as ZIP
  async bulkDownloadFiles(fileIds, zipFilename = null) {
    try {
      const response = await this.api.post(
        "/files/bulk-download",
        { fileIds },
        { responseType: "blob" }
      );

      // Generate filename if not provided
      const filename = zipFilename || `files-${Date.now()}.zip`;

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: "Files downloaded successfully as ZIP" };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bulk delete files
  async bulkDeleteFiles(fileIds) {
    try {
      const response = await this.api.post("/files/bulk-delete", { fileIds });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get download URL for single file
  getDownloadUrl(id) {
    return `${API_BASE_URL}/api/files/${id}/download`;
  }

  // Format file size to human readable
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Get file icon based on mimetype
  getFileIcon(mimetype) {
    if (!mimetype) return "📄";

    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.startsWith("video/")) return "🎥";
    if (mimetype.startsWith("audio/")) return "🎵";
    if (mimetype.includes("pdf")) return "📄";
    if (mimetype.includes("word") || mimetype.includes("document")) return "📝";
    if (mimetype.includes("excel") || mimetype.includes("spreadsheet"))
      return "📊";
    if (mimetype.includes("powerpoint") || mimetype.includes("presentation"))
      return "📊";
    if (
      mimetype.includes("zip") ||
      mimetype.includes("rar") ||
      mimetype.includes("archive")
    )
      return "📦";
    if (mimetype.includes("text/")) return "📄";
    return "📄";
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error:
          error.response.data?.error ||
          error.response.data?.message ||
          "Server error",
        status: error.response.status,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: "Network error - please check your connection",
        status: 0,
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
        status: 0,
      };
    }
  }
}

// Export as default instance
const fileService = new FileService();
export default fileService;

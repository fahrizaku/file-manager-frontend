# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **File Management System Frontend** built with Next.js 15. It provides a web interface for uploading, managing, downloading, and deleting files with support for both single and bulk operations.

## Architecture

### Application Structure

```
src/
├── app/
│   ├── page.js          # Main page (client component, state management)
│   ├── layout.js        # Root layout with fonts
│   └── globals.css      # Tailwind base styles
├── components/
│   ├── FileUpload.js    # Drag & drop upload with bulk support
│   ├── FileList.js      # File grid display with actions
│   └── BulkActions.js   # Bulk operations (download ZIP, delete)
└── services/
    └── fileService.js   # API client for backend communication
```

### Key Architectural Patterns

1. **State Management**: Centralized in `page.js` (main component)
   - File list state managed at top level
   - Selection state for bulk operations
   - Notification and error states
   - Child components receive data via props and communicate via callbacks

2. **API Communication**:
   - All API calls go through `fileService.js` (singleton pattern)
   - Base URL: `http://localhost:3001/api` (configurable via `API_BASE_URL` env var)
   - Handles errors consistently and returns normalized responses
   - Supports FormData for file uploads with progress tracking

3. **Component Communication Flow**:
   ```
   page.js (state owner)
     ├─> FileUpload (onUploadSuccess, onUploadError callbacks)
     ├─> BulkActions (onFilesDeleted, onClearSelection callbacks)
     └─> FileList (onFileDeleted, onFileUpdated, onFileSelect callbacks)
   ```

4. **File Selection System**:
   - Files can be individually selected via checkbox
   - Selected files stored as array in parent component
   - BulkActions component only renders when selections exist
   - Selection state persists across updates/refreshes

### Backend Integration

The frontend expects a REST API backend at `localhost:3001` with these endpoints:

- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get single file
- `POST /api/files` - Upload single file (multipart/form-data)
- `POST /api/files/bulk-upload` - Upload multiple files
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete single file
- `POST /api/files/bulk-delete` - Delete multiple files
- `POST /api/files/bulk-download` - Download multiple files as ZIP
- `GET /api/files/:id/download` - Download single file

## Development Commands

```bash
# Development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Variables

Create `.env.local` for local development:

```bash
API_BASE_URL=http://localhost:3001
```

If not set, defaults to `http://localhost:3001`.

## Code Conventions

1. **Client Components**: All components use `"use client"` directive (required for interactivity)
2. **State Management**: Use React hooks (useState, useEffect, useCallback)
3. **Styling**: Tailwind CSS utility classes with custom primary color
4. **Icons**: Lucide React for consistent iconography
5. **File Size Formatting**: Use `fileService.formatFileSize()` helper
6. **File Icons**: Use `fileService.getFileIcon()` for mimetype-based icons
7. **Error Handling**: All API calls wrapped in try-catch with user-friendly messages

## Important Implementation Details

### File Upload

- **Single Upload**: Automatically triggers on single file drop
- **Bulk Upload**: Multi-file drop enters "bulk mode" requiring explicit confirmation
- **Max File Size**: 10MB per file (enforced by react-dropzone)
- **Description**: Optional field applied to all files in bulk upload

### State Updates

When files are uploaded/deleted/updated, the parent component (`page.js`) must update its state. Components use callbacks:

- Upload: `onUploadSuccess(newFiles)` - pass uploaded file(s) to parent
- Delete: `onFileDeleted(fileId)` - notify parent to remove from list
- Update: `onFileUpdated(updatedFile)` - notify parent to replace in list

### Bulk Operations

- Files must be selected first (checkbox in FileList)
- BulkActions component appears when selections exist
- Bulk download creates ZIP file with timestamp
- Bulk delete requires confirmation dialog
- After bulk operations, selection is automatically cleared

## Testing the Application

1. Start the backend API server (must be running on port 3001)
2. Run `npm run dev` to start frontend
3. Visit `http://localhost:3000`
4. Test upload, download, edit, delete operations
5. Test bulk operations by selecting multiple files

## Common Tasks

### Adding a New Feature

1. If it requires API communication, add method to `fileService.js`
2. Add UI component in `src/components/`
3. Wire up state management in `page.js`
4. Add callbacks for parent-child communication

### Modifying API Endpoints

Update the corresponding methods in `src/services/fileService.js`. All API calls are centralized there.

### Changing File Size Limits

Update the `maxSize` prop in the `useDropzone` hook in `FileUpload.js` (currently 10485760 bytes = 10MB).

### Styling Changes

This project uses Tailwind CSS 4. Modify `src/app/globals.css` for global styles or use utility classes directly in components. The custom primary color is used throughout for brand consistency.

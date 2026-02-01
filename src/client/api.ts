import { ScanResponse, UpdateExifResponse } from './types';

// In development, Vite proxy handles /api routes
// In production, API is served from the same origin
const API_BASE_URL = '';

export const api = {
  async scanFolder(folderPath: string): Promise<ScanResponse> {
    const response = await fetch(`${API_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderPath }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scan folder');
    }

    return response.json();
  },

  getImageUrl(filePath: string): string {
    // Encode the path, handling Windows paths with backslashes
    // encodeURIComponent will convert backslashes to %5C and colons to %3A
    const encodedPath = encodeURIComponent(filePath);
    return `${API_BASE_URL}/api/image/${encodedPath}`;
  },

  async updateExif(filePaths: string[], folderPath: string): Promise<UpdateExifResponse> {
    const response = await fetch(`${API_BASE_URL}/api/update-exif`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePaths, folderPath }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update EXIF');
    }

    return response.json();
  },
};

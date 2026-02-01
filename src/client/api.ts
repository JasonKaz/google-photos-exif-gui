import { ScanResponse, UpdateExifResponse, GetImagesResponse } from './types';

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

  async getImages(filePaths: string[]): Promise<GetImagesResponse> {
    const response = await fetch(`${API_BASE_URL}/api/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePaths }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get images');
    }

    return response.json();
  },

  async updateExif(filePaths: string[], folderPath: string, timezoneOffset: number): Promise<UpdateExifResponse> {
    const response = await fetch(`${API_BASE_URL}/api/update-exif`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePaths, folderPath, timezoneOffset }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update EXIF');
    }

    return response.json();
  },
};

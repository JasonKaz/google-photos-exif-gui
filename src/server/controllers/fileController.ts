import express, { Request, Response } from 'express';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { updateExifMetadata } from '../../helpers/update-exif-metadata';
import { writeVideoCreationTime } from '../../helpers/write-video-creation-time';
import { readPhotoTakenTimeFromGoogleJson } from '../../helpers/read-photo-taken-time-from-google-json';
import { findSupportedMediaFiles } from '../../helpers/find-supported-media-files';
import { MediaFileInfo } from '../../models/media-file-info';

interface UpdateExifRequest {
  filePaths: string[];
  folderPath: string;
  timezoneOffset: number;
}

export const fileController = {
  async serveImage(req: express.Request, res: express.Response): Promise<void> {
    try {
      // Extract the path from the URL
      // req.originalUrl will be like "/api/image/C%3A%5CUsers%5C..."
      // or req.url might be "/image/C%3A%5CUsers%5C..." (without /api if mounted)
      let urlPath = req.originalUrl || req.url;
      
      // Remove query string
      urlPath = urlPath.split('?')[0];
      
      // Extract everything after /api/image/ or /image/
      const match = urlPath.match(/\/api\/image\/(.+)$/) || urlPath.match(/\/image\/(.+)$/);
      
      if (!match || !match[1]) {
        res.status(400).json({ error: 'Path parameter is required', url: urlPath });
        return;
      }
      
      const encodedPath = match[1];

      // Decode the path (it comes URL-encoded from the client)
      let filePath: string;
      try {
        filePath = decodeURIComponent(encodedPath);
      } catch (error) {
        // If decoding fails, try using the path as-is (might already be decoded)
        filePath = encodedPath;
      }
      
      if (!existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        console.error(`Encoded path: ${encodedPath}`);
        console.error(`Original URL: ${urlPath}`);
        res.status(404).json({ error: 'File not found', path: filePath });
        return;
      }

      // Determine MIME type based on extension
      const ext = filePath.toLowerCase().split('.').pop();
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'heic': 'image/heic',
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
      };

      const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);

      const fileBuffer = await readFile(filePath);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ error: 'Failed to serve image', details: error instanceof Error ? error.message : String(error) });
    }
  },

  async updateExif(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { filePaths, folderPath, timezoneOffset } = req.body as UpdateExifRequest;
      
      if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
        res.status(400).json({ error: 'filePaths array is required' });
        return;
      }

      if (!folderPath) {
        res.status(400).json({ error: 'folderPath is required' });
        return;
      }

      if (typeof timezoneOffset !== 'number' || isNaN(timezoneOffset)) {
        res.status(400).json({ error: 'timezoneOffset is required and must be a number' });
        return;
      }

      // Find all media files to get their MediaFileInfo
      const tempOutputDir = folderPath;
      const allMediaFiles = await findSupportedMediaFiles(folderPath, tempOutputDir);
      
      // Create a map for quick lookup
      const mediaFileMap = new Map<string, MediaFileInfo>();
      allMediaFiles.forEach(file => {
        mediaFileMap.set(file.mediaFilePath, file);
      });

      const results: Array<{ filePath: string; success: boolean; error?: string }> = [];
      const errorDir = folderPath; // Use same folder for errors in GUI mode

      for (const filePath of filePaths) {
        const mediaFile = mediaFileMap.get(filePath);
        if (!mediaFile) {
          results.push({ filePath, success: false, error: 'File not found in scanned files' });
          continue;
        }

        try {
          const photoTimeTaken = await readPhotoTakenTimeFromGoogleJson(mediaFile);
          if (!photoTimeTaken) {
            results.push({ filePath, success: false, error: 'No JSON metadata found' });
            continue;
          }

          // Check if file is MP4 - use writeVideoCreationTime for videos
          if (mediaFile.mediaFileExtension.toLowerCase() === '.mp4') {
            await writeVideoCreationTime(mediaFile.mediaFilePath, photoTimeTaken);
          } else {
            // For other files, use updateExifMetadata
            // Create a modified MediaFileInfo with the original path as output path for in-place update
            const fileInfoForUpdate: MediaFileInfo = {
              ...mediaFile,
              outputFilePath: mediaFile.mediaFilePath, // Update in place
              outputFileName: mediaFile.mediaFileName,
            };

            await updateExifMetadata(fileInfoForUpdate, photoTimeTaken, errorDir, timezoneOffset);
          }
          
          results.push({ filePath, success: true });
        } catch (error) {
          results.push({ 
            filePath, 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }

      res.json({ results });
    } catch (error) {
      console.error('Error updating EXIF:', error);
      res.status(500).json({ error: 'Failed to update EXIF', details: error instanceof Error ? error.message : String(error) });
    }
  },
};

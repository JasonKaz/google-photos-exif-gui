import express, { Request, Response } from 'express';
import { findSupportedMediaFiles } from '../../helpers/find-supported-media-files';
import { findJsonFilesRecursively } from '../../helpers/find-json-files-recursively';
import { readPhotoTakenTimeFromGoogleJson } from '../../helpers/read-photo-taken-time-from-google-json';
import { readExifMetadata } from '../../helpers/read-exif-metadata';
import { readVideoCreationTime } from '../../helpers/read-video-creation-time';
import { MediaFileInfo } from '../../models/media-file-info';

interface ScanRequest {
  folderPath: string;
}

interface FileComparisonInfo {
  mediaFileInfo: MediaFileInfo;
  exifDateTimeOriginal: string | null;
  jsonPhotoTakenTime: string | null;
  canUpdate: boolean;
}

export const scanController = {
  async scanFolder(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { folderPath } = req.body as ScanRequest;
      
      if (!folderPath) {
        res.status(400).json({ error: 'folderPath is required' });
        return;
      }

      // Use a temporary output directory for scanning (we won't actually copy files)
      const tempOutputDir = folderPath;
      const mediaFiles = await findSupportedMediaFiles(folderPath, tempOutputDir);

      const fileComparisons: FileComparisonInfo[] = [];
      const unmatchedFiles: MediaFileInfo[] = [];
      
      // Find all JSON files and check which ones don't have matching media files
      const allJsonFiles = await findJsonFilesRecursively(folderPath);
      const matchedJsonFiles = new Set<string>();
      
      // Track which JSON files are matched by media files
      for (const mediaFile of mediaFiles) {
        if (mediaFile.jsonFilePath && mediaFile.jsonFileExists) {
          matchedJsonFiles.add(mediaFile.jsonFilePath);
        }
      }
      
      // Find JSON files that don't match any media file
      const unmatchedJsonFiles = allJsonFiles.filter(jsonFilePath => !matchedJsonFiles.has(jsonFilePath));

      for (const mediaFile of mediaFiles) {
        const jsonPhotoTakenTime = await readPhotoTakenTimeFromGoogleJson(mediaFile);
        
        if (!jsonPhotoTakenTime) {
          unmatchedFiles.push(mediaFile);
          continue;
        }

        let exifDateTimeOriginal: string | null = null;
        if (mediaFile.supportsExif) {
          if (mediaFile.mediaFileExtension.toLowerCase() === '.mp4') {
            // For MP4 files, use ffprobe to read creation time
            exifDateTimeOriginal = await readVideoCreationTime(mediaFile.mediaFilePath);
          } else {
            exifDateTimeOriginal = await readExifMetadata(mediaFile.mediaFilePath);
          }
        }
        
        // Can update if: file supports EXIF but has no EXIF date
        // If EXIF date exists, we assume it's correct (even if it doesn't match JSON due to timezone differences)
        const canUpdate = mediaFile.supportsExif && !exifDateTimeOriginal;

        // Don't encode images here - they will be fetched on demand per page
        const fileComparison: FileComparisonInfo = {
          mediaFileInfo: mediaFile,
          exifDateTimeOriginal,
          jsonPhotoTakenTime,
          canUpdate,
        };
        
        fileComparisons.push(fileComparison);
      }

      res.json({
        files: fileComparisons,
        unmatchedFiles,
        unmatchedJsonFiles,
      });
    } catch (error) {
      console.error('Error scanning folder:', error);
      res.status(500).json({ error: 'Failed to scan folder', details: error instanceof Error ? error.message : String(error) });
    }
  },
};

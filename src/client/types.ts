import { MediaFileInfo } from '../models/media-file-info';

export interface FileComparisonInfo {
  mediaFileInfo: MediaFileInfo;
  exifDateTimeOriginal: string | null;
  jsonPhotoTakenTime: string | null;
  canUpdate: boolean;
}

export interface GetImagesResponse {
  images: Record<string, string | null>;
}

export interface ScanResponse {
  files: FileComparisonInfo[];
  unmatchedFiles: MediaFileInfo[];
  unmatchedJsonFiles: string[];
}

export interface UpdateExifResponse {
  results: Array<{
    filePath: string;
    success: boolean;
    error?: string;
  }>;
}

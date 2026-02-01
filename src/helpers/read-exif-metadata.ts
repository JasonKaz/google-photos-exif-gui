import { ExifDateTime, exiftool } from 'exiftool-vendored';
import { doesFileSupportExif } from './does-file-support-exif';
import { isNullOrUndefined } from './is-null-or-undefined';

export async function readExifMetadata(filePath: string): Promise<string | null> {
  if (!doesFileSupportExif(filePath)) {
    return null;
  }

  try {
    const readResult = await exiftool.read(filePath);
    if (isNullOrUndefined(readResult.DateTimeOriginal)) {
      return null;
    }

    // DateTimeOriginal can be a string or Date object
    const dateTimeOriginal = readResult.DateTimeOriginal;

    if (typeof dateTimeOriginal === 'string') {
      // Parse and convert to ISO format
      const date = new Date(dateTimeOriginal);
      return date.toISOString();
    } else if (dateTimeOriginal instanceof Date) {
      return `${dateTimeOriginal.toISOString()}`;
    } else if (dateTimeOriginal instanceof ExifDateTime) {
      return new Date(dateTimeOriginal.toEpochSeconds() * 1000).toISOString();
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

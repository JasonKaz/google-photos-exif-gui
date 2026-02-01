import { exiftool } from 'exiftool-vendored';
import { doesFileSupportExif } from './does-file-support-exif';
import { promises as fspromises } from 'fs';
import { MediaFileInfo } from '../models/media-file-info';
import { resolve } from 'path';
import { convertUtcToLocalTime } from './convert-utc-to-local-time';

const { unlink, copyFile } = fspromises;

export async function updateExifMetadata(
  fileInfo: MediaFileInfo, 
  timeTakenUtc: string, 
  errorDir: string,
  timezoneOffsetHours: number
): Promise<void> {
  if (!doesFileSupportExif(fileInfo.outputFilePath)) {
    return;
  }

  const hoursWithPadding = Math.abs(timezoneOffsetHours).toString().padStart(2, '0');
  const tzOffset = `${timezoneOffsetHours>0?'+':'-'}${hoursWithPadding}:00`;
  const utcWithTz = `${timeTakenUtc}${tzOffset}`;

  try {
    // Convert UTC timestamp to local time using the timezone offset
    //const localTime = convertUtcToLocalTime(timeTakenUtc, timezoneOffsetHours);
    /*console.log('updating exif', {
      DateTimeOriginal: timeTakenUtc,
      utcWithTz,
      TimeZoneOffset: tzOffset,
      zone: `UTC${timezoneOffsetHours>0?'+':''}${timezoneOffsetHours}`,
      TimeZone: tzOffset
    });*/
    
    await exiftool.write(fileInfo.outputFilePath, {
      DateTimeOriginal: utcWithTz,
    });
  
    await unlink(`${fileInfo.outputFilePath}_original`); // exiftool will rename the old file to {filename}_original, we can delete that

  } catch (error) {
    console.log('Error writing EXIF data', error);
    /*await copyFile(fileInfo.outputFilePath,  resolve(errorDir, fileInfo.mediaFileName));
    if (fileInfo.jsonFileExists && fileInfo.jsonFileName && fileInfo.jsonFilePath) {
      await copyFile(fileInfo.jsonFilePath, resolve(errorDir, fileInfo.jsonFileName));
    }*/
  }
}

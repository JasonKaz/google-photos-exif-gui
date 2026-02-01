/**
 * Converts a UTC timestamp to local time in a specific timezone.
 * @param utcTimestamp - ISO string of UTC timestamp (e.g., "2021-10-23T13:49:37.000Z")
 * @param timezoneOffsetHours - Timezone offset in hours from UTC (e.g., -5 for EST, +3 for EET)
 * @returns Local time formatted as "YYYY:MM:DD HH:MM:SS" (EXIF format)
 */
export function convertUtcToLocalTime(utcTimestamp: string, timezoneOffsetHours: number): string {
  const utcDate = new Date(utcTimestamp);
  
  // Convert UTC to local time by adding the timezone offset
  const localTime = new Date(utcDate.getTime() + (timezoneOffsetHours * 60 * 60 * 1000));
  //return localTime.getTime();
  
  // Format as EXIF DateTimeOriginal format: "YYYY:MM:DD HH:MM:SS"
  const year = localTime.getUTCFullYear();
  const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localTime.getUTCDate()).padStart(2, '0');
  const hours = String(localTime.getUTCHours()).padStart(2, '0');
  const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(localTime.getUTCSeconds()).padStart(2, '0');
  
  return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
  
}

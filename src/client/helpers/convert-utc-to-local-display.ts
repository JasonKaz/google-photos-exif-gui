/**
 * Converts a UTC timestamp to local time in a specific timezone.
 * Returns a formatted string for display.
 */
export function convertUtcToLocalDisplay(utcTimestamp: string | null, timezoneOffsetHours: number): string {
  if (!utcTimestamp) return 'N/A';
  try {
    const utcDate = new Date(utcTimestamp);
    // Convert UTC to local time by adding the timezone offset
    const localTime = new Date(utcDate.getTime() + (-timezoneOffsetHours * 60 * 60 * 1000));
    
    return localTime.toLocaleString();
  } catch {
    return 'N/A';
  }
}

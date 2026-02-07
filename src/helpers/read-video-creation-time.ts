import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Reads the creation time from a video file using ffprobe
 * @param filePath - Path to the video file
 * @returns Promise that resolves to the creation time string, or null if not found or on error
 */
export async function readVideoCreationTime(filePath: string): Promise<string | null> {
  try {
    // Get the project root by going up two levels from helpers directory
    // Works for both src/helpers/ (development) and lib/helpers/ (compiled)
    const projectRoot = join(__dirname, '../..');
    const ffprobePath = join(projectRoot, 'ffprobe.exe');
    
    // Build the ffprobe command
    const command = `"${ffprobePath}" -v quiet -show_entries format_tags=creation_time -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('ffprobe stderr:', stderr);
    }
    
    const creationTime = stdout.trim();
    return creationTime || null;
  } catch (error) {
    console.error('Error reading video creation time:', error);
    return null;
  }
}

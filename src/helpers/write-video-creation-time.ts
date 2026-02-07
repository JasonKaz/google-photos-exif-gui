import { exec } from 'child_process';
import { join, dirname, basename } from 'path';
import { promisify } from 'util';
import { promises as fspromises } from 'fs';

const execAsync = promisify(exec);
const { rename, unlink } = fspromises;

/**
 * Writes the creation time metadata to a video file using ffmpeg
 * @param filePath - Path to the video file to update
 * @param creationTime - Creation time in ISO format (e.g., "2025-02-07T11:13:00Z")
 * @returns Promise that resolves when the metadata has been written, or rejects on error
 */
export async function writeVideoCreationTime(filePath: string, creationTime: string): Promise<void> {
  try {
    // Get the project root by going up two levels from helpers directory
    // Works for both src/helpers/ (development) and lib/helpers/ (compiled)
    const projectRoot = join(__dirname, '../..');
    const ffmpegPath = join(projectRoot, 'ffmpeg.exe');
    
    // Create a temporary output file in the same directory as the input file
    const fileDir = dirname(filePath);
    const fileName = basename(filePath);
    const tempOutputPath = join(fileDir, `temp_${Date.now()}_${fileName}`);
    
    // Build the ffmpeg command
    // -c copy: copy streams without re-encoding
    // -movflags use_metadata_tags: use metadata tags for MP4
    // -metadata creation_time: set the creation time
    const command = `"${ffmpegPath}" -i "${filePath}" -c copy -movflags use_metadata_tags -metadata creation_time="${creationTime}" "${tempOutputPath}"`;
    
    const { stderr } = await execAsync(command);
    
    // ffmpeg outputs progress to stderr, so we only log if there's an actual error
    // (ffmpeg uses stderr for normal output, so we check for error patterns)
    if (stderr && stderr.includes('Error')) {
      console.error('ffmpeg stderr:', stderr);
      throw new Error(`ffmpeg error: ${stderr}`);
    }
    
    // Replace the original file with the updated one
    // First, create a backup name for the original
    const backupPath = `${filePath}.backup`;
    
    try {
      // Rename original to backup
      await rename(filePath, backupPath);
      // Rename temp file to original
      await rename(tempOutputPath, filePath);
      // Delete backup
      await unlink(backupPath);
    } catch (renameError) {
      // If rename fails, try to clean up temp file
      try {
        await unlink(tempOutputPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      throw renameError;
    }
  } catch (error) {
    console.error('Error writing video creation time:', error);
    throw error;
  }
}

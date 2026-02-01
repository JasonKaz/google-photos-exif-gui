import express, { Request, Response } from 'express';
import { readFile } from 'fs/promises';

interface GetImagesRequest {
  filePaths: string[];
}

export const imageController = {
  async getImages(req: express.Request, res: express.Response): Promise<void> {
    try {
      const { filePaths } = req.body as GetImagesRequest;
      
      if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
        res.status(400).json({ error: 'filePaths array is required' });
        return;
      }

      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.heic'];
      const images: Record<string, string | null> = {};

      // Process images in parallel
      await Promise.all(
        filePaths.map(async (filePath) => {
          try {
            const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
            const isImage = imageExtensions.includes(ext);
            
            if (!isImage) {
              images[filePath] = null;
              return;
            }

            const imageBuffer = await readFile(filePath);
            // Determine MIME type based on extension
            const mimeTypes: Record<string, string> = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.gif': 'image/gif',
              '.heic': 'image/heic',
            };
            const mimeType = mimeTypes[ext] || 'image/jpeg';
            images[filePath] = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
          } catch (error) {
            // If image can't be read, set to null
            console.error(`Failed to read image: ${filePath}`, error);
            images[filePath] = null;
          }
        })
      );

      res.json({ images });
    } catch (error) {
      console.error('Error getting images:', error);
      res.status(500).json({ error: 'Failed to get images', details: error instanceof Error ? error.message : String(error) });
    }
  },
};

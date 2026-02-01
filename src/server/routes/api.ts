import { Router } from 'express';
import { scanController } from '../controllers/scanController';
import { fileController } from '../controllers/fileController';
import { imageController } from '../controllers/imageController';

export const apiRouter = Router();

apiRouter.post('/scan', scanController.scanFolder);
apiRouter.post('/images', imageController.getImages);
// Use a catch-all route for images - must be last
apiRouter.get('/image/*', fileController.serveImage);
apiRouter.post('/update-exif', fileController.updateExif);

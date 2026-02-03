import { Config } from './models/config-models';

export const CONFIG: Config = {
  supportedMediaFileTypes: [
    { extension: '.jpeg', supportsExif: true },
    { extension: '.jpg',  supportsExif: true },
    { extension: '.heic', supportsExif: true },
    { extension: '.gif',  supportsExif: true },
    { extension: '.mp4',  supportsExif: false },
    { extension: '.png',  supportsExif: true },
    { extension: '.avi',  supportsExif: false },
    { extension: '.mov',  supportsExif: true },
    { extension: '.m4v',  supportsExif: true },
    { extension: '.webm',  supportsExif: false },
  ],
};

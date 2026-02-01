import { getAllFilesRecursively } from './get-all-files-recursively';
import { extname } from 'path';

export async function findJsonFilesRecursively(dirToSearch: string): Promise<string[]> {
  const allFiles = await getAllFilesRecursively(dirToSearch);
  return allFiles.filter(filePath => {
    const extension = extname(filePath).toLowerCase();
    return extension === '.json';
  });
}

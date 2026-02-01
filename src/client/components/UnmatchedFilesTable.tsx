import React from 'react';
import { MediaFileInfo } from '../../models/media-file-info';

interface UnmatchedFilesTableProps {
  files: MediaFileInfo[];
}

export function UnmatchedFilesTable({ files }: UnmatchedFilesTableProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f5f5f5' }}>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>File Path</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Extension</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Supports EXIF</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr key={file.mediaFilePath}>
            <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
              {file.mediaFilePath}
            </td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
              {file.mediaFileExtension}
            </td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
              {file.supportsExif ? 'Yes' : 'No'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

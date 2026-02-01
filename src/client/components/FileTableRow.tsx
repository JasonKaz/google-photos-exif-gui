import React from 'react';
import { FileComparisonInfo } from '../types';

interface FileTableRowProps {
  fileInfo: FileComparisonInfo;
  isSelected: boolean;
  onToggle: () => void;
}

export function FileTableRow({ fileInfo, isSelected, onToggle }: FileTableRowProps) {
  // Use base64 image data directly from the file info
  const imageUrl = fileInfo.imageBase64 || '';
  
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getStatusText = (): string => {
    if (!fileInfo.mediaFileInfo.supportsExif) {
      return 'Does not support EXIF';
    }
    if (!fileInfo.exifDateTimeOriginal) {
      return 'Media has no EXIF date';
    }
    if (fileInfo.matches) {
      return 'Match';
    }
    return 'Mismatch';
  };

  const getStatusColor = (): string => {
    if (!fileInfo.mediaFileInfo.supportsExif) {
      return '#999';
    }
    if (!fileInfo.exifDateTimeOriginal) {
      return '#ff9800';
    }
    if (fileInfo.matches) {
      return '#4CAF50';
    }
    return '#f44336';
  };

  return (
    <tr style={{ backgroundColor: isSelected ? '#e3f2fd' : 'white' }}>
      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          disabled={!fileInfo.canUpdate}
          style={{ cursor: fileInfo.canUpdate ? 'pointer' : 'not-allowed' }}
        />
      </td>
      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={fileInfo.mediaFileInfo.mediaFileName}
            style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span style={{ fontSize: '12px', color: '#999' }}>No preview</span>
        )}
      </td>
      <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
        {fileInfo.mediaFileInfo.mediaFilePath}
      </td>
      <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
        {fileInfo.mediaFileInfo.jsonFilePath || 'N/A'}
      </td>
      <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
        {formatDate(fileInfo.exifDateTimeOriginal)}
      </td>
      <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
        {formatDate(fileInfo.jsonPhotoTakenTime)}
      </td>
      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
        <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>
          {getStatusText()}
        </span>
      </td>
    </tr>
  );
}

import React from 'react';
import { FileComparisonInfo } from '../types';
import { convertUtcToLocalDisplay } from '../helpers/convert-utc-to-local-display';

interface FileTableRowProps {
  fileInfo: FileComparisonInfo;
  isSelected: boolean;
  onToggle: () => void;
  imageBase64?: string | null;
  timezoneOffset: number;
}

export function FileTableRow({ fileInfo, isSelected, onToggle, imageBase64, timezoneOffset }: FileTableRowProps) {
  // Use base64 image data passed as prop
  const imageUrl = imageBase64 || '';
  
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
      return 'No EXIF date';
    }
    return 'Has EXIF date';
  };

  const getStatusColor = (): string => {
    if (!fileInfo.mediaFileInfo.supportsExif) {
      return '#999';
    }
    if (!fileInfo.exifDateTimeOriginal) {
      return '#ff9800';
    }
    return '#4CAF50';
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
        <div>{formatDate(fileInfo.jsonPhotoTakenTime)}</div>
        {fileInfo.jsonPhotoTakenTime && (
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
            Offset: {convertUtcToLocalDisplay(fileInfo.jsonPhotoTakenTime, timezoneOffset)}
          </div>
        )}
      </td>
      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
        <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>
          {getStatusText()}
        </span>
      </td>
    </tr>
  );
}

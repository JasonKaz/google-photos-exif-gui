import React from 'react';
import { FileComparisonInfo } from '../types';
import { FileTableRow } from './FileTableRow';

interface FileTableProps {
  files: FileComparisonInfo[];
  selectedFiles: Set<string>;
  onToggleFile: (filePath: string) => void;
  imageMap: Record<string, string | null>;
  timezoneOffset: number;
  showImagePreviews: boolean;
}

export function FileTable({ files, selectedFiles, onToggleFile, imageMap, timezoneOffset, showImagePreviews }: FileTableProps) {
  if (files.length === 0) {
    return <div style={{ marginTop: '20px' }}>No files found with matching JSON metadata.</div>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Files with JSON Metadata ({files.length})</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Select</th>
            {showImagePreviews && (
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Image</th>
            )}
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>File Path</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>JSON Metadata</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Image DateTimeOriginal</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>JSON Photo Taken Time</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {files.map((fileInfo) => (
            <FileTableRow
              key={fileInfo.mediaFileInfo.mediaFilePath}
              fileInfo={fileInfo}
              isSelected={selectedFiles.has(fileInfo.mediaFileInfo.mediaFilePath)}
              onToggle={() => onToggleFile(fileInfo.mediaFileInfo.mediaFilePath)}
              imageBase64={imageMap[fileInfo.mediaFileInfo.mediaFilePath] || null}
              timezoneOffset={timezoneOffset}
              showImagePreviews={showImagePreviews}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

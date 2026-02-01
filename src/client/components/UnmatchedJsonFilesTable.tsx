import React from 'react';

interface UnmatchedJsonFilesTableProps {
  jsonFiles: string[];
}

export function UnmatchedJsonFilesTable({ jsonFiles }: UnmatchedJsonFilesTableProps) {
  if (jsonFiles.length === 0) {
    return null;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f5f5f5' }}>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>JSON File Path</th>
        </tr>
      </thead>
      <tbody>
        {jsonFiles.map((jsonFilePath) => (
          <tr key={jsonFilePath}>
            <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '12px' }}>
              {jsonFilePath}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

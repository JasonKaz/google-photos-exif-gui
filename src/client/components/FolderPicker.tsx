import React, { useState } from 'react';

interface FolderPickerProps {
  onScan: (folderPath: string) => void;
  disabled?: boolean;
}

export function FolderPicker({ onScan, disabled }: FolderPickerProps) {
  const [folderPath, setFolderPath] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderPath.trim()) {
      onScan(folderPath.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="folderPath" style={{ fontWeight: 'bold' }}>
          Folder Path:
        </label>
        <input
          id="folderPath"
          type="text"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="Enter folder path (e.g., ./sample-data)"
          disabled={disabled}
          style={{ 
            flex: 1, 
            padding: '8px', 
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button 
          type="submit" 
          disabled={disabled || !folderPath.trim()}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#2196F3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: disabled || !folderPath.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          Scan
        </button>
      </div>
    </form>
  );
}

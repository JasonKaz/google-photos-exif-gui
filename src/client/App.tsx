import React, { useState } from 'react';
import { FolderPicker } from './components/FolderPicker';
import { FileTable } from './components/FileTable';
import { UnmatchedFilesTable } from './components/UnmatchedFilesTable';
import { UnmatchedJsonFilesTable } from './components/UnmatchedJsonFilesTable';
import { FileComparisonInfo } from './types';
import { MediaFileInfo } from '../models/media-file-info';

export function App() {
  const [folderPath, setFolderPath] = useState<string>('');
  const [files, setFiles] = useState<FileComparisonInfo[]>([]);
  const [unmatchedFiles, setUnmatchedFiles] = useState<MediaFileInfo[]>([]);
  const [unmatchedJsonFiles, setUnmatchedJsonFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<boolean>(false);

  const handleScan = async (path: string) => {
    setFolderPath(path);
    setLoading(true);
    setError(null);
    setSelectedFiles(new Set());

    try {
      const { api } = await import('./api');
      const response = await api.scanFolder(path);
      setFiles(response.files);
      setUnmatchedFiles(response.unmatchedFiles);
      setUnmatchedJsonFiles(response.unmatchedJsonFiles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan folder');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFile = (filePath: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filePath)) {
      newSelected.delete(filePath);
    } else {
      newSelected.add(filePath);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    const updatableFiles = files.filter(f => f.canUpdate);
    if (selectedFiles.size === updatableFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(updatableFiles.map(f => f.mediaFileInfo.mediaFilePath)));
    }
  };

  const handleUpdate = async () => {
    if (selectedFiles.size === 0 || !folderPath) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const { api } = await import('./api');
      const filePaths = Array.from(selectedFiles);
      const response = await api.updateExif(filePaths, folderPath);

      // Check for failures
      const failures = response.results.filter(r => !r.success);
      if (failures.length > 0) {
        const errorMessages = failures.map(f => `${f.filePath}: ${f.error || 'Unknown error'}`).join('\n');
        setError(`Some files failed to update:\n${errorMessages}`);
      } else {
        setError(null);
        // Re-scan to refresh the data
        await handleScan(folderPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update EXIF');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Google Photos EXIF Tool - GUI Mode</h1>
      
      <FolderPicker onScan={handleScan} disabled={loading} />
      
      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap'
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: '20px' }}>Scanning folder...</div>
      )}

      {!loading && files.length > 0 && (
        <>
          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <button 
              onClick={handleSelectAll}
              style={{ marginRight: '10px', padding: '8px 16px' }}
            >
              {selectedFiles.size === files.filter(f => f.canUpdate).length ? 'Deselect All' : 'Select All'}
            </button>
            <button 
              onClick={handleUpdate}
              disabled={selectedFiles.size === 0 || updating}
              style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: selectedFiles.size === 0 || updating ? 'not-allowed' : 'pointer' }}
            >
              {updating ? 'Updating...' : `Update ${selectedFiles.size} File(s)`}
            </button>
          </div>
          <FileTable 
            files={files}
            selectedFiles={selectedFiles}
            onToggleFile={handleToggleFile}
          />
        </>
      )}

      {!loading && unmatchedFiles.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2>Files Without JSON Metadata ({unmatchedFiles.length})</h2>
          <UnmatchedFilesTable files={unmatchedFiles} />
        </div>
      )}

      {!loading && unmatchedJsonFiles.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2>JSON Files Without Matching Media Files ({unmatchedJsonFiles.length})</h2>
          <UnmatchedJsonFilesTable jsonFiles={unmatchedJsonFiles} />
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { FolderPicker } from './components/FolderPicker';
import { FileTable } from './components/FileTable';
import { Pagination } from './components/Pagination';
import { OffsetSelector } from './components/OffsetSelector';
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  const [imageMap, setImageMap] = useState<Record<string, string | null>>({});
  const [loadingImages, setLoadingImages] = useState<boolean>(false);
  const [timezoneOffset, setTimezoneOffset] = useState<number>(0); // Default to UTC
  const [showImagePreviews, setShowImagePreviews] = useState<boolean>(true);
  const [filterFilesWithExifDate, setFilterFilesWithExifDate] = useState<boolean>(false);

  const handleScan = async (path: string) => {
    setFolderPath(path);
    setLoading(true);
    setError(null);
    setSelectedFiles(new Set());
    setCurrentPage(1); // Reset to first page on new scan
    setImageMap({}); // Clear image map on new scan

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
    // Apply filtering if enabled - only show files without EXIF date that support EXIF
    const filteredFiles = filterFilesWithExifDate 
      ? files.filter(f => !f.exifDateTimeOriginal && f.mediaFileInfo.supportsExif)
      : files;
    
    // Select all updatable files on current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageFiles = filteredFiles.slice(startIndex, endIndex);
    const updatableFilesOnPage = currentPageFiles.filter(f => f.canUpdate);
    
    const newSelected = new Set(selectedFiles);
    const allOnPageSelected = updatableFilesOnPage.every(f => 
      newSelected.has(f.mediaFileInfo.mediaFilePath)
    );
    
    if (allOnPageSelected) {
      // Deselect all on current page
      updatableFilesOnPage.forEach(f => {
        newSelected.delete(f.mediaFileInfo.mediaFilePath);
      });
    } else {
      // Select all on current page
      updatableFilesOnPage.forEach(f => {
        newSelected.add(f.mediaFileInfo.mediaFilePath);
      });
    }
    
    setSelectedFiles(newSelected);
  };
  
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Load images for the current page
  useEffect(() => {
    if (files.length === 0) {
      return;
    }

    const loadImagesForPage = async () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageFiles = files.slice(startIndex, endIndex);
      
      // Get file paths for images only
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.heic'];
      const imageFilePaths = currentPageFiles
        .filter(f => imageExtensions.includes(f.mediaFileInfo.mediaFileExtension.toLowerCase()))
        .map(f => f.mediaFileInfo.mediaFilePath);

      if (imageFilePaths.length === 0) {
        return;
      }

      setLoadingImages(true);
      try {
        const { api } = await import('./api');
        const response = await api.getImages(imageFilePaths);
        
        // Update image map with new images
        setImageMap(prev => ({
          ...prev,
          ...response.images,
        }));
      } catch (error) {
        console.error('Failed to load images:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    loadImagesForPage();
  }, [files, currentPage, itemsPerPage]);

  const handleUpdate = async () => {
    if (selectedFiles.size === 0 || !folderPath) {
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const { api } = await import('./api');
      const filePaths = Array.from(selectedFiles);
      const response = await api.updateExif(filePaths, folderPath, timezoneOffset);

      // Check for failures
      const failures = response.results.filter(r => !r.success);
      if (failures.length > 0) {
        const errorMessages = failures.map(f => `${f.filePath}: ${f.error || 'Unknown error'}`).join('\n');
        setError(`Some files failed to update:\n${errorMessages}`);
      } else {
        setError(null);
        // Re-scan to refresh the data
        //await handleScan(folderPath);
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

      {!loading && files.length > 0 && (() => {
        // Apply filtering if enabled - only show files without EXIF date that support EXIF
        const filteredFiles = filterFilesWithExifDate 
          ? files.filter(f => !f.exifDateTimeOriginal && f.mediaFileInfo.supportsExif)
          : files;
        
        // Calculate pagination on filtered files
        const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentPageFiles = filteredFiles.slice(startIndex, endIndex);
        
        // Check if all updatable files on current page are selected
        const updatableFilesOnPage = currentPageFiles.filter(f => f.canUpdate);
        const allOnPageSelected = updatableFilesOnPage.length > 0 && 
          updatableFilesOnPage.every(f => selectedFiles.has(f.mediaFileInfo.mediaFilePath));
        
        return (
          <>
            <div style={{ marginTop: '20px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <OffsetSelector 
                timezoneOffset={timezoneOffset}
                onTimezoneChange={setTimezoneOffset}
              />
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showImagePreviews}
                    onChange={(e) => setShowImagePreviews(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px' }}>Show Image Previews</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filterFilesWithExifDate}
                    onChange={(e) => {
                      setFilterFilesWithExifDate(e.target.checked);
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px' }}>Hide Files with EXIF Date</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={handleSelectAll}
                  style={{ padding: '8px 16px' }}
                >
                  {allOnPageSelected ? 'Deselect All on Page' : 'Select All on Page'}
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={selectedFiles.size === 0 || updating}
                  style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: selectedFiles.size === 0 || updating ? 'not-allowed' : 'pointer' }}
                >
                  {updating ? 'Updating...' : `Update ${selectedFiles.size} File(s)`}
                </button>
              </div>
            </div>
            {loadingImages && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Loading images...
              </div>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredFiles.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
            <FileTable 
              files={currentPageFiles}
              selectedFiles={selectedFiles}
              onToggleFile={handleToggleFile}
              imageMap={imageMap}
              timezoneOffset={timezoneOffset}
              showImagePreviews={showImagePreviews}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredFiles.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
            {filterFilesWithExifDate && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Showing {filteredFiles.length} of {files.length} files (filtered)
              </div>
            )}
          </>
        );
      })()}

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

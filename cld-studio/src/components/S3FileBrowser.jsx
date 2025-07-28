import React, { useState, useEffect } from 'react';
import { useCLDStore } from '../stores/cldStore';

const S3FileBrowser = ({ isOpen, onClose }) => {
  const { listS3Files, loadFileFromS3, addEvent } = useCLDStore();
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListingFiles, setIsListingFiles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    setIsListingFiles(true);
    try {
      const fileList = await listS3Files();
      setFiles(fileList);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error loading files:', error);
      addEvent('Failed to load S3 files: ' + error.message, 'error');
    } finally {
      setIsListingFiles(false);
    }
  };

  const handleFileSelect = (fileName) => {
    setSelectedFile(fileName);
  };

  const handleLoadFile = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      await loadFileFromS3(selectedFile);
      onClose();
    } catch (error) {
      console.error('Error loading file:', error);
      addEvent('Failed to load file: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadFiles();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '95%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Load File from S3
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleRefresh}
              disabled={isListingFiles}
              className="modal-close-btn"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                borderRadius: '4px',
                opacity: isListingFiles ? 0.5 : 1
              }}
              title="Refresh files"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
            <button
              onClick={onClose}
              className="modal-close-btn"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                borderRadius: '4px'
              }}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-body" style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: '20px'
        }}>
          {isListingFiles ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Loading files...</span>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{ marginBottom: '16px' }}>
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
              </svg>
              <p style={{ margin: '0 0 16px 0', fontSize: '16px' }}>No .cld files found in S3</p>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
                This is normal for a new deployment. You can create sample data or upload your own .cld files.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={handleRefresh}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                  Refresh
                </button>
                                 <button
                   onClick={() => {
                     const { createSampleData } = useCLDStore.getState();
                     createSampleData();
                     onClose();
                   }}
                   style={{
                     padding: '8px 16px',
                     backgroundColor: '#10b981',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     fontSize: '14px'
                   }}
                   onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                   onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                 >
                   Create Sample Data
                 </button>
                 <button
                   onClick={() => {
                     const { testS3Listing } = useCLDStore.getState();
                     testS3Listing();
                   }}
                   style={{
                     padding: '8px 16px',
                     backgroundColor: '#f59e0b',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     fontSize: '14px'
                   }}
                   onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                   onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
                 >
                   Debug S3
                 </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Available Files ({files.length})
                </h3>
                <div style={{
                  maxHeight: '300px',
                  overflow: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  {files.map((fileName, index) => (
                    <div
                      key={fileName}
                      onClick={() => handleFileSelect(fileName)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: index < files.length - 1 ? '1px solid #e5e7eb' : 'none',
                        backgroundColor: selectedFile === fileName ? '#dbeafe' : 'transparent',
                        borderLeft: selectedFile === fileName ? '4px solid #3b82f6' : '4px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedFile !== fileName) {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedFile !== fileName) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: selectedFile === fileName ? '2px solid #3b82f6' : '2px solid #d1d5db',
                          backgroundColor: selectedFile === fileName ? '#3b82f6' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {selectedFile === fileName && (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: '0 0 2px 0',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#1f2937',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {fileName}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            CLD Diagram File
                          </p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8V4h5v5h5v9z"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {selectedFile ? `Selected: ${selectedFile}` : 'No file selected'}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              onClick={handleLoadFile}
              disabled={!selectedFile || isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: !selectedFile || isLoading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: !selectedFile || isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (selectedFile && !isLoading) {
                  e.target.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFile && !isLoading) {
                  e.target.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  Load File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S3FileBrowser; 
import React, { useState, useEffect } from 'react';
import { list, downloadData, uploadData, remove } from 'aws-amplify/storage';
import { Upload, Download, Trash2, Folder, File, RefreshCw } from 'lucide-react';
import { validateFileFormat, sanitizeCLDData } from '../utils/validation.js';
import ValidationErrorModal from './ValidationErrorModal';
import './S3FileManager.css';

function S3FileManager({ isOpen, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPath, setCurrentPath] = useState('public/');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Validation state
  const [validationModal, setValidationModal] = useState({
    isOpen: false,
    validationResult: null,
    fileName: '',
    fileType: '',
    fileData: null
  });

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, currentPath]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const result = await list(currentPath, {
        level: 'public'
      });
      setFiles(result.results);
    } catch (error) {
      console.error('Error loading files:', error);
      alert('Failed to load files from S3');
    } finally {
      setLoading(false);
    }
  };

  const validateAndUploadFile = async (file) => {
    try {
      // Get file extension
      const fileName = file.name;
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      
      // Check if it's a supported file type
      if (!['.cld', '.cldq', '.json'].includes(fileExtension.toLowerCase())) {
        // Upload without validation for unsupported types
        const key = `${currentPath}${fileName}`;
        await uploadData(key, file, {
          level: 'public',
          contentType: file.type
        });
        return { success: true, message: 'File uploaded successfully!' };
      }
      
      // Read and validate file content
      const text = await file.text();
      let fileData;
      
      try {
        fileData = JSON.parse(text);
      } catch (parseError) {
        return { 
          success: false, 
          message: `Invalid JSON format: ${parseError.message}` 
        };
      }
      
      // Validate file format
      const validationResult = validateFileFormat(fileData, fileExtension);
      
      if (!validationResult.isValid) {
        // Show validation modal
        setValidationModal({
          isOpen: true,
          validationResult,
          fileName,
          fileType: fileExtension,
          fileData
        });
        return { success: false, message: 'Validation failed' };
      }
      
      // Sanitize data if it's a CLD file
      if (fileExtension.toLowerCase() === '.cld') {
        fileData = sanitizeCLDData(fileData);
      }
      
      // Create a new file with sanitized data
      const sanitizedFile = new File(
        [JSON.stringify(fileData, null, 2)],
        fileName,
        { type: file.type }
      );
      
      // Upload the sanitized file
      const key = `${currentPath}${fileName}`;
      await uploadData(key, sanitizedFile, {
        level: 'public',
        contentType: file.type
      });
      
      return { 
        success: true, 
        message: 'File validated and uploaded successfully!',
        warnings: validationResult.warnings
      };
      
    } catch (error) {
      console.error('Error processing file:', error);
      return { 
        success: false, 
        message: `Failed to process file: ${error.message}` 
      };
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await validateAndUploadFile(file);
      
      if (result.success) {
        // Reload files after upload
        await loadFiles();
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDownload = async (file) => {
    try {
      const result = await downloadData(file.key, {
        level: 'public'
      });
      
      // Create a download link
      const link = document.createElement('a');
      link.href = result;
      link.download = file.key.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleFileDelete = async (file) => {
    if (!confirm(`Are you sure you want to delete ${file.key}?`)) return;

    try {
      await remove(file.key, {
        level: 'public'
      });
      
      // Reload files after deletion
      await loadFiles();
      alert('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const navigateToFolder = (folderName) => {
    if (folderName === '..') {
      // Go up one level
      const pathParts = currentPath.split('/').filter(Boolean);
      pathParts.pop();
      setCurrentPath(pathParts.length > 0 ? `${pathParts.join('/')}/` : 'public/');
    } else {
      // Go into folder
      setCurrentPath(`${currentPath}${folderName}/`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="s3-file-manager-overlay">
      <div className="s3-file-manager-modal">
        <div className="s3-file-manager-header">
          <h2>S3 File Manager</h2>
          <div className="s3-file-manager-actions">
            <button 
              className="refresh-button"
              onClick={loadFiles}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="s3-file-manager-path">
          <span>Current Path: {currentPath}</span>
        </div>

        <div className="s3-file-manager-upload">
          <label className="upload-button">
            <Upload size={16} />
            Upload File
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
          {uploading && <span className="upload-status">Uploading...</span>}
        </div>

        <div className="s3-file-manager-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Loading files...</span>
            </div>
          ) : (
            <div className="files-list">
              {currentPath !== 'public/' && (
                <div 
                  className="file-item folder"
                  onClick={() => navigateToFolder('..')}
                >
                  <Folder size={20} />
                  <span>..</span>
                  <span className="file-type">Parent Directory</span>
                </div>
              )}
              
              {files.map((file) => (
                <div key={file.key} className="file-item">
                  <div className="file-info" onClick={() => setSelectedFile(file)}>
                    {file.key.endsWith('/') ? (
                      <Folder size={20} />
                    ) : (
                      <File size={20} />
                    )}
                    <span className="file-name">
                      {file.key.split('/').pop() || file.key}
                    </span>
                    <span className="file-size">
                      {file.key.endsWith('/') ? 'Folder' : formatFileSize(file.size || 0)}
                    </span>
                    <span className="file-date">
                      {file.lastModified ? formatDate(file.lastModified) : 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="file-actions">
                    {!file.key.endsWith('/') && (
                      <>
                        <button
                          className="action-button download"
                          onClick={() => handleFileDownload(file)}
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleFileDelete(file)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    {file.key.endsWith('/') && (
                      <button
                        className="action-button open"
                        onClick={() => navigateToFolder(file.key.split('/').pop())}
                        title="Open Folder"
                      >
                        Open
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {files.length === 0 && (
                <div className="empty-state">
                  <Folder size={48} />
                  <span>No files found in this directory</span>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="file-details">
            <h3>File Details</h3>
            <p><strong>Name:</strong> {selectedFile.key.split('/').pop()}</p>
            <p><strong>Path:</strong> {selectedFile.key}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size || 0)}</p>
            <p><strong>Last Modified:</strong> {selectedFile.lastModified ? formatDate(selectedFile.lastModified) : 'Unknown'}</p>
            <button onClick={() => setSelectedFile(null)}>Close</button>
          </div>
        )}
      </div>
      
      {/* Validation Error Modal */}
      <ValidationErrorModal
        isOpen={validationModal.isOpen}
        onClose={() => setValidationModal({ isOpen: false, validationResult: null, fileName: '', fileType: '', fileData: null })}
        validationResult={validationModal.validationResult}
        fileName={validationModal.fileName}
        fileType={validationModal.fileType}
        onRetry={() => {
          // Close modal and allow user to try uploading again
          setValidationModal({ isOpen: false, validationResult: null, fileName: '', fileType: '', fileData: null });
        }}
        onContinue={async () => {
          // Try to upload with warnings
          if (validationModal.fileData) {
            try {
              const fileName = validationModal.fileName;
              const fileExtension = validationModal.fileType;
              
              // Sanitize data if it's a CLD file
              let fileData = validationModal.fileData;
              if (fileExtension.toLowerCase() === '.cld') {
                fileData = sanitizeCLDData(fileData);
              }
              
              // Create a new file with sanitized data
              const sanitizedFile = new File(
                [JSON.stringify(fileData, null, 2)],
                fileName,
                { type: 'application/json' }
              );
              
              // Upload the sanitized file
              const key = `${currentPath}${fileName}`;
              await uploadData(key, sanitizedFile, {
                level: 'public',
                contentType: 'application/json'
              });
              
              // Reload files and close modal
              await loadFiles();
              setValidationModal({ isOpen: false, validationResult: null, fileName: '', fileType: '', fileData: null });
              alert('File uploaded with warnings.');
            } catch (error) {
              console.error('Error uploading file with warnings:', error);
              alert('Failed to upload file with warnings.');
            }
          }
        }}
      />
    </div>
  );
}

export default S3FileManager; 
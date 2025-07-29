import React, { useState, useEffect, useRef } from 'react';
import { useCLDStore } from '../stores/cldStore';
import { FolderOpen, Save, X, Folder, FileText, Check, AlertCircle } from 'lucide-react';

const SaveToS3Modal = ({ isOpen, onClose }) => {
  const { saveDiagramToS3, addEvent, getS3Categories, diagramName } = useCLDStore();
  const [fileName, setFileName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('examples');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Resizable state
  const [size, setSize] = useState({ width: 500, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Set default filename based on current diagram name
      setFileName(diagramName || 'untitled');
      setError('');
      setSuccess(false);
    }
  }, [isOpen, diagramName]);

  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const availableCategories = await getS3Categories();
      setCategories(availableCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set default categories if loading fails
      setCategories(['examples', 'assignments', 'exam']);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSave = async () => {
    if (!fileName.trim()) {
      setError('Please enter a filename');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await saveDiagramToS3(fileName.trim(), selectedCategory);
      setSuccess(true);
      addEvent(`Diagram saved successfully to ${selectedCategory}/${fileName.trim()}.cld`, 'success');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || 'Failed to save diagram');
      addEvent('Failed to save diagram to S3: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('analysis-modal-drag-handle') || e.target.closest('.analysis-modal-header')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(400, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(400, resizeStart.width - deltaX);
        setPosition(prev => ({ ...prev, x: e.clientX }));
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(300, resizeStart.height + deltaY);
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(300, resizeStart.height - deltaY);
        setPosition(prev => ({ ...prev, y: e.clientY }));
      }
      
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  // Resize handlers
  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ 
      x: e.clientX, 
      y: e.clientY, 
      width: size.width, 
      height: size.height 
    });
  };

  // Global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isResizing || isDragging) {
        handleMouseMove(e);
      }
    };
    
    const handleGlobalMouseUp = () => {
      if (isResizing || isDragging) {
        handleMouseUp();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isResizing, isDragging]);

  if (!isOpen) return null;

  return (
    <div 
      className="analysis-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isResizing && !isDragging) {
          onClose();
        }
      }}
    >
      <div 
        className={`analysis-modal ${isResizing ? 'resizing' : ''}`}
        style={{
          width: size.width,
          height: size.height,
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`
        }}
      >
        {/* Resize handles */}
        <div 
          className="analysis-modal-resize-handle top"
          onMouseDown={(e) => handleResizeStart(e, 'top')}
        ></div>
        <div 
          className="analysis-modal-resize-handle bottom"
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        ></div>
        <div 
          className="analysis-modal-resize-handle left"
          onMouseDown={(e) => handleResizeStart(e, 'left')}
        ></div>
        <div 
          className="analysis-modal-resize-handle right"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        ></div>
        
        {/* Modal Header */}
        <div className="analysis-modal-header">
          <div className="analysis-modal-drag-handle" onMouseDown={handleMouseDown} />
          <h3>Save to Cloud</h3>
          <button 
            className="analysis-modal-close"
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="analysis-modal-content">
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Success Message */}
            {success && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#d1fae5',
                border: '1px solid #10b981',
                borderRadius: '6px',
                color: '#065f46'
              }}>
                <Check size={16} />
                <span>Diagram saved successfully!</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                color: '#991b1b'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* File Name Input */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                File Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter filename"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  disabled={isLoading}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  .cld
                </span>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Save to Folder
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={isLoading || isLoadingCategories}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="examples">📁 Examples</option>
                  <option value="assignments">📁 Assignments</option>
                  <option value="exam">📁 Exam</option>
                  {categories.filter(cat => !['examples', 'assignments', 'exam'].includes(cat)).map(cat => (
                    <option key={cat} value={cat}>📁 {cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
                {isLoadingCategories && (
                  <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280'
                  }}>
                    Loading...
                  </div>
                )}
              </div>
            </div>

            {/* File Path Preview */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Save Location
              </label>
              <div style={{
                padding: '10px 12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#6b7280',
                fontFamily: 'monospace'
              }}>
                {selectedCategory}/{fileName || 'untitled'}.cld
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !fileName.trim()}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save to Cloud
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SaveToS3Modal;
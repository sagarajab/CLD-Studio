import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCLDStore } from '../stores/cldStore';

const ExamplesBrowser = ({ isOpen, onClose }) => {
  const { 
    examples, 
    isLoadingExamples, 
    examplesError, 
    loadExamplesList, 
    loadExamplesByCategory,
    searchExamples,
    loadExample,
    createSampleData
  } = useCLDStore();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Resizable state
  const [size, setSize] = useState({ width: 700, height: 450 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadExamplesList();
    }
  }, [isOpen]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      loadExamplesList();
    } else {
      loadExamplesByCategory(category);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchExamples(searchTerm.trim());
    } else {
      loadExamplesList();
    }
  };

  const handleLoadExample = async (example) => {
    try {
      await loadExample(example);
      onClose();
    } catch (error) {
      console.error('Error loading example:', error);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.analysis-modal-resize-handle')) return;
    
    setIsDragging(true);
    const startMouse = { x: e.clientX, y: e.clientY };
    const startPosition = { ...position };
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startMouse.x;
      const deltaY = e.clientY - startMouse.y;
      
      setPosition({
        x: startPosition.x + deltaX,
        y: startPosition.y + deltaY
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Resize handlers
  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    
    const startSize = {
      width: size.width,
      height: size.height
    };
    const startPosition = { ...position };
    const startMouse = { x: e.clientX, y: e.clientY };
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startMouse.x;
      const deltaY = e.clientY - startMouse.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newPosition = { ...startPosition };
      
      if (direction === 'right') {
        newWidth = Math.max(500, startSize.width + deltaX);
      } else if (direction === 'left') {
        const widthChange = Math.min(deltaX, startSize.width - 500);
        newWidth = startSize.width - widthChange;
        newPosition.x = startPosition.x + widthChange;
      } else if (direction === 'bottom') {
        newHeight = Math.max(300, startSize.height + deltaY);
      } else if (direction === 'top') {
        const heightChange = Math.min(deltaY, startSize.height - 300);
        newHeight = startSize.height - heightChange;
        newPosition.y = startPosition.y + heightChange;
      }
      
      setSize({ width: newWidth, height: newHeight });
      setPosition(newPosition);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection('');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const filteredExamples = examples.filter(example => {
    const matchesSearch = searchTerm === '' || 
      example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

    return createPortal(
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
        {/* Modal Header */}
        <div className="analysis-modal-header">
          <div className="analysis-modal-drag-handle" onMouseDown={handleMouseDown} />
          <h3>Load Examples</h3>
          <button 
            className="analysis-modal-close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search examples..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Modal Content */}
        <div className="analysis-modal-content">
          {/* Loading State */}
          {isLoadingExamples && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium text-lg">Loading examples...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest examples</p>
            </div>
          )}

          {/* Error State */}
          {examplesError && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-3xl">⚠️</span>
              </div>
              <p className="text-red-600 font-medium text-lg mb-4">Error loading examples</p>
              <p className="text-gray-500 text-sm mb-6">{examplesError}</p>
              <button
                onClick={() => loadExamplesList()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Examples Grid */}
          {!isLoadingExamples && !examplesError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExamples.map((example) => (
                <div
                  key={example.id}
                  className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all duration-200 hover:bg-blue-50/30"
                  onClick={() => handleLoadExample(example)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {example.name}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      example.category === 'basic' ? 'bg-green-100 text-green-700' :
                      example.category === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {example.category}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {example.description || 'No description available'}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span className="text-xs">⬇️</span>
                      <span>{example.downloadCount || 0} downloads</span>
                    </span>
                    {example.tags && (
                      <span className="text-blue-600 font-medium text-xs">
                        {example.tags.split(',').slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}

          {/* Empty States */}
          {!isLoadingExamples && !examplesError && filteredExamples.length === 0 && (
            <div className="text-center py-12">
              {searchTerm ? (
                <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-3xl">🔍</span>
                  </div>
                  <p className="text-gray-600 font-medium text-lg mb-4">No examples found</p>
                  <p className="text-gray-500 text-sm mb-6">No examples match "{searchTerm}"</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      loadExamplesList();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm"
                  >
                    Clear Search
                  </button>
                </div>
              ) : examples.length === 0 ? (
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-500 text-3xl">📚</span>
                  </div>
                  <p className="text-gray-600 font-medium text-lg mb-2">No examples available yet</p>
                  <p className="text-gray-500 text-sm mb-6">Create some sample data to get started</p>
                  <button
                    onClick={createSampleData}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-sm"
                  >
                    Create Sample Data
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-3xl">📂</span>
                  </div>
                  <p className="text-gray-600 font-medium text-lg">No examples match your filters</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your search or category filters</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Resize Handles */}
        <div className="analysis-modal-resize-handle top" onMouseDown={(e) => handleResizeStart(e, 'top')} />
        <div className="analysis-modal-resize-handle bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')} />
        <div className="analysis-modal-resize-handle left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
        <div className="analysis-modal-resize-handle right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
      </div>
    </div>,
    document.body
  );
};

export default ExamplesBrowser; 
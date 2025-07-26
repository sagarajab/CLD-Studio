import React, { useState, useEffect, useRef } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { Grid } from 'lucide-react'

function MenuBar({ mode, setMode }) {
  const { saveDiagram, loadDiagram, clearDiagram, exportMatrix, exportAsPNG, exportAsSVG, exportAsPDF, showGrid, toggleGrid } = useCLDStore()
  const [activeMenu, setActiveMenu] = useState(null)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName)
  }

  const handleSave = () => {
    saveDiagram()
    setActiveMenu(null)
  }

  const handleLoad = () => {
    loadDiagram()
    setActiveMenu(null)
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the diagram?')) {
      clearDiagram()
    }
    setActiveMenu(null)
  }

  const handleExport = () => {
    exportMatrix()
    setActiveMenu(null)
  }

  const handleExportAsPNG = () => {
    exportAsPNG()
    setActiveMenu(null)
  }

  const handleExportAsSVG = () => {
    exportAsSVG()
    setActiveMenu(null)
  }

  const handleExportAsPDF = () => {
    exportAsPDF()
    setActiveMenu(null)
  }



  return (
    <div ref={menuRef} className="px-4 py-2 flex items-center space-x-8">
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('file')}
          className={`p-2 rounded menu-item ${activeMenu === 'file' ? 'bg-blue-100' : ''}`}
          title="File"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        {activeMenu === 'file' && (
          <div className="absolute top-full left-0 mt-1 w-48 menu-dropdown">
            <div className="py-1">
              <button
                onClick={handleSave}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save Diagram</span>
              </button>
              <button
                onClick={handleLoad}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Load Diagram</span>
              </button>
              <button
                onClick={handleExportAsPNG}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span>Export as PNG</span>
              </button>
              <button
                onClick={handleExportAsSVG}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <span>Export as SVG</span>
              </button>
              <button
                onClick={handleExportAsPDF}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <span>Export as PDF</span>
              </button>
              <button
                onClick={handleExport}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v18H3z"/>
                  <path d="M9 9h6v6H9z"/>
                  <path d="M15 3v18"/>
                  <path d="M3 15h18"/>
                </svg>
                <span>Export Matrix (CSV)</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleClear}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Diagram</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('edit')}
          className={`p-2 rounded menu-item ${activeMenu === 'edit' ? 'bg-blue-100' : ''}`}
          title="Edit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        {activeMenu === 'edit' && (
          <div className="absolute top-full left-0 mt-1 w-48 menu-dropdown">
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>Undo</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
                <span>Redo</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Select All</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('view')}
          className={`p-2 rounded menu-item ${activeMenu === 'view' ? 'bg-blue-100' : ''}`}
          title="View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        {activeMenu === 'view' && (
          <div className="absolute top-full left-0 mt-1 w-48 menu-dropdown">
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span>Zoom In</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
                <span>Zoom Out</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>Fit to Screen</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>Show Labels</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid Toggle Button */}
      <div className="relative">
        <button
          onClick={toggleGrid}
          className={`p-2 rounded menu-item ${showGrid ? 'bg-blue-100' : ''}`}
          title={showGrid ? 'Hide Grid' : 'Show Grid'}
        >
          <Grid className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center space-x-2 ml-auto">
        <span className="text-sm text-gray-600">Mode:</span>
        <div className="mode-toggle">
          <button
            onClick={() => setMode('sandbox')}
            className={`mode-button ${mode === 'sandbox' ? 'active' : ''}`}
          >
            Sandbox
          </button>
          <button
            onClick={() => setMode('assessment')}
            className={`mode-button ${mode === 'assessment' ? 'active' : ''}`}
          >
            Assessment
          </button>
        </div>
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button
          onClick={() => handleMenuClick('help')}
          className={`p-2 rounded menu-item ${activeMenu === 'help' ? 'bg-blue-100' : ''}`}
          title="Help"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        {activeMenu === 'help' && (
          <div className="absolute top-full right-0 mt-1 w-48 menu-dropdown">
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>User Guide</span>
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Keyboard Shortcuts</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>About CLD Studio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MenuBar 
import React, { useState, useEffect, useRef } from 'react'
import { useCLDStore } from '../stores/cldStore'

function CompactToolbar({ mode }) {

  const dropdownRef = useRef(null)
  
  const { 
    clearDiagram, 
    exportMatrix,
    exportAsPNG,
    exportAsSVG,
    exportAsPDF,
    submitAssessment,
    activeDropdown,
    setActiveDropdown,
    closeAllDropdowns
  } = useCLDStore()

  const handleClear = () => {
    if (window.confirm('Clear diagram?')) {
      clearDiagram()
    }
  }



  const handleExportAsPNG = () => {
    exportAsPNG()
    closeAllDropdowns()
  }

  const handleExportAsSVG = () => {
    exportAsSVG()
    closeAllDropdowns()
  }

  const handleExportAsPDF = () => {
    exportAsPDF()
    closeAllDropdowns()
  }

  const handleExportMatrix = () => {
    exportMatrix()
    closeAllDropdowns()
  }

  const toggleExportDropdown = () => {
    if (activeDropdown === 'export') {
      closeAllDropdowns()
    } else {
      setActiveDropdown('export')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeAllDropdowns()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [closeAllDropdowns])

  const handleSubmit = () => {
    if (mode === 'assessment') {
      submitAssessment()
      alert('Assessment submitted!')
    }
  }

  return (
    <div className="compact-toolbar">
      <button
        onClick={handleClear}
        className="toolbar-btn danger"
        title="Clear diagram"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear
      </button>
      
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleExportDropdown}
          className="toolbar-btn"
          title="Export options"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </button>
        {activeDropdown === 'export' && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-40">
            <button
              onClick={handleExportAsPNG}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center space-x-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              <span>PNG</span>
            </button>
            <button
              onClick={handleExportAsSVG}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center space-x-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span>SVG</span>
            </button>
            <button
              onClick={handleExportAsPDF}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center space-x-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span>PDF</span>
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={handleExportMatrix}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 flex items-center space-x-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v18H3z"/>
                <path d="M9 9h6v6H9z"/>
                <path d="M15 3v18"/>
                <path d="M3 15h18"/>
              </svg>
              <span>Matrix</span>
            </button>
          </div>
        )}
      </div>

      {mode === 'assessment' && (
        <button
          onClick={handleSubmit}
          className="toolbar-btn primary"
          title="Submit assessment"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Submit
        </button>
      )}

      <div className="flex-1"></div>

      <div className="text-xs text-gray-500">
        {mode === 'sandbox' ? 'Click to add nodes' : 'Complete the diagram'}
      </div>
    </div>
  )
}

export default CompactToolbar 
import React, { useState, useEffect, useRef } from 'react'
import { useCLDStore } from '../stores/cldStore'

function Toolbar() {
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const dropdownRef = useRef(null)
  
  const { 
    clearDiagram, 
    exportMatrix,
    exportAsPNG,
    exportAsSVG,
    exportAsPDF,
    nodes, 
    edges,
    mode,
    submitAssessment 
  } = useCLDStore()

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the diagram?')) {
      clearDiagram()
    }
  }

  const handleExportMatrix = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportMatrix()
    setShowExportDropdown(false)
  }

  const handleExportAsPNG = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportAsPNG()
    setShowExportDropdown(false)
  }

  const handleExportAsSVG = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportAsSVG()
    setShowExportDropdown(false)
  }

  const handleExportAsPDF = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportAsPDF()
    setShowExportDropdown(false)
  }

  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmitAssessment = () => {
    if (mode === 'assessment') {
      submitAssessment()
      alert('Assessment submitted! (This is a placeholder - backend integration pending)')
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="toolbar-button danger"
              title="Clear diagram"
            >
              Clear
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleExportDropdown}
                className="toolbar-button"
                title="Export options"
              >
                Export ▼
              </button>
              {showExportDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-48">
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
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleExportMatrix}
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
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {mode === 'assessment' && (
            <button
              onClick={handleSubmitAssessment}
              className="toolbar-button"
            >
              Submit Assessment
            </button>
          )}
        </div>
      </div>

      {mode === 'sandbox' && (
        <div className="tip-box mt-3 text-sm">
          💡 Tip: Click anywhere on the canvas to add nodes, drag nodes to connect them, and click edges to change polarity
        </div>
      )}
      
      {mode === 'assessment' && (
        <div className="assessment-box mt-3 text-sm">
          📝 Assessment Mode: Complete the diagram according to the problem requirements
        </div>
      )}
    </div>
  )
}

export default Toolbar 
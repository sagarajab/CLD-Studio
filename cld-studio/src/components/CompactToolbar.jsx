import React from 'react'
import { useCLDStore } from '../stores/cldStore'

function CompactToolbar({ mode }) {
  const { 
    clearDiagram, 
    exportMatrix, 
    submitAssessment 
  } = useCLDStore()

  const handleClear = () => {
    if (window.confirm('Clear diagram?')) {
      clearDiagram()
    }
  }

  const handleExport = () => {
    exportMatrix()
  }

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
      
      <button
        onClick={handleExport}
        className="toolbar-btn"
        title="Export matrix"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>

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
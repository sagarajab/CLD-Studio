import React from 'react'
import { useCLDStore } from '../stores/cldStore'

function Toolbar() {
  const { 
    clearDiagram, 
    exportMatrix, 
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
  }

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
            
            <button
              onClick={handleExportMatrix}
              className="toolbar-button"
              title="Export as adjacency matrix"
            >
              Export Matrix
            </button>
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
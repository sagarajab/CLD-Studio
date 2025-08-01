import React, { useEffect } from 'react'
import AdjacencyMatrix from './AdjacencyMatrix'

function AdjacencyMatrixModal({ isOpen, onClose }) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adjacency Matrix</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <AdjacencyMatrix onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

export default AdjacencyMatrixModal 
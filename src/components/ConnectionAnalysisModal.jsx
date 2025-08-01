import React, { useMemo, useState, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'

function ConnectionAnalysisModal({ isOpen, onClose }) {
  const { 
    nodes, 
    edges, 
    updateEdgeDescription,
    setHoveredEdge,
    clearHoveredEdge
  } = useCLDStore()
  
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Prepare connections data
  const connectionsAnalysis = useMemo(() => {
    return edges.map(edge => {
      const fromNode = nodes.find(n => n.id === edge.source)
      const toNode = nodes.find(n => n.id === edge.target)
      
      return {
        id: edge.id,
        fromNode: fromNode?.data?.label || edge.source,
        polarity: edge.data?.polarity || 'positive',
        toNode: toNode?.data?.label || edge.target,
        description: edge.data?.description || 'No description'
      }
    })
  }, [edges, nodes])

  const startEditing = (id, currentValue) => {
    setEditingCell(id)
    setEditValue(currentValue)
  }

  const saveEdit = () => {
    if (editingCell && editValue !== undefined) {
      updateEdgeDescription(editingCell, editValue)
    }
    setEditingCell(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const renderEditableCell = (id, value) => {
    const isEditing = editingCell === id

    if (isEditing) {
      return (
        <textarea
          className="description-cell editing"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={saveEdit}
          onFocus={(e) => e.target.select()}
          autoFocus
          rows={1}
          style={{
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            width: '100%',
            minHeight: '20px',
            padding: '4px 6px',
            boxSizing: 'border-box',
            verticalAlign: 'middle'
          }}
        />
      )
    }

    return (
      <div 
        className="description-cell clickable"
        onClick={() => startEditing(id, value)}
        title="Click to edit description"
      >
        {value}
      </div>
    )
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (editingCell) {
          cancelEdit()
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editingCell, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connection Analysis</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="modal-table-container">
            <table className="analysis-table modal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>From Node</th>
                  <th>Polarity</th>
                  <th>To Node</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {connectionsAnalysis.map(connection => (
                  <tr 
                    key={connection.id}
                    onMouseEnter={() => setHoveredEdge(connection.id)}
                    onMouseLeave={() => clearHoveredEdge()}
                  >
                    <td className="id-cell">{connection.id}</td>
                    <td className="node-cell">{connection.fromNode}</td>
                    <td className={`polarity-cell ${connection.polarity}`}>
                      {connection.polarity === 'positive' ? '+' : '-'}
                    </td>
                    <td className="node-cell">{connection.toNode}</td>
                    <td className="description-cell">
                      {renderEditableCell(connection.id, connection.description)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionAnalysisModal 
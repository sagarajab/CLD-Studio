import React, { useMemo, useState, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'

function NodeAnalysisModal({ isOpen, onClose }) {
  const { 
    nodes, 
    edges, 
    updateNodeDescription,
    setHoveredNode,
    clearHoveredNode
  } = useCLDStore()
  
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Calculate in/out counts for nodes
  const nodeAnalysis = useMemo(() => {
    return nodes.map(node => {
      const inCount = edges.filter(edge => edge.target === node.id).length
      const outCount = edges.filter(edge => edge.source === node.id).length
      
      return {
        id: node.id,
        label: node.data?.label || 'Unnamed',
        inCount,
        outCount,
        description: node.data?.description || 'No description'
      }
    })
  }, [nodes, edges])

  const startEditing = (id, currentValue) => {
    setEditingCell(id)
    setEditValue(currentValue)
  }

  const saveEdit = () => {
    if (editingCell && editValue !== undefined) {
      updateNodeDescription(editingCell, editValue)
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
          <h2>Node Analysis</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="modal-table-container">
            <table className="analysis-table modal-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Label</th>
                  <th>In Count</th>
                  <th>Out Count</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {nodeAnalysis.map(node => (
                  <tr 
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => clearHoveredNode()}
                  >
                    <td className="id-cell">{node.id}</td>
                    <td className="label-cell">{node.label}</td>
                    <td className="count-cell">{node.inCount}</td>
                    <td className="count-cell">{node.outCount}</td>
                    <td className="description-cell">
                      {renderEditableCell(node.id, node.description)}
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

export default NodeAnalysisModal 
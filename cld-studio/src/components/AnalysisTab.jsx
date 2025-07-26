import React, { useMemo, useState, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'

function AnalysisTab() {
  const { nodes, edges, updateNodeDescription, updateEdgeDescription } = useCLDStore()
  const [activeModal, setActiveModal] = useState(null) // 'nodes', 'connections', 'stats', or null
  const [editingCell, setEditingCell] = useState(null) // { type: 'node'|'edge', id: number, field: 'description' }
  const [editValue, setEditValue] = useState('')

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (editingCell) {
          // Cancel editing
          setEditingCell(null)
          setEditValue('')
        } else if (activeModal) {
          // Close modal
          closeModal()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeModal, editingCell])

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

  // Calculate system statistics
  const systemStats = useMemo(() => {
    const totalNodes = nodes.length
    const totalConnections = edges.length
    const avgConnectionsPerNode = totalNodes > 0 ? (totalConnections / totalNodes).toFixed(2) : 0
    const positiveConnections = edges.filter(edge => edge.data?.polarity === 'positive').length
    const negativeConnections = edges.filter(edge => edge.data?.polarity === 'negative').length
    
    return {
      totalNodes,
      totalConnections,
      avgConnectionsPerNode,
      positiveConnections,
      negativeConnections
    }
  }, [nodes, edges])

  const openModal = (modalType) => {
    setActiveModal(modalType)
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingCell(null)
    setEditValue('')
  }

  const startEditing = (type, id, currentValue) => {
    setEditingCell({ type, id, field: 'description' })
    setEditValue(currentValue)
  }

  const saveEdit = () => {
    if (!editingCell) return

    const { type, id } = editingCell
    
    if (type === 'node') {
      updateNodeDescription(id, editValue)
    } else if (type === 'edge') {
      updateEdgeDescription(id, editValue)
    }

    setEditingCell(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  const renderEditableCell = (type, id, value) => {
    const isEditing = editingCell && editingCell.type === type && editingCell.id === id

    if (isEditing) {
      return (
        <div className="editable-cell">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={saveEdit}
            autoFocus
            className="edit-textarea"
            rows={2}
          />
          <div className="edit-actions">
            <button 
              className="edit-save-btn" 
              onClick={saveEdit}
              title="Save (Enter)"
            >
              ✓
            </button>
            <button 
              className="edit-cancel-btn" 
              onClick={cancelEdit}
              title="Cancel (Esc)"
            >
              ✕
            </button>
          </div>
        </div>
      )
    }

    return (
      <div 
        className="description-cell clickable"
        onClick={() => startEditing(type, id, value)}
        title="Click to edit description"
      >
        {value}
      </div>
    )
  }

  const renderModal = () => {
    if (!activeModal) return null

    const modalTitles = {
      nodes: 'Nodes Analysis',
      connections: 'Connections Analysis',
      stats: 'System Statistics'
    }

    const renderModalContent = () => {
      switch (activeModal) {
        case 'nodes':
          return (
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
                  <tr key={node.id}>
                    <td className="id-cell">{node.id}</td>
                    <td className="label-cell">{node.label}</td>
                    <td className="count-cell">{node.inCount}</td>
                    <td className="count-cell">{node.outCount}</td>
                    <td className="description-cell">
                      {renderEditableCell('node', node.id, node.description)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )

        case 'connections':
          return (
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
                  <tr key={connection.id}>
                    <td className="id-cell">{connection.id}</td>
                    <td className="node-cell">{connection.fromNode}</td>
                    <td className={`polarity-cell ${connection.polarity}`}>
                      {connection.polarity === 'positive' ? '+' : '-'}
                    </td>
                    <td className="node-cell">{connection.toNode}</td>
                    <td className="description-cell">
                      {renderEditableCell('edge', connection.id, connection.description)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )

        case 'stats':
          return (
            <table className="analysis-table modal-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="metric-cell">Total Nodes</td>
                  <td className="value-cell">{systemStats.totalNodes}</td>
                  <td className="description-cell">Number of variables in the system</td>
                </tr>
                <tr>
                  <td className="metric-cell">Total Connections</td>
                  <td className="value-cell">{systemStats.totalConnections}</td>
                  <td className="description-cell">Number of causal relationships</td>
                </tr>
                <tr>
                  <td className="metric-cell">Avg Connections/Node</td>
                  <td className="value-cell">{systemStats.avgConnectionsPerNode}</td>
                  <td className="description-cell">Average connections per variable</td>
                </tr>
                <tr>
                  <td className="metric-cell">Positive Connections</td>
                  <td className="value-cell positive">{systemStats.positiveConnections}</td>
                  <td className="description-cell">Same-direction relationships</td>
                </tr>
                <tr>
                  <td className="metric-cell">Negative Connections</td>
                  <td className="value-cell negative">{systemStats.negativeConnections}</td>
                  <td className="description-cell">Opposite-direction relationships</td>
                </tr>
              </tbody>
            </table>
          )

        default:
          return null
      }
    }

    return (
      <div className="analysis-modal-overlay" onClick={closeModal}>
        <div className="analysis-modal" onClick={(e) => e.stopPropagation()}>
          <div className="analysis-modal-header">
            <h3>{modalTitles[activeModal]}</h3>
            <button className="analysis-modal-close" onClick={closeModal}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="analysis-modal-content">
            {renderModalContent()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="analysis-tab">
      <div className="analysis-container">
        {/* Table 1: List of Nodes */}
        <div className="analysis-section">
          <div className="section-header">
            <h3 className="section-title">Nodes Analysis</h3>
            <button 
              className="view-modal-btn"
              onClick={() => openModal('nodes')}
              title="View in full screen"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
          </div>
          <div className="table-container">
            <table className="analysis-table">
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
                  <tr key={node.id}>
                    <td className="id-cell">{node.id}</td>
                    <td className="label-cell">{node.label}</td>
                    <td className="count-cell">{node.inCount}</td>
                    <td className="count-cell">{node.outCount}</td>
                    <td className="description-cell">{node.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: List of Connections/Links */}
        <div className="analysis-section">
          <div className="section-header">
            <h3 className="section-title">Connections Analysis</h3>
            <button 
              className="view-modal-btn"
              onClick={() => openModal('connections')}
              title="View in full screen"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
          </div>
          <div className="table-container">
            <table className="analysis-table">
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
                  <tr key={connection.id}>
                    <td className="id-cell">{connection.id}</td>
                    <td className="node-cell">{connection.fromNode}</td>
                    <td className={`polarity-cell ${connection.polarity}`}>
                      {connection.polarity === 'positive' ? '+' : '-'}
                    </td>
                    <td className="node-cell">{connection.toNode}</td>
                    <td className="description-cell">{connection.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: System Statistics */}
        <div className="analysis-section">
          <div className="section-header">
            <h3 className="section-title">System Statistics</h3>
            <button 
              className="view-modal-btn"
              onClick={() => openModal('stats')}
              title="View in full screen"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
          </div>
          <div className="table-container">
            <table className="analysis-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="metric-cell">Total Nodes</td>
                  <td className="value-cell">{systemStats.totalNodes}</td>
                  <td className="description-cell">Number of variables in the system</td>
                </tr>
                <tr>
                  <td className="metric-cell">Total Connections</td>
                  <td className="value-cell">{systemStats.totalConnections}</td>
                  <td className="description-cell">Number of causal relationships</td>
                </tr>
                <tr>
                  <td className="metric-cell">Avg Connections/Node</td>
                  <td className="value-cell">{systemStats.avgConnectionsPerNode}</td>
                  <td className="description-cell">Average connections per variable</td>
                </tr>
                <tr>
                  <td className="metric-cell">Positive Connections</td>
                  <td className="value-cell positive">{systemStats.positiveConnections}</td>
                  <td className="description-cell">Same-direction relationships</td>
                </tr>
                <tr>
                  <td className="metric-cell">Negative Connections</td>
                  <td className="value-cell negative">{systemStats.negativeConnections}</td>
                  <td className="description-cell">Opposite-direction relationships</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  )
}

export default AnalysisTab 
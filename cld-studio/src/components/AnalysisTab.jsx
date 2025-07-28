import React, { useMemo, useState, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import SimplifiedAdjacencyMatrix from './SimplifiedAdjacencyMatrix'
import AdjacencyMatrix from './AdjacencyMatrix'

function AnalysisTab() {
  const { 
    nodes, 
    edges, 
    allLoops, 
    updateNodeDescription, 
    updateEdgeDescription,
    setHoveredNode,
    clearHoveredNode,
    setHoveredEdge,
    clearHoveredEdge,
    setHighlightedLoop,
    clearHighlightedLoop
  } = useCLDStore()
  const [activeModal, setActiveModal] = useState(null) // 'nodes', 'connections', 'stats', or null
  const [editingCell, setEditingCell] = useState(null) // { type: 'node'|'edge', id: number, field: 'description' }
  const [editValue, setEditValue] = useState('')
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [modalSize, setModalSize] = useState({ width: '700px', height: '450px' })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [showAdjacencyMatrix, setShowAdjacencyMatrix] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({
    nodes: true,
    connections: true,
    stats: true,
    adjMatrix: true
  })


  // Handle ESC key to close modal and global mouse events
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
        } else if (showAdjacencyMatrix) {
          // Close adjacency matrix modal
          setShowAdjacencyMatrix(false)
        }
      }
    }

    const handleGlobalMouseMove = (e) => {
      if (isDragging || isResizing) {
        handleMouseMove(e)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isDragging || isResizing) {
        handleMouseUp()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [activeModal, editingCell, isDragging, isResizing, dragStart, resizeStart, resizeDirection, modalPosition, showAdjacencyMatrix])

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
    
    // Find node with maximum out connections
    const maxOutNode = nodeAnalysis.length > 0 ? 
      nodeAnalysis.reduce((max, node) => node.outCount > max.outCount ? node : max) : null
    
    // Find node with maximum in connections
    const maxInNode = nodeAnalysis.length > 0 ? 
      nodeAnalysis.reduce((max, node) => node.inCount > max.inCount ? node : max) : null
    
    return {
      totalNodes,
      totalConnections,
      avgConnectionsPerNode,
      positiveConnections,
      negativeConnections,
      maxOutNode: maxOutNode ? { label: maxOutNode.label, count: maxOutNode.outCount } : null,
      maxInNode: maxInNode ? { label: maxInNode.label, count: maxInNode.inCount } : null,
      topLoopsCount: allLoops.length
    }
  }, [nodes, edges, nodeAnalysis, allLoops])

  const openModal = (modalType) => {
    setActiveModal(modalType)
    // Reset position when opening modal
    setModalPosition({ x: 0, y: 0 })
    
    // Calculate initial size based on content
    let initialWidth = '600px'
    let initialHeight = '400px'
    
    // Set minimum sizes that should fit most content
    switch (modalType) {
      case 'nodes':
        initialWidth = '800px'
        initialHeight = '500px'
        break
      case 'connections':
        initialWidth = '900px'
        initialHeight = '500px'
        break
      case 'stats':
        initialWidth = '600px'
        initialHeight = '400px'
        break
      default:
        initialWidth = '700px'
        initialHeight = '450px'
    }
    
    setModalSize({ width: initialWidth, height: initialHeight })
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingCell(null)
    setEditValue('')
  }

  const toggleSectionCollapse = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const collapseAllSections = () => {
    setCollapsedSections({
      nodes: true,
      connections: true,
      stats: true,
      adjMatrix: true
    })
  }

  const expandAllSections = () => {
    setCollapsedSections({
      nodes: false,
      connections: false,
      stats: false,
      adjMatrix: false
    })
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  // Modal drag and resize handlers
  const handleDragStart = (e) => {
    if (e.target.classList.contains('analysis-modal-drag-handle') || e.target.closest('.analysis-modal-header')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - modalPosition.x, y: e.clientY - modalPosition.y })
    }
  }

  const handleResizeStart = (e, direction) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    const modal = e.target.closest('.analysis-modal')
    const rect = modal.getBoundingClientRect()
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height
    })
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setModalPosition({ x: newX, y: newY })
    } else if (isResizing) {
      e.preventDefault()
      e.stopPropagation()
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(600, resizeStart.width + deltaX)
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(600, resizeStart.width - deltaX)
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(400, resizeStart.height + deltaY)
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(400, resizeStart.height - deltaY)
      }
      
      setModalSize({ width: `${newWidth}px`, height: `${newHeight}px` })
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
    }
    if (isResizing) {
      setIsResizing(false)
      setResizeDirection(null)
    }
  }

  const renderEditableCell = (type, id, value) => {
    const isEditing = editingCell && editingCell.type === type && editingCell.id === id

    if (isEditing) {
      return (
        <div 
          className="description-cell editing"
          contentEditable
          suppressContentEditableWarning={true}
          onInput={(e) => setEditValue(e.currentTarget.textContent)}
          onKeyDown={handleEditKeyDown}
          onBlur={saveEdit}
          autoFocus
          dangerouslySetInnerHTML={{ __html: editValue }}
        />
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
            </div>
          )

        case 'connections':
          return (
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
            </div>
          )

        case 'stats':
          return (
            <div className="modal-table-container">
              <table className="analysis-table modal-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="metric-cell">Total Nodes</td>
                    <td className="value-cell">{systemStats.totalNodes}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Total Connections</td>
                    <td className="value-cell">{systemStats.totalConnections}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Avg Connections/Node</td>
                    <td className="value-cell">{systemStats.avgConnectionsPerNode}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Positive Connections</td>
                    <td className="value-cell positive">{systemStats.positiveConnections}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Negative Connections</td>
                    <td className="value-cell negative">{systemStats.negativeConnections}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Max Out Connections</td>
                    <td className="value-cell">{systemStats.maxOutNode ? `${systemStats.maxOutNode.label} (${systemStats.maxOutNode.count})` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Max In Connections</td>
                    <td className="value-cell">{systemStats.maxInNode ? `${systemStats.maxInNode.label} (${systemStats.maxInNode.count})` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Top Loops</td>
                    <td className="value-cell">{systemStats.topLoopsCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )

        default:
          return null
      }
    }

    return (
      <div className={`analysis-modal-overlay ${isResizing ? 'resizing' : ''}`} onClick={(e) => {
        // Only close if clicking directly on the overlay, not on modal or during resize
        if (e.target === e.currentTarget && !isResizing && !isDragging) {
          closeModal()
        }
      }}>
        <div 
          className={`analysis-modal ${isResizing ? 'resizing' : ''}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: modalSize.width,
            height: modalSize.height,
            transform: `translate(calc(-50% + ${modalPosition.x}px), calc(-50% + ${modalPosition.y}px))`
          }}
        >
          {/* Resize handles */}
          <div 
            className="analysis-modal-resize-handle top"
            onMouseDown={(e) => handleResizeStart(e, 'top')}
          ></div>
          <div 
            className="analysis-modal-resize-handle bottom"
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          ></div>
          <div 
            className="analysis-modal-resize-handle left"
            onMouseDown={(e) => handleResizeStart(e, 'left')}
          ></div>
          <div 
            className="analysis-modal-resize-handle right"
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          ></div>
          
          {/* Drag handle */}
          <div 
            className="analysis-modal-drag-handle"
            onMouseDown={handleDragStart}
          ></div>
          
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
        {/* Control Groups */}
        <div className="control-groups">
          <div className="control-group">
            <button 
              className="control-toggle"
              onClick={() => openModal('nodes')}
              title="Node Analysis - View detailed node information and statistics"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
          
          <div className="control-group">
            <button 
              className="control-toggle"
              onClick={() => openModal('connections')}
              title="Connection Analysis - View detailed connection information and polarity"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
          
          <div className="control-group">
            <button 
              className="control-toggle"
              onClick={() => openModal('stats')}
              title="System Statistics - View comprehensive system metrics and analysis"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
          
          <div className="control-group">
            <button 
              className="control-toggle"
              onClick={() => setShowAdjacencyMatrix(true)}
              title="Adjacency Matrix - View detailed connection matrix with node relationships"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3v18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15h18" />
              </svg>
            </button>
          </div>

          <div className="control-group">
            <button 
              className="control-toggle"
              onClick={collapseAllSections}
              title="Collapse All Sections"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="control-group">
            <button 
              className="control-toggle"
              onClick={expandAllSections}
              title="Expand All Sections"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table 1: List of Nodes */}
        <div className="analysis-section">
          <div className="section-header">
            <h3 className="section-title">Nodes Analysis</h3>
            <div className="section-controls">
              <button 
                className="view-modal-btn"
                onClick={() => openModal('nodes')}
                title="View in full screen"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View
              </button>
              <button 
                className="collapse-btn"
                onClick={() => toggleSectionCollapse('nodes')}
                title={collapsedSections.nodes ? "Expand section" : "Collapse section"}
              >
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                  <path d={collapsedSections.nodes ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            </div>
          </div>
          {!collapsedSections.nodes && (
            <div className="table-container">
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Label</th>
                    <th>In Count</th>
                    <th>Out Count</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table 2: List of Connections/Links */}
        <div className="analysis-section">
          <div className="section-header">
            <h3 className="section-title">Connections Analysis</h3>
            <div className="section-controls">
              <button 
                className="view-modal-btn"
                onClick={() => openModal('connections')}
                title="View in full screen"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View
              </button>
              <button 
                className="collapse-btn"
                onClick={() => toggleSectionCollapse('connections')}
                title={collapsedSections.connections ? "Expand section" : "Collapse section"}
              >
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                  <path d={collapsedSections.connections ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            </div>
          </div>
          {!collapsedSections.connections && (
            <div className="table-container">
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>From Node</th>
                    <th>Polarity</th>
                    <th>To Node</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table 3: System Statistics */}
        <div className="analysis-section">
          <div className="section-header">
            <h3 className="section-title">System Statistics</h3>
            <div className="section-controls">
              <button 
                className="view-modal-btn"
                onClick={() => openModal('stats')}
                title="View in full screen"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View
              </button>
              <button 
                className="collapse-btn"
                onClick={() => toggleSectionCollapse('stats')}
                title={collapsedSections.stats ? "Expand section" : "Collapse section"}
              >
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                  <path d={collapsedSections.stats ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            </div>
          </div>
          {!collapsedSections.stats && (
            <div className="table-container">
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="metric-cell">Total Nodes</td>
                    <td className="value-cell">{systemStats.totalNodes}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Total Connections</td>
                    <td className="value-cell">{systemStats.totalConnections}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Avg Connections/Node</td>
                    <td className="value-cell">{systemStats.avgConnectionsPerNode}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Positive Connections</td>
                    <td className="value-cell positive">{systemStats.positiveConnections}</td>
                  </tr>
                  <tr>
                    <td className="metric-cell">Negative Connections</td>
                    <td className="value-cell negative">{systemStats.negativeConnections}</td>
                  </tr>
                  <tr
                    onMouseEnter={() => {
                      if (systemStats.maxOutNode) {
                        const maxOutNode = nodes.find(n => n.data?.label === systemStats.maxOutNode.label)
                        if (maxOutNode) setHoveredNode(maxOutNode.id)
                      }
                    }}
                    onMouseLeave={() => clearHoveredNode()}
                  >
                    <td className="metric-cell">Max Out Connections</td>
                    <td className="value-cell">{systemStats.maxOutNode ? `${systemStats.maxOutNode.label} (${systemStats.maxOutNode.count})` : 'N/A'}</td>
                  </tr>
                  <tr
                    onMouseEnter={() => {
                      if (systemStats.maxInNode) {
                        const maxInNode = nodes.find(n => n.data?.label === systemStats.maxInNode.label)
                        if (maxInNode) setHoveredNode(maxInNode.id)
                      }
                    }}
                    onMouseLeave={() => clearHoveredNode()}
                  >
                    <td className="metric-cell">Max In Connections</td>
                    <td className="value-cell">{systemStats.maxInNode ? `${systemStats.maxInNode.label} (${systemStats.maxInNode.count})` : 'N/A'}</td>
                  </tr>
                  <tr
                    onMouseEnter={() => {
                      if (systemStats.topLoopsCount > 0 && allLoops.length > 0) {
                        // Highlight the first (longest) loop
                        setHighlightedLoop(0)
                      }
                    }}
                    onMouseLeave={() => clearHighlightedLoop()}
                  >
                    <td className="metric-cell">Top Loops</td>
                    <td className="value-cell">{systemStats.topLoopsCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table 4: Simplified Adjacency Matrix */}
        <div className="analysis-section">
          <div className="section-header">
            <h3 className="section-title">Adjacency Matrix</h3>
            <div className="section-controls">
              <button 
                className="view-modal-btn"
                onClick={() => setShowAdjacencyMatrix(true)}
                title="View detailed adjacency matrix"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View
              </button>
              <button 
                className="collapse-btn"
                onClick={() => toggleSectionCollapse('adjMatrix')}
                title={collapsedSections.adjMatrix ? "Expand section" : "Collapse section"}
              >
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                  <path d={collapsedSections.adjMatrix ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            </div>
          </div>
          {!collapsedSections.adjMatrix && (
            <div className="table-container">
              <SimplifiedAdjacencyMatrix />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
      
      {/* Adjacency Matrix Modal */}
      {showAdjacencyMatrix && (
        <AdjacencyMatrix onClose={() => setShowAdjacencyMatrix(false)} />
      )}
    </div>
  )
}

export default AnalysisTab 
import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import AnalysisTab from './AnalysisTab'
import { Infinity } from 'lucide-react'

function SysLoopSidebar({ mode, loops, dimmingEnabled, setDimmingEnabled, hoveredLoop, setHoveredLoop }) {
  const [problemStatement, setProblemStatement] = useState('Describe the problem here...')
  const [showMatrix, setShowMatrix] = useState(false)
  const [activeTab, setActiveTab] = useState('problem') // 'problem', 'loops', 'analysis'
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [isResizing, setIsResizing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Modal state for loops detail view
  const [showLoopsModal, setShowLoopsModal] = useState(false)
  const [editingCell, setEditingCell] = useState(null) // { type: 'loop', id: number, field: 'description' }
  const [editValue, setEditValue] = useState('')
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [modalSize, setModalSize] = useState({ width: '800px', height: '500px' })
  const [isModalDragging, setIsModalDragging] = useState(false)
  const [isModalResizing, setIsModalResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const sidebarRef = useRef(null)
  const { 
    highlightedLoop, 
    setHighlightedLoop, 
    clearHighlightedLoop,
    enterLoopViewMode,
    exitLoopViewMode,
    nodes,
    adjacencyMatrix,
    simulationMode,
    toggleSimulationMode,
    updateLoopDescription
  } = useCLDStore()

  // Constants for sidebar dimensions
  const MIN_WIDTH = 320 // Minimum width to fit tab labels comfortably
  const MAX_WIDTH = 600 // Maximum width
  const COLLAPSED_WIDTH = 48 // Width when collapsed (just enough for collapse button)

  // Handle resize functionality
  useEffect(() => {
    let animationId = null

    const handleMouseMove = (e) => {
      if (!isResizing) return
      
      // Cancel any pending animation frame
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      
      // Use requestAnimationFrame for smooth updates
      animationId = requestAnimationFrame(() => {
        const newWidth = e.clientX
        
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
          setSidebarWidth(newWidth)
        }
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      
      // Cancel any pending animation frame
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      
      // Clean up animation frame
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isResizing])

  const handleResizeStart = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Modal functions for loops detail view
  const openLoopsModal = () => {
    setShowLoopsModal(true)
    setModalPosition({ x: 0, y: 0 })
    setModalSize({ width: '800px', height: '500px' })
  }

  const closeLoopsModal = () => {
    setShowLoopsModal(false)
    setEditingCell(null)
    setEditValue('')
  }

  const startEditing = (type, id, currentValue) => {
    setEditingCell({ type, id })
    setEditValue(currentValue)
  }

  const saveEdit = () => {
    if (editingCell && editValue !== undefined) {
      if (editingCell.type === 'loop') {
        updateLoopDescription(editingCell.id, editValue)
      }
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

  const handleModalDragStart = (e) => {
    if (e.target.classList.contains('analysis-modal-drag-handle') || e.target.closest('.analysis-modal-header')) {
      setIsModalDragging(true)
      setDragStart({ x: e.clientX - modalPosition.x, y: e.clientY - modalPosition.y })
    }
  }

  const handleModalResizeStart = (e, direction) => {
    e.stopPropagation()
    setIsModalResizing(true)
    setResizeDirection(direction)
    setResizeStart({ 
      x: e.clientX, 
      y: e.clientY, 
      width: parseInt(modalSize.width), 
      height: parseInt(modalSize.height) 
    })
  }

  const handleModalMouseMove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isModalDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      setModalPosition({ x: newX, y: newY })
    }
    
    if (isModalResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(500, resizeStart.width + deltaX)
      }
      if (resizeDirection.includes('left')) {
        newWidth = Math.max(500, resizeStart.width - deltaX)
        setModalPosition(prev => ({ ...prev, x: resizeStart.x + deltaX }))
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(300, resizeStart.height + deltaY)
      }
      if (resizeDirection.includes('top')) {
        newHeight = Math.max(300, resizeStart.height - deltaY)
        setModalPosition(prev => ({ ...prev, y: resizeStart.y + deltaY }))
      }
      
      setModalSize({ width: `${newWidth}px`, height: `${newHeight}px` })
    }
  }

  const handleModalMouseUp = () => {
    setIsModalDragging(false)
    setIsModalResizing(false)
    setResizeDirection(null)
  }

  // Global mouse event listeners for modal
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isModalDragging || isModalResizing) {
        handleModalMouseMove(e)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isModalDragging || isModalResizing) {
        handleModalMouseUp()
      }
    }

    if (showLoopsModal) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [showLoopsModal, isModalDragging, isModalResizing, dragStart, resizeStart, resizeDirection, modalPosition])

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

  const renderTabContent = () => {
    if (isCollapsed) return null

    switch (activeTab) {
      case 'problem':
        return (
          <div className="sidebar-section">
            <div className="section-title">Problem Statement</div>
            <textarea
              className="problem-textarea"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Describe the problem here..."
            />
          </div>
        )
      
      case 'loops':
        return (
          <div className="sidebar-section">
            {/* Loop Controls - Fixed */}
            <div style={{ 
              padding: '8px 12px', 
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: 'transparent'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Auto Dim Others
                  </span>
                  <button
                    onClick={() => setDimmingEnabled(!dimmingEnabled)}
                    style={{
                      width: '44px',
                      height: '24px',
                      border: 'none',
                      borderRadius: '12px',
                      background: dimmingEnabled ? '#10b981' : '#d1d5db',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s ease'
                    }}
                    title={dimmingEnabled ? 'Disable dimming' : 'Enable dimming'}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: dimmingEnabled ? '23px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }} />
                  </button>
                </div>
                <button
                  className="view-modal-btn"
                  onClick={openLoopsModal}
                  title="View loop details"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View
                </button>
              </div>
            </div>

            {/* Loops Table - Scrollable */}
            <div className="loops-scroll-container">
              {loops.length === 0 ? (
                <div className="no-loops">
                  <p>No loops found.</p>
                </div>
              ) : (
                <table className="loops-table-compact">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Length</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loops.map((loop, index) => (
                      <tr 
                        key={index}
                        className={highlightedLoop === index ? 'highlighted' : ''}
                        onClick={() => {
                          if (highlightedLoop === index) {
                            clearHighlightedLoop()
                            exitLoopViewMode()
                          } else {
                            setHighlightedLoop(index)
                            enterLoopViewMode()
                          }
                        }}
                        onMouseEnter={() => setHoveredLoop(index)}
                        onMouseLeave={() => setHoveredLoop(null)}
                      >
                        <td>{index + 1}</td>
                        <td>{loop.length}</td>
                        <td>
                          <span className={`loop-type-compact ${loop.type.toLowerCase()}`}>
                            {loop.type === 'Balancing' ? 'B' : 'R'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )
      
      case 'analysis':
        return <AnalysisTab />
      

      
      default:
        return null
    }
  }

  return (
    <div 
      className={`sysloop-sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''}`}
      ref={sidebarRef}
      style={{ 
        width: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${sidebarWidth}px`,
        minWidth: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${MIN_WIDTH}px`,
        maxWidth: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${MAX_WIDTH}px`
      }}
    >
      {/* Collapse/Expand Button */}
      <button
        className="sidebar-collapse-btn"
        onClick={toggleCollapse}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggleCollapse()
          }
        }}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg 
          width="16" 
          height="16" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Resize Handle - Only show when not collapsed */}
      {!isCollapsed && (
        <div 
          className={`sidebar-resize-handle ${isResizing ? 'dragging' : ''}`}
          onMouseDown={handleResizeStart}
        />
      )}
      
      {/* Tab Navigation - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="sidebar-tabs">
                  <button
          className={`sidebar-tab ${activeTab === 'problem' ? 'active' : ''}`}
          onClick={() => setActiveTab('problem')}
          title="Problem Statement"
        >
          <svg style={{ width: '16px', height: '16px', minWidth: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Problem
        </button>
                  <button
          className={`sidebar-tab ${activeTab === 'loops' ? 'active' : ''}`}
          onClick={() => setActiveTab('loops')}
          title="System Loops"
        >
          <Infinity style={{ width: '16px', height: '16px', minWidth: '16px', flexShrink: 0 }} />
          Loops
        </button>
                  <button
          className={`sidebar-tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
          title="Graph Analysis"
        >
          <svg style={{ width: '16px', height: '16px', minWidth: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analysis
        </button>

        </div>
      )}

      {/* Tab Content - Only show when not collapsed */}
      {!isCollapsed && (
        <div className="sidebar-content">
          {renderTabContent()}
        </div>
      )}

      {/* Loops Detail Modal */}
      {showLoopsModal && (
        <div 
          className="analysis-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isModalResizing && !isModalDragging) {
              closeLoopsModal()
            }
          }}
        >
          <div 
            className={`analysis-modal ${isModalResizing ? 'resizing' : ''}`}
            style={{
              width: modalSize.width,
              height: modalSize.height,
              transform: `translate(calc(-50% + ${modalPosition.x}px), calc(-50% + ${modalPosition.y}px))`
            }}
          >
            {/* Modal Header */}
            <div className="analysis-modal-header">
              <div className="analysis-modal-drag-handle" onMouseDown={handleModalDragStart} />
              <h3>Loop Details</h3>
              <button 
                className="analysis-modal-close"
                onClick={closeLoopsModal}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="analysis-modal-content">
              <div className="modal-table-container">
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Length</th>
                      <th>Type</th>
                      <th>Nodes</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loops.map((loop, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{loop.length}</td>
                        <td>
                          <span className={`loop-type-compact ${loop.type.toLowerCase()}`}>
                            {loop.type === 'Balancing' ? 'B' : 'R'}
                          </span>
                        </td>
                        <td>
                          {loop.nodes.map((nodeId, nodeIndex) => {
                            const node = nodes.find(n => n.id === nodeId)
                            return (
                              <span key={nodeId}>
                                {node?.data?.label || `Node ${nodeId}`}
                                {nodeIndex < loop.nodes.length - 1 ? ' → ' : ''}
                              </span>
                            )
                          })}
                        </td>
                        <td>
                          {renderEditableCell('loop', index, loop.description || 'No description')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resize Handles */}
            <div className="analysis-modal-resize-handle top" onMouseDown={(e) => handleModalResizeStart(e, 'top')} />
            <div className="analysis-modal-resize-handle bottom" onMouseDown={(e) => handleModalResizeStart(e, 'bottom')} />
            <div className="analysis-modal-resize-handle left" onMouseDown={(e) => handleModalResizeStart(e, 'left')} />
            <div className="analysis-modal-resize-handle right" onMouseDown={(e) => handleModalResizeStart(e, 'right')} />
          </div>
        </div>
      )}

    </div>
  )
}

export default SysLoopSidebar 
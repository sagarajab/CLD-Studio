import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import AnalysisTab from './AnalysisTab'
import { Infinity as InfinityIcon } from 'lucide-react'
import './SysLoopSidebar.css'

function SysLoopSidebar({ loops, dimmingEnabled, setDimmingEnabled, setHoveredLoop }) {
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
  
  // Analysis modal states
  const [activeAnalysisModal, setActiveAnalysisModal] = useState(null) // 'nodes', 'connections', 'stats', 'adjMatrix'
  const [analysisModalPosition, setAnalysisModalPosition] = useState({ x: 0, y: 0 })
  const [analysisModalSize, setAnalysisModalSize] = useState({ width: '700px', height: '450px' })
  const [isAnalysisModalDragging, setIsAnalysisModalDragging] = useState(false)
  const [isAnalysisModalResizing, setIsAnalysisModalResizing] = useState(false)
  const [analysisModalResizeDirection, setAnalysisModalResizeDirection] = useState(null)
  const [analysisModalDragStart, setAnalysisModalDragStart] = useState({ x: 0, y: 0 })
  const [analysisModalResizeStart, setAnalysisModalResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const sidebarRef = useRef(null)
  const { 
    highlightedLoop, 
    setHighlightedLoop, 
    clearHighlightedLoop,
    enterLoopViewMode,
    exitLoopViewMode,
    nodes,
    updateLoopDescription,
    problemStatement,
    updateProblemStatement
  } = useCLDStore()

  // Clear highlighted loop when leaving the loops tab
  useEffect(() => {
    if (activeTab !== 'loops' && highlightedLoop !== null) {
      clearHighlightedLoop()
      exitLoopViewMode()
    }
  }, [activeTab, highlightedLoop, clearHighlightedLoop, exitLoopViewMode])

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

  // Analysis modal functions
  const openAnalysisModal = (modalType) => {
    setActiveAnalysisModal(modalType)
    setAnalysisModalPosition({ x: 0, y: 0 })
    
    // Calculate initial size based on content
    let initialWidth = '600px'
    let initialHeight = '400px'
    
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
      case 'adjMatrix':
        initialWidth = '700px'
        initialHeight = '450px'
        break
      default:
        initialWidth = '700px'
        initialHeight = '450px'
    }
    
    setAnalysisModalSize({ width: initialWidth, height: initialHeight })
  }

  const closeAnalysisModal = () => {
    setActiveAnalysisModal(null)
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

  // Analysis modal handlers
  const handleAnalysisModalMouseMove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAnalysisModalDragging) {
      const newX = e.clientX - analysisModalDragStart.x
      const newY = e.clientY - analysisModalDragStart.y
      setAnalysisModalPosition({ x: newX, y: newY })
    }
    
    if (isAnalysisModalResizing) {
      const deltaX = e.clientX - analysisModalResizeStart.x
      const deltaY = e.clientY - analysisModalResizeStart.y
      
      let newWidth = analysisModalResizeStart.width
      let newHeight = analysisModalResizeStart.height
      
      if (analysisModalResizeDirection.includes('right')) {
        newWidth = Math.max(500, analysisModalResizeStart.width + deltaX)
      }
      if (analysisModalResizeDirection.includes('left')) {
        newWidth = Math.max(500, analysisModalResizeStart.width - deltaX)
        setAnalysisModalPosition(prev => ({ ...prev, x: analysisModalResizeStart.x + deltaX }))
      }
      if (analysisModalResizeDirection.includes('bottom')) {
        newHeight = Math.max(300, analysisModalResizeStart.height + deltaY)
      }
      if (analysisModalResizeDirection.includes('top')) {
        newHeight = Math.max(300, analysisModalResizeStart.height - deltaY)
        setAnalysisModalPosition(prev => ({ ...prev, y: analysisModalResizeStart.y + deltaY }))
      }
      
      setAnalysisModalSize({ width: `${newWidth}px`, height: `${newHeight}px` })
    }
  }

  const handleAnalysisModalMouseUp = () => {
    setIsAnalysisModalDragging(false)
    setIsAnalysisModalResizing(false)
    setAnalysisModalResizeDirection(null)
  }

  // Global mouse event listeners for modal
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isModalDragging || isModalResizing) {
        handleModalMouseMove(e)
      }
      if (isAnalysisModalDragging || isAnalysisModalResizing) {
        handleAnalysisModalMouseMove(e)
      }
    }

    const handleGlobalMouseUp = () => {
      if (isModalDragging || isModalResizing) {
        handleModalMouseUp()
      }
      if (isAnalysisModalDragging || isAnalysisModalResizing) {
        handleAnalysisModalMouseUp()
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
        <textarea
          className="description-cell editing"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={saveEdit}
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
              onChange={(e) => updateProblemStatement(e.target.value)}
              placeholder="Describe the problem here..."
            />
          </div>
        )
      
      case 'loops':
        return (
          <div className="sidebar-section">
            {/* Loop Controls - Fixed */}
            <div className="loop-controls-container">
              <div className="loop-controls-header">
                <div className="loop-controls-left">
                  <span className="auto-dim-label">
                    Auto Dim Others
                  </span>
                  <button
                    onClick={() => setDimmingEnabled(!dimmingEnabled)}
                    className={`toggle-switch ${dimmingEnabled ? 'enabled' : 'disabled'}`}
                    title={dimmingEnabled ? 'Disable dimming' : 'Enable dimming'}
                  >
                    <div className={`toggle-switch-thumb ${dimmingEnabled ? 'enabled' : 'disabled'}`} />
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
      className={`sysloop-sidebar ${isCollapsed ? 'collapsed' : ''} ${isResizing ? 'resizing' : ''} sidebar-container ${isCollapsed ? 'collapsed' : ''}`}
      ref={sidebarRef}
      style={{ 
        width: isCollapsed ? `${COLLAPSED_WIDTH}px` : `${sidebarWidth}px`
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
          className={`collapse-icon ${isCollapsed ? 'collapsed' : 'expanded'}`}
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
          <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Problem
        </button>
                  <button
          className={`sidebar-tab ${activeTab === 'loops' ? 'active' : ''}`}
          onClick={() => setActiveTab('loops')}
          title="System Loops"
        >
          <InfinityIcon className="tab-icon" />
          Loops
        </button>
                  <button
          className={`sidebar-tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
          title="Graph Analysis"
        >
          <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Collapsed State Icons - Only show when collapsed */}
      {isCollapsed && (
        <div className="collapsed-sidebar-icons">
          <button
            className="collapsed-icon-btn"
            onClick={() => openAnalysisModal('nodes')}
            title="Node Analysis"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          <button
            className="collapsed-icon-btn"
            onClick={() => openAnalysisModal('connections')}
            title="Connection Analysis"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          
          <button
            className="collapsed-icon-btn"
            onClick={() => openAnalysisModal('stats')}
            title="System Statistics"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          
          <button
            className="collapsed-icon-btn"
            onClick={() => openAnalysisModal('adjMatrix')}
            title="Adjacency Matrix"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3v18" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15h18" />
            </svg>
          </button>
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

      {/* Analysis Modals */}
      {activeAnalysisModal && (
        <div 
          className="analysis-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isAnalysisModalResizing && !isAnalysisModalDragging) {
              closeAnalysisModal()
            }
          }}
        >
          <div 
            className={`analysis-modal ${isAnalysisModalResizing ? 'resizing' : ''}`}
            style={{
              width: analysisModalSize.width,
              height: analysisModalSize.height,
              transform: `translate(calc(-50% + ${analysisModalPosition.x}px), calc(-50% + ${analysisModalPosition.y}px))`
            }}
          >
            {/* Modal Header */}
            <div className="analysis-modal-header">
              <div className="analysis-modal-drag-handle" onMouseDown={(e) => {
                setIsAnalysisModalDragging(true)
                setAnalysisModalDragStart({ x: e.clientX - analysisModalPosition.x, y: e.clientY - analysisModalPosition.y })
              }} />
              <h3>
                {activeAnalysisModal === 'nodes' && 'Nodes Analysis'}
                {activeAnalysisModal === 'connections' && 'Connections Analysis'}
                {activeAnalysisModal === 'stats' && 'System Statistics'}
                {activeAnalysisModal === 'adjMatrix' && 'Adjacency Matrix'}
              </h3>
              <button 
                className="analysis-modal-close"
                onClick={closeAnalysisModal}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="analysis-modal-content">
              {activeAnalysisModal === 'nodes' && (
                <div className="modal-table-container">
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Label</th>
                        <th>In Count</th>
                        <th>Out Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map(node => {
                        const inCount = nodes.filter(n => n.id === node.id).length
                        const outCount = nodes.filter(n => n.id === node.id).length
                        return (
                          <tr key={node.id}>
                            <td>{node.id}</td>
                            <td>{node.data?.label || 'Unnamed'}</td>
                            <td>{inCount}</td>
                            <td>{outCount}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeAnalysisModal === 'connections' && (
                <div className="modal-table-container">
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>From Node</th>
                        <th>Polarity</th>
                        <th>To Node</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* This would need to be populated with actual edge data */}
                      <tr>
                        <td colSpan="4" className="loops-table-cell">
                          Connection data would be displayed here
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeAnalysisModal === 'stats' && (
                <div className="modal-table-container">
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Nodes</td>
                        <td>{nodes.length}</td>
                      </tr>
                      <tr>
                        <td>Total Loops</td>
                        <td>{loops.length}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeAnalysisModal === 'adjMatrix' && (
                <div className="modal-table-container">
                  <div className="empty-loops-container">
                    Adjacency Matrix would be displayed here
                  </div>
                </div>
              )}
            </div>

            {/* Resize Handles */}
            <div className="analysis-modal-resize-handle top" onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsAnalysisModalResizing(true)
              setAnalysisModalResizeDirection('top')
              setAnalysisModalResizeStart({ 
                x: e.clientX, 
                y: e.clientY, 
                width: parseInt(analysisModalSize.width), 
                height: parseInt(analysisModalSize.height) 
              })
            }} />
            <div className="analysis-modal-resize-handle bottom" onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsAnalysisModalResizing(true)
              setAnalysisModalResizeDirection('bottom')
              setAnalysisModalResizeStart({ 
                x: e.clientX, 
                y: e.clientY, 
                width: parseInt(analysisModalSize.width), 
                height: parseInt(analysisModalSize.height) 
              })
            }} />
            <div className="analysis-modal-resize-handle left" onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsAnalysisModalResizing(true)
              setAnalysisModalResizeDirection('left')
              setAnalysisModalResizeStart({ 
                x: e.clientX, 
                y: e.clientY, 
                width: parseInt(analysisModalSize.width), 
                height: parseInt(analysisModalSize.height) 
              })
            }} />
            <div className="analysis-modal-resize-handle right" onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsAnalysisModalResizing(true)
              setAnalysisModalResizeDirection('right')
              setAnalysisModalResizeStart({ 
                x: e.clientX, 
                y: e.clientY, 
                width: parseInt(analysisModalSize.width), 
                height: parseInt(analysisModalSize.height) 
              })
            }} />
          </div>
        </div>
      )}

    </div>
  )
}

export default SysLoopSidebar 
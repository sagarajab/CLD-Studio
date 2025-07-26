import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import AnalysisTab from './AnalysisTab'

function SysLoopSidebar({ mode, loops, dimmingEnabled, setDimmingEnabled, hoveredLoop, setHoveredLoop }) {
  const [problemStatement, setProblemStatement] = useState('Describe the problem here...')
  const [showMatrix, setShowMatrix] = useState(false)
  const [activeTab, setActiveTab] = useState('problem') // 'problem', 'loops', 'analysis'
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [isResizing, setIsResizing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const sidebarRef = useRef(null)
  const { 
    highlightedLoop, 
    setHighlightedLoop, 
    clearHighlightedLoop,
    enterLoopViewMode,
    exitLoopViewMode,
    nodes,
    adjacencyMatrix
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
              backgroundColor: '#f9fafb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px'
              }}>
                <button
                  onClick={() => {
                    setHighlightedLoop(null)
                    exitLoopViewMode()
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    background: highlightedLoop === null ? '#3b82f6' : '#ffffff',
                    color: highlightedLoop === null ? '#ffffff' : '#374151',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}
                  title="Clear loop selection"
                >
                  ✕
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>Dim</span>
                  <button
                    onClick={() => setDimmingEnabled(!dimmingEnabled)}
                    style={{
                      width: '32px',
                      height: '16px',
                      border: 'none',
                      borderRadius: '8px',
                      background: dimmingEnabled ? '#10b981' : '#d1d5db',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s ease'
                    }}
                    title={dimmingEnabled ? 'Disable dimming' : 'Enable dimming'}
                  >
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '2px',
                      left: dimmingEnabled ? '18px' : '2px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }} />
                  </button>
                </div>

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
          <svg style={{ width: '16px', height: '16px', minWidth: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
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
    </div>
  )
}

export default SysLoopSidebar 
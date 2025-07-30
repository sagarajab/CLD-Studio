import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import './StateVectorModal.css'

function StateVectorModal({ isOpen, onClose }) {
  const { nodes, simulationState } = useCLDStore()
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [size, setSize] = useState({ width: 600, height: 400 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 })
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 })
  const [zIndex, setZIndex] = useState(2001)
  const modalRef = useRef(null)
  const headerRef = useRef(null)

  // Handle ESC key and global mouse events during resize
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    const handleGlobalMouseMove = (e) => {
      if (isResizing || isDragging) {
        handleMouseMove(e)
      }
    }
    
    const handleGlobalMouseUp = () => {
      if (isResizing || isDragging) {
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
  }, [isOpen, onClose, isResizing, isDragging])

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    // Check if the click is within the header area (including title and close button)
    const headerElement = headerRef.current
    if (headerElement && headerElement.contains(e.target)) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
      // Bring modal to front when clicked
      setZIndex(prev => prev + 1)
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      let newWidth = originalSize.width
      let newHeight = originalSize.height
      let newX = originalPosition.x
      let newY = originalPosition.y
      
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(400, originalSize.width + deltaX)
      }
      if (resizeDirection.includes('left')) {
        const widthChange = Math.min(deltaX, originalSize.width - 400)
        newWidth = Math.max(400, originalSize.width - widthChange)
        newX = originalPosition.x + widthChange
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(300, originalSize.height + deltaY)
      }
      if (resizeDirection.includes('top')) {
        const heightChange = Math.min(deltaY, originalSize.height - 300)
        newHeight = Math.max(300, originalSize.height - heightChange)
        newY = originalPosition.y + heightChange
      }
      
      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection('')
  }

  // Resize handle
  const handleResizeStart = (e, direction) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStart({
      x: e.clientX,
      y: e.clientY
    })
    setOriginalSize({
      width: size.width,
      height: size.height
    })
    setOriginalPosition({
      x: position.x,
      y: position.y
    })
  }

  if (!isOpen) return null

  // Get state vectors
  const getStateVector = (stepIndex) => {
    if (stepIndex < 0 || !simulationState.valueHistory || stepIndex >= simulationState.valueHistory.length) {
      return new Array(nodes.length).fill(0)
    }
    return simulationState.valueHistory[stepIndex] || new Array(nodes.length).fill(0)
  }

  const currentStep = simulationState.currentStep
  const s_t_minus_1 = getStateVector(currentStep - 1)
  const s_t = getStateVector(currentStep)
  const s_t_plus_1 = getStateVector(currentStep + 1)

  return (
    <div
      ref={modalRef}
      className={`state-vector-modal ${isDragging ? 'dragging' : 'default'}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex
      }}
      onMouseDown={handleMouseDown}
    >
        {/* Header */}
        <div
          ref={headerRef}
          className="state-vector-modal-header"
        >
          <h3 className="state-vector-modal-title">
            State Vectors - Step {currentStep}
          </h3>
          <button
            onClick={onClose}
            className="state-vector-modal-close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="state-vector-modal-content">
          <div className="state-vector-description">
            Showing state vectors for step {currentStep}. S(t-1) = previous step, S(t) = current step, S(t+1) = next step.
          </div>
          
          <div className="state-vector-table-container">
            <table className="state-vector-table">
              <thead>
                <tr className="state-vector-table-header">
                  <th>Node</th>
                  <th className="center">S(t-1)</th>
                  <th className="center highlighted">S(t)</th>
                  <th className="center">S(t+1)</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node, index) => (
                  <tr key={node.id} className="state-vector-table-row">
                    <td className="state-vector-table-cell">
                      {node.data.label || `Node ${node.id}`}
                    </td>
                    <td className="state-vector-table-cell center">
                      {(() => {
                        const value = s_t_minus_1[index]
                        if (value === undefined || value === null) return '0.00'
                        if (Math.abs(value) >= 1000) {
                          return value.toExponential(2)
                        }
                        return value.toFixed(2)
                      })()}
                    </td>
                    <td className="state-vector-table-cell center highlighted">
                      {(() => {
                        const value = s_t[index]
                        if (value === undefined || value === null) return '0.00'
                        if (Math.abs(value) >= 1000) {
                          return value.toExponential(2)
                        }
                        return value.toFixed(2)
                      })()}
                    </td>
                    <td className="state-vector-table-cell center">
                      {(() => {
                        const value = s_t_plus_1[index]
                        if (value === undefined || value === null) return '0.00'
                        if (Math.abs(value) >= 1000) {
                          return value.toExponential(2)
                        }
                        return value.toFixed(2)
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Border resize handles */}
        {/* Top border */}
        <div
          className="state-vector-resize-handle top"
          onMouseDown={(e) => handleResizeStart(e, 'top')}
        />
        
        {/* Right border */}
        <div
          className="state-vector-resize-handle right"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        />
        
        {/* Bottom border */}
        <div
          className="state-vector-resize-handle bottom"
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        />
        
        {/* Left border */}
        <div
          className="state-vector-resize-handle left"
          onMouseDown={(e) => handleResizeStart(e, 'left')}
        />
        
        {/* Corner resize handles */}
        {/* Top-left corner */}
        <div
          className="state-vector-resize-handle top-left"
          onMouseDown={(e) => handleResizeStart(e, 'top left')}
        />
        
        {/* Top-right corner */}
        <div
          className="state-vector-resize-handle top-right"
          onMouseDown={(e) => handleResizeStart(e, 'top right')}
        />
        
        {/* Bottom-right corner */}
        <div
          className="state-vector-resize-handle bottom-right"
          onMouseDown={(e) => handleResizeStart(e, 'bottom right')}
        />
        
        {/* Bottom-left corner */}
        <div
          className="state-vector-resize-handle bottom-left"
          onMouseDown={(e) => handleResizeStart(e, 'bottom left')}
        />
      </div>
  )
}

export default StateVectorModal 
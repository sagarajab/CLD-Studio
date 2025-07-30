import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'

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
              style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          cursor: isDragging ? 'grabbing' : 'default',
          zIndex: zIndex,
          pointerEvents: 'auto',
          userSelect: 'none'
        }}
              onMouseDown={handleMouseDown}
    >
        {/* Header */}
        <div
          ref={headerRef}
          style={{
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#333',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none'
          }}>
            State Vectors - Step {currentStep}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: '#333'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          <div style={{ marginBottom: '16px', fontSize: '14px', color: '#333' }}>
            Showing state vectors for step {currentStep}. S(t-1) = previous step, S(t) = current step, S(t+1) = next step.
          </div>
          
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'left', minWidth: '120px', color: '#333', fontWeight: '600' }}>
                    Node
                  </th>
                  <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center', minWidth: '80px', color: '#333', fontWeight: '600' }}>
                    S(t-1)
                  </th>
                  <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center', minWidth: '80px', backgroundColor: '#e3f2fd', color: '#333', fontWeight: '600' }}>
                    S(t)
                  </th>
                  <th style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center', minWidth: '80px', color: '#333', fontWeight: '600' }}>
                    S(t+1)
                  </th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node, index) => (
                  <tr key={node.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6', fontWeight: '500', color: '#333' }}>
                      {node.data.label || `Node ${node.id}`}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center', fontFamily: 'monospace', color: '#333' }}>
                      {(() => {
                        const value = s_t_minus_1[index]
                        if (value === undefined || value === null) return '0.00'
                        if (Math.abs(value) >= 1000) {
                          return value.toExponential(2)
                        }
                        return value.toFixed(2)
                      })()}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center', fontFamily: 'monospace', backgroundColor: '#f3f8ff', color: '#333' }}>
                      {(() => {
                        const value = s_t[index]
                        if (value === undefined || value === null) return '0.00'
                        if (Math.abs(value) >= 1000) {
                          return value.toExponential(2)
                        }
                        return value.toFixed(2)
                      })()}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #dee2e6', textAlign: 'center', fontFamily: 'monospace', color: '#333' }}>
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
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '8px',
            cursor: 'ns-resize',
            zIndex: 1,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleResizeStart(e, 'top')}
        />
        
        {/* Right border */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            bottom: '0',
            width: '8px',
            cursor: 'ew-resize',
            zIndex: 1,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        />
        
        {/* Bottom border */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '8px',
            cursor: 'ns-resize',
            zIndex: 1,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleResizeStart(e, 'bottom')}
        />
        
        {/* Left border */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            bottom: '0',
            width: '8px',
            cursor: 'ew-resize',
            zIndex: 1,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleResizeStart(e, 'left')}
        />
        
        {/* Corner resize handles */}
        {/* Top-left corner */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '12px',
            height: '12px',
            cursor: 'nw-resize',
            zIndex: 2,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleResizeStart(e, 'top left')}
        />
        
        {/* Top-right corner */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '12px',
            height: '12px',
            cursor: 'ne-resize',
            zIndex: 2,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleResizeStart(e, 'top right')}
        />
        
        {/* Bottom-right corner */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '12px',
            height: '12px',
            cursor: 'se-resize',
            zIndex: 2,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleResizeStart(e, 'bottom right')}
        />
        
        {/* Bottom-left corner */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '12px',
            height: '12px',
            cursor: 'sw-resize',
            zIndex: 2,
            userSelect: 'none'
          }}
          onMouseDown={(e) => handleResizeStart(e, 'bottom left')}
        />
      </div>
  )
}

export default StateVectorModal 
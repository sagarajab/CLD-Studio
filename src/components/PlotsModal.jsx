import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function PlotsModal({ isOpen, onClose }) {
  const { nodes, simulationState } = useCLDStore()
  const [position, setPosition] = useState({ x: 700, y: 50 })
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 })
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 })
  const [zIndex, setZIndex] = useState(2002)
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
        newWidth = Math.max(600, originalSize.width + deltaX)
      }
      if (resizeDirection.includes('left')) {
        const widthChange = Math.min(deltaX, originalSize.width - 600)
        newWidth = Math.max(600, originalSize.width - widthChange)
        newX = originalPosition.x + widthChange
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(400, originalSize.height + deltaY)
      }
      if (resizeDirection.includes('top')) {
        const heightChange = Math.min(deltaY, originalSize.height - 400)
        newHeight = Math.max(400, originalSize.height - heightChange)
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

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!simulationState.valueHistory || simulationState.valueHistory.length === 0) {
      // Return initial node values if no simulation data
      if (nodes.length === 0) return []
      
      // Create just two data points to show the full range
      const dataPoints = [
        { step: 0 },
        { step: simulationState.maxSteps }
      ]
      
      nodes.forEach((node) => {
        const nodeLabel = node.data.label || `Node ${node.id}`
        const initialValue = node.data.value || 0
        dataPoints[0][nodeLabel] = initialValue
        dataPoints[1][nodeLabel] = initialValue
      })
      
      return dataPoints
    }
    
    // Create data points only up to the current simulation step
    const dataPoints = []
    const currentStep = simulationState.valueHistory.length - 1
    
    for (let step = 0; step <= currentStep; step++) {
      const dataPoint = { step }
      const values = simulationState.valueHistory[step]
      
      nodes.forEach((node, nodeIndex) => {
        const nodeLabel = node.data.label || `Node ${node.id}`
        const value = values[nodeIndex]
        dataPoint[nodeLabel] = typeof value === 'number' ? value : 0
      })
      
      dataPoints.push(dataPoint)
    }
    
    return dataPoints
  }, [simulationState.valueHistory, nodes, simulationState.maxSteps])

  // Memoize chart dimensions to prevent flickering during drag
  const chartDimensions = useMemo(() => ({
    width: size.width - 32, // Account for padding
    height: size.height - 120 // Account for header and padding
  }), [size.width, size.height])

  // Generate colors for each node
  const colors = useMemo(() => [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
    '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#800080', '#008000', '#000080', '#808000', '#800080'
  ], [])

  if (!isOpen) return null

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
          userSelect: 'none',
          willChange: isDragging ? 'transform' : 'auto'
        }}
              onMouseDown={handleMouseDown}
    >
        {/* Header */}
        <div
          ref={headerRef}
          style={{
            padding: '8px 12px',
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
            fontSize: '14px', 
            fontWeight: '600',
            color: '#333',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none'
          }}>
            Node Values Over Time
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
              color: '#666'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

                {/* Content */}
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
          

            
            {/* Chart */}
          <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '4px', padding: '16px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer 
                width="100%" 
                height="100%"
                key={`${chartDimensions.width}x${chartDimensions.height}`}
              >
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  style={{ willChange: 'auto' }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="step" 
                    domain={[0, simulationState.maxSteps]}
                    type="number"
                    allowDataOverflow={false}
                    tick={{ fontSize: 10 }}
                    axisLabel={{ fontSize: 10 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => {
                      if (Math.abs(value) >= 1000) {
                        return value.toExponential(2)
                      }
                      return value.toFixed(2)
                    }}
                    tick={{ fontSize: 10 }}
                    axisLabel={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value) => {
                      if (Math.abs(value) >= 1000) {
                        return [value.toExponential(4), 'Value']
                      }
                      return [value.toFixed(4), 'Value']
                    }}
                    contentStyle={{ fontSize: 10 }}
                  />
                  <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: 10 }} />
                  
                  {/* Show lines for all nodes (both initial values and simulation data) */}
                  {nodes.map((node, index) => {
                    const nodeLabel = node.data.label || `Node ${node.id}`
                    return (
                      <Line
                        key={node.id}
                        type="linear"
                        dataKey={nodeLabel}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ 
                          r: 2, 
                          fill: colors[index % colors.length],
                          stroke: colors[index % colors.length],
                          strokeWidth: 1
                        }}
                        activeDot={{ 
                          r: 4, 
                          fill: colors[index % colors.length],
                          stroke: colors[index % colors.length],
                          strokeWidth: 1
                        }}
                        isAnimationActive={false}
                        animationDuration={0}
                        connectNulls={false}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#666',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                {nodes.length > 0 ? 
                  'Sample data shown. Initialize and run a simulation to see real data.' : 
                  'No nodes available. Add nodes to see the chart.'
                }
              </div>
            )}
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

export default PlotsModal 
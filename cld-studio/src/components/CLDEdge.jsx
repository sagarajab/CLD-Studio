import React, { useState, useCallback } from 'react'
import { BaseEdge, EdgeLabelRenderer, useReactFlow } from 'reactflow'
import { useCLDStore } from '../stores/cldStore'

function CLDEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}) {
  const { updateEdge, selectedEdge, globalStyles } = useCLDStore()
  const { getNode } = useReactFlow()
  const polarity = data?.polarity || 'positive'
  const isSelected = selectedEdge === id

  // Get node centers
  const getNodeCenters = () => {
    const sourceNode = getNode(data?.source)
    const targetNode = getNode(data?.target)
    
    if (sourceNode && targetNode) {
      return {
        sourceX: sourceNode.position.x + (sourceNode.width || 100) / 2,
        sourceY: sourceNode.position.y + (sourceNode.height || 60) / 2,
        targetX: targetNode.position.x + (targetNode.width || 100) / 2,
        targetY: targetNode.position.y + (targetNode.height || 60) / 2
      }
    }
    
    // Fallback to handle positions if nodes not found
    return { sourceX, sourceY, targetX, targetY }
  }

  const { sourceX: centerSourceX, sourceY: centerSourceY, targetX: centerTargetX, targetY: centerTargetY } = getNodeCenters()

  // Get or initialize radius
  const getRadius = () => {
    if (data?.radius !== undefined) {
      return data.radius
    }
    // Default radius based on distance
    const dx = centerTargetX - centerSourceX
    const dy = centerTargetY - centerSourceY
    const distance = Math.sqrt(dx * dx + dy * dy)
    return Math.max(distance * 0.3, 30)
  }

  const [radius, setRadius] = useState(getRadius())
  const [isDraggingRadius, setIsDraggingRadius] = useState(false)

  const handleEdgeClick = () => {
    // Toggle polarity on click
    const newPolarity = polarity === 'positive' ? 'negative' : 'positive'
    updateEdge(id, { polarity: newPolarity })
  }

  // Calculate circular arc path
  const getCircularArcPath = () => {
    const dx = centerTargetX - centerSourceX
    const dy = centerTargetY - centerSourceY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // If nodes are too close or radius is too small, use a straight line
    if (distance < 20 || radius < 10) {
      return `M ${centerSourceX} ${centerSourceY} L ${centerTargetX} ${centerTargetY}`
    }
    
    // Calculate arc parameters
    const sweepFlag = 1 // Always use large arc for better visibility
    
    // Calculate the arc center
    const midX = (centerSourceX + centerTargetX) / 2
    const midY = (centerSourceY + centerTargetY) / 2
    
    // Calculate perpendicular vector for arc direction
    const perpX = -dy / distance
    const perpY = dx / distance
    
    // Arc center offset from midpoint
    const centerX = midX + perpX * radius
    const centerY = midY + perpY * radius
    
    // Calculate start and end angles
    const startAngle = Math.atan2(centerSourceY - centerY, centerSourceX - centerX)
    const endAngle = Math.atan2(centerTargetY - centerY, centerTargetX - centerX)
    
    // Ensure we go the shorter way around the circle
    let angleDiff = endAngle - startAngle
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
    
    const largeArcFlag = Math.abs(angleDiff) > Math.PI ? 1 : 0
    
    // Create SVG arc path
    const arcPath = `M ${centerSourceX} ${centerSourceY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${centerTargetX} ${centerTargetY}`
    
    return arcPath
  }

  const edgePath = getCircularArcPath()

  // Calculate label position on the arc
  const getLabelPosition = () => {
    const dx = centerTargetX - centerSourceX
    const dy = centerTargetY - centerSourceY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < 20 || radius < 10) {
      // For straight lines, use midpoint
      return {
        x: (centerSourceX + centerTargetX) / 2,
        y: (centerSourceY + centerTargetY) / 2
      }
    }
    
    // For arcs, calculate position at 50% along the arc
    const midX = (centerSourceX + centerTargetX) / 2
    const midY = (centerSourceY + centerTargetY) / 2
    const perpX = -dy / distance
    const perpY = dx / distance
    const centerX = midX + perpX * radius
    const centerY = midY + perpY * radius
    
    // Calculate midpoint angle
    const startAngle = Math.atan2(centerSourceY - centerY, centerSourceX - centerX)
    const endAngle = Math.atan2(centerTargetY - centerY, centerTargetX - centerX)
    let midAngle = (startAngle + endAngle) / 2
    
    // Adjust for arc direction
    let angleDiff = endAngle - startAngle
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI
    
    if (Math.abs(angleDiff) > Math.PI) {
      midAngle += Math.PI
    }
    
    return {
      x: centerX + radius * Math.cos(midAngle),
      y: centerY + radius * Math.sin(midAngle)
    }
  }

  const labelPos = getLabelPosition()

  // Calculate radius control point position
  const getRadiusControlPosition = () => {
    const dx = centerTargetX - centerSourceX
    const dy = centerTargetY - centerSourceY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < 20) {
      return { x: (centerSourceX + centerTargetX) / 2, y: (centerSourceY + centerTargetY) / 2 }
    }
    
    const midX = (centerSourceX + centerTargetX) / 2
    const midY = (centerSourceY + centerTargetY) / 2
    const perpX = -dy / distance
    const perpY = dx / distance
    
    return {
      x: midX + perpX * radius,
      y: midY + perpY * radius
    }
  }

  const radiusControlPos = getRadiusControlPosition()

  // Handle radius control dragging
  const handleRadiusControlMouseDown = useCallback((event) => {
    event.stopPropagation()
    setIsDraggingRadius(true)
  }, [])

  // Add global mouse event listeners for radius dragging
  React.useEffect(() => {
    if (isDraggingRadius) {
      const handleGlobalMouseMove = (event) => {
        const canvasElement = document.querySelector('.react-flow__pane')
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect()
          const mouseX = event.clientX - rect.left
          const mouseY = event.clientY - rect.top
          
          // Calculate new radius based on mouse position
          const midX = (centerSourceX + centerTargetX) / 2
          const midY = (centerSourceY + centerTargetY) / 2
          const dx = centerTargetX - centerSourceX
          const dy = centerTargetY - centerSourceY
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 0) {
            const perpX = -dy / distance
            const perpY = dx / distance
            
            // Calculate radius as distance from midpoint to mouse along perpendicular
            const newRadius = Math.abs((mouseX - midX) * perpX + (mouseY - midY) * perpY)
            setRadius(Math.max(newRadius, 10)) // Minimum radius of 10
          }
        }
      }

      const handleGlobalMouseUp = () => {
        setIsDraggingRadius(false)
        updateEdge(id, { radius })
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDraggingRadius, radius, centerSourceX, centerSourceY, centerTargetX, centerTargetY, updateEdge, id])

  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: globalStyles.arrowWidth,
      cursor: 'pointer',
      transition: 'none'
    }

    // Use individual edge color if available, otherwise fall back to global
    const edgeColor = data?.color || globalStyles.arrowColor
    baseStyle.stroke = edgeColor

    if (selected || isSelected) {
      baseStyle.strokeWidth = globalStyles.arrowWidth + 1
      baseStyle.filter = 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))'
    }

    return baseStyle
  }

  const getPolaritySymbol = () => {
    return polarity === 'positive' ? '+' : '−'
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={getEdgeStyle()}
        onClick={handleEdgeClick}
      />
      
      {/* Radius Control Point */}
      <circle
        cx={radiusControlPos.x}
        cy={radiusControlPos.y}
        r={5}
        fill={selected || isSelected ? '#3b82f6' : '#6b7280'}
        stroke="white"
        strokeWidth={2}
        cursor="ns-resize"
        style={{
          pointerEvents: 'all',
          opacity: selected || isSelected ? 1 : 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseDown={handleRadiusControlMouseDown}
        title="Drag to adjust arc radius"
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelPos.x}px,${labelPos.y}px)`,
            fontSize: 12,
            fontWeight: 'bold',
            pointerEvents: 'all',
            cursor: 'pointer',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: data?.color || globalStyles.arrowColor,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          onClick={handleEdgeClick}
          title={`Click to change polarity (currently ${polarity})`}
        >
          {getPolaritySymbol()}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default CLDEdge 
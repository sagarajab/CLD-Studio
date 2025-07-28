import React, { useState, useRef, useMemo } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { getEllipseDimensions } from '../utils/text'

function CLDNode({ 
  id, 
  data, 
  selected, 
  isInHighlightedLoop, 
  isInHoveredLoop,
  highlightedLoopType, 
  hoveredLoopType,
  onClick, 
  onMouseDown, 
  devMode = false, 
  isFromNode = false, 
  isCreatingConnection = false, 
  isRightMouseDown = false 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || 'New Node')
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef(null)
  const textRef = useRef(null)
  const { updateNode, globalStyles, simulationMode, simulationState, nodes, addEvent } = useCLDStore()

  // Calculate ellipse dimensions based on text content with wrapping
  const ellipseDimensions = useMemo(() => {
    return getEllipseDimensions(label, {
      fontSize: globalStyles.nodeFontSize,
      onConstraintViolation: addEvent
    })
  }, [label, globalStyles.nodeFontSize, addEvent])

  const handleLabelChange = (e) => {
    const newValue = e.target.value
    const lines = newValue.split('\n')
    
    // Check character limit
    if (newValue.length > 80) {
      addEvent('⚠️ Character limit exceeded (max 80 characters)')
      return
    }
    
    // Check if adding this change would exceed 4 lines
    if (lines.length <= 4) {
      setLabel(newValue)
    } else {
      addEvent('⚠️ Line limit exceeded (max 4 lines)')
    }
  }

  const handleLabelBlur = () => {
    setIsEditing(false)
    updateNode(id, { label })
  }

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter without Shift finishes editing
      e.preventDefault()
      setIsEditing(false)
      updateNode(id, { label })
    } else if (e.key === 'Escape') {
      // Escape cancels editing and reverts to original label
      e.preventDefault()
      setLabel(data.label || 'New Node')
      setIsEditing(false)
    }
    // Enter with Shift creates a new line (default textarea behavior)
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    if (!simulationMode) {
      setIsEditing(true)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }

  const handleClick = (e) => {
    e.stopPropagation()
    if (onClick) {
      onClick(e)
    }
  }

  const handleMouseDown = (e) => {
    e.stopPropagation()
    if (onMouseDown) {
      onMouseDown(e)
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Get node values from simulation state
  const nodeIndex = simulationState.accumulatedValues.length > 0 ? 
    nodes.findIndex(node => node.id === id) : -1
  
  const nodeValue = nodeIndex !== -1 ? simulationState.accumulatedValues[nodeIndex] || 0 : 0
  const lastIncrement = nodeIndex !== -1 ? simulationState.stateVector[nodeIndex] || 0 : 0

  return (
    <g>
      {/* Only one ellipse is visible at a time and handles all pointer events */}
      {devMode ? (
        <ellipse
          cx={ellipseDimensions.centerX}
          cy={ellipseDimensions.centerY}
          rx={ellipseDimensions.radiusX}
          ry={ellipseDimensions.radiusY}
          fill="none"
          stroke="red"
          strokeWidth="1"
          strokeDasharray="2,2"
          onContextMenu={(e) => e.preventDefault()}
          pointerEvents="all"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      ) : (
        <ellipse
          cx={ellipseDimensions.centerX}
          cy={ellipseDimensions.centerY}
          rx={ellipseDimensions.radiusX}
          ry={ellipseDimensions.radiusY}
          fill={
            isInHighlightedLoop
              ? highlightedLoopType === 'Balancing'
                ? '#bbf7d0' // light green
                : '#fca5a5' // light red
              : isInHoveredLoop
                ? hoveredLoopType === 'Balancing'
                  ? '#d1fae5' // lighter green for hover
                  : '#fee2e2' // lighter red for hover
                : 'none'
          }
          stroke={
            isInHighlightedLoop || isInHoveredLoop
              ? 'none'
              : isFromNode ? "#f97316" // Orange for FROM node
              : selected ? "#3b82f6" // Blue for selected
              : isHovered ? "rgba(59, 130, 246, 0.3)" // Transparent light blue for hover
              : "none"
          }
          strokeWidth={
            isInHighlightedLoop || isInHoveredLoop
              ? "0"
              : isFromNode ? "3"
              : selected ? "3"
              : isHovered ? "3"
              : "0"
          }
          style={{
            filter: isInHoveredLoop && !isInHighlightedLoop ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' : 'none'
          }}
          cursor={(isCreatingConnection || isRightMouseDown) ? "crosshair" : "pointer"}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => e.preventDefault()}
          pointerEvents="all"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Node label */}
      {isEditing ? (
        <foreignObject
          x={ellipseDimensions.textPadding}
          y={ellipseDimensions.textPadding}
          width={ellipseDimensions.width - ellipseDimensions.textPadding * 2}
          height={Math.max(ellipseDimensions.height - ellipseDimensions.textPadding * 2, 100)}
          style={{ overflow: 'visible' }}
        >
          <textarea
            ref={inputRef}
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: `${globalStyles.nodeFontSize}px`,
              fontWeight: '600',
              textAlign: 'center',
              color: data.color || '#000000',
              resize: 'none',
              fontFamily: globalStyles.nodeFont,
              lineHeight: `${globalStyles.nodeFontSize + 4}px`,
              padding: '4px',
              margin: '0',
              verticalAlign: 'top',
              display: 'block',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              pointerEvents: 'auto',
              overflow: 'hidden'
            }}
            placeholder="Enter label..."
          />
        </foreignObject>
      ) : (
        // Render wrapped text lines
        ellipseDimensions.wrappedLines.map((line, index) => {
          const totalLines = ellipseDimensions.wrappedLines.length
          const startY = ellipseDimensions.centerY - ((totalLines - 1) * ellipseDimensions.lineHeight) / 2
          const y = startY + index * ellipseDimensions.lineHeight
          
          return (
            <text
              key={index}
              ref={index === 0 ? textRef : null}
              x={ellipseDimensions.centerX}
              y={y + 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={globalStyles.nodeFontSize}
              fontWeight="600"
              fill={data.color || '#000000'}
              fontFamily={globalStyles.nodeFont}
              cursor={(isCreatingConnection || isRightMouseDown) ? "crosshair" : "pointer"}
              style={{ userSelect: 'none' }}
              onClick={handleClick}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              pointerEvents="all"
            >
              {line}
            </text>
          )
        })
      )}

      {/* Node value pill for simulation mode - positioned on top of everything */}
      {simulationMode && simulationState.stateVector.length > 0 && (
        <g className="value-pill-group" style={{ pointerEvents: 'none' }}>
          {/* White thick border background */}
          <rect
            x={ellipseDimensions.centerX - 40}
            y={ellipseDimensions.centerY - ellipseDimensions.radiusY - 20}
            width="80"
            height="12"
            fill="white"
            stroke="white"
            strokeWidth="3"
            rx="6"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          />
          
          {/* Main pill background - neutral gray */}
          <rect
            x={ellipseDimensions.centerX - 38}
            y={ellipseDimensions.centerY - ellipseDimensions.radiusY - 18}
            width="76"
            height="8"
            fill="#e5e7eb"
            rx="4"
          />
          
          {/* Fill level indicator - range -2000 to 2000, 1000 = 50% fill */}
          <rect
            x={ellipseDimensions.centerX - 38}
            y={ellipseDimensions.centerY - ellipseDimensions.radiusY - 18}
            width={Math.min(Math.max((nodeValue + 2000) * 0.019, 0), 76)}
            height="8"
            fill="#3b82f6"
            rx="4"
            style={{ transition: 'all 0.3s ease' }}
          />
          
          {/* Center line for reference */}
          <line
            x1={ellipseDimensions.centerX}
            y1={ellipseDimensions.centerY - ellipseDimensions.radiusY - 18}
            x2={ellipseDimensions.centerX}
            y2={ellipseDimensions.centerY - ellipseDimensions.radiusY - 10}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
          />
        </g>
      )}

    </g>
  )
}

export default CLDNode 
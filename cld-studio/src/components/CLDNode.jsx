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
  const { updateNode, globalStyles, simulationMode, simulationState, nodes } = useCLDStore()

  // Calculate ellipse dimensions based on text content with wrapping
  const ellipseDimensions = useMemo(() => {
    return getEllipseDimensions(label, {
      fontSize: globalStyles.nodeFontSize
    })
  }, [label, globalStyles.nodeFontSize])

  const handleLabelChange = (e) => {
    setLabel(e.target.value)
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
          height={ellipseDimensions.height - ellipseDimensions.textPadding * 2}
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
              padding: '0',
              margin: '0',
              verticalAlign: 'middle',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              pointerEvents: 'auto'
            }}
            placeholder="Enter label..."
            maxLength={100} // Prevent extremely long text
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

      {/* Value bar for simulation mode */}
      {simulationMode && simulationState.stateVector.length > 0 && (
        <g className="value-bar-group">
          {/* Background bar with center line */}
          <rect
            x={ellipseDimensions.centerX + ellipseDimensions.radiusX + 10}
            y={ellipseDimensions.centerY - 50}
            width="8"
            height="100"
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth="1"
            rx="2"
          />
          
          {/* Center line */}
          <line
            x1={ellipseDimensions.centerX + ellipseDimensions.radiusX + 10}
            y1={ellipseDimensions.centerY}
            x2={ellipseDimensions.centerX + ellipseDimensions.radiusX + 18}
            y2={ellipseDimensions.centerY}
            stroke="#9ca3af"
            strokeWidth="1"
          />
          
          {/* Value bar - proportional fill from center */}
          {nodeValue !== 0 && (
            <rect
              x={ellipseDimensions.centerX + ellipseDimensions.radiusX + 10}
              y={nodeValue > 0 ? 
                ellipseDimensions.centerY - Math.min(Math.abs(nodeValue) * 2, 50) : 
                ellipseDimensions.centerY
              }
              width="8"
              height={Math.min(Math.abs(nodeValue) * 2, 50)}
              fill={nodeValue > 0 ? '#28a745' : '#dc3545'}
              rx="2"
              style={{ transition: 'all 0.3s ease' }}
            />
          )}
          
          {/* Accumulated value text */}
          <text
            x={ellipseDimensions.centerX + ellipseDimensions.radiusX + 25}
            y={ellipseDimensions.centerY - 8}
            fontSize="12"
            fill="#333"
            textAnchor="start"
            dominantBaseline="middle"
          >
            {nodeValue.toFixed(1)}
          </text>
          
          {/* Last increment text */}
          <text
            x={ellipseDimensions.centerX + ellipseDimensions.radiusX + 25}
            y={ellipseDimensions.centerY + 8}
            fontSize="10"
            fill="#666"
            textAnchor="start"
            dominantBaseline="middle"
          >
            Δ: {lastIncrement.toFixed(1)}
          </text>
        </g>
      )}

    </g>
  )
}

export default CLDNode 
import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { getEllipseDimensions } from '../utils/text'
import './CLDNode.css'

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
  isMultiSelected = false,
  arrowDrawingMode = false,
  isArrowSource = false,
  renderEditBox = true,
  onSaveLabel,
}) {
  // Use data.label directly instead of local state to avoid sync issues
  const label = data.label || 'New Node'
  const [localLabel, setLocalLabel] = useState(label)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef(null)
  const textRef = useRef(null)
  const { updateNode, globalStyles, simulationMode, simulationState, nodes, addEvent, hoveredNode, editingNodeId, setEditingNode, clearEditingNode } = useCLDStore()
  
  const isEditing = editingNodeId === id

  // Debug: log current data structure and sync localLabel
  useEffect(() => {
    console.log('CLDNode data structure for node', id, ':', data)
    setLocalLabel(data.label || 'New Node')
  }, [data.label, id])

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
      console.log('CLDNode handleLabelChange: updating label to:', newValue)
      setLocalLabel(newValue)
      // Call the save callback to update the node data
      if (onSaveLabel) {
        console.log('CLDNode handleLabelChange: calling onSaveLabel with:', id, newValue)
        onSaveLabel(id, newValue)
      }
    } else {
      addEvent('⚠️ Line limit exceeded (max 4 lines)')
    }
  }

  const handleLabelBlur = () => {
    clearEditingNode()
    updateNode(id, { label: localLabel })
  }

  // Function to save current label (called from parent when exiting edit mode)
  const saveCurrentLabel = () => {
    if (isEditing) {
      updateNode(id, { label: localLabel })
    }
  }

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter without Shift finishes editing
      e.preventDefault()
      clearEditingNode()
      updateNode(id, { label: localLabel })
    } else if (e.key === 'Escape') {
      // Escape cancels editing and reverts to original label
      e.preventDefault()
      setLocalLabel(data.label || 'New Node')
      clearEditingNode()
    }
    // Enter with Shift creates a new line (default textarea behavior)
  }

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    if (!simulationMode) {
      setEditingNode(id)
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

  const handleContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Handle right-click for connection creation
    if (e.button === 2) {
      if (onClick) {
        onClick(e)
      }
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

  return (
    <g>
      {/* Only one ellipse is visible at a time and handles all pointer events */}
      {!isEditing && (devMode ? (
        <ellipse
          cx={ellipseDimensions.centerX}
          cy={ellipseDimensions.centerY}
          rx={ellipseDimensions.radiusX}
          ry={ellipseDimensions.radiusY}
          fill="none"
          stroke="red"
          strokeWidth="1"
          strokeDasharray="2,2"
          onContextMenu={handleContextMenu}
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
              : isArrowSource ? "#f97316" // Orange for arrow source node
              : isFromNode ? "#f97316" // Orange for FROM node
              : (selected || isMultiSelected) ? "#3b82f6" // Modern blue for selected (single or multi)
              : (isHovered || hoveredNode === id) ? "rgba(59, 130, 246, 0.6)" // Lighter shade of blue for hover
              : "none"
          }
          strokeWidth={
            isInHighlightedLoop || isInHoveredLoop
              ? "0"
              : isArrowSource ? "3"
              : isFromNode ? "3"
              : (selected || isMultiSelected) ? "3"
              : (isHovered || hoveredNode === id) ? "3"
              : "0"
          }
          className={`node-ellipse ${isInHoveredLoop && !isInHighlightedLoop ? 'hovered-loop' : ''}`}
          cursor={isCreatingConnection || arrowDrawingMode ? "crosshair" : "pointer"}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          pointerEvents="all"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      ))}

      {/* Node label - only show when not editing */}
      {!isEditing && (
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
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={globalStyles.nodeFontSize}
              fontWeight="600"
              fill={data.color || '#000000'}
              fontFamily={globalStyles.nodeFont}
              cursor={isCreatingConnection || arrowDrawingMode ? "crosshair" : "pointer"}
              className="node-text"
              onClick={handleClick}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              onContextMenu={handleContextMenu}
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
        <g className="value-pill-group">
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
            className="value-pill"
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
            fill="#f39c12"
            rx="4"
            className="value-pill"
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

            {/* Edit box - positioned at the very end to appear on top */}
      {isEditing && renderEditBox && (
        <g>
          {/* Background rectangle for editing */}
          <rect
            x={ellipseDimensions.centerX - ellipseDimensions.width / 2}
            y={ellipseDimensions.centerY - ellipseDimensions.height / 2}
            width={ellipseDimensions.width}
            height={ellipseDimensions.lineHeight * 4 + 10}
            fill="#ffffff"
            stroke="#d1d5db"
            strokeWidth="1"
            rx="6"
            ry="6"
            filter="drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))"
          />
          {/* Textarea positioned absolutely */}
          <foreignObject
            x={ellipseDimensions.centerX - ellipseDimensions.width / 2 + 10}
            y={ellipseDimensions.centerY - ellipseDimensions.height / 2 + 5}
            width={ellipseDimensions.width - 20}
            height={ellipseDimensions.lineHeight * 4}
          >
            <textarea
              ref={inputRef}
              value={isEditing ? localLabel : label}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              onKeyDown={handleLabelKeyDown}
              onContextMenu={handleContextMenu}
              className="node-textarea-simple"
              style={{
                fontSize: `${globalStyles.nodeFontSize}px`,
                color: data.color || '#000000',
                fontFamily: globalStyles.nodeFont,
                lineHeight: `${globalStyles.nodeFontSize + 4}px`
              }}
              placeholder="Enter label..."
            />
          </foreignObject>
        </g>
      )}

    </g>
  )
}

export default CLDNode 
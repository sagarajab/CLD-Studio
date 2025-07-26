import React, { useState, useRef, useMemo } from 'react'
import { useCLDStore } from '../stores/cldStore'

function CLDNode({ id, data, selected, onClick, onMouseDown, devMode = false, isFromNode = false, isCreatingConnection = false, isRightMouseDown = false }) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || 'New Node')
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef(null)
  const textRef = useRef(null)
  const { updateNode, globalStyles } = useCLDStore()

  // Function to wrap text to fit maximum width
  const wrapText = (text, maxWidth) => {
    // Split by line breaks first to preserve user-created breaks
    const lines = text.split('\n')
    const wrappedLines = []
    
    for (const line of lines) {
      const words = line.split(' ')
      let currentLine = ''
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const testWidth = testLine.length * (globalStyles.nodeFontSize * 0.6) // approximate character width based on font size
        
        if (testWidth <= maxWidth) {
          currentLine = testLine
        } else {
          if (currentLine) {
            wrappedLines.push(currentLine)
            currentLine = word
          } else {
            // Single word is too long, break it into chunks
            const wordChunks = []
            const charWidth = globalStyles.nodeFontSize * 0.6
            for (let i = 0; i < word.length; i += Math.floor(maxWidth / charWidth)) {
              wordChunks.push(word.slice(i, i + Math.floor(maxWidth / charWidth)))
            }
            wrappedLines.push(...wordChunks)
            currentLine = ''
          }
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine)
      }
    }
    
    return wrappedLines
  }

  // Calculate ellipse dimensions based on text content with wrapping
  const ellipseDimensions = useMemo(() => {
    // Base dimensions with padding
    const baseWidth = 60
    const baseHeight = 40
    const padding = 32 // increased padding to ensure text stays within bounds
    const maxTextWidth = 120 // maximum text width before wrapping
    const lineHeight = globalStyles.nodeFontSize + 4 // height per line of text
    
    // Wrap text to fit maximum width
    const wrappedLines = wrapText(label, maxTextWidth)
    
    // Calculate the actual width needed for the text
    const calculateLineWidth = (line) => line.length * (globalStyles.nodeFontSize * 0.6) // approximate character width based on font size
    const lineWidths = wrappedLines.map(calculateLineWidth)
    const maxLineWidth = Math.max(...lineWidths, 0)
    
    // Calculate final dimensions - ensure text is properly contained
    const textWidth = Math.min(maxLineWidth, maxTextWidth) // Don't exceed max width
    const width = Math.max(baseWidth, textWidth + padding)
    const height = Math.max(baseHeight, wrappedLines.length * lineHeight + padding)
    
    return {
      width,
      height,
      centerX: width / 2,
      centerY: height / 2,
      radiusX: width / 2,
      radiusY: height / 2,
      wrappedLines,
      lineHeight,
      textPadding: padding / 2 // half padding for text positioning
    }
  }, [label])

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
    setIsEditing(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
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



  return (
    <g>
      {console.log('🔍 CLDNode devMode:', devMode, 'selected:', selected)}
      
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
          fill="none"
          stroke={
            isFromNode ? "#f97316" : // Orange for FROM node
            selected ? "#3b82f6" : // Blue for selected
            isHovered ? "rgba(59, 130, 246, 0.3)" : // Transparent light blue for hover
            "none"
          }
          strokeWidth={
            isFromNode ? "3" : // Orange border width
            selected ? "3" : // Selected border width
            isHovered ? "3" : // Hover border width
            "0"
          }
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


    </g>
  )
}

export default CLDNode 
import React, { useMemo, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCLDStore } from '../stores/cldStore'

function AdjacencyMatrix({ onClose }) {
  const { nodes, edges } = useCLDStore()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [modalOffset, setModalOffset] = useState({ x: 0, y: 0 })
  const [hoveredCell, setHoveredCell] = useState(null)
  const modalRef = useRef(null)
  const headerRef = useRef(null)

  // Maximum matrix size
  const MAX_MATRIX_SIZE = 600 // pixels
  const MIN_CELL_SIZE = 20 // minimum cell size in pixels



  // Generate adjacency matrix
  const adjacencyMatrix = useMemo(() => {
    if (nodes.length === 0) return []

    const matrix = []
    const nodeIds = nodes.map(node => node.id).sort((a, b) => a - b) // Sort by ID for consistent ordering

    // Initialize matrix with zeros
    for (let i = 0; i < nodes.length; i++) {
      matrix[i] = []
      for (let j = 0; j < nodes.length; j++) {
        matrix[i][j] = 0 // 0 = no connection, 1 = positive, -1 = negative
      }
    }

    // Fill matrix based on edges
    edges.forEach(edge => {
      const sourceIndex = nodeIds.indexOf(edge.source)
      const targetIndex = nodeIds.indexOf(edge.target)
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const polarity = edge.data?.polarity === 'negative' ? -1 : 1
        matrix[sourceIndex][targetIndex] = polarity
      }
    })

    return { matrix, nodeIds }
  }, [nodes, edges])

  // Get node label by ID
  const getNodeLabel = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId)
    return node?.data?.label || `Node ${nodeId}`
  }

  // Calculate cell size based on matrix size
  const cellSize = useMemo(() => {
    if (nodes.length === 0) return MIN_CELL_SIZE
    const calculatedSize = Math.max(MIN_CELL_SIZE, Math.floor(MAX_MATRIX_SIZE / nodes.length))
    return Math.min(calculatedSize, 50) // Cap at 50px maximum
  }, [nodes.length])

  // Calculate actual matrix size
  const matrixSize = useMemo(() => {
    return nodes.length * cellSize
  }, [nodes.length, cellSize])

  // Drag functionality
  const handleMouseDown = (e) => {
    if (e.target === headerRef.current || headerRef.current?.contains(e.target)) {
      e.preventDefault()
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault()
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      const newOffsetX = modalOffset.x + deltaX
      const newOffsetY = modalOffset.y + deltaY
      
      // Keep modal within viewport bounds
      const modalWidth = modalRef.current.offsetWidth
      const modalHeight = modalRef.current.offsetHeight
      const maxOffsetX = window.innerWidth / 2 - modalWidth / 2
      const maxOffsetY = window.innerHeight / 2 - modalHeight / 2
      
      const clampedOffsetX = Math.max(-maxOffsetX, Math.min(newOffsetX, maxOffsetX))
      const clampedOffsetY = Math.max(-maxOffsetY, Math.min(newOffsetY, maxOffsetY))
      
      setModalOffset({ x: clampedOffsetX, y: clampedOffsetY })
      setDragStart({ x: e.clientX, y: e.clientY })
      
      // Apply transform to move the modal from its centered position
      modalRef.current.style.transform = `translate(calc(-50% + ${clampedOffsetX}px), calc(-50% + ${clampedOffsetY}px))`
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Reset modal position when component mounts
  useEffect(() => {
    setModalOffset({ x: 0, y: 0 })
    if (modalRef.current) {
      modalRef.current.style.transform = 'translate(-50%, -50%)'
    }
  }, [])

  // Add event listeners for drag and ESC key
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, modalOffset])

  // Add ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const getCellColor = (value) => {
    if (value === 0) return '#f8f9fa' // Light gray for no connection
    if (value === 1) return '#28a745' // Green for positive
    if (value === -1) return '#dc3545' // Red for negative
    return '#f8f9fa'
  }

  const getCellBorder = (rowIndex, colIndex) => {
    if (rowIndex === colIndex) {
      return 'none' // No border for diagonal elements
    }
    return '1px solid #dee2e6' // Light border for other cells
  }

  const handleCellHover = (rowIndex, colIndex) => {
    if (rowIndex !== colIndex) { // Don't show info for diagonal cells
      setHoveredCell({ rowIndex, colIndex })
    }
  }

  const handleCellLeave = () => {
    setHoveredCell(null)
  }



  const getCellStyle = (rowIndex, colIndex, cell) => {
    const isDiagonal = rowIndex === colIndex
    const isHovered = hoveredCell && hoveredCell.rowIndex === rowIndex && hoveredCell.colIndex === colIndex
    
    let backgroundColor = isDiagonal ? 'transparent' : getCellColor(cell)
    let border = getCellBorder(rowIndex, colIndex)
    
    // Add highlight effect for hovered cells (except diagonal)
    if (isHovered && !isDiagonal) {
      // Add prominent border for hovered cells
      border = '2px solid #007bff' // Blue border for hovered cells
    }
    
    return {
      backgroundColor,
      border,
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      textAlign: 'center',
      verticalAlign: 'middle',
      cursor: isDiagonal ? 'default' : 'pointer',
      transition: 'all 0.2s ease'
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="adjacency-matrix-modal">
        <div 
          className="adjacency-matrix-container"
          ref={modalRef}
          style={{
            cursor: isDragging ? 'grabbing' : 'default'
          }}
        >
          <div className="adjacency-matrix-header" ref={headerRef} onMouseDown={handleMouseDown}>
            <h3>Adjacency Matrix</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="adjacency-matrix-content">
            <p>No nodes available to create adjacency matrix.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="adjacency-matrix-modal">
      <div 
        className="adjacency-matrix-container"
        ref={modalRef}
        style={{
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        <div className="adjacency-matrix-header" ref={headerRef} onMouseDown={handleMouseDown}>
          <h3>Adjacency Matrix ({nodes.length}×{nodes.length})</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="adjacency-matrix-content">
          <div className="matrix-wrapper">
            <table className="adjacency-matrix-table" style={{ position: 'relative' }}>
              <tbody>
                {adjacencyMatrix.matrix.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="matrix-cell"
                        style={getCellStyle(rowIndex, colIndex, cell)}
                        onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                        onMouseLeave={handleCellLeave}
                      >
                        {/* Empty cell - no text */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Static Node Info Display */}
          <div className="node-info-display">
            {hoveredCell ? (
              <div className="node-relationship">
                <span className="source-node">{getNodeLabel(adjacencyMatrix.nodeIds[hoveredCell.rowIndex])}</span>
                <span className="arrow">→</span>
                <span className="target-node">{getNodeLabel(adjacencyMatrix.nodeIds[hoveredCell.colIndex])}</span>
                <span className={`connection-type ${adjacencyMatrix.matrix[hoveredCell.rowIndex][hoveredCell.colIndex] === 1 ? 'positive' : 
                   adjacencyMatrix.matrix[hoveredCell.rowIndex][hoveredCell.colIndex] === -1 ? 'negative' : 'none'}`}>
                  {adjacencyMatrix.matrix[hoveredCell.rowIndex][hoveredCell.colIndex] === 1 ? 'Positive' : 
                   adjacencyMatrix.matrix[hoveredCell.rowIndex][hoveredCell.colIndex] === -1 ? 'Negative' : 'No Connection'}
                </span>
              </div>
            ) : (
              <div className="node-info-placeholder">
                Hover over a cell to see the relationship
              </div>
            )}
          </div>

          <div className="matrix-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
              <span>Positive (+)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
              <span>Negative (-)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f8f9fa' }}></div>
              <span>No Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdjacencyMatrix 
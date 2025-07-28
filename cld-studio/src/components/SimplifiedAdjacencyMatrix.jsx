import React, { useMemo } from 'react'
import { useCLDStore } from '../stores/cldStore'

function SimplifiedAdjacencyMatrix() {
  const { nodes, edges } = useCLDStore()

  // Generate adjacency matrix
  const adjacencyMatrix = useMemo(() => {
    if (nodes.length === 0) return { matrix: [], nodeIds: [] }

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

  // Calculate cell size based on number of nodes with auto-fit
  const cellSize = useMemo(() => {
    if (nodes.length === 0) return 20
    // Auto-fit to 300px max dimension, accounting for borders
    const maxDimension = 300
    const borderWidth = 1 // 1px border per cell
    const totalBorderWidth = nodes.length * borderWidth * 2 // borders on all sides
    const availableSpace = maxDimension - totalBorderWidth
    const calculatedSize = Math.floor(availableSpace / nodes.length)
    // Keep cells between 4px and 50px
    return Math.max(4, Math.min(50, calculatedSize))
  }, [nodes.length])

  const getCellColor = (value) => {
    if (value === 0) return '#f8f9fa' // Light gray for no connection
    if (value === 1) return '#28a745' // Green for positive
    if (value === -1) return '#dc3545' // Red for negative
    return '#f8f9fa'
  }

  const getCellStyle = (rowIndex, colIndex, cell) => {
    const isDiagonal = rowIndex === colIndex
    
    return {
      backgroundColor: isDiagonal ? 'transparent' : getCellColor(cell),
      border: '1px solid #dee2e6',
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      textAlign: 'center',
      verticalAlign: 'middle',
      cursor: 'default',
      fontSize: '8px',
      position: 'relative',
      padding: 0,
      margin: 0,
      lineHeight: 1
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="simplified-matrix-container">
        <div className="matrix-grid">
          <div className="empty-matrix"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="simplified-matrix-container">
      <div 
        className="matrix-grid"
        style={{
          width: `${cellSize * nodes.length + nodes.length * 2}px`,
          height: `${cellSize * nodes.length + nodes.length * 2}px`,
          maxWidth: '300px',
          maxHeight: '300px'
        }}
      >
        <table className="simplified-matrix-table">
          <tbody>
            {adjacencyMatrix.matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="simplified-matrix-cell"
                    style={getCellStyle(rowIndex, colIndex, cell)}
                    title={`${getNodeLabel(adjacencyMatrix.nodeIds[rowIndex])} → ${getNodeLabel(adjacencyMatrix.nodeIds[colIndex])}: ${
                      cell === 1 ? 'Positive' : cell === -1 ? 'Negative' : 'No Connection'
                    }`}
                  >
                    {/* Empty cell - no text */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SimplifiedAdjacencyMatrix 
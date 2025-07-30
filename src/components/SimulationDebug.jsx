import React from 'react'
import { useCLDStore } from '../stores/cldStore'
import './SimulationDebug.css'

function SimulationDebug() {
  const { nodes, edges, simulationMode, simulationState } = useCLDStore()
  
  // Hide debug info in simulation mode
  if (simulationMode) return null
  
  // Create adjacency matrix for debugging
  const createAdjacencyMatrix = () => {
    const nodeIdToIndex = {}
    nodes.forEach((node, index) => {
      nodeIdToIndex[node.id] = index
    })
    
    const matrix = []
    for (let i = 0; i < nodes.length; i++) {
      matrix[i] = new Array(nodes.length).fill(0)
    }
    
    edges.forEach(edge => {
      const sourceIndex = nodeIdToIndex[edge.source]
      const targetIndex = nodeIdToIndex[edge.target]
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        const polarity = edge.data?.polarity === 'negative' ? -1 : 1
        matrix[sourceIndex][targetIndex] = polarity
      }
    })
    
    return matrix
  }
  
  const adjacencyMatrix = createAdjacencyMatrix()
  
  return (
    <div className="simulation-debug">
      <h4>Debug Info</h4>
      
      <div className="debug-section">
        <div className="debug-section-title">Nodes:</div>
        <ul className="debug-list">
          {nodes.map((node, index) => (
            <li key={node.id}>
              {index}: {node.data.label || `Node ${node.id}`}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="debug-section">
        <div className="debug-section-title">Current Increments:</div>
        <div className="debug-values">
          {simulationState.stateVector.map((val, i) => (
            <span key={i} className="debug-value">
              {val}
            </span>
          ))}
        </div>
      </div>
      
      <div className="debug-section">
        <div className="debug-section-title">Accumulated Values:</div>
        <div className="debug-values">
          {simulationState.accumulatedValues.map((val, i) => (
            <span key={i} className="debug-value">
              {val}
            </span>
          ))}
        </div>
      </div>
      
      <div className="debug-section">
        <div className="debug-section-title">Adjacency Matrix:</div>
        <div className="debug-values">
          {adjacencyMatrix.map((row, i) => (
            <div key={i} className="debug-matrix-row">
              {row.map((val, j) => (
                <span key={j} className="debug-matrix-cell">
                  {val}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="debug-section">
        <div className="debug-section-title">Step:</div>
        <div>{simulationState.currentStep}</div>
      </div>
      
      <div>
        <strong>Running:</strong> {simulationState.isRunning ? 'Yes' : 'No'}
      </div>
    </div>
  )
}

export default SimulationDebug 
import React from 'react'
import { useCLDStore } from '../stores/cldStore'

function SimulationDebug() {
  const { nodes, edges, simulationMode, simulationState } = useCLDStore()
  
  if (!simulationMode) return null
  
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
    <div className="simulation-debug" style={{ 
      position: 'fixed', 
      top: '70px', 
      left: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <h4>Debug Info</h4>
      
      <div>
        <strong>Nodes:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          {nodes.map((node, index) => (
            <li key={node.id}>
              {index}: {node.data.label || `Node ${node.id}`}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <strong>Current Increments:</strong>
        <div style={{ fontFamily: 'monospace', margin: '5px 0' }}>
          {simulationState.stateVector.map((val, i) => (
            <span key={i} style={{ marginRight: '5px' }}>
              {val}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <strong>Accumulated Values:</strong>
        <div style={{ fontFamily: 'monospace', margin: '5px 0' }}>
          {simulationState.accumulatedValues.map((val, i) => (
            <span key={i} style={{ marginRight: '5px' }}>
              {val}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <strong>Adjacency Matrix:</strong>
        <div style={{ fontFamily: 'monospace', margin: '5px 0' }}>
          {adjacencyMatrix.map((row, i) => (
            <div key={i}>
              {row.map((val, j) => (
                <span key={j} style={{ marginRight: '5px' }}>
                  {val}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <strong>Step:</strong> {simulationState.currentStep}
      </div>
      
      <div>
        <strong>Running:</strong> {simulationState.isRunning ? 'Yes' : 'No'}
      </div>
    </div>
  )
}

export default SimulationDebug 
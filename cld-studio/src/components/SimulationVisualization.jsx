import React from 'react'
import { useCLDStore } from '../stores/cldStore'

function SimulationVisualization() {
  const { nodes, simulationMode, simulationState } = useCLDStore()
  
  if (!simulationMode || !simulationState.stateVector.length) return null
  
  return (
    <div className="simulation-visualization">
      <div className="value-bars">
        {nodes.map((node, index) => {
          const value = simulationState.accumulatedValues[index] || 0
          const maxValue = 100 // Maximum value for scaling
          const normalizedValue = Math.min(Math.abs(value), maxValue)
          const barHeight = (normalizedValue / maxValue) * 50 // Scale to max 50px (half of 100px container)
          const barColor = value > 0 ? '#28a745' : value < 0 ? '#dc3545' : '#6c757d'
          
          return (
            <div key={node.id} className="value-bar-container">
              <div className="value-bar-label">
                {node.data.label || `Node ${node.id}`}
              </div>
              <div className="value-bar-wrapper">
                <div 
                  className="value-bar"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: barColor,
                    transition: 'height 0.3s ease',
                    position: 'absolute',
                    bottom: value < 0 ? '50px' : '50px',
                    transform: value < 0 ? 'translateY(0)' : 'translateY(-100%)'
                  }}
                />
                <div className="value-text">
                  {value.toFixed(1)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="simulation-history">
        <h4>State History</h4>
        <div className="history-chart">
          {simulationState.history.map((state, stepIndex) => (
            <div key={stepIndex} className="history-step">
              <div className="step-label">Step {stepIndex}</div>
              <div className="step-values">
                {state.map((value, nodeIndex) => (
                  <div 
                    key={nodeIndex}
                    className="history-value"
                    style={{
                      backgroundColor: value > 0 ? '#28a745' : value < 0 ? '#dc3545' : '#6c757d',
                      width: '8px',
                      height: '8px',
                      margin: '1px',
                      borderRadius: '2px'
                    }}
                    title={`${nodes[nodeIndex]?.data.label || `Node ${nodes[nodeIndex]?.id}`}: ${value}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimulationVisualization 
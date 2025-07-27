import React, { useState } from 'react'
import { useCLDStore } from '../stores/cldStore'

function SimulationControls() {
  const { 
    nodes, 
    simulationMode, 
    simulationState,
    toggleSimulationMode,
    initializeSimulation,
    runSimulation,
    pauseSimulation,
    stepSimulation,
    stepBackSimulation,
    resetSimulation,
    updateSimulationSettings,
    testPropagation
  } = useCLDStore()
  
  const [selectedNode, setSelectedNode] = useState('')
  const [perturbationValue, setPerturbationValue] = useState(1)
  
  const handleStartSimulation = () => {
    if (selectedNode && perturbationValue !== 0) {
      initializeSimulation(parseInt(selectedNode), perturbationValue)
    }
  }
  
  const handlePerturbationChange = (value) => {
    // Clamp value between -100 and 100
    const clampedValue = Math.max(-100, Math.min(100, value))
    setPerturbationValue(clampedValue)
  }
  
  if (!simulationMode) return null
  
  return (
    <div className="simulation-controls">
      <div className="simulation-header">
        <h3>Simulation Controls</h3>
        <button 
          className="close-btn" 
          onClick={toggleSimulationMode}
        >
          ×
        </button>
      </div>
      
      <div className="simulation-content">
        <div className="control-group">
          <label>Select Node to Perturb:</label>
          <select 
            value={selectedNode} 
            onChange={(e) => setSelectedNode(e.target.value)}
            disabled={simulationState.isRunning}
          >
            <option value="">Choose a node...</option>
            {nodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.data.label || `Node ${node.id}`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label>Perturbation Value (-100 to 100):</label>
          <input
            type="range"
            min="-100"
            max="100"
            value={perturbationValue}
            onChange={(e) => handlePerturbationChange(parseInt(e.target.value))}
            disabled={simulationState.isRunning}
          />
          <input
            type="number"
            min="-100"
            max="100"
            value={perturbationValue}
            onChange={(e) => handlePerturbationChange(parseInt(e.target.value))}
            disabled={simulationState.isRunning}
            style={{ width: '80px', marginLeft: '10px' }}
          />
        </div>
        
        <div className="control-group">
          <label>Simulation Speed (ms):</label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={simulationState.stepDelay}
            onChange={(e) => updateSimulationSettings({ stepDelay: parseInt(e.target.value) })}
            disabled={simulationState.isRunning}
          />
          <span style={{ marginLeft: '10px' }}>{simulationState.stepDelay}ms</span>
        </div>
        
        <div className="control-group">
          <label>Max Steps:</label>
          <input
            type="number"
            min="10"
            max="200"
            value={simulationState.maxSteps}
            onChange={(e) => updateSimulationSettings({ maxSteps: parseInt(e.target.value) })}
            disabled={simulationState.isRunning}
            style={{ width: '80px' }}
          />
        </div>
        

        
        <div className="simulation-buttons">
          <button
            onClick={handleStartSimulation}
            disabled={!selectedNode || simulationState.isRunning}
            className="btn-primary"
          >
            Initialize
          </button>
          
          <button
            onClick={runSimulation}
            disabled={!simulationState.perturbedNode || simulationState.isRunning}
            className="btn-success"
          >
            {simulationState.isRunning ? 'Running...' : 'Start'}
          </button>
          
          <button
            onClick={pauseSimulation}
            disabled={!simulationState.isRunning}
            className="btn-warning"
          >
            Pause
          </button>
          
          <button
            onClick={stepBackSimulation}
            disabled={!simulationState.perturbedNode || simulationState.isRunning || simulationState.currentStep <= 0}
            className="btn-info"
            style={{ background: '#0ea5e9' }}
          >
            Previous
          </button>
          
          <button
            onClick={stepSimulation}
            disabled={!simulationState.perturbedNode || simulationState.isRunning}
            className="btn-info"
            style={{ background: '#0ea5e9' }}
          >
            Next
          </button>
          
          <button
            onClick={resetSimulation}
            className="btn-secondary"
          >
            Reset
          </button>
          
          <button
            onClick={testPropagation}
            className="btn-secondary"
            style={{ background: '#8b5cf6' }}
          >
            Test
          </button>
        </div>
        
        <div className="simulation-status">
          <div>Step: {simulationState.currentStep} / {simulationState.maxSteps}</div>
          <div>Status: {simulationState.isRunning ? 'Running' : 'Stopped'}</div>
          {simulationState.perturbedNode && (
            <div>
              Perturbed: {nodes.find(n => n.id === simulationState.perturbedNode)?.data.label || `Node ${simulationState.perturbedNode}`}
            </div>
          )}
          {simulationMode && simulationState.perturbedNode && !simulationState.isRunning && (
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
              💡 Tip: Press <kbd style={{ background: '#f3f4f6', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>Space</kbd> to step forward, <kbd style={{ background: '#f3f4f6', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace' }}>←</kbd> to step back
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SimulationControls 
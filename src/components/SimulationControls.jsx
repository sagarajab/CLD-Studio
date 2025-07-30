import React, { useState } from 'react'
import { TimerReset } from 'lucide-react'
import { useCLDStore } from '../stores/cldStore'
import './SimulationControls.css'

function SimulationControls() {
  const { 
    nodes, 
    simulationState,
    initializeSimulation,
    runSimulation,
    pauseSimulation,
    stepSimulation,
    stepBackSimulation,
    resetSimulation,
    updateSimulationSettings
  } = useCLDStore()
  
  const [selectedNode, setSelectedNode] = useState('')
  const [perturbationValue, setPerturbationValue] = useState(1)
  
  const handleStartSimulation = () => {
    if (selectedNode && perturbationValue !== 0) {
      const success = initializeSimulation(parseInt(selectedNode), perturbationValue)
      if (success) {
        // Simulation initialized successfully
      } else {
        console.error('Failed to initialize simulation')
      }
    }
  }

  const handlePlayWithAutoInit = () => {
    // If simulation is not initialized, initialize it first
    if (!simulationState.isInitialized && selectedNode && perturbationValue !== 0) {
      const success = initializeSimulation(parseInt(selectedNode), perturbationValue)
      if (!success) {
        console.error('Failed to initialize simulation')
        return
      }
    }
    // Run the simulation (either after initialization or if already initialized)
    if (simulationState.isInitialized && !simulationState.isRunning) {
      runSimulation()
    }
  }
  
  const handlePerturbationChange = (value) => {
    const clampedValue = Math.max(-100, Math.min(100, value))
    setPerturbationValue(clampedValue)
  }
  
  return (
    <div className="simulation-controls-container">
      {/* Setup Controls */}
      <div className="setup-controls">
        <select 
          value={selectedNode} 
          onChange={(e) => setSelectedNode(e.target.value)}
          disabled={simulationState.isRunning}
          className="simulation-select"
        >
          <option value="">Select node...</option>
          {nodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.data.label || `Node ${node.id}`}
            </option>
          ))}
        </select>
        
        <input
          type="number"
          min="-100"
          max="100"
          value={perturbationValue}
          onChange={(e) => handlePerturbationChange(parseInt(e.target.value))}
          disabled={simulationState.isRunning}
          className="simulation-input"
        />
        
        <button
          onClick={handleStartSimulation}
          disabled={!selectedNode || simulationState.isRunning}
          className="simulation-button"
        >
          Init
        </button>
      </div>
      
      {/* Control Buttons */}
      <div className="control-buttons">
        {/* Settings Button - moved before play button */}
        <button
          onClick={() => updateSimulationSettings({ stepDelay: simulationState.stepDelay })}
          className="control-button"
          title="Simulation Settings"
        >
          ⚙️
        </button>
        
        <button
          onClick={handlePlayWithAutoInit}
          disabled={!simulationState.isInitialized || simulationState.isRunning}
          className="control-button success"
          title={
            !simulationState.isInitialized ? "Initialize simulation first" :
            simulationState.isRunning ? "Simulation is running" :
            simulationState.isPaused ? "Resume simulation" :
            simulationState.currentStep >= simulationState.maxSteps ? "Re-run simulation from beginning" :
            "Start simulation"
          }
        >
          {simulationState.isRunning ? 'Running' : simulationState.isPaused ? 'Resume' : simulationState.currentStep >= simulationState.maxSteps ? 'Re-run' : 'Start'}
        </button>
        
        <button
          onClick={pauseSimulation}
          disabled={!simulationState.isRunning}
          className="control-button warning"
        >
          Pause
        </button>
        
        <button
          onClick={stepBackSimulation}
          disabled={!simulationState.isInitialized || simulationState.isRunning || simulationState.currentStep <= 0}
          className="control-button secondary"
        >
          ←
        </button>
        
        <button
          onClick={stepSimulation}
          disabled={!simulationState.isInitialized || simulationState.isRunning}
          className="control-button primary"
        >
          →
        </button>
        
        <button
          onClick={resetSimulation}
          className="control-button danger"
        >
          <TimerReset className="control-icon" />
          Reset
        </button>
      </div>
      
      {/* Settings */}
      <div className="settings-section">
        <div className="settings-group">
          <span className="settings-label">Speed:</span>
          <input
            type="range"
            min="1"
            max="40"
            step="0.5"
            value={Math.round(2000 / simulationState.stepDelay * 10) / 10}
            onChange={(e) => updateSimulationSettings({ stepDelay: Math.round(2000 / parseFloat(e.target.value)) })}
            disabled={simulationState.isRunning}
            className="settings-input"
          />
          <span className="settings-value">{Math.round(2000 / simulationState.stepDelay * 10) / 10}x</span>
        </div>
        
        <div className="settings-group">
          <span className="settings-label">Max:</span>
          <input
            type="number"
            min="10"
            max="200"
            value={simulationState.maxSteps}
            onChange={(e) => updateSimulationSettings({ maxSteps: parseInt(e.target.value) })}
            disabled={simulationState.isRunning}
            className="settings-input"
          />
        </div>
      </div>
      
      {/* Status */}
      <div className="status-section">
        <div>
          Step: {simulationState.currentStep} / {simulationState.maxSteps} | 
          Status: {simulationState.isRunning ? 'Running' : simulationState.isPaused ? 'Paused' : 'Stopped'}
          {simulationState.perturbedNode && (
            <span> | Node: {nodes.find(n => n.id === simulationState.perturbedNode)?.data.label || `Node ${simulationState.perturbedNode}`}</span>
          )}
          {simulationState.isInitialized && (
            <span> | ✓ Initialized</span>
          )}
        </div>
        
        {/* LED Status Indicator */}
        <div 
          className={`simulation-led ${
            !simulationState.isInitialized ? 'inactive' :
            simulationState.isRunning ? 'running' :
            simulationState.isPaused ? 'paused' : 'ready'
          }`}
          title={
            !simulationState.isInitialized ? 'Simulation not initialized' :
            simulationState.isRunning ? 'Simulation running' :
            simulationState.isPaused ? 'Simulation paused' : 'Simulation ready'
          }
        />
      </div>
    </div>
  )
}

export default SimulationControls 
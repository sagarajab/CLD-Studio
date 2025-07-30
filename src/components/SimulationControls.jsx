import React, { useState } from 'react'
import { TimerReset } from 'lucide-react'
import { useCLDStore } from '../stores/cldStore'

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
        console.log('Simulation initialized successfully')
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
    <div style={{ 
      padding: '10px', 
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      fontSize: '12px'
    }}>
      {/* Setup Controls */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <select 
          value={selectedNode} 
          onChange={(e) => setSelectedNode(e.target.value)}
          disabled={simulationState.isRunning}
          style={{ padding: '4px', fontSize: '11px', border: '1px solid #d1d5db', borderRadius: '3px' }}
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
          style={{ width: '60px', padding: '4px', fontSize: '11px', border: '1px solid #d1d5db', borderRadius: '3px' }}
        />
        
        <button
          onClick={handleStartSimulation}
          disabled={!selectedNode || simulationState.isRunning}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: !selectedNode || simulationState.isRunning ? 'not-allowed' : 'pointer',
            opacity: !selectedNode || simulationState.isRunning ? 0.5 : 1
          }}
        >
          Init
        </button>
      </div>
      
      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        {/* Settings Button - moved before play button */}
        <button
          onClick={() => updateSimulationSettings({ stepDelay: simulationState.stepDelay })}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: 'pointer'
          }}
          title="Simulation Settings"
        >
          ⚙️
        </button>
        
        <button
          onClick={handlePlayWithAutoInit}
          disabled={!simulationState.isInitialized || simulationState.isRunning}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: !simulationState.isInitialized || simulationState.isRunning ? 'not-allowed' : 'pointer',
            opacity: !simulationState.isInitialized || simulationState.isRunning ? 0.5 : 1
          }}
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
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: !simulationState.isRunning ? 'not-allowed' : 'pointer',
            opacity: !simulationState.isRunning ? 0.5 : 1
          }}
        >
          Pause
        </button>
        
        <button
          onClick={stepBackSimulation}
          disabled={!simulationState.isInitialized || simulationState.isRunning || simulationState.currentStep <= 0}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: !simulationState.isInitialized || simulationState.isRunning || simulationState.currentStep <= 0 ? 'not-allowed' : 'pointer',
            opacity: !simulationState.isInitialized || simulationState.isRunning || simulationState.currentStep <= 0 ? 0.5 : 1
          }}
        >
          ←
        </button>
        
        <button
          onClick={stepSimulation}
          disabled={!simulationState.isInitialized || simulationState.isRunning}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: !simulationState.isInitialized || simulationState.isRunning ? 'not-allowed' : 'pointer',
            opacity: !simulationState.isInitialized || simulationState.isRunning ? 0.5 : 1
          }}
        >
          →
        </button>
        
        <button
          onClick={resetSimulation}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <TimerReset style={{ width: '12px', height: '12px' }} />
          Reset
        </button>
      </div>
      
      {/* Settings */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px' }}>Speed:</span>
          <input
            type="range"
            min="1"
            max="40"
            step="0.5"
            value={Math.round(2000 / simulationState.stepDelay * 10) / 10}
            onChange={(e) => updateSimulationSettings({ stepDelay: Math.round(2000 / parseFloat(e.target.value)) })}
            disabled={simulationState.isRunning}
            style={{ width: '80px' }}
          />
          <span style={{ fontSize: '11px', minWidth: '40px' }}>{Math.round(2000 / simulationState.stepDelay * 10) / 10}x</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px' }}>Max:</span>
          <input
            type="number"
            min="10"
            max="200"
            value={simulationState.maxSteps}
            onChange={(e) => updateSimulationSettings({ maxSteps: parseInt(e.target.value) })}
            disabled={simulationState.isRunning}
            style={{ width: '50px', padding: '2px', fontSize: '11px', border: '1px solid #d1d5db', borderRadius: '3px' }}
          />
        </div>
      </div>
      
      {/* Status */}
      <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
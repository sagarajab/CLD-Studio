import React, { useState } from 'react'
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
      initializeSimulation(parseInt(selectedNode), perturbationValue)
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
        <button
          onClick={runSimulation}
          disabled={!simulationState.perturbedNode || simulationState.isRunning}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: !simulationState.perturbedNode || simulationState.isRunning ? 'not-allowed' : 'pointer',
            opacity: !simulationState.perturbedNode || simulationState.isRunning ? 0.5 : 1
          }}
        >
          {simulationState.isRunning ? 'Running' : 'Start'}
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
          disabled={!simulationState.perturbedNode || simulationState.isRunning || simulationState.currentStep <= 0}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: !simulationState.perturbedNode || simulationState.isRunning || simulationState.currentStep <= 0 ? 'not-allowed' : 'pointer',
            opacity: !simulationState.perturbedNode || simulationState.isRunning || simulationState.currentStep <= 0 ? 0.5 : 1
          }}
        >
          ←
        </button>
        
        <button
          onClick={stepSimulation}
          disabled={!simulationState.perturbedNode || simulationState.isRunning}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            background: '#ffffff',
            cursor: !simulationState.perturbedNode || simulationState.isRunning ? 'not-allowed' : 'pointer',
            opacity: !simulationState.perturbedNode || simulationState.isRunning ? 0.5 : 1
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
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      
      {/* Settings */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px' }}>Speed:</span>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={simulationState.stepDelay}
            onChange={(e) => updateSimulationSettings({ stepDelay: parseInt(e.target.value) })}
            disabled={simulationState.isRunning}
            style={{ width: '80px' }}
          />
          <span style={{ fontSize: '11px', minWidth: '40px' }}>{simulationState.stepDelay}ms</span>
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
        </div>
        
        {/* LED Status Indicator */}
        <div 
          className={`simulation-led ${
            !simulationState.perturbedNode ? 'inactive' :
            simulationState.isRunning ? 'running' :
            simulationState.isPaused ? 'paused' : 'ready'
          }`}
          title={
            !simulationState.perturbedNode ? 'Simulation not initialized' :
            simulationState.isRunning ? 'Simulation running' :
            simulationState.isPaused ? 'Simulation paused' : 'Simulation ready'
          }
        />
      </div>
    </div>
  )
}

export default SimulationControls 
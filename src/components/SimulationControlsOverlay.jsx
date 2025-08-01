import React, { useState, useEffect } from 'react'
import { 
  Settings2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  TimerReset, 
  BarChart3, 
  Activity 
} from 'lucide-react'
import { useCLDStore } from '../stores/cldStore'
import './SimulationControlsOverlay.css'

function SimulationControlsOverlay() {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [selectedSimNode, setSelectedSimNode] = useState('')
  const [perturbationValue, setPerturbationValue] = useState(1)

  const {
    nodes,
    simulationMode,
    simulationState,
    initializeSimulation,
    runSimulation,
    pauseSimulation,
    stepSimulation,
    stepBackSimulation,
    resetSimulation,
    updateSimulationSettings,
    setShowStateVectorModal,
    setShowPlotsModal
  } = useCLDStore()

  // Reset selectedSimNode if it becomes invalid (when nodes change)
  useEffect(() => {
    if (selectedSimNode && !nodes.find(node => node.id == selectedSimNode)) {
      setSelectedSimNode('')
    }
  }, [nodes, selectedSimNode])

  const handleStartSimulation = () => {
    if (selectedSimNode) {
      // Check if the selected node still exists
      const nodeExists = nodes.find(node => node.id == selectedSimNode)
      if (!nodeExists) {
        setSelectedSimNode('') // Reset selection
        return
      }
      
      const success = initializeSimulation(selectedSimNode, perturbationValue)
      if (success) {
        setActiveDropdown(null)
      }
    }
  }

  const handlePlayWithAutoInit = () => {
    if (!simulationState.isInitialized && selectedSimNode) {
      // Check if the selected node still exists
      const nodeExists = nodes.find(node => node.id == selectedSimNode) // Use loose equality to handle string/number conversion
      if (!nodeExists) {
        console.warn(`Selected node ${selectedSimNode} no longer exists. Please select a valid node.`)
        setSelectedSimNode('') // Reset selection
        return
      }
      
      const success = initializeSimulation(selectedSimNode, perturbationValue)
      if (!success) {
        return // Don't run simulation if initialization failed
      }
    }
    runSimulation()
  }

  const handlePerturbationChange = (value) => {
    setPerturbationValue(value)
  }

  const toggleSimSettingsDropdown = () => {
    const newState = activeDropdown === 'simSettings' ? null : 'simSettings'
    setActiveDropdown(newState)
  }

  const handleClickOutside = (event) => {
    // Don't close dropdown if clicking inside the dropdown itself
    if (event.target.closest('.sim-settings-dropdown-overlay')) {
      return
    }
    // Close dropdown if clicking outside the overlay
    if (!event.target.closest('.sim-controls-overlay')) {
      setActiveDropdown(null)
    }
  }

  // Only show when simulation mode is active
  if (!simulationMode) {
    return null
  }

  return (
    <div className="sim-controls-overlay" onClick={handleClickOutside}>
      <div className="sim-controls-container">
        {/* Settings Dropdown */}
        <div className="sim-control-item">
          <button
            className={`sim-control-btn ${activeDropdown === 'simSettings' ? 'active' : ''}`}
            onClick={toggleSimSettingsDropdown}
            title="Simulation settings"
          >
            <Settings2 size={16} />
          </button>
                     {activeDropdown === 'simSettings' && (
             <div className="sim-settings-dropdown-overlay">
              <div className="form-section">
                                 <h4 className="form-section-title">Simulation Settings</h4>
                
                                 {/* Node Selection */}
                 <div className="form-group">
                   <label className="form-label">Select Node</label>
                                      <select 
                     value={selectedSimNode} 
                     onChange={(e) => setSelectedSimNode(e.target.value)}
                     disabled={simulationState.isRunning}
                     className="form-select"
                   >
                    <option value="">Select node...</option>
                                         {nodes.map(node => (
                       <option key={node.id} value={node.id}>
                         {node.data.label || `Node ${node.id}`}
                       </option>
                     ))}
                  </select>
                  {nodes.length === 0 && (
                    <div className="form-help-text">No nodes available for simulation</div>
                  )}
                  {nodes.length > 0 && (
                    <div className="form-help-text" style={{color: '#28a745'}}>
                      {nodes.length} node{nodes.length !== 1 ? 's' : ''} available
                    </div>
                  )}
                </div>
                
                {/* Perturbation Value */}
                <div className="form-group">
                  <label className="form-label">Perturbation Value</label>
                                     <input
                     type="number"
                     min="-100"
                     max="100"
                     value={perturbationValue}
                     onChange={(e) => {
                       const value = parseInt(e.target.value) || 0
                       handlePerturbationChange(value)
                     }}
                     disabled={simulationState.isRunning}
                     className="form-input"
                   />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Speed: {Math.round(2000 / simulationState.stepDelay * 10) / 10}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="0.5"
                    value={Math.round(2000 / simulationState.stepDelay * 10) / 10}
                    onChange={(e) => updateSimulationSettings({ stepDelay: Math.round(2000 / parseFloat(e.target.value)) })}
                    disabled={simulationState.isRunning}
                    className="simulation-range"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Max Steps: {simulationState.maxSteps}</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={simulationState.maxSteps}
                    onChange={(e) => updateSimulationSettings({ maxSteps: parseInt(e.target.value) })}
                    disabled={simulationState.isRunning}
                    className="simulation-range"
                  />
                </div>
                
                                 {/* Initialize Button */}
                 <button
                   onClick={handleStartSimulation}
                   disabled={!selectedSimNode || simulationState.isRunning}
                   className="initialize-button"
                 >
                   Initialize Simulation
                 </button>
                
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="sim-control-item">
          <button
            onClick={handlePlayWithAutoInit}
            disabled={!simulationState.isInitialized || simulationState.isRunning}
            className={`sim-control-btn ${!simulationState.isInitialized || simulationState.isRunning ? 'disabled' : simulationState.isRunning ? 'running' : 'enabled'}`}
            title={
              !simulationState.isInitialized ? "Initialize simulation first" :
              simulationState.isRunning ? "Simulation is running" :
              simulationState.isPaused ? "Resume simulation" :
              simulationState.currentStep >= simulationState.maxSteps ? "Re-run simulation from beginning" :
              "Start simulation"
            }
          >
            <Play size={16} />
          </button>
        </div>

        <div className="sim-control-item">
          <button
            onClick={pauseSimulation}
            disabled={!simulationState.isRunning}
            className={`sim-control-btn ${!simulationState.isRunning ? 'disabled' : 'enabled'}`}
            title="Pause simulation"
          >
            <Pause size={16} />
          </button>
        </div>

        <div className="sim-control-item">
          <button
            onClick={stepBackSimulation}
            disabled={!simulationState.isInitialized || simulationState.isRunning}
            className={`sim-control-btn ${!simulationState.isInitialized || simulationState.isRunning ? 'disabled' : 'enabled'}`}
            title="Step back"
          >
            <SkipBack size={16} />
          </button>
        </div>

        <div className="sim-control-item">
          <button
            onClick={stepSimulation}
            disabled={!simulationState.isInitialized || simulationState.isRunning}
            className={`sim-control-btn ${!simulationState.isInitialized || simulationState.isRunning ? 'disabled' : 'enabled'}`}
            title="Step forward"
          >
            <SkipForward size={16} />
          </button>
        </div>

        <div className="sim-control-item">
          <button
            onClick={resetSimulation}
            className="sim-control-btn enabled"
            title="Reset simulation"
          >
            <TimerReset size={16} />
          </button>
        </div>

        {/* State Vector and Plot Buttons */}
        <div className="sim-control-item">
          <button
            onClick={() => setShowStateVectorModal(true)}
            className="sim-control-btn enabled"
            title="Show state vectors"
          >
            <BarChart3 size={16} />
          </button>
        </div>

        <div className="sim-control-item">
          <button
            onClick={() => setShowPlotsModal(true)}
            className="sim-control-btn enabled"
            title="Show plots"
          >
            <Activity size={16} />
          </button>
        </div>

        {/* LED Indicator */}
        <div className="sim-control-item">
          <div 
            className={`simulation-led ${
              !simulationState.isInitialized ? 'inactive' :
              simulationState.isRunning ? 'running' :
              simulationState.isPaused ? 'paused' :
              simulationState.currentStep >= simulationState.maxSteps ? 'completed' : 'ready'
            }`}
            title={
              !simulationState.isInitialized ? 'Simulation not initialized' :
              simulationState.isRunning ? 'Simulation running' :
              simulationState.isPaused ? 'Simulation paused' :
              simulationState.currentStep >= simulationState.maxSteps ? 'Simulation completed' : 'Simulation ready'
            }
          />
        </div>
      </div>

      {/* Progress Bar */}
      {simulationState.isInitialized && (
        <div className="sim-progress-container">
          <span className="sim-progress-text">
            {simulationState.currentStep}/{simulationState.maxSteps}
          </span>
          <div className="sim-progress-bar">
            <div 
              className="sim-progress-fill"
              style={{
                width: `${Math.min(100, (simulationState.currentStep / simulationState.maxSteps) * 100)}%`
              }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SimulationControlsOverlay 
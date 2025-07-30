import React, { useState, useEffect, useRef } from 'react'
import { TimerReset } from 'lucide-react'
import { useCLDStore } from '../stores/cldStore'
import StateVectorModal from './StateVectorModal'
import PlotsModal from './PlotsModal'
import './Toolbar.css'

function Toolbar() {
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showSimSettingsDropdown, setShowSimSettingsDropdown] = useState(false)
  const [selectedNode, setSelectedNode] = useState('')
  const [perturbationValue, setPerturbationValue] = useState(1)
  const [showPlotsModal, setShowPlotsModal] = useState(false)
  const [showStateVectorModal, setShowStateVectorModal] = useState(false)
  
  const dropdownRef = useRef(null)
  const simSettingsRef = useRef(null)
  
  const { 
    clearDiagram, 
    exportMatrix,
    exportAsPNG,
    exportAsSVG,
    exportAsPDF,
    exportDetailedData,
    nodes,
    mode,
    submitAssessment,
    simulationState,
    initializeSimulation,
    runSimulation,
    pauseSimulation,
    stepSimulation,
    stepBackSimulation,
    resetSimulation,
    updateSimulationSettings
  } = useCLDStore()

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the diagram?')) {
      clearDiagram()
    }
  }

  const handleExportMatrix = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportMatrix()
    setShowExportDropdown(false)
  }

  const handleExportAsPNG = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportAsPNG()
    setShowExportDropdown(false)
  }

  const handleExportAsSVG = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportAsSVG()
    setShowExportDropdown(false)
  }

  const handleExportAsPDF = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportAsPDF()
    setShowExportDropdown(false)
  }

  const handleExportDetailedData = () => {
    if (nodes.length === 0) {
      alert('No nodes to export. Please add some nodes to your diagram.')
      return
    }
    exportDetailedData()
    setShowExportDropdown(false)
  }

  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown)
  }

  const toggleSimSettingsDropdown = () => {
    setShowSimSettingsDropdown(!showSimSettingsDropdown)
  }

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false)
      }
      if (simSettingsRef.current && !simSettingsRef.current.contains(event.target)) {
        setShowSimSettingsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmitAssessment = () => {
    if (mode === 'assessment') {
      submitAssessment()
      alert('Assessment submitted! (This is a placeholder - backend integration pending)')
    }
  }

  return (
    <div className="toolbar px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="toolbar-button danger"
              title="Clear diagram"
            >
              Clear
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleExportDropdown}
                className="toolbar-button"
                title="Export options"
              >
                Export ▼
              </button>
              {showExportDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-48">
                  <button
                    onClick={handleExportAsPNG}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                    <span>Export as PNG</span>
                  </button>
                  <button
                    onClick={handleExportAsSVG}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    <span>Export as SVG</span>
                  </button>
                  <button
                    onClick={handleExportAsPDF}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    <span>Export as PDF</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleExportDetailedData}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                    <span>Export Detailed Data (JSON)</span>
                  </button>
                  <button
                    onClick={handleExportMatrix}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h18v18H3z"/>
                      <path d="M9 9h6v6H9z"/>
                      <path d="M15 3v18"/>
                      <path d="M3 15h18"/>
                    </svg>
                    <span>Export Matrix (CSV)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simulation Controls Group */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <span className="text-sm font-medium text-gray-700">Simulation</span>
            
            {/* Node Selection */}
            <select 
              value={selectedNode} 
              onChange={(e) => setSelectedNode(e.target.value)}
              disabled={simulationState.isRunning}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 toolbar-node-select"
            >
              <option value="">Select node...</option>
              {nodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.data.label || `Node ${node.id}`}
                </option>
              ))}
            </select>
            
            {/* Perturbation Value */}
            <input
              type="number"
              min="-100"
              max="100"
              value={perturbationValue}
              onChange={(e) => handlePerturbationChange(parseInt(e.target.value))}
              disabled={simulationState.isRunning}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 toolbar-perturbation-input"
            />
            
            {/* Initialize Button */}
            <button
              onClick={handleStartSimulation}
              disabled={!selectedNode || simulationState.isRunning}
              className="toolbar-button"
              title="Initialize simulation"
            >
              Init
            </button>
            
            {/* Control Buttons */}
            <button
              onClick={handlePlayWithAutoInit}
              disabled={!simulationState.isInitialized || simulationState.isRunning}
              className="toolbar-button"
              title={
                !simulationState.isInitialized ? "Initialize simulation first" :
                simulationState.isRunning ? "Simulation is running" :
                simulationState.isPaused ? "Resume simulation" :
                simulationState.currentStep >= simulationState.maxSteps ? "Re-run simulation from beginning" :
                "Start simulation"
              }
            >
              ▶
            </button>
            
            <button
              onClick={pauseSimulation}
              disabled={!simulationState.isRunning}
              className="toolbar-button"
              title="Pause simulation"
            >
              ⏸
            </button>
            
            <button
              onClick={stepBackSimulation}
              disabled={!simulationState.isInitialized || simulationState.isRunning || simulationState.currentStep <= 0}
              className="toolbar-button"
              title="Step back"
            >
              ⏮
            </button>
            
            <button
              onClick={stepSimulation}
              disabled={!simulationState.isInitialized || simulationState.isRunning}
              className="toolbar-button"
              title="Step forward"
            >
              ⏭
            </button>
            
            <button
              onClick={resetSimulation}
              className="toolbar-button"
              title="Reset simulation"
            >
              <TimerReset className="w-4 h-4" />
            </button>
            
            {/* Settings Dropdown */}
            <div className="relative" ref={simSettingsRef}>
              <button
                onClick={toggleSimSettingsDropdown}
                className="toolbar-button"
                title="Simulation settings"
              >
                ⚙
              </button>
              {showSimSettingsDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-64 p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Speed:</span>
                      <input
                        type="range"
                        min="1"
                        max="40"
                        step="0.5"
                        value={Math.round(2000 / simulationState.stepDelay * 10) / 10}
                        onChange={(e) => updateSimulationSettings({ stepDelay: Math.round(2000 / parseFloat(e.target.value)) })}
                        disabled={simulationState.isRunning}
                        className="w-24"
                      />
                      <span className="text-xs min-w-12">{Math.round(2000 / simulationState.stepDelay * 10) / 10}x</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Max Steps:</span>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={simulationState.maxSteps}
                        onChange={(e) => updateSimulationSettings({ maxSteps: parseInt(e.target.value) })}
                        disabled={simulationState.isRunning}
                        className="px-2 py-1 text-xs border border-gray-300 rounded w-16"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Buttons */}
            <button
              onClick={() => setShowStateVectorModal(true)}
              className="toolbar-button"
              title="Show state vectors"
            >
              📊
            </button>
            
            <button
              onClick={() => setShowPlotsModal(true)}
              className="toolbar-button"
              title="Show plots"
            >
              📈
            </button>
            
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

        <div className="flex items-center space-x-4">
          {mode === 'assessment' && (
            <button
              onClick={handleSubmitAssessment}
              className="toolbar-button"
            >
              Submit Assessment
            </button>
          )}
        </div>
      </div>

      {mode === 'sandbox' && (
        <div className="tip-box mt-3 text-sm">
          💡 Tip: Click anywhere on the canvas to add nodes, drag nodes to connect them, and click edges to change polarity
        </div>
      )}
      
      {mode === 'assessment' && (
        <div className="assessment-box mt-3 text-sm">
          📝 Assessment Mode: Complete the diagram according to the problem requirements
        </div>
      )}

      {/* Modals */}
      {showStateVectorModal && (
        <StateVectorModal 
          isOpen={showStateVectorModal} 
          onClose={() => setShowStateVectorModal(false)} 
        />
      )}
      
      {showPlotsModal && (
        <PlotsModal 
          isOpen={showPlotsModal} 
          onClose={() => setShowPlotsModal(false)} 
        />
      )}
    </div>
  )
}

export default Toolbar 
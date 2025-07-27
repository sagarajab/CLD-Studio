import { useState, useMemo, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import Canvas from './components/Canvas'
import SysLoopHeader from './components/SysLoopHeader'
import SysLoopSidebar from './components/SysLoopSidebar'
import SettingsModal from './components/SettingsModal'
import SimulationDebug from './components/SimulationDebug'
import { useCLDStore } from './stores/cldStore'

function App() {
  const [mode, setMode] = useState('sandbox')
  const [dimmingEnabled, setDimmingEnabled] = useState(true) // Add dimming toggle state
  const [hoveredLoop, setHoveredLoop] = useState(null) // Add hovered loop state
  const [devMode, setDevMode] = useState(false) // Add dev mode state
  const [showSettingsModal, setShowSettingsModal] = useState(false) // Add settings modal state
  
  const { 
    nodes, 
    edges, 
    selectedNode, 
    selectedEdge, 
    highlightedLoop, 
    loopViewMode,
    exitLoopViewMode,
    clearHighlightedLoop,
    viewTransform,
    allLoops,
    updateGraphAnalysis,
    diagramName,
    simulationMode,
    simulationState,
    toggleSimulationMode,
    stepSimulation,
    stepBackSimulation,
    eventsLog
  } = useCLDStore()

  // Set initial browser title based on diagram name
  useEffect(() => {
    const title = diagramName && diagramName.trim() !== '' ? `${diagramName} - CLD Studio` : 'CLD Studio'
    document.title = title
  }, [diagramName])

  // Update graph analysis when nodes or edges change significantly
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      updateGraphAnalysis()
    }
  }, [nodes.length, edges.length, updateGraphAnalysis])

  // Use the robust loop detection from store
  const loops = useMemo(() => {
    return allLoops
  }, [allLoops])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Close settings modal
        setShowSettingsModal(false)
        
        // Exit loop view mode
        if (loopViewMode) {
          exitLoopViewMode()
          clearHighlightedLoop()
        }
        
        // Reset hovered loop
        setHoveredLoop(null)
        
        // Reset dimming to enabled
        setDimmingEnabled(true)
      }
      
      // Spacebar for step-by-step simulation
      if (event.key === ' ' && simulationMode && simulationState.perturbedNode && !simulationState.isRunning) {
        event.preventDefault()
        stepSimulation()
      }
      
      // Left arrow for step back simulation
      if (event.key === 'ArrowLeft' && simulationMode && simulationState.perturbedNode && !simulationState.isRunning && simulationState.currentStep > 0) {
        event.preventDefault()
        stepBackSimulation()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [loopViewMode, exitLoopViewMode, clearHighlightedLoop, simulationMode, simulationState, stepSimulation, stepBackSimulation])

  // Handle clicking outside to exit loop view mode
  const handleAppClick = (event) => {
    // Only exit if clicking on the main app container (not on sidebar or canvas)
    if (event.target === event.currentTarget && loopViewMode) {
      exitLoopViewMode()
      clearHighlightedLoop()
    }
  }

  return (
    <div className="sysloop-app" onClick={handleAppClick}>
      {/* Header */}
      <SysLoopHeader mode={mode} setMode={setMode} />

      {/* Main Content */}
      <div className="main-layout">
        {/* Left Sidebar */}
        <SysLoopSidebar 
          mode={mode} 
          loops={loops} 
          dimmingEnabled={dimmingEnabled}
          setDimmingEnabled={setDimmingEnabled}
          hoveredLoop={hoveredLoop}
          setHoveredLoop={setHoveredLoop}
        />
        
        {/* Main Canvas */}
        <div className="canvas-area">
          <ReactFlowProvider>
            <Canvas 
              mode={mode} 
              loops={loops} 
              dimmingEnabled={dimmingEnabled}
              hoveredLoop={hoveredLoop}
              devMode={devMode}
              setDevMode={setDevMode}
            />
          </ReactFlowProvider>
        </div>
        
        {/* Simulation Debug Panel */}
        <SimulationDebug />
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <div className="status-item variables">
            <span className="status-count">{nodes.length}</span>
            <span className="status-label">Variables</span>
          </div>
          <div className="status-item connections">
            <span className="status-count">{edges.length}</span>
            <span className="status-label">Connections</span>
          </div>
          <div className="status-item loops">
            <span className="status-count">{loops.length}</span>
            <span className="status-label">Loops</span>
          </div>
          
          {/* Simulation Mode Indicator */}
          {simulationMode && (
            <div className="status-item simulation">
              <span className="status-label">SIMULATION</span>
              <span className="status-count">ACTIVE</span>
            </div>
          )}
          
          {/* Events Log */}
          <div className="status-item events">
            <span className="status-label">Events:</span>
            <div className="events-log">
              {eventsLog.length > 0 ? (
                eventsLog.map((event, index) => (
                  <span key={event.id} className="event-item" title={event.timestamp}>
                    {event.message}
                  </span>
                ))
              ) : (
                <span className="status-text">No recent events</span>
              )}
            </div>
          </div>
        </div>
        <div className="status-right">
          <div className="status-controls">
            <span className="zoom-level">{Math.round(viewTransform.scale * 100)}%</span>
            
            {/* Dev Mode Toggle */}
            <button
              onClick={() => setDevMode(!devMode)}
              style={{
                background: devMode ? '#3b82f6' : 'transparent',
                color: devMode ? 'white' : '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Toggle Dev Mode"
            >
              <span style={{ fontSize: '12px' }}>🔧</span>
              {devMode ? 'DEV' : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  )
}

export default App

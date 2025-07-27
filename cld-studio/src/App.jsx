import { useState, useMemo, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import Canvas from './components/Canvas'
import SysLoopHeader from './components/SysLoopHeader'
import SysLoopSidebar from './components/SysLoopSidebar'
import SettingsModal from './components/SettingsModal'
import SimulationControls from './components/SimulationControls'
import SimulationVisualization from './components/SimulationVisualization'
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
    stepBackSimulation
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
        
        {/* Simulation Panel */}
        {simulationMode && (
          <div className="simulation-panel">
            <SimulationControls />
            <SimulationVisualization />
          </div>
        )}
        
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
          <div className="status-item selected">
            <span className="status-label">Selected:</span>
            <span className="status-text">
              {selectedNode ? `Node ${selectedNode}` : 
               selectedEdge ? `Arrow ${selectedEdge}` : 
               'None'}
            </span>
          </div>
          
          {/* Simulation Mode Indicator */}
          {simulationMode && (
            <div className="status-item simulation">
              <span className="status-label">SIMULATION</span>
              <span className="status-count">ACTIVE</span>
            </div>
          )}
        </div>
        <div className="status-right">
          <span className="status-text">
            {loopViewMode && (
              <span style={{ color: '#3b82f6', fontWeight: 'bold', marginRight: '10px' }}>
                LOOP VIEW MODE
              </span>
            )}
            {hoveredLoop !== null && loops[hoveredLoop] && (
              <span style={{ color: '#8b5cf6', fontWeight: 'bold', marginRight: '10px' }}>
                HOVERING: Loop {hoveredLoop + 1}
              </span>
            )}
            {highlightedLoop !== null && loops[highlightedLoop] 
              ? `Loop ${highlightedLoop + 1} highlighted (${loops[highlightedLoop].type}, ${loops[highlightedLoop].length} nodes)`
              : 'No loop highlighted'
            }
          </span>
          <div className="status-controls">
            {loopViewMode && (
              <span style={{ fontSize: '11px', color: '#666', marginRight: '10px' }}>
                Click outside or press Escape to exit
              </span>
            )}
            {!dimmingEnabled && (
              <span style={{ fontSize: '11px', color: '#f59e0b', marginRight: '10px' }}>
                Dimming disabled
              </span>
            )}
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

            {/* Simulation Toggle Button */}
            <button
              onClick={toggleSimulationMode}
              style={{
                background: simulationMode ? '#dc3545' : 'transparent',
                color: simulationMode ? 'white' : '#6b7280',
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
              title="Toggle Simulation Mode"
            >
              <span style={{ fontSize: '12px' }}>⚡</span>
              {simulationMode ? 'SIM' : 'SIM'}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                ':hover': {
                  background: '#f3f4f6',
                  borderColor: '#9ca3af',
                  color: '#374151'
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f3f4f6'
                e.target.style.borderColor = '#9ca3af'
                e.target.style.color = '#374151'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.borderColor = '#d1d5db'
                e.target.style.color = '#6b7280'
              }}
              title="Settings"
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
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

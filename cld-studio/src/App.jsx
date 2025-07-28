import { useState, useMemo, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import Canvas from './components/Canvas'
import SysLoopHeader from './components/SysLoopHeader'
import SysLoopSidebar from './components/SysLoopSidebar'
import SettingsModal from './components/SettingsModal'
import { useCLDStore } from './stores/cldStore'
import { Wrench, Settings as SettingsIcon, Info, HelpCircle, Undo2, Redo2 } from 'lucide-react'

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
    eventsLog,
    undo,
    redo,
    undoStack,
    redoStack
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
      
      // Undo/Redo shortcuts
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          // Ctrl+Z: Undo
          event.preventDefault()
          undo()
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          // Ctrl+Shift+Z or Ctrl+Y: Redo
          event.preventDefault()
          redo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [loopViewMode, exitLoopViewMode, clearHighlightedLoop, simulationMode, simulationState, stepSimulation, stepBackSimulation, undo, redo])

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
        
        {/* Simulation Debug Panel - Removed */}
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
          
          {/* Events Log - Show only latest event */}
          <div className="status-item events">
            <div className="events-log" style={{ 
              width: '400px', 
              minWidth: '400px',
              maxWidth: '400px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {eventsLog.length > 0 ? (
                <span className="event-item" title={eventsLog[0].timestamp}>
                  {eventsLog[0].message}
                </span>
              ) : (
                <span className="status-text">No recent events</span>
              )}
            </div>
          </div>
        </div>
        <div className="status-right">
          <div className="status-user-session-auth" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>User: <b>[username]</b></span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Session: <b>[session-id]</b></span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Auth: <b>[auth-status]</b></span>
          </div>
          <div className="status-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Undo Button */}
            <button
              onClick={undo}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                cursor: undoStack.length > 0 ? 'pointer' : 'not-allowed',
                color: undoStack.length > 0 ? '#6b7280' : '#d1d5db',
                transition: 'color 0.2s',
              }}
              title={`Undo (Ctrl+Z)${undoStack.length > 0 ? ` - ${undoStack.length} steps available` : ' - Nothing to undo'}`}
              className="statusbar-icon-btn"
              disabled={undoStack.length === 0}
            >
              <Undo2 size={18} style={{ verticalAlign: 'middle' }} />
            </button>
            
            {/* Redo Button */}
            <button
              onClick={redo}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                marginLeft: '2px',
                display: 'flex',
                alignItems: 'center',
                cursor: redoStack.length > 0 ? 'pointer' : 'not-allowed',
                color: redoStack.length > 0 ? '#6b7280' : '#d1d5db',
                transition: 'color 0.2s',
              }}
              title={`Redo (Ctrl+Y)${redoStack.length > 0 ? ` - ${redoStack.length} steps available` : ' - Nothing to redo'}`}
              className="statusbar-icon-btn"
              disabled={redoStack.length === 0}
            >
              <Redo2 size={18} style={{ verticalAlign: 'middle' }} />
            </button>
            
            {/* Dev Mode Toggle */}
            <button
              onClick={() => setDevMode(!devMode)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                marginLeft: '10px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: devMode ? 'red' : '#6b7280',
                transition: 'color 0.2s',
              }}
              title="Toggle Dev Mode"
              className="statusbar-icon-btn"
            >
              <Wrench size={18} style={{ verticalAlign: 'middle' }} />
            </button>
            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                marginLeft: '2px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'color 0.2s',
              }}
              title="Application Settings"
              className="statusbar-icon-btn"
            >
              <SettingsIcon size={18} style={{ verticalAlign: 'middle' }} />
            </button>
            {/* About Button */}
            <button
              onClick={() => alert('About: CLD Studio v1.0')}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                marginLeft: '2px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'color 0.2s',
              }}
              title="About"
              className="statusbar-icon-btn"
            >
              <Info size={18} style={{ verticalAlign: 'middle' }} />
            </button>
            {/* Help Button */}
            <button
              onClick={() => alert('Help: For assistance, visit the documentation.')}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                marginLeft: '2px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'color 0.2s',
              }}
              title="Help"
              className="statusbar-icon-btn"
            >
              <HelpCircle size={18} style={{ verticalAlign: 'middle' }} />
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

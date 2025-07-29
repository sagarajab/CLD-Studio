import { useState, useMemo, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import Canvas from './components/Canvas'
import SysLoopHeader from './components/SysLoopHeader'
import SysLoopSidebar from './components/SysLoopSidebar'
import SettingsModal from './components/SettingsModal'
import ExamplesBrowser from './components/ExamplesBrowser'
import { useCLDStore } from './stores/cldStore'
import { Wrench, Settings as SettingsIcon, Info, HelpCircle } from 'lucide-react'
import './components/StatusBar.css'

function App() {
  const [mode, setMode] = useState('sandbox')
  const [dimmingEnabled, setDimmingEnabled] = useState(true) // Add dimming toggle state
  const [hoveredLoop, setHoveredLoop] = useState(null) // Add hovered loop state
  const [devMode, setDevMode] = useState(false) // Add dev mode state
  const [showSettingsModal, setShowSettingsModal] = useState(false) // Add settings modal state
  const [showExamplesBrowser, setShowExamplesBrowser] = useState(false) // Add examples browser modal state
  
  const { 
    nodes, 
    edges, 
    loopViewMode,
    exitLoopViewMode,
    clearHighlightedLoop,
    allLoops,
    updateGraphAnalysis,
    diagramName,
    simulationMode,
    simulationState,
    stepSimulation,
    stepBackSimulation,
    eventsLog,
    undo,
    redo,
    viewTransform
  } = useCLDStore()

  // Set initial browser title based on diagram name
  useEffect(() => {
    const title = diagramName && diagramName.trim() !== '' ? `${diagramName} - CLD Studio` : 'CLD Studio'
    document.title = title
  }, [diagramName])

  // Listen for examples browser open event
  useEffect(() => {
    const handleOpenExamplesBrowser = () => {
      setShowExamplesBrowser(true)
    }

    window.addEventListener('openExamplesBrowser', handleOpenExamplesBrowser)
    
    return () => {
      window.removeEventListener('openExamplesBrowser', handleOpenExamplesBrowser)
    }
  }, [])

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
            <div className="events-log">
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
          <div className="status-user-session-auth">
            <span>User: <b>[username]</b></span>
            <span>Session: <b>[session-id]</b></span>
            <span>Auth: <b>[auth-status]</b></span>
          </div>
          <div className="status-controls">
            {/* Zoom Level Indicator */}
            <div className="status-item zoom-level" style={{
              fontSize: '12px',
              color: '#374151',
              padding: '3px 10px',
              background: '#f3f4f6',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '500',
              border: '1px solid #d1d5db',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              width: '90px',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#6b7280', fontSize: '11px', fontWeight: '400' }}>Zoom:</span>
              <span style={{ color: '#1f2937', fontWeight: '600', minWidth: '30px', textAlign: 'right' }}>{Math.round(viewTransform.scale * 100)}%</span>
            </div>
            
            {/* Dev Mode Toggle */}
            <button
              onClick={() => setDevMode(!devMode)}
              className={`statusbar-icon-btn dev-mode-btn ${devMode ? 'active' : ''}`}
              title="Toggle Dev Mode"
            >
              <Wrench size={18} />
            </button>
            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="statusbar-icon-btn settings-btn"
              title="Application Settings"
            >
              <SettingsIcon size={18} />
            </button>
            {/* About Button */}
            <button
              onClick={() => alert('About: CLD Studio v1.0')}
              className="statusbar-icon-btn about-btn"
              title="About"
            >
              <Info size={18} />
            </button>
            {/* Help Button */}
            <button
              onClick={() => alert('Help: For assistance, visit the documentation.')}
              className="statusbar-icon-btn help-btn"
              title="Help"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      )}

      {/* Examples Browser Modal */}
      <ExamplesBrowser 
        isOpen={showExamplesBrowser} 
        onClose={() => setShowExamplesBrowser(false)} 
      />
    </div>
  )
}

export default App

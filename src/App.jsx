import { useState, useMemo, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import Canvas from './components/Canvas'
import SysLoopHeader from './components/SysLoopHeader'
import SysLoopSidebar from './components/SysLoopSidebar'
import SettingsModal from './components/SettingsModal'
import S3FileManager from './components/S3FileManager'
import { useCLDStore } from './stores/cldStore'
import { Wrench, Settings as SettingsIcon, Info, HelpCircle, Undo2, Redo2, LogOut, Database, User, UserCheck } from 'lucide-react'
import './components/StatusBar.css'

function App({ user, signOut }) {
  const [mode, setMode] = useState('sandbox')
  const [dimmingEnabled, setDimmingEnabled] = useState(true) // Add dimming toggle state
  const [hoveredLoop, setHoveredLoop] = useState(null) // Add hovered loop state
  const [devMode, setDevMode] = useState(false) // Add dev mode state
  const [showSettingsModal, setShowSettingsModal] = useState(false) // Add settings modal state
  const [showS3FileManager, setShowS3FileManager] = useState(false) // Add S3 file manager state
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 }) // Add mouse coordinates state
  
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

  // Handle mouse move to track coordinates
  const handleMouseMove = (event) => {
    setMouseCoords({ x: event.clientX, y: event.clientY })
  }

  return (
    <div className="sysloop-app" onClick={handleAppClick} onMouseMove={handleMouseMove}>
             {/* Header */}
       <SysLoopHeader mode={mode} setMode={setMode} signOut={signOut} />

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
          {/* Events Log - Message console at extreme left */}
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
          
          {/* Normal text labels for stats */}
          <div className="status-stats-container">
            <span>
              <span className="status-stat-label">Variables</span> 
              <span className="status-stat-value">{nodes.length}</span>
            </span>
            <div className="status-separator"></div>
            <span>
              <span className="status-stat-label">Connections</span> 
              <span className="status-stat-value">{edges.length}</span>
            </span>
            <div className="status-separator"></div>
            <span>
              <span className="status-stat-label">Loops</span> 
              <span className="status-stat-value">{loops.length}</span>
            </span>
          </div>
        </div>
        <div className="status-right">
          <div className="status-user-session-auth">
            <span>User: <b>{user?.signInDetails?.loginId || user?.attributes?.email || 'Guest'}</b></span>
            <div className="status-separator"></div>
            {user ? <UserCheck size={16} className="text-green-500" /> : <User size={16} className="text-gray-400" />}
          </div>
          <div className="status-controls">
            
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

      {/* S3 File Manager Modal */}
      {showS3FileManager && (
        <S3FileManager isOpen={showS3FileManager} onClose={() => setShowS3FileManager(false)} />
      )}
    </div>
  )
}

export default App

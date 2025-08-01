import { useState, useMemo, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import Canvas from './components/Canvas'
import SysLoopHeader from './components/SysLoopHeader'
import SysLoopSidebar from './components/SysLoopSidebar'
import SettingsModal from './components/SettingsModal'
import S3FileManager from './components/S3FileManager'
import TBTAuthTest from './components/TBTAuthTest'
import TBTUserAdmin from './components/TBTUserAdmin'
import { useCLDStore } from './stores/cldStore'
import { useTBTAuthStore } from './stores/tbtAuthStore'
import { useUserProgressStore } from './stores/userProgressStore'
import { Wrench, Settings as SettingsIcon, Info, HelpCircle, Undo2, Redo2, LogOut, Database, User, UserCheck, TestTube, Users } from 'lucide-react'
import './components/StatusBar.css'

function App({ user, signOut }) {
  const [mode, setMode] = useState('sandbox')
  const [dimmingEnabled, setDimmingEnabled] = useState(true) // Add dimming toggle state
  const [hoveredLoop, setHoveredLoop] = useState(null) // Add hovered loop state
  const [devMode, setDevMode] = useState(false) // Add dev mode state
  const [showSettingsModal, setShowSettingsModal] = useState(false) // Add settings modal state
  const [showS3FileManager, setShowS3FileManager] = useState(false) // Add S3 file manager state
  const [showTBTAuthTest, setShowTBTAuthTest] = useState(false) // Add TBT auth test modal state
  const [showTBTUserAdmin, setShowTBTUserAdmin] = useState(false) // Add TBT user admin modal state
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 }) // Add mouse coordinates state
  
  // TBT Authentication state
  const { 
    performTBTAuth, 
    amplifyAuthVerified,
    tbtAuthStatus, 
    accessLevel, 
    isNewUser,
    isLoading: tbtAuthLoading,
    error: tbtAuthError
  } = useTBTAuthStore()
  
  // User progress tracking
  const { startActivityTracking, stopActivityTracking } = useUserProgressStore()
  
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

  // Perform tbt_auth when amplify_Auth user is available
  useEffect(() => {
    if (user && !amplifyAuthVerified) {
      console.log('🔄 Starting tbt_auth process...');
      performTBTAuth();
    }
  }, [user, amplifyAuthVerified, performTBTAuth]);

  // Start activity tracking when user is authenticated
  useEffect(() => {
    if (user && amplifyAuthVerified) {
      startActivityTracking();
      return () => {
        stopActivityTracking();
      };
    }
  }, [user, amplifyAuthVerified, startActivityTracking, stopActivityTracking]);

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

  // Show loading state during tbt_auth
  if (tbtAuthLoading) {
    return (
      <div className="auth-loading-container">
        <div className="loading-spinner"></div>
        <p>✅ amplify_Auth completed</p>
        <p>🔄 Performing tbt_auth verification...</p>
      </div>
    );
  }

  // Show error state
  if (tbtAuthError) {
    return (
      <div className="auth-error-container">
        <h2>Authentication Error</h2>
        <p>amplify_Auth: ✅ Passed</p>
        <p>tbt_auth: ❌ Failed</p>
        <p>Error: {tbtAuthError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Show welcome message for new users
  if (isNewUser) {
    return (
      <div className="welcome-container">
        <h2>Welcome to CLD Studio!</h2>
        <div className="auth-status">
          <p>✅ amplify_Auth: Passed</p>
          <p>✅ tbt_auth: Guest Access Granted</p>
        </div>
        <p>You're currently using guest access. Some features may be limited.</p>
        <button onClick={() => window.location.reload()}>
          Continue with Guest Access
        </button>
      </div>
    );
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
            <div className="auth-status-indicators">
              <span className={`auth-indicator amplify ${amplifyAuthVerified ? 'passed' : 'failed'}`}>
                amplify_Auth: {amplifyAuthVerified ? '✅' : '❌'}
              </span>
              <span className={`auth-indicator tbt ${tbtAuthStatus}`}>
                tbt_auth: {tbtAuthStatus === 'tbt' ? '✅' : tbtAuthStatus === 'guest' ? '👤' : '⏳'}
              </span>
            </div>
            <div className="status-separator"></div>
            <span className={`access-level ${accessLevel}`}>
              {accessLevel.toUpperCase()}
            </span>
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
            {/* TBT Auth Test Button */}
            <button
              onClick={() => setShowTBTAuthTest(true)}
              className="statusbar-icon-btn test-btn"
              title="TBT Auth Test"
            >
              <TestTube size={18} />
            </button>
            {/* TBT User Admin Button */}
            <button
              onClick={() => setShowTBTUserAdmin(true)}
              className="statusbar-icon-btn admin-btn"
              title="TBT User Management"
            >
              <Users size={18} />
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

      {/* TBT Auth Test Modal */}
      {showTBTAuthTest && (
        <div className="modal-overlay" onClick={() => setShowTBTAuthTest(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>TBT Authentication Test</h2>
              <button 
                className="modal-close"
                onClick={() => setShowTBTAuthTest(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <TBTAuthTest />
            </div>
          </div>
        </div>
      )}

      {/* TBT User Admin Modal */}
      {showTBTUserAdmin && (
        <div className="modal-overlay" onClick={() => setShowTBTUserAdmin(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>TBT User Management</h2>
              <button 
                className="modal-close"
                onClick={() => setShowTBTUserAdmin(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <TBTUserAdmin />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

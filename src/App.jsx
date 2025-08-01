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
import StateVectorModal from './components/StateVectorModal'
import PlotsModal from './components/PlotsModal'
import NodeAnalysisModal from './components/NodeAnalysisModal'
import ConnectionAnalysisModal from './components/ConnectionAnalysisModal'
import SystemStatsModal from './components/SystemStatsModal'
import AdjacencyMatrixModal from './components/AdjacencyMatrixModal'
import { useCLDStore } from './stores/cldStore'
import { useTBTAuthStore } from './stores/tbtAuthStore'
import { useUserProgressStore } from './stores/userProgressStore'
import { Undo2, Redo2, Database, User, UserCheck, TreeDeciduous, MailCheck } from 'lucide-react'
import StatusBar from './components/StatusBar'

function App({ user, signOut }) {
  const [mode, setMode] = useState('sandbox')
  const [dimmingEnabled, setDimmingEnabled] = useState(true) // Add dimming toggle state
  const [hoveredLoop, setHoveredLoop] = useState(null) // Add hovered loop state
  const [devMode, setDevMode] = useState(false) // Add dev mode state
  const [showSettingsModal, setShowSettingsModal] = useState(false) // Add settings modal state
  const [showS3FileManager, setShowS3FileManager] = useState(false) // Add S3 file manager state
  const [showTBTAuthTest, setShowTBTAuthTest] = useState(false) // Add TBT auth test modal state
  const [showTBTUserAdmin, setShowTBTUserAdmin] = useState(false) // Add TBT user admin modal state
  const [showNodeAnalysisModal, setShowNodeAnalysisModal] = useState(false) // Add node analysis modal state
  const [showConnectionAnalysisModal, setShowConnectionAnalysisModal] = useState(false) // Add connection analysis modal state
  const [showSystemStatsModal, setShowSystemStatsModal] = useState(false) // Add system stats modal state
  const [showAdjacencyMatrixModal, setShowAdjacencyMatrixModal] = useState(false) // Add adjacency matrix modal state
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 }) // Add mouse coordinates state
  
  // TBT Authentication state
  const { 
    performTBTAuth, 
    amplifyAuthVerified,
    tbtAuthStatus, 
    accessLevel, 
    isNewUser,
    isLoading: tbtAuthLoading,
    error: tbtAuthError,
    clearAuth  // Add this import
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
    viewTransform,
    showStateVectorModal,
    showPlotsModal,
    setShowStateVectorModal,
    setShowPlotsModal
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

  // Reset TBT auth state when user changes
  useEffect(() => {
    if (user) {
      // Reset TBT auth state for new user
      clearAuth();
    }
  }, [user?.userId]); // Track user ID changes specifically

  // Perform tbt_auth when amplify_Auth user is available
  useEffect(() => {
    if (user && !amplifyAuthVerified) {
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
       <SysLoopHeader 
         signOut={signOut}
         onSettingsClick={() => setShowSettingsModal(true)}
         onTBTUserAdminClick={() => setShowTBTUserAdmin(true)}
         onTBTAuthTestClick={() => setShowTBTAuthTest(true)}
         onDevModeToggle={() => setDevMode(!devMode)}
         devMode={devMode}
       />

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
          setShowSettingsModal={setShowSettingsModal}
          setShowStateVectorModal={setShowStateVectorModal}
          setShowPlotsModal={setShowPlotsModal}
          setShowS3FileManager={setShowS3FileManager}
          setShowNodeAnalysisModal={setShowNodeAnalysisModal}
          setShowConnectionAnalysisModal={setShowConnectionAnalysisModal}
          setShowSystemStatsModal={setShowSystemStatsModal}
          setShowAdjacencyMatrixModal={setShowAdjacencyMatrixModal}
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
      <StatusBar 
        nodes={nodes}
        edges={edges}
        loops={loops}
        eventsLog={eventsLog}
        user={user}
        amplifyAuthVerified={amplifyAuthVerified}
        tbtAuthStatus={tbtAuthStatus}
      />

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

      {/* State Vector Modal */}
      {showStateVectorModal && (
        <StateVectorModal 
          isOpen={showStateVectorModal} 
          onClose={() => setShowStateVectorModal(false)} 
        />
      )}

      {/* Plots Modal */}
      {showPlotsModal && (
        <PlotsModal 
          isOpen={showPlotsModal} 
          onClose={() => setShowPlotsModal(false)} 
        />
      )}

      {/* Node Analysis Modal */}
      {showNodeAnalysisModal && (
        <NodeAnalysisModal 
          isOpen={showNodeAnalysisModal} 
          onClose={() => setShowNodeAnalysisModal(false)} 
        />
      )}

      {/* Connection Analysis Modal */}
      {showConnectionAnalysisModal && (
        <ConnectionAnalysisModal 
          isOpen={showConnectionAnalysisModal} 
          onClose={() => setShowConnectionAnalysisModal(false)} 
        />
      )}

      {/* System Stats Modal */}
      {showSystemStatsModal && (
        <SystemStatsModal 
          isOpen={showSystemStatsModal} 
          onClose={() => setShowSystemStatsModal(false)} 
        />
      )}

      {/* Adjacency Matrix Modal */}
      {showAdjacencyMatrixModal && (
        <AdjacencyMatrixModal 
          isOpen={showAdjacencyMatrixModal} 
          onClose={() => setShowAdjacencyMatrixModal(false)} 
        />
      )}
    </div>
  )
}

export default App
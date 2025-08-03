import { useState, useMemo, useEffect } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import Canvas from './components/Canvas'
import SysLoopHeader from './components/SysLoopHeader'
import SysLoopSidebar from './components/SysLoopSidebar'
import SettingsModal from './components/SettingsModal'
import S3FileManager from './components/S3FileManager'
import StateVectorModal from './components/StateVectorModal'
import PlotsModal from './components/PlotsModal'
import NodeAnalysisModal from './components/NodeAnalysisModal'
import ConnectionAnalysisModal from './components/ConnectionAnalysisModal'
import SystemStatsModal from './components/SystemStatsModal'
import AdjacencyMatrixModal from './components/AdjacencyMatrixModal'

import AssignmentPanel from './components/AssignmentPanel'
import AssignmentProgressModal from './components/AssignmentProgressModal'
import TBTAuthLoadingScreen from './components/TBTAuthLoadingScreen'
import { useCLDStore } from './stores/cldStore'
import useTBTAuthStore from './stores/tbtAuthStore'
import { useUserProgressStore } from './stores/userProgressStore'
import useAssignmentStore from './stores/assignmentStore'
import { Undo2, Redo2, Database, User, UserCheck, TreeDeciduous, MailCheck, BookOpen } from 'lucide-react'
import StatusBar from './components/StatusBar'

function App({ user, signOut }) {
  const [mode, setMode] = useState('sandbox')
  const [dimmingEnabled, setDimmingEnabled] = useState(true) // Add dimming toggle state
  const [hoveredLoop, setHoveredLoop] = useState(null) // Add hovered loop state
  const [devMode, setDevMode] = useState(false) // Add dev mode state
  const [showSettingsModal, setShowSettingsModal] = useState(false) // Add settings modal state
  const [showS3FileManager, setShowS3FileManager] = useState(false) // Add S3 file manager state
  const [showNodeAnalysisModal, setShowNodeAnalysisModal] = useState(false) // Add node analysis modal state
  const [showConnectionAnalysisModal, setShowConnectionAnalysisModal] = useState(false) // Add connection analysis modal state
  const [showSystemStatsModal, setShowSystemStatsModal] = useState(false) // Add system stats modal state
  const [showAdjacencyMatrixModal, setShowAdjacencyMatrixModal] = useState(false) // Add adjacency matrix modal state

  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 }) // Add mouse coordinates state
  const [showAuthLoadingScreen, setShowAuthLoadingScreen] = useState(false) // Add auth loading screen state
  
  // TBT Authentication state
  const { 
    authenticateUser, 
    tbtAuthStatus, 
    accessLevel, 
    isApproved,
    isLoading: tbtAuthLoading,
    error: tbtAuthError,
    clearUser,
    hasTBTAccess
  } = useTBTAuthStore()
  
  // User progress tracking
  const { startActivityTracking, stopActivityTracking } = useUserProgressStore()
  
  // Assignment store
  const { 
    isAssignmentMode, 
    showProgressModal, 
    setShowProgressModal, 
    startAssignment, 
    loadAssignments, 
    loadAllUserProgress,
    setCurrentUserEmail,
    sidebarWidth, 
    currentAssignment, 
    currentQuestion 
  } = useAssignmentStore()
  
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

  // Handle assignment button click
  const handleAssignmentClick = async () => {
    // Check TBT access before allowing assignment mode
    if (!hasTBTAccess()) {
      alert('Assignment access is restricted to TBT users only.')
      return
    }

    // If already in assignment mode, exit it
    if (isAssignmentMode) {
      const { exitAssignment } = useAssignmentStore.getState()
      exitAssignment()
      return
    }

    try {
      const assignments = await loadAssignments()
      if (assignments.length > 0) {
        // For now, start with the first assignment
        // In a real implementation, you might want to show a selection modal
        await startAssignment(assignments[0])
      } else {
        // If no assignments loaded, try to start a test assignment
        const testAssignment = {
          id: 'test-assignment-001',
          title: 'Test Assignment - Basic Feedback Loop',
          description: 'A test assignment for development and testing purposes',
          timeLimit: 1800,
          maxScore: 50,
          questions: [
            {
              id: 'q1',
              questionType: 'text',
              question: 'What is a feedback loop? Explain in your own words.',
              maxScore: 10,
              timeLimit: 300
            },
            {
              id: 'q2',
              questionType: 'number',
              question: 'How many nodes are in your diagram?',
              maxScore: 5,
              timeLimit: 120
            },
            {
              id: 'q3',
              questionType: 'mcq',
              question: 'What type of feedback loop did you create?',
              options: ['Positive feedback', 'Negative feedback', 'Both', 'Neither'],
              maxScore: 10,
              timeLimit: 180
            },
            {
              id: 'q4',
              questionType: 'diagram',
              question: 'Create a causal loop diagram showing a simple feedback loop with at least 3 nodes.',
              maxScore: 25,
              timeLimit: 1200
            }
          ]
        }
        await startAssignment(testAssignment)
      }
    } catch (error) {
      console.error('Error starting assignment:', error)
      alert('Failed to load assignments. Please try again.')
    }
  }

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
      clearUser();
      // Show auth loading screen when user logs in
      setShowAuthLoadingScreen(true);
    } else {
      // Hide loading screen when user logs out
      setShowAuthLoadingScreen(false);
    }
  }, [user?.userId]); // Track user ID changes specifically

  // Perform TBT authentication when user is available
  useEffect(() => {
    if (user && !tbtAuthLoading) {
      const userEmail = user.signInDetails?.loginId || user.attributes?.email;
      authenticateUser(userEmail);
      
      // Set user email in assignment store for database operations
      if (userEmail) {
        setCurrentUserEmail(userEmail);
      }
    }
  }, [user?.userId]); // Only depend on user ID, not tbtAuthLoading

  // Load user progress when TBT authentication is complete
  useEffect(() => {
    if (tbtAuthStatus === 'tbt' && !tbtAuthLoading) {
      loadAllUserProgress();
    }
  }, [tbtAuthStatus, tbtAuthLoading, loadAllUserProgress]);

  // Hide auth loading screen when authentication is complete
  useEffect(() => {
    if (!tbtAuthLoading && showAuthLoadingScreen && tbtAuthStatus) {
      // Auto-hide after 1 second
      const timer = setTimeout(() => {
        setShowAuthLoadingScreen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tbtAuthLoading, showAuthLoadingScreen, tbtAuthStatus]);

  // Fallback: Hide loading screen after 8 seconds to prevent getting stuck
  useEffect(() => {
    if (showAuthLoadingScreen) {
      const fallbackTimer = setTimeout(() => {
        console.warn('Auth loading screen timeout - hiding automatically');
        setShowAuthLoadingScreen(false);
      }, 8000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [showAuthLoadingScreen]);

  // Start activity tracking when user is authenticated
  useEffect(() => {
    if (user) {
      startActivityTracking();
      return () => {
        stopActivityTracking();
      };
    }
  }, [user, startActivityTracking, stopActivityTracking]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Close settings modal
        setShowSettingsModal(false)
        setShowS3FileManager(false)
        setShowNodeAnalysisModal(false)
        setShowConnectionAnalysisModal(false)
        setShowSystemStatsModal(false)
        setShowAdjacencyMatrixModal(false)
      }
      
      // Undo/Redo shortcuts
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault()
          undo()
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          event.preventDefault()
          redo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [undo, redo])

  // Handle app click to exit loop view mode
  const handleAppClick = (event) => {
    if (event.target === event.currentTarget && loopViewMode) {
      exitLoopViewMode()
      clearHighlightedLoop()
    }
  }

  // Handle mouse move to track coordinates
  const handleMouseMove = (event) => {
    setMouseCoords({ x: event.clientX, y: event.clientY })
  }

  // Handle continue button click on auth loading screen
  const handleAuthContinue = () => {
    setShowAuthLoadingScreen(false);
  }

  // Handle escape key for auth loading screen
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showAuthLoadingScreen) {
        setShowAuthLoadingScreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAuthLoadingScreen]);

  return (
    <div className="sysloop-app" onClick={handleAppClick} onMouseMove={handleMouseMove}>
      {/* TBT Authentication Loading Screen */}
      {showAuthLoadingScreen && (
        <TBTAuthLoadingScreen
          userEmail={user?.signInDetails?.loginId || user?.attributes?.email}
          tbtAuthStatus={tbtAuthStatus}
          isLoading={tbtAuthLoading}
          onContinue={handleAuthContinue}
        />
      )}

      {/* Header */}
       <SysLoopHeader 
         signOut={signOut}
         onSettingsClick={() => setShowSettingsModal(true)}
         onDevModeToggle={() => setDevMode(!devMode)}
         devMode={devMode}
         onAssignmentClick={handleAssignmentClick}
         userEmail={user?.signInDetails?.loginId || user?.attributes?.email}
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
        <div 
          className={`canvas-area ${isAssignmentMode ? 'assignment-mode' : ''}`}
          style={isAssignmentMode ? { marginRight: `${sidebarWidth}px` } : {}}
        >
          <ReactFlowProvider>
                         <Canvas 
               mode={mode} 
               loops={loops} 
               dimmingEnabled={dimmingEnabled}
               hoveredLoop={hoveredLoop}
               devMode={devMode}
               setDevMode={setDevMode}
               isAssignmentMode={isAssignmentMode}
               currentAssignment={currentAssignment}
               currentQuestion={currentQuestion}
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
        isAuthenticated={!!user}
        tbtAuthStatus={tbtAuthStatus}
        accessLevel={accessLevel}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      )}

      {/* S3 File Manager Modal */}
      {showS3FileManager && (
        <S3FileManager isOpen={showS3FileManager} onClose={() => setShowS3FileManager(false)} />
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

      {/* Assignment Sidebar */}
              {isAssignmentMode && <AssignmentPanel />}

      {/* Assignment Progress Modal */}
      {showProgressModal && (
        <AssignmentProgressModal 
          isOpen={showProgressModal} 
          onClose={() => setShowProgressModal(false)} 
        />
      )}
    </div>
  )
}

export default App
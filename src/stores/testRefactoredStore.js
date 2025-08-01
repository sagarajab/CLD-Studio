// Test file to verify refactored store functionality
import { useCLDStoreRefactored } from './cldStoreRefactored'

// Test basic functionality
export const testRefactoredStore = () => {
  console.log('Testing refactored CLD store...')
  
  const store = useCLDStoreRefactored.getState()
  
  // Test 1: Check if all expected properties exist
  const requiredProperties = [
    'nodes', 'edges', 'selectedNode', 'selectedEdge', 'selectedNodes', 'selectedEdges',
    'hoveredNode', 'hoveredEdge', 'highlightedLoop', 'loopViewMode', 'viewTransform',
    'panningMode', 'arrowDrawingMode', 'showStateVectorModal', 'showPlotsModal',
    'editingNodeId', 'activeDropdown', 'showGrid', 'isLoading', 'simulationMode',
    'simulationState', 'config', 'globalStyles', 'selectedNodeColor', 'selectedArrowColor',
    'diagramName', 'mode', 'currentProblem', 'problemStatement', 'adjacencyMatrix',
    'allLoops', 'eventsLog', 'undoStack', 'redoStack'
  ]
  
  const missingProperties = requiredProperties.filter(prop => !(prop in store))
  
  if (missingProperties.length > 0) {
    console.error('Missing properties:', missingProperties)
    return false
  }
  
  // Test 2: Check if all expected methods exist
  const requiredMethods = [
    'addNode', 'updateNode', 'deleteNode', 'addEdge', 'updateEdge', 'deleteEdge',
    'setSelectedNode', 'setSelectedEdge', 'addToNodeSelection', 'removeFromNodeSelection',
    'clearNodeSelection', 'addToEdgeSelection', 'removeFromEdgeSelection', 'clearEdgeSelection',
    'setHoveredNode', 'clearHoveredNode', 'setHoveredEdge', 'clearHoveredEdge',
    'setHighlightedLoop', 'clearHighlightedLoop', 'enterLoopViewMode', 'exitLoopViewMode',
    'setViewTransform', 'updateViewTransform', 'resetView', 'togglePanningMode',
    'toggleArrowDrawingMode', 'toggleGrid', 'setShowStateVectorModal', 'setShowPlotsModal',
    'setEditingNode', 'clearEditingNode', 'setActiveDropdown', 'closeAllDropdowns',
    'setLoading', 'resetUIState', 'updateSelectedNodesColor', 'updateSelectedEdgesColor',
    'deleteSelectedNodes', 'deleteSelectedEdges', 'initializeSimulation', 'calculateNextState',
    'saveDiagram', 'loadDiagram', 'undo', 'redo', 'recordStateChange', 'recordDragStart',
    'recordDragEnd', 'clearDiagram', 'loadDiagramData', 'exportMatrix', 'exportAsPNG',
    'exportAsSVG', 'exportAsPDF', 'exportDetailedData', 'loadProblem', 'updateConfig',
    'updateGlobalStyles', 'resetConfig', 'setNodeFont', 'setNodeFontSize', 'setArrowColor',
    'setArrowWidth', 'setArrowTransparency', 'setArrowHeadSize', 'resetGlobalStyles',
    'setSelectedNodeColor', 'setSelectedArrowColor', 'updateGraphAnalysis',
    'generateAdjacencyMatrix', 'findAllLoops', 'setDiagramName', 'updateProblemStatement',
    'clearProblemStatement', 'setMode', 'toggleSimulationMode', 'runSimulation',
    'pauseSimulation', 'stepSimulation', 'stepBackSimulation', 'resetSimulation',
    'updateSimulationSettings', 'isSimulationCompleted', 'updateLoopDescription',
    'updateNodeDescription', 'updateEdgeDescription', 'addEvent', 'clearEventsLog',
    'clearUndoRedoStacks', 'resetUndoRedoState'
  ]
  
  const missingMethods = requiredMethods.filter(method => typeof store[method] !== 'function')
  
  if (missingMethods.length > 0) {
    console.error('Missing methods:', missingMethods)
    return false
  }
  
  // Test 3: Test basic operations
  try {
    // Test adding a node
    const addNodeResult = store.addNode({ x: 100, y: 100 }, 'Test Node')
    if (!addNodeResult) {
      console.error('Failed to add node')
      return false
    }
    
    // Test adding an edge
    const addEdgeResult = store.addEdge(1, 2, 'positive')
    if (!addEdgeResult) {
      console.error('Failed to add edge')
      return false
    }
    
    // Test selection
    store.setSelectedNode(1)
    if (store.selectedNode !== 1) {
      console.error('Failed to set selected node')
      return false
    }
    
    // Test view transform
    store.setViewTransform({ x: 50, y: 50, scale: 1.5 })
    if (store.viewTransform.x !== 50 || store.viewTransform.y !== 50 || store.viewTransform.scale !== 1.5) {
      console.error('Failed to set view transform')
      return false
    }
    
    console.log('✅ All tests passed! Refactored store is working correctly.')
    return true
    
  } catch (error) {
    console.error('Error during testing:', error)
    return false
  }
}

// Run the test
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testRefactoredStore()
  }, 1000)
} 
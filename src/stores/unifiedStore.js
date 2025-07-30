import { create } from 'zustand'
import { useConfigStore } from './configStore'
import { useUIStore } from './uiStore'
import { useGraphStore } from './graphStore'
import { useAnalysisStore } from './analysisStore'
import { useSimulationStore } from './simulationStore'
import { useUndoRedoStore } from './undoRedoStore'
import { useMainStore } from './mainStore'

// Unified store that combines all modular stores
const useUnifiedStore = create((set, get) => {
  // Initialize all modular stores
  const configStore = useConfigStore.getState()
  const uiStore = useUIStore.getState()
  const graphStore = useGraphStore.getState()
  const analysisStore = useAnalysisStore.getState()
  const simulationStore = useSimulationStore.getState()
  const undoRedoStore = useUndoRedoStore.getState()
  const mainStore = useMainStore.getState()

  return {
    // ===== CONFIG STORE =====
    // Configuration state
    config: configStore.config,
    globalStyles: configStore.globalStyles,
    showGrid: configStore.showGrid,
    selectedNodeColor: configStore.selectedNodeColor,
    selectedArrowColor: configStore.selectedArrowColor,
    
    // Configuration operations
    updateConfig: configStore.updateConfig,
    updateGlobalStyles: configStore.updateGlobalStyles,
    resetConfig: configStore.resetConfig,
    toggleGrid: configStore.toggleGrid,
    setSelectedNodeColor: configStore.setSelectedNodeColor,
    setSelectedArrowColor: configStore.setSelectedArrowColor,
    setNodeFont: configStore.setNodeFont,
    setNodeFontSize: configStore.setNodeFontSize,
    setArrowColor: configStore.setArrowColor,
    setArrowWidth: configStore.setArrowWidth,
    setArrowTransparency: configStore.setArrowTransparency,
    setArrowHeadSize: configStore.setArrowHeadSize,
    resetGlobalStyles: configStore.resetGlobalStyles,

    // ===== UI STORE =====
    // View transform state
    viewTransform: uiStore.viewTransform,
    panningMode: uiStore.panningMode,
    
    // Selection state
    selectedNode: uiStore.selectedNode,
    selectedEdge: uiStore.selectedEdge,
    selectedNodes: uiStore.selectedNodes,
    selectedEdges: uiStore.selectedEdges,
    
    // Hover state
    hoveredNode: uiStore.hoveredNode,
    hoveredEdge: uiStore.hoveredEdge,
    
    // Loop highlighting state
    highlightedLoop: uiStore.highlightedLoop,
    loopViewMode: uiStore.loopViewMode,
    
    // Loading state
    isLoading: uiStore.isLoading,
    
    // UI operations
    setViewTransform: uiStore.setViewTransform,
    updateViewTransform: uiStore.updateViewTransform,
    resetView: uiStore.resetView,
    togglePanningMode: uiStore.togglePanningMode,
    setSelectedNode: uiStore.setSelectedNode,
    setSelectedEdge: uiStore.setSelectedEdge,
    addToNodeSelection: uiStore.addToNodeSelection,
    removeFromNodeSelection: uiStore.removeFromNodeSelection,
    clearNodeSelection: uiStore.clearNodeSelection,
    setNodeSelection: uiStore.setNodeSelection,
    addToEdgeSelection: uiStore.addToEdgeSelection,
    removeFromEdgeSelection: uiStore.removeFromEdgeSelection,
    clearEdgeSelection: uiStore.clearEdgeSelection,
    setEdgeSelection: uiStore.setEdgeSelection,
    clearAllSelections: uiStore.clearAllSelections,
    setHoveredNode: uiStore.setHoveredNode,
    clearHoveredNode: uiStore.clearHoveredNode,
    setHoveredEdge: uiStore.setHoveredEdge,
    clearHoveredEdge: uiStore.clearHoveredEdge,
    setHighlightedLoop: uiStore.setHighlightedLoop,
    clearHighlightedLoop: uiStore.clearHighlightedLoop,
    enterLoopViewMode: uiStore.enterLoopViewMode,
    exitLoopViewMode: uiStore.exitLoopViewMode,
    setLoading: uiStore.setLoading,

    // ===== GRAPH STORE =====
    // Graph state
    nodes: graphStore.nodes,
    edges: graphStore.edges,
    
    // Graph operations
    addNode: graphStore.addNode,
    updateNode: graphStore.updateNode,
    updateNodeDescription: graphStore.updateNodeDescription,
    deleteNode: graphStore.deleteNode,
    addEdge: graphStore.addEdge,
    updateEdge: graphStore.updateEdge,
    updateEdgeDescription: graphStore.updateEdgeDescription,
    deleteEdge: graphStore.deleteEdge,
    updateSelectedNodesColor: graphStore.updateSelectedNodesColor,
    updateSelectedEdgesColor: graphStore.updateSelectedEdgesColor,
    deleteSelectedNodes: graphStore.deleteSelectedNodes,
    deleteSelectedEdges: graphStore.deleteSelectedEdges,
    updateSelectedNodeColor: graphStore.updateSelectedNodeColor,
    updateAllNodeColors: graphStore.updateAllNodeColors,
    updateSelectedEdgeColor: graphStore.updateSelectedEdgeColor,
    updateAllEdgeColors: graphStore.updateAllEdgeColors,
    clearDiagram: graphStore.clearDiagram,
    connectionExists: graphStore.connectionExists,

    // ===== ANALYSIS STORE =====
    // Analysis state
    adjacencyMatrix: analysisStore.adjacencyMatrix,
    allLoops: analysisStore.allLoops,
    
    // Analysis operations
    generateAdjacencyMatrix: analysisStore.generateAdjacencyMatrix,
    findAllLoops: analysisStore.findAllLoops,
    updateGraphAnalysis: analysisStore.updateGraphAnalysis,
    updateLoopDescription: analysisStore.updateLoopDescription,
    exportMatrix: analysisStore.exportMatrix,

    // ===== SIMULATION STORE =====
    // Simulation state
    simulationMode: simulationStore.simulationMode,
    simulationState: simulationStore.simulationState,
    
    // Simulation operations
    toggleSimulationMode: simulationStore.toggleSimulationMode,
    initializeSimulation: simulationStore.initializeSimulation,
    runSimulation: simulationStore.runSimulation,
    pauseSimulation: simulationStore.pauseSimulation,
    stepSimulation: simulationStore.stepSimulation,
    stepBackSimulation: simulationStore.stepBackSimulation,
    resetSimulation: simulationStore.resetSimulation,
    calculateNextState: simulationStore.calculateNextState,
    updateSimulationSettings: simulationStore.updateSimulationSettings,
    isSimulationCompleted: simulationStore.isSimulationCompleted,
    testPropagation: simulationStore.testPropagation,

    // ===== UNDO/REDO STORE =====
    // Undo/Redo state
    undoStack: undoRedoStore.undoStack,
    redoStack: undoRedoStore.redoStack,
    maxUndoSteps: undoRedoStore.maxUndoSteps,
    isUndoRedoAction: undoRedoStore.isUndoRedoAction,
    
    // Undo/Redo operations
    createStateSnapshot: undoRedoStore.createStateSnapshot,
    recordStateChange: undoRedoStore.recordStateChange,
    undo: undoRedoStore.undo,
    redo: undoRedoStore.redo,
    clearUndoRedoStacks: undoRedoStore.clearUndoRedoStacks,
    resetUndoRedoState: undoRedoStore.resetUndoRedoState,
    debugUndoRedoState: undoRedoStore.debugUndoRedoState,
    recordDragStart: undoRedoStore.recordDragStart,
    recordDragEnd: undoRedoStore.recordDragEnd,

    // ===== MAIN STORE =====
    // Application state
    mode: mainStore.mode,
    currentProblem: mainStore.currentProblem,
    diagramName: mainStore.diagramName,
    problemStatement: mainStore.problemStatement,
    eventsLog: mainStore.eventsLog,
    
    // Main operations
    addEvent: mainStore.addEvent,
    clearEventsLog: mainStore.clearEventsLog,
    updateProblemStatement: mainStore.updateProblemStatement,
    clearProblemStatement: mainStore.clearProblemStatement,
    setDiagramName: mainStore.setDiagramName,
    setMode: mainStore.setMode,
    loadProblem: mainStore.loadProblem,
    submitAssessment: mainStore.submitAssessment,
    saveDiagram: mainStore.saveDiagram,
    loadDiagram: mainStore.loadDiagram,
    exportAsPNG: mainStore.exportAsPNG,
    exportAsSVG: mainStore.exportAsSVG,
    exportAsPDF: mainStore.exportAsPDF,
    debugExportElements: mainStore.debugExportElements
  }
})

export { useUnifiedStore }

// For backward compatibility, export the unified store as the main store
export const useCLDStore = useUnifiedStore 
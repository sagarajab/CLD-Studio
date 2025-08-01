import { create } from 'zustand'
import { useGraphStore } from './graphStore'
import { useUIStore } from './uiStore'
import { useSimulationStore } from './simulationStore'
import { useConfigStore } from './configStore'
import { useUndoRedoStore } from './undoRedoStore'
import { useFileStore } from './fileStore'
import { useEventsStore } from './eventsStore'

// Create a composed store that maintains backward compatibility
const useCLDStoreRefactored = create((set, get) => {
  // Initialize all specialized stores
  const graphStore = useGraphStore.getState()
  const uiStore = useUIStore.getState()
  const simulationStore = useSimulationStore.getState()
  const configStore = useConfigStore.getState()
  const undoRedoStore = useUndoRedoStore.getState()
  const fileStore = useFileStore.getState()
  const eventsStore = useEventsStore.getState()

  // Helper function to update all stores when main state changes
  const updateAllStores = (updates) => {
    // Update graph store
    if (updates.nodes !== undefined || updates.edges !== undefined) {
      useGraphStore.setState({
        nodes: updates.nodes || graphStore.nodes,
        edges: updates.edges || graphStore.edges
      })
    }
    
    // Update UI store
    if (updates.viewTransform !== undefined || updates.showGrid !== undefined) {
      useUIStore.setState({
        viewTransform: updates.viewTransform || uiStore.viewTransform,
        showGrid: updates.showGrid !== undefined ? updates.showGrid : uiStore.showGrid
      })
    }
    
    // Update simulation store
    if (updates.simulationState !== undefined) {
      useSimulationStore.setState({
        simulationState: updates.simulationState
      })
    }
    
    // Update config store
    if (updates.config !== undefined || updates.globalStyles !== undefined) {
      useConfigStore.setState({
        config: updates.config || configStore.config,
        globalStyles: updates.globalStyles || configStore.globalStyles
      })
    }
    
    // Update file store
    if (updates.diagramName !== undefined || updates.mode !== undefined || updates.problemStatement !== undefined) {
      useFileStore.setState({
        diagramName: updates.diagramName || fileStore.diagramName,
        mode: updates.mode || fileStore.mode,
        problemStatement: updates.problemStatement !== undefined ? updates.problemStatement : fileStore.problemStatement
      })
    }
  }

  return {
    // Expose all state from specialized stores for backward compatibility
    ...graphStore,
    ...uiStore,
    ...simulationStore,
    ...configStore,
    ...fileStore,
    ...eventsStore,
    
    // Override methods to maintain backward compatibility and coordinate between stores
    
    // Graph operations with event logging and undo/redo
    addNode: (position, label = 'New Node') => {
      const { simulationMode, simulationState, arrowDrawingMode, editingNodeId } = get()
      
      // Disable node addition during simulation mode or arrow drawing mode
      if (simulationMode || simulationState.isRunning) {
        console.warn('Cannot add nodes while simulation mode is enabled')
        return false
      }
      
      if (arrowDrawingMode) {
        console.warn('Cannot add nodes while arrow drawing mode is enabled')
        return false
      }
      
      if (editingNodeId !== null) {
        console.warn('Cannot add nodes while a node is being edited')
        return false
      }
      
      // Record state BEFORE adding the node
      undoRedoStore.recordStateChange(get())
      
      const result = graphStore.addNode(position, label, configStore.selectedNodeColor)
      
      if (result) {
        eventsStore.addEvent(`Node "${label}" added`)
      }
      
      return result
    },
    
    updateNode: (nodeId, updates) => {
      const { simulationState, simulationMode } = get()
      
      // Allow position updates during simulation (for dragging), but prevent other changes
      if (simulationMode || simulationState.isRunning) {
        if (updates.position) {
          graphStore.updateNode(nodeId, updates)
          return true
        } else {
          console.warn('Cannot update node properties while simulation mode is enabled (except position)')
          return false
        }
      }
      
      graphStore.updateNode(nodeId, updates)
      
      // Record state change for non-position updates
      const visualOnlyUpdates = ['borderColor', 'borderWidth', 'borderStyle', 'highlighted', 'dimmed']
      const isVisualOnlyUpdate = Object.keys(updates).every(key => visualOnlyUpdates.includes(key))
      
      if (!isVisualOnlyUpdate && !updates.position) {
        undoRedoStore.recordStateChange(get())
      }
    },
    
    deleteNode: (nodeId) => {
      const { simulationState, simulationMode } = get()
      
      if (simulationMode || simulationState.isRunning) {
        console.warn('Cannot delete nodes while simulation mode is enabled')
        return false
      }
      
      // Record state BEFORE deleting the node
      undoRedoStore.recordStateChange(get())
      
      const nodeLabel = graphStore.deleteNode(nodeId)
      eventsStore.addEvent(`Node "${nodeLabel}" deleted`)
    },
    
    addEdge: (source, target, polarity = 'positive') => {
      const { simulationState, simulationMode } = get()
      
      if (simulationMode || simulationState.isRunning) {
        console.warn('Cannot add edges while simulation mode is enabled')
        return false
      }
      
      // Record state BEFORE adding the edge
      undoRedoStore.recordStateChange(get())
      
      const result = graphStore.addEdge(source, target, polarity, configStore.selectedArrowColor)
      
      if (result.success) {
        eventsStore.addEvent(`Arrow "${result.sourceLabel}" → "${result.targetLabel}" added`)
      }
      
      return result.success
    },
    
    updateEdge: (edgeId, updates) => {
      const { simulationState, simulationMode } = get()
      
      if (simulationMode || simulationState.isRunning) {
        if (updates.radius !== undefined) {
          graphStore.updateEdge(edgeId, updates)
          return true
        } else {
          console.warn('Cannot update edge properties while simulation mode is enabled (except radius)')
          return false
        }
      }
      
      graphStore.updateEdge(edgeId, updates)
      
      if (updates.radius === undefined) {
        undoRedoStore.recordStateChange(get())
      }
    },
    
    deleteEdge: (edgeId) => {
      const { simulationState, simulationMode } = get()
      
      if (simulationMode || simulationState.isRunning) {
        console.warn('Cannot delete edges while simulation mode is enabled')
        return false
      }
      
      // Record state BEFORE deleting the edge
      undoRedoStore.recordStateChange(get())
      
      const { sourceLabel, targetLabel } = graphStore.deleteEdge(edgeId)
      eventsStore.addEvent(`Arrow "${sourceLabel}" → "${targetLabel}" deleted`)
    },
    
    // Bulk operations
    updateSelectedNodesColor: (color) => {
      const { selectedNodes } = get()
      
      if (selectedNodes.length === 0) return
      
      undoRedoStore.recordStateChange(get())
      graphStore.updateNodesColor(selectedNodes, color)
    },

    updateSelectedEdgesColor: (color) => {
      const { selectedEdges } = get()
      
      if (selectedEdges.length === 0) return
      
      undoRedoStore.recordStateChange(get())
      graphStore.updateEdgesColor(selectedEdges, color)
    },

    deleteSelectedNodes: () => {
      const { selectedNodes } = get()
      
      if (selectedNodes.length === 0) return
      
      undoRedoStore.recordStateChange(get())
      
      const nodeLabels = graphStore.deleteNodes(selectedNodes)
      eventsStore.addEvent(`${selectedNodes.length} node(s) deleted: ${nodeLabels.join(', ')}`)
      
      // Clear selection after state recording
      uiStore.clearNodeSelection()
    },

    deleteSelectedEdges: () => {
      const { selectedEdges } = get()
      
      if (selectedEdges.length === 0) return
      
      undoRedoStore.recordStateChange(get())
      
      const edgeLabels = graphStore.deleteEdges(selectedEdges)
      eventsStore.addEvent(`${selectedEdges.length} edge(s) deleted: ${edgeLabels.join(', ')}`)
      
      // Clear selection after state recording
      uiStore.clearEdgeSelection()
    },
    
    // Simulation operations with graph data coordination
    initializeSimulation: (perturbedNodeId, perturbationValue) => {
      const { nodes } = get()
      return simulationStore.initializeSimulation(perturbedNodeId, perturbationValue, nodes)
    },
    
    calculateNextState: (currentStateVector) => {
      const { nodes, edges } = get()
      // Update simulation store with current graph data
      simulationStore.setGraphData(nodes, edges)
      return simulationStore.calculateNextState(currentStateVector)
    },
    
    // File operations
    saveDiagram: () => {
      const state = get()
      fileStore.saveDiagram(state)
    },
    
    loadDiagram: () => {
      fileStore.loadDiagram(set)
    },
    
    // Undo/Redo operations
    undo: () => {
      const currentState = get()
      return undoRedoStore.undo(currentState, updateAllStores)
    },
    
    redo: () => {
      const currentState = get()
      return undoRedoStore.redo(currentState, updateAllStores)
    },
    
    recordStateChange: () => {
      undoRedoStore.recordStateChange(get())
    },
    
    recordDragStart: (nodeId, startPosition) => {
      undoRedoStore.recordDragStart(get(), nodeId, startPosition)
    },
    
    recordDragEnd: (nodeId, endPosition) => {
      undoRedoStore.recordDragEnd(get(), nodeId, endPosition)
    },
    
    // Diagram operations
    clearDiagram: () => {
      const currentDiagramName = get().diagramName
      graphStore.clearGraph()
      uiStore.resetUIState()
      fileStore.setDiagramName(currentDiagramName)
      undoRedoStore.clearUndoRedoStacks()
    },
    
    loadDiagramData: (diagramData) => {
      // This is a complex operation that needs to coordinate multiple stores
      // For now, we'll use the existing implementation from the original store
      // TODO: Refactor this to use the new store structure
      console.warn('loadDiagramData needs to be refactored to use new store structure')
    },
    
    // Export operations
    exportMatrix: () => {
      const { nodes, edges } = get()
      fileStore.exportMatrix(nodes, edges)
    },
    
    exportAsPNG: async () => {
      const { diagramName } = get()
      await fileStore.exportAsPNG(diagramName)
    },
    
    exportAsSVG: () => {
      const { diagramName } = get()
      fileStore.exportAsSVG(diagramName)
    },
    
    exportAsPDF: async () => {
      const { diagramName } = get()
      await fileStore.exportAsPDF(diagramName)
    },
    
    exportDetailedData: () => {
      const state = get()
      fileStore.exportDetailedData(state)
    },
    
    // Assessment operations
    loadProblem: (problem) => {
      const { nodes, edges } = fileStore.loadProblem(problem)
      graphStore.setGraphData(nodes, edges)
    },
    
    // Configuration operations
    updateConfig: (updates) => {
      configStore.updateConfig(updates)
    },
    
    updateGlobalStyles: (updates) => {
      configStore.updateGlobalStyles(updates)
    },
    
    resetConfig: () => {
      configStore.resetConfig()
    },
    
    // Global styling operations
    setNodeFont: (font) => {
      configStore.setNodeFont(font)
    },
    
    setNodeFontSize: (size) => {
      configStore.setNodeFontSize(size)
    },
    
    setArrowColor: (color) => {
      configStore.setArrowColor(color)
    },
    
    setArrowWidth: (width) => {
      configStore.setArrowWidth(width)
    },
    
    setArrowTransparency: (transparency) => {
      configStore.setArrowTransparency(transparency)
    },
    
    setArrowHeadSize: (size) => {
      configStore.setArrowHeadSize(size)
    },
    
    resetGlobalStyles: () => {
      configStore.resetGlobalStyles()
    },
    
    // Selected color operations
    setSelectedNodeColor: (color) => {
      configStore.setSelectedNodeColor(color)
    },
    
    setSelectedArrowColor: (color) => {
      configStore.setSelectedArrowColor(color)
    },
    
    // Update graph analysis
    updateGraphAnalysis: () => {
      graphStore.updateGraphAnalysis()
    },
    
    // Generate adjacency matrix
    generateAdjacencyMatrix: () => {
      return graphStore.generateAdjacencyMatrix()
    },
    
    // Find all loops
    findAllLoops: () => {
      return graphStore.findAllLoops()
    },
    
    // Diagram name operations
    setDiagramName: (name) => {
      fileStore.setDiagramName(name)
    },
    
    // Problem statement operations
    updateProblemStatement: (statement) => {
      fileStore.updateProblemStatement(statement)
    },
    
    clearProblemStatement: () => {
      fileStore.clearProblemStatement()
    },
    
    // Mode operations
    setMode: (mode) => {
      fileStore.setMode(mode)
    },
    
    // Simulation mode operations
    toggleSimulationMode: () => {
      const wasEnabled = simulationStore.toggleSimulationMode()
      eventsStore.addEvent(`Simulation mode ${wasEnabled ? 'activated' : 'deactivated'}`)
    },
    
    // Simulation control operations
    runSimulation: () => {
      simulationStore.runSimulation()
    },
    
    pauseSimulation: () => {
      simulationStore.pauseSimulation()
    },
    
    stepSimulation: () => {
      simulationStore.stepSimulation()
    },
    
    stepBackSimulation: () => {
      simulationStore.stepBackSimulation()
    },
    
    resetSimulation: () => {
      simulationStore.resetSimulation()
    },
    
    updateSimulationSettings: (settings) => {
      simulationStore.updateSimulationSettings(settings)
    },
    
    isSimulationCompleted: () => {
      return simulationStore.isSimulationCompleted()
    },
    
    // Loop description updates
    updateLoopDescription: (loopIndex, description) => {
      graphStore.updateLoopDescription(loopIndex, description)
    },
    
    // Node and edge description updates
    updateNodeDescription: (nodeId, description) => {
      graphStore.updateNodeDescription(nodeId, description)
      undoRedoStore.recordStateChange(get())
    },
    
    updateEdgeDescription: (edgeId, description) => {
      const { simulationState } = get()
      
      if (simulationState.isRunning) {
        console.warn('Cannot update edge descriptions while simulation is running')
        return false
      }
      
      graphStore.updateEdgeDescription(edgeId, description)
      undoRedoStore.recordStateChange(get())
    },
    
    // Events operations
    addEvent: (event) => {
      eventsStore.addEvent(event)
    },
    
    clearEventsLog: () => {
      eventsStore.clearEventsLog()
    },
    
    // Undo/Redo stack operations
    clearUndoRedoStacks: () => {
      undoRedoStore.clearUndoRedoStacks()
    },
    
    resetUndoRedoState: () => {
      undoRedoStore.resetUndoRedoState()
    }
  }
})

export { useCLDStoreRefactored } 
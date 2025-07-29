import { create } from 'zustand'
import { loadConfig, saveConfig } from '../config/appConfig'
import { examplesService } from '../services/examplesService'
import { createSampleData } from '../utils/createSampleData'

const useCLDStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  selectedNodes: [], // Multiselect: array of selected node IDs
  selectedEdges: [], // Multiselect: array of selected edge IDs
  highlightedLoop: null, // Currently highlighted loop
  hoveredNode: null, // Currently hovered node
  hoveredEdge: null, // Currently hovered edge
  loopViewMode: false, // Whether we're in loop view mode (dimming other elements)
  mode: 'sandbox', // 'sandbox' or 'assessment'
  currentProblem: null,
  viewTransform: { x: 0, y: 0, scale: 1 }, // Zoom and pan state
  diagramName: 'Untitled', // Add diagram name state
  isLoading: false, // Loading state for user feedback
  config: loadConfig(), // Load config from localStorage
  
  // Undo/Redo state
  undoStack: [], // Array of state snapshots for undo
  redoStack: [], // Array of state snapshots for redo
  maxUndoSteps: 50, // Maximum number of undo steps (increased from 10)
  isUndoRedoAction: false, // Flag to prevent recording during undo/redo operations
  
  // Adjacency matrix and loop detection
  adjacencyMatrix: [], // Mathematical representation of the graph
  allLoops: [], // All detected loops in the graph
  
  // Global styling settings - now loaded from config
  globalStyles: loadConfig().globalStyles,
  
  // Grid visibility state
  showGrid: loadConfig().ui.showGrid, // Load from config
  
  // Simulation state
  simulationMode: false,
  simulationState: {
    isRunning: false,
    isPaused: false,
    isInitialized: false, // Track if simulation is properly initialized
    currentStep: 0,
    maxSteps: 50,
    stepDelay: 500, // milliseconds
    stateVector: [], // Current increment vector S(t)
    accumulatedValues: [], // Actual accumulated node values
    history: [], // History of increment vectors
    valueHistory: [], // History of accumulated values
    perturbedNode: null, // Node that was perturbed
    perturbationValue: 0
  },
  
  // Panning mode state
  panningMode: false,
  
  // Events log for status bar
  eventsLog: [],
  
  // Problem statement for sandbox mode
  problemStatement: '',
  
  // Selected colors state (like PowerPoint)
  selectedNodeColor: loadConfig().colors.defaultSelected.nodeColor,
  selectedArrowColor: loadConfig().colors.defaultSelected.arrowColor,
  
  // Examples state
  examples: [],
  isLoadingExamples: false,
  examplesError: null,
  
  // View transform operations
  setViewTransform: (transform) => {
    set({ viewTransform: transform })
  },
  
  updateViewTransform: (updates) => {
    set((state) => ({
      viewTransform: { ...state.viewTransform, ...updates }
    }))
  },
  
  resetView: () => {
    set({ viewTransform: { x: 0, y: 0, scale: 1 } })
  },
  
  // Panning mode operations
  togglePanningMode: () => {
    set((state) => ({ panningMode: !state.panningMode }))
  },
  
  // Grid operations
  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }))
  },
  
  // Node operations
  addNode: (position, label = 'New Node') => {
    const { nodes, config, updateGraphAnalysis, simulationState, simulationMode, addEvent, recordStateChange } = get()
    
    console.log(`Adding node "${label}" at position`, position, `Current nodes: ${nodes.length}`)
    
    // Disable node addition during simulation mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot add nodes while simulation mode is enabled')
      return false
    }
    
    // Check node limit constraint
    if (nodes.length >= config.constraints.maxNodes) {
      alert(`Cannot add more nodes. Maximum allowed: ${config.constraints.maxNodes}`)
      return false
    }
    
    // Record state BEFORE adding the node
    recordStateChange()
    
    const newNode = {
      id: nodes.length + 1, // Using integer IDs as per user preference
      type: 'cldNode',
      position,
      data: { 
        label,
        type: 'variable', // 'variable', 'constant', 'parameter'
        color: get().selectedNodeColor // Use selected color
      }
    }
    
    set((state) => ({
      nodes: [...state.nodes, newNode]
    }))
    
    // Verify node was added
    setTimeout(() => {
      const currentState = get()
      console.log(`Node added successfully. New node count: ${currentState.nodes.length}`, currentState.nodes.map(n => n.id))
    }, 0)
    
    updateGraphAnalysis()
    addEvent(`Node "${label}" added`)
    return true
  },
  
  updateNode: (nodeId, updates) => {
    const { simulationState, simulationMode, recordStateChange } = get()
    
    // Allow position updates during simulation (for dragging), but prevent other changes
    if (simulationMode || simulationState.isRunning) {
      // Only allow position updates during simulation
      if (updates.position) {
        // Allow dragging nodes during simulation
        set((state) => ({
          nodes: state.nodes.map(node => 
            node.id === nodeId 
              ? { 
                  ...node, 
                  position: updates.position
                }
              : node
          )
        }))
        return true
      } else {
        console.warn('Cannot update node properties while simulation mode is enabled (except position)')
        return false
      }
    }
    
    set((state) => ({
      nodes: state.nodes.map(node => 
        node.id === nodeId 
          ? { 
              ...node, 
              data: { ...node.data, ...updates },
              // Handle position updates separately
              ...(updates.position && { position: updates.position })
            }
          : node
      )
    }))
    get().updateGraphAnalysis()
    
    // Record state change for non-position updates (position updates are handled by drag functions)
    // Don't record visual-only updates like border color changes
    const visualOnlyUpdates = ['borderColor', 'borderWidth', 'borderStyle', 'highlighted', 'dimmed']
    const isVisualOnlyUpdate = Object.keys(updates).every(key => visualOnlyUpdates.includes(key))
    
    if (!isVisualOnlyUpdate && !updates.position) {
      console.log(`Recording state change for node ${nodeId} update:`, updates)
      recordStateChange()
    } else {
      console.log(`Skipping state recording for ${isVisualOnlyUpdate ? 'visual-only' : 'position'} update on node ${nodeId}:`, updates)
    }
  },

  updateNodeDescription: (nodeId, description) => {
    const { recordStateChange } = get()
    
    set((state) => ({
      nodes: state.nodes.map(node => 
        node.id === nodeId 
          ? { 
              ...node, 
              data: { ...node.data, description }
            }
          : node
      )
    }))
    get().updateGraphAnalysis()
    recordStateChange() // Record state change for description updates
  },
  
  deleteNode: (nodeId) => {
    const { simulationState, simulationMode, addEvent, recordStateChange } = get()
    
    // Disable node deletion during simulation mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot delete nodes while simulation mode is enabled')
      return false
    }
    
    // Record state BEFORE deleting the node
    recordStateChange()
    
    const nodeToDelete = get().nodes.find(node => node.id === nodeId)
    const nodeLabel = nodeToDelete?.data?.label || `Node ${nodeId}`
    
    set((state) => ({
      nodes: state.nodes.filter(node => node.id !== nodeId),
      edges: state.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
    }))
    get().updateGraphAnalysis()
    addEvent(`Node "${nodeLabel}" deleted`)
  },
  
  // Edge operations
  addEdge: (source, target, polarity = 'positive') => {
    const { edges, config, updateGraphAnalysis, simulationState, simulationMode, addEvent, nodes, recordStateChange } = get()
    
    console.log(`Adding edge from ${source} to ${target} with polarity ${polarity}`)
    
    // Disable edge addition during simulation mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot add edges while simulation mode is enabled')
      return false
    }
    
    // Check edge limit constraint
    if (edges.length >= config.constraints.maxEdges) {
      alert(`Cannot add more edges. Maximum allowed: ${config.constraints.maxEdges}`)
      return false
    }
    
    // Record state BEFORE adding the edge
    recordStateChange()
    
    // Find the next available integer ID
    const existingIds = edges.map(edge => edge.id)
    let nextId = 1
    while (existingIds.includes(nextId)) {
      nextId++
    }
    
    const sourceNode = nodes.find(n => n.id === source)
    const targetNode = nodes.find(n => n.id === target)
    const sourceLabel = sourceNode?.data?.label || `Node ${source}`
    const targetLabel = targetNode?.data?.label || `Node ${target}`
    
    const newEdge = {
      id: nextId, // Using integer IDs as per user preference
      source,
      target,
      type: 'default',
      data: { 
        polarity, // 'positive' or 'negative'
        color: get().selectedArrowColor // Use selected color
      },
      sourceX: 0,
      sourceY: 0,
      targetX: 0,
      targetY: 0,
      sourcePosition: 'bottom',
      targetPosition: 'top',
      selected: false,
      animated: false,
      style: {},
      className: '',
      zIndex: 0,
      interactionWidth: 20
    }
    
    set((state) => ({
      edges: [...state.edges, newEdge]
    }))
    updateGraphAnalysis()
    addEvent(`Arrow "${sourceLabel}" → "${targetLabel}" added`)
    console.log(`Edge added successfully.`)
    return true
  },
  
  updateEdge: (edgeId, updates) => {
    const { simulationState, simulationMode, recordStateChange } = get()
    
    // Allow radius updates during simulation (for dragging), but prevent other changes
    if (simulationMode || simulationState.isRunning) {
      // Only allow radius updates during simulation
      if (updates.radius !== undefined) {
        // Allow dragging edge radius during simulation
        set((state) => ({
          edges: state.edges.map(edge => 
            edge.id === edgeId 
              ? { 
                  ...edge, 
                  data: { ...edge.data, radius: updates.radius }
                }
              : edge
          )
        }))
        return true
      } else {
        console.warn('Cannot update edge properties while simulation mode is enabled (except radius)')
        return false
      }
    }
    
    set((state) => ({
      edges: state.edges.map(edge => 
        edge.id === edgeId 
          ? { 
              ...edge, 
              data: { ...edge.data, ...updates }
            }
          : edge
      )
    }))
    get().updateGraphAnalysis()
    
    // Record state change for non-radius updates (radius updates are handled by drag functions)
    if (updates.radius === undefined) {
      console.log(`Recording state change for edge ${edgeId} update:`, updates)
      recordStateChange()
    } else {
      console.log(`Skipping state recording for radius update on edge ${edgeId}`)
    }
  },

  updateEdgeDescription: (edgeId, description) => {
    const { simulationState, recordStateChange } = get()
    
    // Disable edge description updates during simulation
    if (simulationState.isRunning) {
      console.warn('Cannot update edge descriptions while simulation is running')
      return false
    }
    
    set((state) => ({
      edges: state.edges.map(edge => 
        edge.id === edgeId 
          ? { 
              ...edge, 
              data: { ...edge.data, description }
            }
          : edge
      )
    }))
    get().updateGraphAnalysis()
    recordStateChange() // Record state change for description updates
  },

  updateLoopDescription: (loopIndex, description) => {
    const { simulationState } = get()
    
    // Disable loop description updates during simulation
    if (simulationState.isRunning) {
      console.warn('Cannot update loop descriptions while simulation is running')
      return false
    }
    
    set((state) => ({
      allLoops: state.allLoops.map((loop, index) => 
        index === loopIndex 
          ? { 
              ...loop, 
              description
            }
          : loop
      )
    }))
  },
  
  deleteEdge: (edgeId) => {
    const { simulationState, simulationMode, addEvent, nodes, recordStateChange } = get()
    
    // Disable edge deletion during simulation mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot delete edges while simulation mode is enabled')
      return false
    }
    
    // Record state BEFORE deleting the edge
    recordStateChange()
    
    const edgeToDelete = get().edges.find(edge => edge.id === edgeId)
    const sourceNode = nodes.find(n => n.id === edgeToDelete?.source)
    const targetNode = nodes.find(n => n.id === edgeToDelete?.target)
    const sourceLabel = sourceNode?.data?.label || `Node ${edgeToDelete?.source}`
    const targetLabel = targetNode?.data?.label || `Node ${edgeToDelete?.target}`
    
    set((state) => ({
      edges: state.edges.filter(edge => edge.id !== edgeId)
    }))
    get().updateGraphAnalysis()
    addEvent(`Arrow "${sourceLabel}" → "${targetLabel}" deleted`)
  },
  
  // Selection
  setSelectedNode: (nodeId) => {
    set({ selectedNode: nodeId })
  },
  
  setSelectedEdge: (edgeId) => {
    set({ selectedEdge: edgeId })
  },

  // Multiselect functions
  addToNodeSelection: (nodeId) => {
    set((state) => ({
      selectedNodes: state.selectedNodes.includes(nodeId) 
        ? state.selectedNodes 
        : [...state.selectedNodes, nodeId]
    }))
  },

  removeFromNodeSelection: (nodeId) => {
    set((state) => ({
      selectedNodes: state.selectedNodes.filter(id => id !== nodeId)
    }))
  },

  clearNodeSelection: () => {
    set({ selectedNodes: [] })
  },

  setNodeSelection: (nodeIds) => {
    set({ selectedNodes: nodeIds })
  },

  addToEdgeSelection: (edgeId) => {
    set((state) => ({
      selectedEdges: state.selectedEdges.includes(edgeId) 
        ? state.selectedEdges 
        : [...state.selectedEdges, edgeId]
    }))
  },

  removeFromEdgeSelection: (edgeId) => {
    set((state) => ({
      selectedEdges: state.selectedEdges.filter(id => id !== edgeId)
    }))
  },

  clearEdgeSelection: () => {
    set({ selectedEdges: [] })
  },

  setEdgeSelection: (edgeIds) => {
    set({ selectedEdges: edgeIds })
  },

  clearAllSelections: () => {
    set({ 
      selectedNode: null, 
      selectedEdge: null, 
      selectedNodes: [], 
      selectedEdges: [] 
    })
  },

  // Bulk operations for multiselect
  updateSelectedNodesColor: (color) => {
    const { selectedNodes, recordStateChange } = get()
    
    if (selectedNodes.length === 0) return
    
    // Record state BEFORE updating the nodes
    recordStateChange()
    
    // Update all selected nodes in one operation
    set((state) => ({
      nodes: state.nodes.map(node => 
        selectedNodes.includes(node.id)
          ? { ...node, data: { ...node.data, color } }
          : node
      )
    }))
    
    get().updateGraphAnalysis()
  },

  updateSelectedEdgesColor: (color) => {
    const { selectedEdges, recordStateChange } = get()
    
    if (selectedEdges.length === 0) return
    
    // Record state BEFORE updating the edges
    recordStateChange()
    
    // Update all selected edges in one operation
    set((state) => ({
      edges: state.edges.map(edge => 
        selectedEdges.includes(edge.id)
          ? { ...edge, data: { ...edge.data, color } }
          : edge
      )
    }))
    
    get().updateGraphAnalysis()
  },

  deleteSelectedNodes: () => {
    const { selectedNodes, nodes, edges, updateGraphAnalysis, addEvent, recordStateChange } = get()
    
    if (selectedNodes.length === 0) return
    
    // Record state BEFORE deleting the nodes
    recordStateChange()
    
    // Get node labels for event logging
    const nodeLabels = selectedNodes.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId)
      return node?.data?.label || `Node ${nodeId}`
    })
    
    // Delete all selected nodes and their connected edges in one operation
    set((state) => ({
      nodes: state.nodes.filter(node => !selectedNodes.includes(node.id)),
      edges: state.edges.filter(edge => 
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      )
    }))
    
    updateGraphAnalysis()
    addEvent(`${selectedNodes.length} node(s) deleted: ${nodeLabels.join(', ')}`)
    
    // Clear selection after state recording
    set({ selectedNodes: [] })
  },

  deleteSelectedEdges: () => {
    const { selectedEdges, edges, nodes, updateGraphAnalysis, addEvent, recordStateChange } = get()
    
    if (selectedEdges.length === 0) return
    
    // Record state BEFORE deleting the edges
    recordStateChange()
    
    // Get edge labels for event logging
    const edgeLabels = selectedEdges.map(edgeId => {
      const edge = edges.find(e => e.id === edgeId)
      const sourceNode = nodes.find(n => n.id === edge?.source)
      const targetNode = nodes.find(n => n.id === edge?.target)
      const sourceLabel = sourceNode?.data?.label || `Node ${edge?.source}`
      const targetLabel = targetNode?.data?.label || `Node ${edge?.target}`
      return `${sourceLabel} → ${targetLabel}`
    })
    
    // Delete all selected edges in one operation
    set((state) => ({
      edges: state.edges.filter(edge => !selectedEdges.includes(edge.id))
    }))
    
    updateGraphAnalysis()
    addEvent(`${selectedEdges.length} edge(s) deleted: ${edgeLabels.join(', ')}`)
    
    // Clear selection after state recording
    set({ selectedEdges: [] })
  },
  
  // Loop highlighting
  setHighlightedLoop: (loopIndex) => {
    set({ highlightedLoop: loopIndex })
  },
  
  clearHighlightedLoop: () => {
    set({ highlightedLoop: null })
  },

  // Node hovering
  setHoveredNode: (nodeId) => {
    set({ hoveredNode: nodeId })
  },

  clearHoveredNode: () => {
    set({ hoveredNode: null })
  },

  // Edge hovering
  setHoveredEdge: (edgeId) => {
    set({ hoveredEdge: edgeId })
  },

  clearHoveredEdge: () => {
    set({ hoveredEdge: null })
  },

  // Loop view mode
  enterLoopViewMode: () => {
    set({ loopViewMode: true })
  },

  exitLoopViewMode: () => {
    set({ loopViewMode: false, highlightedLoop: null })
  },
  
  // Events log operations
  addEvent: (event) => {
    const timestamp = new Date().toLocaleTimeString()
    const newEvent = {
      id: Date.now(),
      timestamp,
      message: event,
      type: 'info'
    }
    
    set((state) => ({
      eventsLog: [newEvent, ...state.eventsLog.slice(0, 4)] // Keep only last 5 events
    }))
  },
  
  clearEventsLog: () => {
    set({ eventsLog: [] })
  },
  
  // Problem statement operations
  updateProblemStatement: (statement) => {
    set({ problemStatement: statement })
  },
  
  clearProblemStatement: () => {
    set({ problemStatement: '' })
  },
  
  // Diagram operations
  clearDiagram: () => {
    set({ 
      nodes: [], 
      edges: [], 
      selectedNode: null, 
      selectedEdge: null, 
      selectedNodes: [],
      selectedEdges: [],
      highlightedLoop: null,
      adjacencyMatrix: [],
      allLoops: [],
      diagramName: 'Untitled',
      problemStatement: '',
      undoStack: [],
      redoStack: []
    })
  },
  
  saveDiagram: () => {
    const { 
      nodes, 
      edges, 
      diagramName, 
      mode, 
      currentProblem, 
      viewTransform, 
      globalStyles, 
      adjacencyMatrix, 
      allLoops,
      simulationState,
      showGrid,
      config,
      problemStatement
    } = get()
    
    // Enhanced diagram data with comprehensive metadata
    const diagramData = {
      // Basic diagram info
      diagramName,
      timestamp: new Date().toISOString(),
      version: '2.0',
      createdWith: 'CLD Studio',
      
      // Problem statement and context
      problemStatement: {
        mode,
        currentProblem: currentProblem ? {
          id: currentProblem.id,
          title: currentProblem.title,
          description: currentProblem.description
        } : null,
        // For sandbox mode, capture the problem statement from the sidebar
        description: mode === 'sandbox' ? problemStatement || 'Free-form causal loop diagram' : currentProblem?.description || '',
        customStatement: problemStatement || ''
      },
      
      // Complete node information
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label || 'New Node',
          type: node.data.type || 'variable', // variable, constant, parameter
          color: node.data.color || '#000000',
          description: node.data.description || '',
          value: node.data.value || 0, // For simulation
          // Any other custom node properties
          ...node.data
        }
      })),
      
      // Complete edge information
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        data: {
          polarity: edge.data.polarity || 'positive',
          color: edge.data.color || '#6b7280',
          width: edge.data.width || 1.5,
          transparency: edge.data.transparency || 1.0,
          radius: edge.data.radius || 30,
          description: edge.data.description || '',
          // Any other custom edge properties
          ...edge.data
        },
        style: edge.style,
        markerEnd: edge.markerEnd
      })),
      
      // View and layout information
      viewTransform,
      showGrid,
      
      // Global styling settings
      globalStyles,
      
      // Analysis data
      analysis: {
        adjacencyMatrix,
        allLoops: allLoops.map(loop => ({
          nodes: loop.nodes,
          edges: loop.edges,
          type: loop.type, // 'Reinforcing' or 'Balancing'
          description: loop.description || '',
          length: loop.nodes.length
        })),
        nodeCount: nodes.length,
        edgeCount: edges.length,
        positiveEdges: edges.filter(e => e.data.polarity === 'positive').length,
        negativeEdges: edges.filter(e => e.data.polarity === 'negative').length
      },
      
      // Simulation state (if any)
      simulation: simulationState.isInitialized ? {
        isRunning: simulationState.isRunning,
        isPaused: simulationState.isPaused,
        isInitialized: simulationState.isInitialized,
        currentStep: simulationState.currentStep,
        maxSteps: simulationState.maxSteps,
        stepDelay: simulationState.stepDelay,
        stateVector: simulationState.stateVector,
        accumulatedValues: simulationState.accumulatedValues,
        history: simulationState.history,
        valueHistory: simulationState.valueHistory,
        perturbedNode: simulationState.perturbedNode,
        perturbationValue: simulationState.perturbationValue
      } : null,
      
      // Configuration snapshot
      config: {
        constraints: config.constraints,
        colors: config.colors,
        performance: config.performance,
        ui: config.ui,
        file: config.file
      },
      
      // Metadata
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        nodeTypes: {
          variable: nodes.filter(n => n.data.type === 'variable').length,
          constant: nodes.filter(n => n.data.type === 'constant').length,
          parameter: nodes.filter(n => n.data.type === 'parameter').length
        },
        edgePolarities: {
          positive: edges.filter(e => e.data.polarity === 'positive').length,
          negative: edges.filter(e => e.data.polarity === 'negative').length
        },
        loops: {
          total: allLoops.length,
          reinforcing: allLoops.filter(l => l.type === 'Reinforcing').length,
          balancing: allLoops.filter(l => l.type === 'Balancing').length
        }
      }
    }
    
    // Create JSON file for download
    const dataStr = JSON.stringify(diagramData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    // Use diagram name with .cld extension, fallback to default if empty
    const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
    link.download = `${safeName}.cld`
    link.click()
    URL.revokeObjectURL(url)
  },
  
  loadDiagram: () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.cld,.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        // Set loading state
        set({ isLoading: true })
        
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const diagramData = JSON.parse(e.target.result)
            
            // Handle both new enhanced format (v2.0) and legacy format (v1.0)
            const isEnhancedFormat = diagramData.version === '2.0' || diagramData.problemStatement
            
            if (isEnhancedFormat) {
              // Enhanced format - load all available data
              set({
                // Basic diagram data
                nodes: diagramData.nodes || [],
                edges: diagramData.edges || [],
                diagramName: diagramData.diagramName || 'Untitled',
                
                // Problem statement and mode
                mode: diagramData.problemStatement?.mode || 'sandbox',
                currentProblem: diagramData.problemStatement?.currentProblem || null,
                problemStatement: diagramData.problemStatement?.customStatement || '',
                
                // View and layout
                viewTransform: diagramData.viewTransform || { x: 0, y: 0, scale: 1 },
                showGrid: diagramData.showGrid !== undefined ? diagramData.showGrid : false,
                
                // Global styles (merge with current config)
                globalStyles: diagramData.globalStyles ? 
                  { ...get().globalStyles, ...diagramData.globalStyles } : 
                  get().globalStyles,
                
                // Analysis data
                adjacencyMatrix: diagramData.analysis?.adjacencyMatrix || [],
                allLoops: diagramData.analysis?.allLoops || [],
                
                // Simulation state (if available)
                simulationState: diagramData.simulation ? {
                  ...get().simulationState,
                  ...diagramData.simulation,
                  isInitialized: diagramData.simulation.isInitialized || false
                } : get().simulationState,
                
                              // Reset selection states
              selectedNode: null,
              selectedEdge: null,
              highlightedLoop: null,
              isLoading: false,
              // Clear undo/redo stacks when loading new diagram
              undoStack: [],
              redoStack: []
              })
              
              // Update config if provided
              if (diagramData.config) {
                const currentConfig = get().config
                const newConfig = { ...currentConfig, ...diagramData.config }
                set({ config: newConfig })
                saveConfig(newConfig)
              }
              
              // Log loading information
              console.log('Loaded enhanced diagram:', {
                name: diagramData.diagramName,
                version: diagramData.version,
                nodes: diagramData.nodes?.length || 0,
                edges: diagramData.edges?.length || 0,
                mode: diagramData.problemStatement?.mode,
                hasSimulation: !!diagramData.simulation,
                metadata: diagramData.metadata
              })
              
            } else {
              // Legacy format - load basic data only
              set({
                nodes: diagramData.nodes || [],
                edges: diagramData.edges || [],
                diagramName: diagramData.diagramName || 'Untitled',
                selectedNode: null,
                selectedEdge: null,
                isLoading: false,
                // Clear undo/redo stacks when loading new diagram
                undoStack: [],
                redoStack: []
              })
              
              console.log('Loaded legacy diagram:', {
                name: diagramData.diagramName,
                version: diagramData.version || '1.0',
                nodes: diagramData.nodes?.length || 0,
                edges: diagramData.edges?.length || 0
              })
            }
            
            // Update graph analysis asynchronously to avoid blocking UI
            setTimeout(() => {
              get().updateGraphAnalysis()
            }, 0)
            
          } catch (error) {
            console.error('Error loading diagram:', error)
            alert('Error loading diagram file. Please check if the file is a valid CLD Studio diagram.')
            set({ isLoading: false })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  },
  
  exportMatrix: () => {
    const { nodes, edges } = get()
    const nodeIds = nodes.map(node => node.id)
    const matrix = nodeIds.map(sourceId => 
      nodeIds.map(targetId => {
        const edge = edges.find(e => e.source === sourceId && e.target === targetId)
        if (!edge) return 0
        return edge.data.polarity === 'positive' ? 1 : -1
      })
    )
    
    // Create CSV file for download
    const csvContent = [
      ['', ...nodeIds],
      ...matrix.map((row, i) => [nodeIds[i], ...row])
    ].map(row => row.join(',')).join('\n')
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cld-matrix-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  },

  exportAsPNG: async () => {
    const { diagramName } = get()
    try {
      // Import html2canvas dynamically to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      
      // Wait a bit for the component to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the ReactFlow container - try multiple selectors
      console.log('Starting element search for export...')
      
      // First, let's see what's available in the DOM
      console.log('All divs with class containing "react":', document.querySelectorAll('div[class*="react"]'))
      console.log('All divs with class containing "flow":', document.querySelectorAll('div[class*="flow"]'))
      console.log('All divs with class containing "cld":', document.querySelectorAll('div[class*="cld"]'))
      
      // Try to find the main canvas area first
      let reactFlowElement = document.querySelector('.canvas-area')
      console.log('Trying .canvas-area first:', reactFlowElement)
      
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.cld-diagram-container')
        console.log('Trying .cld-diagram-container:', reactFlowElement)
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow')
        console.log('Trying .react-flow:', reactFlowElement)
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('[data-testid="rf__wrapper"]')
        console.log('Trying [data-testid="rf__wrapper"]:', reactFlowElement)
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow__viewport')
        console.log('Trying .react-flow__viewport:', reactFlowElement)
      }
      if (!reactFlowElement) {
        // Try to find any div containing ReactFlow content
        reactFlowElement = document.querySelector('.react-flow__renderer')
        console.log('Trying .react-flow__renderer:', reactFlowElement)
      }
      if (!reactFlowElement) {
        // Try to find ReactFlow by looking for elements with ReactFlow-specific content
        const allDivs = document.querySelectorAll('div')
        for (let div of allDivs) {
          if (div.innerHTML.includes('react-flow') || 
              div.innerHTML.includes('rf__') ||
              div.querySelector('.react-flow') ||
              div.querySelector('[data-testid*="rf"]')) {
            console.log('Found potential ReactFlow container:', div)
            reactFlowElement = div
            break
          }
        }
      }
      
      if (!reactFlowElement) {
        console.log('Available elements with react-flow in class:', document.querySelectorAll('[class*="react-flow"]'))
        console.log('All divs in document:', document.querySelectorAll('div'))
        
        // As a last resort, try to export the entire viewport
        console.log('Trying to export entire viewport as fallback...')
        reactFlowElement = document.body
      }

      // Capture the diagram as canvas
      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
        link.download = `${safeName}.png`
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (error) {
      console.error('Error exporting as PNG:', error)
      alert('Failed to export as PNG. Please try again.')
    }
  },

  exportAsSVG: () => {
    const { diagramName } = get()
    try {
      // Get the ReactFlow container - try multiple selectors
      let reactFlowElement = document.querySelector('.canvas-area')
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.cld-diagram-container')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('[data-testid="rf__wrapper"]')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow__viewport')
      }
      if (!reactFlowElement) {
        // Try to find any div containing ReactFlow content
        reactFlowElement = document.querySelector('.react-flow__renderer')
      }
      if (!reactFlowElement) {
        // As a last resort, try to export the entire viewport
        reactFlowElement = document.body
      }

      // Create SVG from the ReactFlow element
      const svgData = new XMLSerializer().serializeToString(reactFlowElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
      link.download = `${safeName}.svg`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting as SVG:', error)
      alert('Failed to export as SVG. Please try again.')
    }
  },

  // Debug function to help troubleshoot export issues
  debugExportElements: () => {
    console.log('=== Export Debug Information ===')
    console.log('Canvas area:', document.querySelector('.canvas-area'))
    console.log('CLD diagram container:', document.querySelector('.cld-diagram-container'))
    console.log('ReactFlow:', document.querySelector('.react-flow'))
    console.log('ReactFlow wrapper:', document.querySelector('[data-testid="rf__wrapper"]'))
    console.log('ReactFlow viewport:', document.querySelector('.react-flow__viewport'))
    console.log('ReactFlow renderer:', document.querySelector('.react-flow__renderer'))
    console.log('All divs with react in class:', document.querySelectorAll('div[class*="react"]'))
    console.log('All divs with flow in class:', document.querySelectorAll('div[class*="flow"]'))
    console.log('All divs with cld in class:', document.querySelectorAll('div[class*="cld"]'))
    console.log('================================')
  },

  exportAsPDF: async () => {
    const { diagramName } = get()
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      
      // Wait a bit for the component to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the ReactFlow container - try multiple selectors
      let reactFlowElement = document.querySelector('.canvas-area')
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.cld-diagram-container')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('[data-testid="rf__wrapper"]')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow__viewport')
      }
      if (!reactFlowElement) {
        // Try to find any div containing ReactFlow content
        reactFlowElement = document.querySelector('.react-flow__renderer')
      }
      if (!reactFlowElement) {
        // As a last resort, try to export the entire viewport
        reactFlowElement = document.body
      }

      // Import html2canvas for capturing the diagram
      const html2canvas = (await import('html2canvas')).default
      
      // Capture the diagram as canvas
      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
      })

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png')
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const imgWidth = 297 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      
      // Download PDF
      const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
      pdf.save(`${safeName}.pdf`)
    } catch (error) {
      console.error('Error exporting as PDF:', error)
      alert('Failed to export as PDF. Please try again.')
    }
  },
  
  // Export detailed diagram data for analysis
  exportDetailedData: () => {
    const { 
      nodes, 
      edges, 
      diagramName, 
      mode, 
      currentProblem, 
      viewTransform, 
      globalStyles, 
      adjacencyMatrix, 
      allLoops,
      simulationState,
      showGrid,
      config,
      problemStatement
    } = get()
    
    // Create comprehensive analysis data
    const analysisData = {
      // Basic info
      diagramName,
      timestamp: new Date().toISOString(),
      version: '2.0',
      createdWith: 'CLD Studio',
      
      // Problem context
      problemStatement: {
        mode,
        currentProblem: currentProblem ? {
          id: currentProblem.id,
          title: currentProblem.title,
          description: currentProblem.description
        } : null,
        description: mode === 'sandbox' ? problemStatement || 'Free-form causal loop diagram' : currentProblem?.description || '',
        customStatement: problemStatement || ''
      },
      
      // Complete node analysis
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label || 'New Node',
          type: node.data.type || 'variable',
          color: node.data.color || '#000000',
          description: node.data.description || '',
          value: node.data.value || 0
        },
        // Analysis data
        inDegree: edges.filter(e => e.target === node.id).length,
        outDegree: edges.filter(e => e.source === node.id).length,
        totalDegree: edges.filter(e => e.source === node.id || e.target === node.id).length
      })),
      
      // Complete edge analysis
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        data: {
          polarity: edge.data.polarity || 'positive',
          color: edge.data.color || '#6b7280',
          width: edge.data.width || 1.5,
          transparency: edge.data.transparency || 1.0,
          radius: edge.data.radius || 30,
          description: edge.data.description || ''
        },
        style: edge.style,
        markerEnd: edge.markerEnd
      })),
      
      // Graph analysis
      graphAnalysis: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        density: nodes.length > 1 ? edges.length / (nodes.length * (nodes.length - 1)) : 0,
        averageDegree: nodes.length > 0 ? (2 * edges.length) / nodes.length : 0,
        nodeTypes: {
          variable: nodes.filter(n => n.data.type === 'variable').length,
          constant: nodes.filter(n => n.data.type === 'constant').length,
          parameter: nodes.filter(n => n.data.type === 'parameter').length
        },
        edgePolarities: {
          positive: edges.filter(e => e.data.polarity === 'positive').length,
          negative: edges.filter(e => e.data.polarity === 'negative').length
        },
        // Node degree distribution
        degreeDistribution: {
          isolated: nodes.filter(n => edges.filter(e => e.source === n.id || e.target === n.id).length === 0).length,
          leaf: nodes.filter(n => edges.filter(e => e.source === n.id || e.target === n.id).length === 1).length,
          hub: nodes.filter(n => edges.filter(e => e.source === n.id || e.target === n.id).length > 3).length
        }
      },
      
      // Loop analysis
      loopAnalysis: {
        totalLoops: allLoops.length,
        reinforcingLoops: allLoops.filter(l => l.type === 'Reinforcing').length,
        balancingLoops: allLoops.filter(l => l.type === 'Balancing').length,
        loopLengths: allLoops.map(l => l.nodes.length),
        averageLoopLength: allLoops.length > 0 ? allLoops.reduce((sum, l) => sum + l.nodes.length, 0) / allLoops.length : 0,
        loops: allLoops.map(loop => ({
          nodes: loop.nodes,
          edges: loop.edges,
          type: loop.type,
          description: loop.description || '',
          length: loop.nodes.length
        }))
      },
      
      // Adjacency matrix
      adjacencyMatrix,
      
      // View and styling
      viewTransform,
      showGrid,
      globalStyles,
      
      // Simulation data (if available)
      simulation: simulationState.isInitialized ? {
        isRunning: simulationState.isRunning,
        isPaused: simulationState.isPaused,
        isInitialized: simulationState.isInitialized,
        currentStep: simulationState.currentStep,
        maxSteps: simulationState.maxSteps,
        stepDelay: simulationState.stepDelay,
        stateVector: simulationState.stateVector,
        accumulatedValues: simulationState.accumulatedValues,
        history: simulationState.history,
        valueHistory: simulationState.valueHistory,
        perturbedNode: simulationState.perturbedNode,
        perturbationValue: simulationState.perturbationValue
      } : null,
      
      // Configuration
      config: {
        constraints: config.constraints,
        colors: config.colors,
        performance: config.performance,
        ui: config.ui,
        file: config.file
      }
    }
    
    // Create JSON file for download
    const dataStr = JSON.stringify(analysisData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
    link.download = `${safeName}-analysis.json`
    link.click()
    URL.revokeObjectURL(url)
  },
  
  // Mode operations
  setMode: (mode) => {
    set({ mode })
  },
  
  // Assessment mode operations
  loadProblem: (problem) => {
    set({ 
      currentProblem: problem,
      nodes: problem.nodes || [],
      edges: problem.edges || [],
      diagramName: problem.name || 'Assessment Problem',
      mode: 'assessment'
    })
    
    // Update graph analysis asynchronously to avoid blocking UI
    setTimeout(() => {
      get().updateGraphAnalysis()
    }, 0)
  },
  
  submitAssessment: () => {
    // TODO: Implement assessment scoring logic
  },
  

  

  
  setNodeFont: (font) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, nodeFont: font }
    }))
  },
  
  setNodeFontSize: (size) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, nodeFontSize: parseInt(size) }
    }))
  },
  
  setArrowColor: (color) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, arrowColor: color }
    }))
  },
  
  setArrowWidth: (width) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, arrowWidth: parseFloat(width) }
    }))
  },
  
  setArrowTransparency: (transparency) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, arrowTransparency: parseFloat(transparency) }
    }))
  },
  
  setArrowHeadSize: (size) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, arrowHeadSize: parseFloat(size) }
    }))
  },
  
  // Reset all global styles to defaults
  resetGlobalStyles: () => {
    set((state) => ({
      globalStyles: {
        ...state.globalStyles,
        arrowWidth: 1.5,
        arrowTransparency: 1.0,
        arrowHeadSize: 2.0
      }
    }))
  },
  
  // Node color operations for selected nodes
  updateSelectedNodeColor: (color) => {
    const { selectedNode } = get()
    if (selectedNode) {
      get().updateNode(selectedNode, { color })
    }
  },
  
  updateAllNodeColors: (color) => {
    set((state) => ({
      nodes: state.nodes.map(node => ({
        ...node,
        data: { ...node.data, color }
      }))
    }))
  },
  
  // Arrow color operations for selected edges
  updateSelectedEdgeColor: (color) => {
    const { selectedEdge } = get()
    if (selectedEdge) {
      get().updateEdge(selectedEdge, { color })
    }
  },
  
  updateAllEdgeColors: (color) => {
    set((state) => ({
      edges: state.edges.map(edge => ({
        ...edge,
        data: { ...edge.data, color }
      }))
    }))
  },

  // Selected color operations (like PowerPoint)
  setSelectedNodeColor: (color) => {
    set({ selectedNodeColor: color })
  },

  setSelectedArrowColor: (color) => {
    set({ selectedArrowColor: color })
  },

  // Generate adjacency matrix from current graph
  generateAdjacencyMatrix: () => {
    const { nodes, edges } = get()
    const nodeIds = nodes.map(node => node.id).sort((a, b) => a - b)
    const nodeIdToIndex = new Map(nodeIds.map((id, index) => [id, index]))
    
    const matrix = nodeIds.map(() => nodeIds.map(() => 0))
    
    edges.forEach(edge => {
      const sourceIndex = nodeIdToIndex.get(edge.source)
      const targetIndex = nodeIdToIndex.get(edge.target)
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        // Store polarity: 1 for positive, -1 for negative
        matrix[sourceIndex][targetIndex] = edge.data?.polarity === 'negative' ? -1 : 1
      }
    })
    
    set({ adjacencyMatrix: matrix })
    return matrix
  },

  // Find all simple cycles in the directed graph using optimized algorithm
  findAllLoops: () => {
    const { nodes, edges, config } = get()
    if (nodes.length === 0 || edges.length === 0) {
      set({ allLoops: [] })
      return []
    }

    // Skip loop detection for very large diagrams to improve performance
    if (nodes.length > config.constraints.maxLoopsForAnalysis || edges.length > config.constraints.maxLoopsForAnalysis * 2) {
      console.warn('Skipping loop detection for large diagram to improve performance')
      set({ allLoops: [] })
      return []
    }

    // Johnson's algorithm for finding all simple cycles in a directed graph
    // Reference: https://en.wikipedia.org/wiki/Johnson%27s_algorithm
    function johnsonsSimpleCycles(nodes, edges) {
      // Build adjacency list
      const nodeIds = nodes.map(node => node.id).sort((a, b) => a - b)
      const graph = new Map()
      nodeIds.forEach(id => graph.set(id, []))
      edges.forEach(edge => {
        if (graph.has(edge.source)) {
          graph.get(edge.source).push({
            target: edge.target,
            polarity: edge.data?.polarity || 'positive',
            edgeId: edge.id
          })
        }
      })

      // Helper: canonicalize a cycle
      const getCanonicalCycle = (cycle, polarities, edgeIds) => {
        if (cycle.length === 0) return { nodes: cycle, polarities, edgeIds }
        const minIndex = cycle.indexOf(Math.min(...cycle))
        const rotatedNodes = [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)]
        const rotatedPolarities = [...polarities.slice(minIndex), ...polarities.slice(0, minIndex)]
        const rotatedEdgeIds = [...edgeIds.slice(minIndex), ...edgeIds.slice(0, minIndex)]
        const reverseRotatedNodes = [...rotatedNodes].reverse()
        const reverseRotatedPolarities = [...rotatedPolarities].reverse()
        const reverseRotatedEdgeIds = [...rotatedEdgeIds].reverse()
        const rotatedKey = rotatedNodes.join(',')
        const reverseKey = reverseRotatedNodes.join(',')
        if (rotatedKey <= reverseKey) {
          return { nodes: rotatedNodes, polarities: rotatedPolarities, edgeIds: rotatedEdgeIds }
        } else {
          return { nodes: reverseRotatedNodes, polarities: reverseRotatedPolarities, edgeIds: reverseRotatedEdgeIds }
        }
      }

      // Johnson's algorithm
      const blocked = new Set()
      const B = new Map()
      const stack = []
      const allCycles = []
      const uniqueCycles = []

      function unblock(u) {
        blocked.delete(u)
        if (B.has(u)) {
          for (const w of B.get(u)) {
            if (blocked.has(w)) {
              unblock(w)
            }
          }
          B.set(u, new Set())
        }
      }

      function circuit(v, s, subgraph) {
        let closed = false
        stack.push(v)
        blocked.add(v)
        for (const neighbor of subgraph.get(v) || []) {
          const w = neighbor.target
          if (w === s) {
            // Found a cycle
            const cycle = [...stack, s]
            const polarities = stack.map((node, idx) => {
              if (idx < stack.length - 1) {
                const edge = (subgraph.get(node) || []).find(e => e.target === stack[idx+1])
                return edge ? edge.polarity : 'positive'
              } else {
                const edge = (subgraph.get(node) || []).find(e => e.target === s)
                return edge ? edge.polarity : 'positive'
              }
            })
            const edgeIds = stack.map((node, idx) => {
              if (idx < stack.length - 1) {
                const edge = (subgraph.get(node) || []).find(e => e.target === stack[idx+1])
                return edge ? edge.edgeId : null
              } else {
                const edge = (subgraph.get(node) || []).find(e => e.target === s)
                return edge ? edge.edgeId : null
              }
            })
            allCycles.push({ nodes: cycle, polarities, edgeIds })
            closed = true
          } else if (!blocked.has(w)) {
            if (circuit(w, s, subgraph)) {
              closed = true
            }
          }
        }
        if (closed) {
          unblock(v)
        } else {
          for (const neighbor of subgraph.get(v) || []) {
            const w = neighbor.target
            if (!B.has(w)) B.set(w, new Set())
            B.get(w).add(v)
          }
        }
        stack.pop()
        return closed
      }

      // Main Johnson's loop
      let sIndex = 0
      while (sIndex < nodeIds.length) {
        const s = nodeIds[sIndex]
        // Build subgraph induced by nodes >= s
        const subgraphNodes = nodeIds.slice(sIndex)
        const subgraph = new Map()
        subgraphNodes.forEach(id => subgraph.set(id, []))
        for (const id of subgraphNodes) {
          for (const neighbor of graph.get(id) || []) {
            if (subgraph.has(neighbor.target)) {
              subgraph.get(id).push(neighbor)
            }
          }
        }
        blocked.clear()
        B.clear()
        circuit(s, s, subgraph)
        sIndex++
      }

      // Remove duplicates using canonicalization
      for (const cycle of allCycles) {
        // Only consider cycles of length >= 2 (no self-loops)
        if (cycle.nodes.length >= 3) {
          // Create canonical form of the cycle (excluding the duplicate last node)
          const cycleNodes = cycle.nodes.slice(0, -1) // Remove duplicate last node
          const canonical = getCanonicalCycle(cycleNodes, cycle.polarities, cycle.edgeIds)
          const isDuplicate = uniqueCycles.some(loop =>
            loop.nodes.length === canonical.nodes.length &&
            loop.nodes.every((n, i) => n === canonical.nodes[i]) &&
            loop.polarities.every((p, i) => p === canonical.polarities[i])
          )
          if (!isDuplicate) {
            const negativeCount = canonical.polarities.filter(p => p === 'negative').length
            const loopType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'
            uniqueCycles.push({
              nodes: canonical.nodes,
              polarities: canonical.polarities,
              edgeIds: canonical.edgeIds,
              type: loopType,
              length: canonical.nodes.length
            })
          }
        }
      }
      return uniqueCycles
    }

    // Use Johnson's algorithm for loop detection
    const allLoops = johnsonsSimpleCycles(nodes, edges)
    set({ allLoops })
    return allLoops
  },

  // Update both adjacency matrix and loops when graph changes
  updateGraphAnalysis: () => {
    const { nodes, edges, config } = get()
    // Only update if we have nodes and edges
    if (nodes.length > 0 && edges.length > 0) {
      if (config.performance.enableAdjacencyMatrix) {
        get().generateAdjacencyMatrix()
      }
      if (config.performance.enableLoopDetection) {
        get().findAllLoops()
      }
    } else {
      // Clear analysis if no graph
      set({ adjacencyMatrix: [], allLoops: [] })
    }
  },

  // Diagram name operations
  setDiagramName: (name) => {
    set({ diagramName: name })
    // Update browser title
    const title = name && name.trim() !== '' ? `${name} - CLD Studio` : 'CLD Studio'
    document.title = title
  },

  // Config management operations
  updateConfig: (updates) => {
    set((state) => {
      const newConfig = { ...state.config, ...updates }
      saveConfig(newConfig)
      return { config: newConfig }
    })
  },

  updateGlobalStyles: (updates) => {
    set((state) => {
      const newGlobalStyles = { ...state.globalStyles, ...updates }
      const newConfig = { ...state.config, globalStyles: newGlobalStyles }
      saveConfig(newConfig)
      return { 
        globalStyles: newGlobalStyles,
        config: newConfig
      }
    })
  },

  resetConfig: () => {
    const defaultConfig = loadConfig()
    set({ config: defaultConfig, globalStyles: defaultConfig.globalStyles })
    saveConfig(defaultConfig)
  },

  // Simulation operations
  toggleSimulationMode: () => {
    const { addEvent } = get()
    const currentMode = get().simulationMode
    
    set((state) => ({ 
      simulationMode: !state.simulationMode,
      simulationState: {
        ...state.simulationState,
        isRunning: false,
        isPaused: false,
        isInitialized: false,
        currentStep: 0,
        stateVector: [],
        history: [],
        perturbedNode: null,
        perturbationValue: 0
      }
    }))
    
    addEvent(`Simulation mode ${!currentMode ? 'activated' : 'deactivated'}`)
  },
  
  initializeSimulation: (perturbedNodeId, perturbationValue) => {
    const { nodes } = get()
    
    if (nodes.length === 0) {
      console.warn('No nodes available for simulation')
      return false
    }
    
    // Find the node index
    const nodeIndex = nodes.findIndex(node => node.id === perturbedNodeId)
    if (nodeIndex === -1) {
      console.warn(`Node ${perturbedNodeId} not found`)
      return false
    }
    
    // Calculate clamped value
    const clampedValue = Math.max(-100, Math.min(100, perturbationValue))
    
    // Initialize with zero increments
    const stateVector = new Array(nodes.length).fill(0)
    stateVector[nodeIndex] = clampedValue
    
    // Initialize accumulated values with 1000 as default start value for all nodes
    const accumulatedValues = new Array(nodes.length).fill(1000)
    // Add the perturbation to the perturbed node
    accumulatedValues[nodeIndex] = 1000 + clampedValue
    
    console.log('Initializing simulation with increments:', {
      perturbedNodeId,
      perturbationValue,
      nodeIndex,
      clampedValue,
      stateVector,
      accumulatedValues,
      nodesCount: nodes.length
    })
    
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        stateVector, // This represents increments/changes
        accumulatedValues, // This represents actual node values
        history: [stateVector],
        valueHistory: [accumulatedValues],
        perturbedNode: perturbedNodeId,
        perturbationValue,
        currentStep: 0,
        isRunning: false,
        isPaused: false, // Ensure paused state is reset on initialization
        isInitialized: true
      }
    }))
    
    return true
  },
  
  runSimulation: () => {
    const { simulationState, nodes, edges } = get()
    if (simulationState.isRunning) return
    
    // Check if simulation is properly initialized
    if (!simulationState.isInitialized) {
      console.warn('Cannot run simulation: not initialized')
      return
    }
    
    // If simulation is completed, reset it to step 0 to allow re-running
    if (simulationState.currentStep >= simulationState.maxSteps) {
      console.log('Simulation completed, resetting to allow re-run')
      set((state) => ({
        simulationState: {
          ...state.simulationState,
          currentStep: 0,
          stateVector: state.simulationState.history[0] || [],
          accumulatedValues: state.simulationState.valueHistory[0] || [],
          history: [state.simulationState.history[0] || []],
          valueHistory: [state.simulationState.valueHistory[0] || []],
          isPaused: false // Reset paused state when re-running
        }
      }))
    }
    
    console.log('Starting simulation with:', {
      nodes: nodes.length,
      edges: edges.length,
      initialState: simulationState.stateVector
    })
    
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        isRunning: true,
        isPaused: false
      }
    }))
    
    const runStep = () => {
      const currentState = get().simulationState
      // Don't proceed if simulation is paused or completed
      if (!currentState.isRunning || currentState.isPaused || currentState.currentStep >= currentState.maxSteps) {
        set((state) => ({
          simulationState: {
            ...state.simulationState,
            isRunning: false,
            // Preserve paused state when simulation completes
            isPaused: currentState.isPaused
          }
        }))
        return
      }
      
      // Calculate next increment vector
      const nextStateVector = get().calculateNextState(currentState.stateVector)
      
      // Calculate new accumulated values by adding the increments
      const newAccumulatedValues = currentState.accumulatedValues.map((value, index) => 
        value + nextStateVector[index]
      )
      
      set((state) => ({
        simulationState: {
          ...state.simulationState,
          currentStep: currentState.currentStep + 1,
          stateVector: nextStateVector,
          accumulatedValues: newAccumulatedValues,
          history: [...currentState.history, nextStateVector],
          valueHistory: [...currentState.valueHistory, newAccumulatedValues]
        }
      }))
      
      // Schedule next step
      setTimeout(runStep, currentState.stepDelay)
    }
    
    runStep()
  },
  
  pauseSimulation: () => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        isRunning: false,
        isPaused: true
      }
    }))
  },
  
  stepSimulation: () => {
    const { simulationState } = get()
    
    // Check if simulation is properly initialized
    if (!simulationState.isInitialized) {
      console.warn('Cannot step simulation: not initialized')
      return
    }
    
    // Check if simulation is already completed
    if (simulationState.currentStep >= simulationState.maxSteps) {
      console.warn('Simulation already completed')
      return
    }
    
    // Only step if we have a valid state vector
    if (simulationState.stateVector.length === 0) {
      return
    }
    
    // Calculate next increment vector
    const nextStateVector = get().calculateNextState(simulationState.stateVector)
    
    // Calculate new accumulated values by adding the increments
    const newAccumulatedValues = simulationState.accumulatedValues.map((value, index) => 
      value + nextStateVector[index]
    )
    
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        currentStep: simulationState.currentStep + 1,
        stateVector: nextStateVector,
        accumulatedValues: newAccumulatedValues,
        history: [...simulationState.history, nextStateVector],
        valueHistory: [...simulationState.valueHistory, newAccumulatedValues]
      }
    }))
  },

  stepBackSimulation: () => {
    const { simulationState } = get()
    
    // Check if simulation is properly initialized
    if (!simulationState.isInitialized) {
      console.warn('Cannot step back simulation: not initialized')
      return
    }
    
    // Only step back if we have history and not at the beginning
    if (simulationState.history.length <= 1 || simulationState.currentStep <= 0) {
      return
    }
    
    // Get the previous state from history
    const previousStateVector = simulationState.history[simulationState.history.length - 2]
    const previousAccumulatedValues = simulationState.valueHistory[simulationState.valueHistory.length - 2]
    
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        currentStep: simulationState.currentStep - 1,
        stateVector: previousStateVector,
        accumulatedValues: previousAccumulatedValues,
        history: simulationState.history.slice(0, -1),
        valueHistory: simulationState.valueHistory.slice(0, -1)
      }
    }))
  },
  
  resetSimulation: () => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        isRunning: false,
        isPaused: false,
        isInitialized: false,
        currentStep: 0,
        stateVector: [],
        accumulatedValues: [],
        history: [],
        valueHistory: [],
        perturbedNode: null,
        perturbationValue: 0
      }
    }))
  },
  
  calculateNextState: (currentStateVector) => {
    const { nodes, edges } = get()
    
    if (nodes.length === 0 || currentStateVector.length === 0) {
      console.warn('No nodes or state vector available for calculation')
      return currentStateVector
    }
    
    if (currentStateVector.length !== nodes.length) {
      console.warn('State vector length does not match nodes length')
      return currentStateVector
    }
    
    // Create node ID to index mapping
    const nodeIdToIndex = {}
    nodes.forEach((node, index) => {
      nodeIdToIndex[node.id] = index
    })
    
    // Create adjacency matrix A
    const adjacencyMatrix = []
    for (let i = 0; i < nodes.length; i++) {
      adjacencyMatrix[i] = new Array(nodes.length).fill(0)
    }
    
    // Fill adjacency matrix based on edges
    edges.forEach(edge => {
      const sourceIndex = nodeIdToIndex[edge.source]
      const targetIndex = nodeIdToIndex[edge.target]
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        const polarity = edge.data?.polarity === 'negative' ? -1 : 1
        adjacencyMatrix[sourceIndex][targetIndex] = polarity
      }
    })
    
    // Calculate next increments: S(t+1) = A^T * S(t)
    // Where S(t) represents the increments/changes, not absolute values
    const nextState = new Array(nodes.length).fill(0)
    
    for (let i = 0; i < nodes.length; i++) {
      let sum = 0
      for (let j = 0; j < nodes.length; j++) {
        // A^T[i][j] = A[j][i] - transpose the matrix
        sum += adjacencyMatrix[j][i] * currentStateVector[j]
      }
      
      // Next increment is based on current increments: S(t+1) = A^T * S(t)
      nextState[i] = sum
    }
    
    return nextState
  },
  
  updateSimulationSettings: (settings) => {
    set((state) => ({
      simulationState: {
        ...state.simulationState,
        ...settings
      }
    }))
  },
  
  // Helper function to check if simulation is completed
  isSimulationCompleted: () => {
    const { simulationState } = get()
    return simulationState.currentStep >= simulationState.maxSteps
  },
  
  // Undo/Redo functions
  createStateSnapshot: () => {
    const { nodes, edges, viewTransform, diagramName, mode, currentProblem, problemStatement } = get()
    return {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      viewTransform: { ...viewTransform },
      diagramName,
      mode,
      currentProblem: currentProblem ? { ...currentProblem } : null,
      problemStatement,
      timestamp: Date.now()
    }
  },
  
  recordStateChange: () => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      console.log('Skipping state recording - undo/redo action in progress')
      return
    }
    
    const snapshot = createStateSnapshot()
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
    
    console.log(`State recorded. Undo stack: ${undoStack.length + 1}, Redo stack: 0`)
  },
  
  undo: () => {
    const { undoStack, redoStack, isUndoRedoAction, createStateSnapshot, nodes } = get()
    
    console.log(`Undo called. Stack sizes - Undo: ${undoStack.length}, Redo: ${redoStack.length}, isUndoRedoAction: ${isUndoRedoAction}`)
    console.log(`Current nodes before undo: ${nodes.length}`, nodes.map(n => n.id))
    
    if (undoStack.length === 0) {
      console.log('Nothing to undo')
      return false
    }
    
    // Prevent recursive undo calls
    if (isUndoRedoAction) {
      console.log('Undo/redo action already in progress, skipping')
      return false
    }
    
    // Create snapshot of current state for redo
    const currentSnapshot = createStateSnapshot()
    
    // Get the last state from undo stack
    const previousState = undoStack[undoStack.length - 1]
    
    console.log(`Restoring state from ${new Date(previousState.timestamp).toLocaleTimeString()}`)
    console.log(`Previous state nodes: ${previousState.nodes.length}`, previousState.nodes.map(n => n.id))
    
    // Set flag to prevent recording this action
    set({ isUndoRedoAction: true })
    
    // Restore the previous state (excluding selection states)
    set({
      nodes: previousState.nodes,
      edges: previousState.edges,
      viewTransform: previousState.viewTransform,
      diagramName: previousState.diagramName,
      mode: previousState.mode,
      currentProblem: previousState.currentProblem,
      problemStatement: previousState.problemStatement,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot],
      isUndoRedoAction: false // Reset flag immediately after state restoration
    })
    
    // Update graph analysis immediately after state restoration
    get().updateGraphAnalysis()
    
    // Verify the state was restored correctly
    setTimeout(() => {
      const currentState = get()
      console.log(`State after restoration - Nodes: ${currentState.nodes.length}`, currentState.nodes.map(n => n.id))
    }, 0)
    
    console.log(`Undo completed. New stack sizes - Undo: ${undoStack.length - 1}, Redo: ${redoStack.length + 1}`)
    return true
  },
  
  redo: () => {
    const { undoStack, redoStack, isUndoRedoAction, createStateSnapshot } = get()
    
    console.log(`Redo called. Stack sizes - Undo: ${undoStack.length}, Redo: ${redoStack.length}, isUndoRedoAction: ${isUndoRedoAction}`)
    
    if (redoStack.length === 0) {
      console.log('Nothing to redo')
      return false
    }
    
    // Prevent recursive redo calls
    if (isUndoRedoAction) {
      console.log('Undo/redo action already in progress, skipping')
      return false
    }
    
    // Create snapshot of current state for undo
    const currentSnapshot = createStateSnapshot()
    
    // Get the last state from redo stack
    const nextState = redoStack[redoStack.length - 1]
    
    console.log(`Restoring state from ${new Date(nextState.timestamp).toLocaleTimeString()}`)
    
    // Set flag to prevent recording this action
    set({ isUndoRedoAction: true })
    
    // Restore the next state (excluding selection states)
    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      viewTransform: nextState.viewTransform,
      diagramName: nextState.diagramName,
      mode: nextState.mode,
      currentProblem: nextState.currentProblem,
      problemStatement: nextState.problemStatement,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: redoStack.slice(0, -1),
      isUndoRedoAction: false // Reset flag immediately after state restoration
    })
    
    // Update graph analysis
    setTimeout(() => {
      get().updateGraphAnalysis()
    }, 0)
    
    console.log(`Redo completed. New stack sizes - Undo: ${undoStack.length + 1}, Redo: ${redoStack.length - 1}`)
    return true
  },
  
  clearUndoRedoStacks: () => {
    console.log('Clearing undo/redo stacks')
    set({ undoStack: [], redoStack: [], isUndoRedoAction: false })
  },
  
  // Force reset undo/redo state (for debugging)
  resetUndoRedoState: () => {
    console.log('Force resetting undo/redo state')
    set({ 
      undoStack: [], 
      redoStack: [], 
      isUndoRedoAction: false 
    })
  },
  
  // Debug function to check undo/redo state
  debugUndoRedoState: () => {
    const { undoStack, redoStack, isUndoRedoAction } = get()
    console.log('=== UNDO/REDO DEBUG STATE ===')
    console.log(`Undo stack size: ${undoStack.length}`)
    console.log(`Redo stack size: ${redoStack.length}`)
    console.log(`isUndoRedoAction flag: ${isUndoRedoAction}`)
    console.log('Undo stack timestamps:', undoStack.map(s => new Date(s.timestamp).toLocaleTimeString()))
    console.log('Redo stack timestamps:', redoStack.map(s => new Date(s.timestamp).toLocaleTimeString()))
    console.log('=== END DEBUG STATE ===')
  },
  
  // Special function for drag operations - only records start and end positions
  recordDragStart: (nodeId, startPosition) => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    console.log(`Drag start recorded for node ${nodeId} at position`, startPosition)
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      console.log('Skipping drag start recording - undo/redo action in progress')
      return
    }
    
    const snapshot = createStateSnapshot()
    // Store the drag start position in the snapshot
    snapshot.dragStart = { nodeId, position: startPosition }
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
    
    console.log(`Drag start state recorded. Undo stack: ${undoStack.length + 1}`)
  },
  
  recordDragEnd: (nodeId, endPosition) => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    console.log(`Drag end recorded for node ${nodeId} at position`, endPosition)
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      console.log('Skipping drag end recording - undo/redo action in progress')
      return
    }
    
    const snapshot = createStateSnapshot()
    // Store the drag end position in the snapshot
    snapshot.dragEnd = { nodeId, position: endPosition }
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
    
    console.log(`Drag end state recorded. Undo stack: ${undoStack.length + 1}`)
  },
  
  // Test function for debugging propagation
  testPropagation: () => {
    const { nodes, edges } = get()
    console.log('=== PROPAGATION TEST ===')
    console.log('Nodes:', nodes.map(n => ({ id: n.id, label: n.data.label })))
    console.log('Edges:', edges.map(e => ({ 
      source: e.source, 
      target: e.target, 
      polarity: e.data.polarity 
    })))
    
    // Test with a simple increment vector
    const testIncrements = new Array(nodes.length).fill(0)
    if (nodes.length > 0) {
      testIncrements[0] = 5 // Initial increment for first node
    }
    
    console.log('Initial increments:', testIncrements)
    
    // Track accumulated values
    let accumulatedValues = [...testIncrements]
    let currentIncrements = [...testIncrements]
    
    // Run multiple steps to show increment-based propagation
    for (let step = 1; step <= 5; step++) {
      currentIncrements = get().calculateNextState(currentIncrements)
      accumulatedValues = accumulatedValues.map((val, i) => val + currentIncrements[i])
      console.log(`Step ${step} increments:`, currentIncrements)
      console.log(`Step ${step} accumulated:`, accumulatedValues)
    }
    
    console.log('=== END TEST ===')
  },

  // Examples functions
  loadExamplesList: async () => {
    const { addEvent } = get();
    set({ isLoadingExamples: true, examplesError: null });
    
    try {
      addEvent('Loading examples...', 'info');
      const examples = await examplesService.getAllExamples();
      set({ examples, isLoadingExamples: false });
      addEvent(`Loaded ${examples.length} examples`, 'success');
    } catch (error) {
      set({ examplesError: error.message, isLoadingExamples: false });
      addEvent('Failed to load examples: ' + error.message, 'error');
    }
  },

  loadExamplesByCategory: async (category) => {
    const { addEvent } = get();
    set({ isLoadingExamples: true, examplesError: null });
    
    try {
      addEvent(`Loading ${category} examples...`, 'info');
      const examples = await examplesService.getExamplesByCategory(category);
      set({ examples, isLoadingExamples: false });
      addEvent(`Loaded ${examples.length} ${category} examples`, 'success');
    } catch (error) {
      set({ examplesError: error.message, isLoadingExamples: false });
      addEvent('Failed to load examples: ' + error.message, 'error');
    }
  },

  searchExamples: async (searchTerm) => {
    const { addEvent } = get();
    set({ isLoadingExamples: true, examplesError: null });
    
    try {
      addEvent(`Searching for "${searchTerm}"...`, 'info');
      const examples = await examplesService.searchExamples(searchTerm);
      set({ examples, isLoadingExamples: false });
      addEvent(`Found ${examples.length} examples for "${searchTerm}"`, 'success');
    } catch (error) {
      set({ examplesError: error.message, isLoadingExamples: false });
      addEvent('Failed to search examples: ' + error.message, 'error');
    }
  },

  loadExample: async (example) => {
    const { addEvent, clearDiagram } = get();
    
    try {
      addEvent(`Loading example: ${example.name}...`, 'info');
      
      // Clear current diagram first
      clearDiagram();
      
      // Load the example file from S3
      const diagramData = await examplesService.loadExampleFile(example);
      
      // Increment download count
      await examplesService.incrementDownloadCount(example.id);
      
      // Load the diagram data (using your existing load logic)
      set({
        nodes: diagramData.nodes || [],
        edges: diagramData.edges || [],
        diagramName: diagramData.diagramName || example.name,
        mode: diagramData.problemStatement?.mode || 'sandbox',
        currentProblem: diagramData.problemStatement?.currentProblem || null,
        problemStatement: diagramData.problemStatement?.customStatement || '',
        viewTransform: diagramData.viewTransform || { x: 0, y: 0, scale: 1 },
        showGrid: diagramData.showGrid !== undefined ? diagramData.showGrid : false,
        globalStyles: diagramData.globalStyles ? 
          { ...get().globalStyles, ...diagramData.globalStyles } : 
          get().globalStyles,
        adjacencyMatrix: diagramData.analysis?.adjacencyMatrix || [],
        allLoops: diagramData.analysis?.allLoops || [],
        simulationState: diagramData.simulation ? {
          ...get().simulationState,
          ...diagramData.simulation,
          isInitialized: diagramData.simulation.isInitialized || false
        } : get().simulationState,
        selectedNode: null,
        selectedEdge: null,
        highlightedLoop: null,
        undoStack: [],
        redoStack: []
      });
      
      addEvent(`Example loaded: ${example.name}`, 'success');
    } catch (error) {
      addEvent('Failed to load example: ' + error.message, 'error');
      throw error;
    }
  },

  // New function to list all files in S3 with organized structure
  listS3Files: async (category = 'all') => {
    const { addEvent } = get();
    
    try {
      addEvent(`Listing S3 files from ${category}...`, 'info');
      
      // Get the list of files from S3
      const { list } = await import('aws-amplify/storage');
      
      console.log('=== S3 Debugging ===');
      console.log(`Listing from category: ${category}`);
      
      let result;
      try {
        if (category === 'all') {
          // List all files
          result = await list();
        } else {
          // List files from specific category
          result = await list({
            path: `${category}/`
          });
        }
        
        console.log('Result:', result);
        console.log('Items:', result.items?.map(item => item.key) || []);
      } catch (error) {
        console.log('Listing error:', error);
        throw error;
      }
      
      // Get all files
      const allFiles = result?.items || [];
      console.log('All files found:', allFiles.map(item => item.key));
      
      // Filter files that are .cld files
      const cldFiles = allFiles
        .filter(file => file && file.key && file.key.endsWith('.cld'))
        .map(file => file.key);
      
      console.log('CLD files found:', cldFiles);
      
      if (cldFiles.length === 0) {
        addEvent(`No .cld files found in ${category}. You can upload sample files to get started.`, 'info');
      } else {
        addEvent(`Found ${cldFiles.length} .cld files in ${category}`, 'success');
      }
      
      return cldFiles;
    } catch (error) {
      console.error('S3 listing error:', error);
      
      // Check if it's a configuration error
      if (error.message.includes('NoBucket') || error.message.includes('Missing bucket')) {
        addEvent('S3 not properly configured. Please check Amplify configuration.', 'error');
      } else {
        addEvent('Failed to list S3 files: ' + error.message, 'error');
      }
      
      throw error;
    }
  },

  // Function to list files from specific categories
  listS3FilesByCategory: async (category) => {
    const { addEvent } = get();
    
    try {
      addEvent(`Listing files from ${category}...`, 'info');
      
      const { list } = await import('aws-amplify/storage');
      
      console.log(`=== Listing ${category} files ===`);
      
      const result = await list({
        path: `${category}/`
      });
      
      console.log(`${category} result:`, result);
      
      const files = result?.items || [];
      const cldFiles = files
        .filter(file => file && file.key && file.key.endsWith('.cld'))
        .map(file => file.key);
      
      console.log(`${category} CLD files:`, cldFiles);
      
      if (cldFiles.length === 0) {
        addEvent(`No .cld files found in ${category}`, 'info');
      } else {
        addEvent(`Found ${cldFiles.length} .cld files in ${category}`, 'success');
      }
      
      return cldFiles;
    } catch (error) {
      console.error(`Error listing ${category} files:`, error);
      addEvent(`Failed to list ${category} files: ${error.message}`, 'error');
      throw error;
    }
  },

  // Function to get available categories
  getS3Categories: async () => {
    const { addEvent } = get();
    
    try {
      addEvent('Getting S3 categories...', 'info');
      
      const { list } = await import('aws-amplify/storage');
      
      console.log('=== Getting S3 Categories ===');
      
      const result = await list();
      const items = result?.items || [];
      
      // Extract unique prefixes (folders)
      const prefixes = new Set();
      items.forEach(item => {
        if (item.key && item.key.includes('/')) {
          const prefix = item.key.split('/')[0];
          if (prefix) {
            prefixes.add(prefix);
          }
        }
      });
      
      const categories = Array.from(prefixes);
      console.log('Available categories:', categories);
      
      addEvent(`Found ${categories.length} categories: ${categories.join(', ')}`, 'success');
      
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      addEvent('Failed to get categories: ' + error.message, 'error');
      throw error;
    }
  },

  // Function to check S3 configuration
  checkS3Configuration: async () => {
    const { addEvent } = get();
    
    try {
      addEvent('Checking S3 configuration...', 'info');
      
      // Try to get the Amplify configuration
      const { Amplify } = await import('aws-amplify');
      const config = Amplify.getConfig();
      
      console.log('=== S3 Configuration Check ===');
      console.log('Amplify config:', config);
      console.log('Storage config:', config.Storage);
      
      if (!config.Storage) {
        addEvent('No storage configuration found in Amplify config', 'error');
        return false;
      }
      
      if (!config.Storage.AWSS3 || !config.Storage.AWSS3.bucket) {
        addEvent('No bucket name found in storage configuration', 'error');
        return false;
      }
      
      addEvent(`S3 bucket configured: ${config.Storage.AWSS3.bucket}`, 'success');
      return true;
    } catch (error) {
      console.error('S3 configuration check error:', error);
      addEvent('Failed to check S3 configuration: ' + error.message, 'error');
      return false;
    }
  },

  // Test function to debug S3 listing
  testS3Listing: async () => {
    const { addEvent } = get();
    
    try {
      addEvent('Testing S3 listing...', 'info');
      
      // Try different approaches to list files
      const { list } = await import('aws-amplify/storage');
      
      // Method 1: List from root
      console.log('Method 1: Listing from root...');
      const result1 = await list({
        options: {
          accessLevel: 'guest'
        }
      });
      console.log('Root result:', result1);
      
      // Method 2: List from public folder
      console.log('Method 2: Listing from public folder...');
      const result2 = await list({
        path: 'public/',
        options: {
          accessLevel: 'guest'
        }
      });
      console.log('Public folder result:', result2);
      
      // Method 3: List with no path
      console.log('Method 3: Listing with no path...');
      const result3 = await list({
        options: {
          accessLevel: 'guest'
        }
      });
      console.log('No path result:', result3);
      
      addEvent('S3 listing test completed - check console', 'success');
      return { result1, result2, result3 };
    } catch (error) {
      addEvent('S3 listing test failed: ' + error.message, 'error');
      throw error;
    }
  },

  // Quick test function to try loading known files
  testKnownFiles: async () => {
    const { addEvent } = get();
    
    try {
      addEvent('Testing known files...', 'info');
      
      const knownFiles = [
        'public/eg1.cld',
        'public/eg2.cld',
        'eg1.cld',
        'eg2.cld'
      ];
      
      const { getUrl } = await import('aws-amplify/storage');
      
      for (const fileName of knownFiles) {
        try {
          console.log(`Testing file: ${fileName}`);
          const fileUrl = await getUrl({
            key: fileName,
            options: {
              accessLevel: 'guest'
            }
          });
          
          const response = await fetch(fileUrl.url);
          console.log(`${fileName}: ${response.ok ? '✅ ACCESSIBLE' : '❌ NOT FOUND'} (${response.status})`);
          
          if (response.ok) {
            addEvent(`Found accessible file: ${fileName}`, 'success');
          }
        } catch (error) {
          console.log(`${fileName}: ❌ ERROR - ${error.message}`);
        }
      }
      
      addEvent('Known files test completed - check console', 'success');
    } catch (error) {
      addEvent('Known files test failed: ' + error.message, 'error');
      throw error;
    }
  },

  // New function to load file directly from S3
  loadFileFromS3: async (fileName) => {
    const { addEvent, clearDiagram } = get();
    
    try {
      addEvent(`Loading file from S3: ${fileName}...`, 'info');
      
      // Clear current diagram first
      clearDiagram();
      
      // Get the file URL from S3
      const { getUrl } = await import('aws-amplify/storage');
      const fileUrl = await getUrl({
        key: fileName
      });
      
      // Fetch the file content
      const response = await fetch(fileUrl.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const fileContent = await response.text();
      const diagramData = JSON.parse(fileContent);
      
      // Load the diagram data
      set({
        nodes: diagramData.nodes || [],
        edges: diagramData.edges || [],
        diagramName: diagramData.diagramName || fileName.replace('.cld', ''),
        mode: diagramData.problemStatement?.mode || 'sandbox',
        currentProblem: diagramData.problemStatement?.currentProblem || null,
        problemStatement: diagramData.problemStatement?.customStatement || '',
        viewTransform: diagramData.viewTransform || { x: 0, y: 0, scale: 1 },
        showGrid: diagramData.showGrid !== undefined ? diagramData.showGrid : false,
        globalStyles: diagramData.globalStyles ? 
          { ...get().globalStyles, ...diagramData.globalStyles } : 
          get().globalStyles,
        adjacencyMatrix: diagramData.analysis?.adjacencyMatrix || [],
        allLoops: diagramData.analysis?.allLoops || [],
        simulationState: diagramData.simulation ? {
          ...get().simulationState,
          ...diagramData.simulation,
          isInitialized: diagramData.simulation.isInitialized || false
        } : get().simulationState,
        selectedNode: null,
        selectedEdge: null,
        highlightedLoop: null,
        undoStack: [],
        redoStack: []
      });
      
      addEvent(`File loaded from S3: ${fileName}`, 'success');
    } catch (error) {
      addEvent('Failed to load file from S3: ' + error.message, 'error');
      throw error;
    }
  },

  // Create sample data for testing
  createSampleData: async () => {
    const { addEvent } = get();
    
    try {
      addEvent('Creating sample data...', 'info');
      const success = await createSampleData();
      
      if (success) {
        addEvent('Sample data created successfully!', 'success');
        // Reload examples list
        get().loadExamplesList();
      } else {
        addEvent('Failed to create sample data', 'error');
      }
    } catch (error) {
      addEvent('Error creating sample data: ' + error.message, 'error');
    }
  },

  // Upload sample CLD files directly to S3 with organized structure
  uploadSampleFiles: async (category = 'examples') => {
    const { addEvent } = get();
    
    try {
      addEvent(`Uploading sample CLD files to S3/${category}...`, 'info');
      
      const { uploadData } = await import('aws-amplify/storage');
      
      // Sample CLD file content organized by category
      const sampleFiles = {
        'examples': {
          'basic-population.cld': {
            nodes: [
              { id: '1', label: 'Population', x: 100, y: 100, color: '#000000' },
              { id: '2', label: 'Birth Rate', x: 300, y: 100, color: '#000000' },
              { id: '3', label: 'Death Rate', x: 300, y: 200, color: '#000000' }
            ],
            edges: [
              { id: '1', source: '1', target: '2', polarity: 'positive' },
              { id: '2', source: '2', target: '1', polarity: 'positive' }
            ],
            diagramName: 'Basic Population System',
            mode: 'sandbox',
            viewTransform: { x: 0, y: 0, scale: 1 },
            showGrid: false
          },
          'business-growth.cld': {
            nodes: [
              { id: '1', label: 'Sales', x: 100, y: 100, color: '#000000' },
              { id: '2', label: 'Marketing', x: 300, y: 100, color: '#000000' },
              { id: '3', label: 'Revenue', x: 200, y: 200, color: '#000000' }
            ],
            edges: [
              { id: '1', source: '1', target: '2', polarity: 'positive' },
              { id: '2', source: '2', target: '3', polarity: 'positive' }
            ],
            diagramName: 'Business Growth System',
            mode: 'sandbox',
            viewTransform: { x: 0, y: 0, scale: 1 },
            showGrid: false
          }
        },
        'assignments': {
          'assignment-1.cld': {
            nodes: [
              { id: '1', label: 'Student Performance', x: 100, y: 100, color: '#000000' },
              { id: '2', label: 'Study Time', x: 300, y: 100, color: '#000000' },
              { id: '3', label: 'Understanding', x: 200, y: 200, color: '#000000' }
            ],
            edges: [
              { id: '1', source: '2', target: '3', polarity: 'positive' },
              { id: '2', source: '3', target: '1', polarity: 'positive' }
            ],
            diagramName: 'Student Learning System',
            mode: 'sandbox',
            viewTransform: { x: 0, y: 0, scale: 1 },
            showGrid: false
          }
        },
        'exam': {
          'exam-question-1.cld': {
            nodes: [
              { id: '1', label: 'Company Growth', x: 100, y: 100, color: '#000000' },
              { id: '2', label: 'Market Share', x: 300, y: 100, color: '#000000' },
              { id: '3', label: 'Competition', x: 200, y: 200, color: '#000000' }
            ],
            edges: [
              { id: '1', source: '1', target: '2', polarity: 'positive' },
              { id: '2', source: '2', target: '3', polarity: 'negative' }
            ],
            diagramName: 'Market Competition System',
            mode: 'sandbox',
            viewTransform: { x: 0, y: 0, scale: 1 },
            showGrid: false
          }
        }
      };
      
      // Get files for the specified category
      const filesToUpload = sampleFiles[category] || sampleFiles['examples'];
      
      for (const [fileName, fileContent] of Object.entries(filesToUpload)) {
        try {
          console.log(`Uploading ${category}/${fileName} to S3...`);
          
          const result = await uploadData({
            key: `${category}/${fileName}`,
            data: JSON.stringify(fileContent, null, 2)
          }).result;
          
          console.log(`Successfully uploaded ${category}/${fileName}`);
          addEvent(`Uploaded ${category}/${fileName} to S3`, 'success');
        } catch (error) {
          console.error(`Error uploading ${category}/${fileName}:`, error);
          addEvent(`Failed to upload ${category}/${fileName}: ${error.message}`, 'error');
        }
      }
      
      addEvent(`Sample file upload completed for ${category}`, 'success');
      
      // Refresh the file list
      setTimeout(() => {
        get().listS3Files(category);
      }, 1000);
      
    } catch (error) {
      addEvent('Error uploading sample files: ' + error.message, 'error');
      throw error;
    }
  },

  // Save current diagram to S3
  saveDiagramToS3: async (fileName, category = 'examples') => {
    const { addEvent, nodes, edges, diagramName, mode, currentProblem, viewTransform, globalStyles, adjacencyMatrix, allLoops, simulationState, showGrid, config, problemStatement } = get();
    
    try {
      addEvent(`Saving diagram to S3/${category}/${fileName}...`, 'info');
      
      // Ensure filename has .cld extension
      const finalFileName = fileName.endsWith('.cld') ? fileName : `${fileName}.cld`;
      
      // Enhanced diagram data with comprehensive metadata
      const diagramData = {
        // Basic diagram info
        diagramName: diagramName || fileName.replace('.cld', ''),
        timestamp: new Date().toISOString(),
        version: '2.0',
        createdWith: 'CLD Studio',
        
        // Problem statement and context
        problemStatement: {
          mode,
          currentProblem: currentProblem ? {
            id: currentProblem.id,
            title: currentProblem.title,
            description: currentProblem.description
          } : null,
          description: mode === 'sandbox' ? problemStatement || 'Free-form causal loop diagram' : currentProblem?.description || '',
          customStatement: problemStatement || ''
        },
        
        // Complete node information
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            label: node.data.label || 'New Node',
            type: node.data.type || 'variable',
            color: node.data.color || '#000000',
            description: node.data.description || '',
            value: node.data.value || 0,
            ...node.data
          }
        })),
        
        // Complete edge information
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          data: {
            polarity: edge.data.polarity || 'positive',
            color: edge.data.color || '#000000',
            description: edge.data.description || '',
            ...edge.data
          }
        })),
        
        // View and display settings
        viewTransform,
        showGrid,
        globalStyles,
        
        // Analysis data
        analysis: {
          adjacencyMatrix,
          allLoops
        },
        
        // Simulation state
        simulation: simulationState,
        
        // Configuration
        config
      };
      
      // Upload to S3
      const { uploadData } = await import('aws-amplify/storage');
      
      const result = await uploadData({
        key: `${category}/${finalFileName}`,
        data: JSON.stringify(diagramData, null, 2)
      }).result;
      
      addEvent(`Diagram saved to S3: ${category}/${finalFileName}`, 'success');
      
      // Update diagram name if it was changed
      if (diagramName !== fileName.replace('.cld', '')) {
        get().setDiagramName(fileName.replace('.cld', ''));
      }
      
      return result;
    } catch (error) {
      console.error('Error saving diagram to S3:', error);
      addEvent('Failed to save diagram to S3: ' + error.message, 'error');
      throw error;
    }
  }
}))

export { useCLDStore }

// Initialize the store with the initial state recorded
const initializeStore = () => {
  const { createStateSnapshot } = useCLDStore.getState()
  const initialSnapshot = createStateSnapshot()
  
  useCLDStore.setState({
    undoStack: [initialSnapshot]
  })
  
  console.log('Initial state recorded in undo stack')
}

// Initialize when the store is first created
initializeStore()

// Make store available globally for debugging
if (typeof window !== 'undefined') {
  window.__CLD_STORE__ = useCLDStore
} 
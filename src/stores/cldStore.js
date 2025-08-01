import { create } from 'zustand'
import { loadConfig, saveConfig } from '../config/appConfig'

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
  editingNodeId: null, // ID of the node currently being edited
  
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
  
  // Arrow drawing mode state
  arrowDrawingMode: false,
  
  // Events log for status bar
  eventsLog: [],
  
  // Problem statement for sandbox mode
  problemStatement: '',
  
  // Global dropdown state management - ensures only one dropdown is open at a time
  activeDropdown: null, // 'designSettings' | 'nodeColor' | 'arrowColor' | 'export' | 'open' | 'simSettings' | null
  
  // Modal state management
  showStateVectorModal: false,
  showPlotsModal: false,
  
  // Selected colors state (like PowerPoint)
  selectedNodeColor: loadConfig().colors.defaultSelected.nodeColor,
  selectedArrowColor: loadConfig().colors.defaultSelected.arrowColor,
  
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
  
  // Arrow drawing mode operations
  toggleArrowDrawingMode: () => {
    const { simulationMode } = get()
    
    // Prevent enabling arrow drawing mode when simulation mode is active
    if (simulationMode) {
      console.warn('Cannot enable arrow drawing mode while simulation mode is active')
      return
    }
    
    set((state) => ({ arrowDrawingMode: !state.arrowDrawingMode }))
  },
  
  // Grid operations
  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }))
  },
  
  // Global dropdown management operations
  setActiveDropdown: (dropdownType) => {
    set({ activeDropdown: dropdownType })
  },
  
  closeAllDropdowns: () => {
    set({ activeDropdown: null })
  },
  
  // Modal state management
  setShowStateVectorModal: (show) => {
    set({ showStateVectorModal: show })
  },
  
  setShowPlotsModal: (show) => {
    set({ showPlotsModal: show })
  },
  
  // Node editing operations
  setEditingNode: (nodeId) => {
    set({ editingNodeId: nodeId })
  },
  
  clearEditingNode: () => {
    set({ editingNodeId: null })
  },
  
  // Node operations
  addNode: (position, label = 'New Node') => {
    const { nodes, config, updateGraphAnalysis, simulationState, simulationMode, arrowDrawingMode, editingNodeId, addEvent, recordStateChange } = get()
    
    // Disable node addition during simulation mode or arrow drawing mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot add nodes while simulation mode is enabled')
      return false
    }
    
    // Disable node addition during arrow drawing mode
    if (arrowDrawingMode) {
      console.warn('Cannot add nodes while arrow drawing mode is enabled')
      return false
    }
    
    // Disable node addition when a node is being edited
    if (editingNodeId !== null) {
      console.warn('Cannot add nodes while a node is being edited')
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
      recordStateChange()
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
      recordStateChange()
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
    const { selectedNodes, nodes, updateGraphAnalysis, addEvent, recordStateChange } = get()
    
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
    const currentDiagramName = get().diagramName
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
      diagramName: currentDiagramName, // Preserve the current diagram name
      problemStatement: '',
      undoStack: [],
      redoStack: []
    })
  },

  loadDiagramData: (diagramData) => {
    // Set loading state
    set({ isLoading: true })
    
    console.log('loadDiagramData called with:', diagramData);
    console.log('Input nodes count:', diagramData.nodes?.length);
    console.log('Input edges count:', diagramData.edges?.length);
    
    try {
      // Handle both new enhanced format (v2.0) and legacy format (v1.0)
      const isEnhancedFormat = diagramData.version === '2.0' || diagramData.problemStatement
      
      // Transform nodes to match expected structure
      const transformNodes = (nodes) => {
        return nodes.map((node, index) => {
          // If node already has data property, use it as is
          if (node.data) {
            return node
          }
          // Otherwise, wrap node properties in data object
          const { id, position, ...nodeData } = node
          const newId = typeof id === 'string' ? index + 1 : id
          
          // Log ID conversion for debugging
          if (typeof id === 'string') {
            console.log(`Converting node ID: "${id}" → ${newId}`)
          }
          
          return {
            id: newId, // Convert string IDs to integers
            position,
            data: nodeData
          }
        })
      }
      
      // Transform edges to match expected structure
      const transformEdges = (edges) => {
        return edges.map((edge, index) => {
          // If edge already has data property, use it as is
          if (edge.data) {
            return edge
          }
          // Otherwise, wrap edge properties in data object
          const { id, source, target, ...edgeData } = edge
          
          // Convert string IDs to integers by finding the corresponding node indices
          const nodes = diagramData.nodes || []
          const sourceNodeIndex = nodes.findIndex(n => n.id === source)
          const targetNodeIndex = nodes.findIndex(n => n.id === target)
          
          const newId = typeof id === 'string' ? index + 1 : id
          const newSource = sourceNodeIndex !== -1 ? sourceNodeIndex + 1 : source
          const newTarget = targetNodeIndex !== -1 ? targetNodeIndex + 1 : target
          
          // Log ID conversion for debugging
          if (typeof id === 'string' || typeof source === 'string' || typeof target === 'string') {
            console.log(`Converting edge ID: "${id}" → ${newId}, source: "${source}" → ${newSource}, target: "${target}" → ${newTarget}`)
          }
          
          return {
            id: newId, // Convert string IDs to integers
            source: newSource,
            target: newTarget,
            data: edgeData
          }
        })
      }
      
      if (isEnhancedFormat) {
        // Enhanced format - load all available data
        set({
          // Basic diagram data
          nodes: transformNodes(diagramData.nodes || []),
          edges: transformEdges(diagramData.edges || []),
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
        
      } else {
        // Legacy format - load basic data only
        set({
          nodes: transformNodes(diagramData.nodes || []),
          edges: transformEdges(diagramData.edges || []),
          diagramName: diagramData.diagramName || 'Untitled',
          selectedNode: null,
          selectedEdge: null,
          isLoading: false,
          // Clear undo/redo stacks when loading new diagram
          undoStack: [],
          redoStack: []
        })
      }
      
      // Update graph analysis asynchronously to avoid blocking UI
      setTimeout(() => {
        get().updateGraphAnalysis()
      }, 0)
      
    } catch (error) {
      console.error('Error loading diagram data:', error)
      set({ isLoading: false })
      throw error
    }
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
            
            // Transform nodes to match expected structure
            const transformNodes = (nodes) => {
              return nodes.map((node, index) => {
                // If node already has data property, use it as is
                if (node.data) {
                  return node
                }
                // Otherwise, wrap node properties in data object
                const { id, position, ...nodeData } = node
                const newId = typeof id === 'string' ? index + 1 : id
                
                // Log ID conversion for debugging
                if (typeof id === 'string') {
                  console.log(`Converting node ID: "${id}" → ${newId}`)
                }
                
                return {
                  id: newId, // Convert string IDs to integers
                  position,
                  data: nodeData
                }
              })
            }
            
            // Transform edges to match expected structure
            const transformEdges = (edges) => {
              return edges.map((edge, index) => {
                // If edge already has data property, use it as is
                if (edge.data) {
                  return edge
                }
                // Otherwise, wrap edge properties in data object
                const { id, source, target, ...edgeData } = edge
                
                // Convert string IDs to integers by finding the corresponding node indices
                const nodes = diagramData.nodes || []
                const sourceNodeIndex = nodes.findIndex(n => n.id === source)
                const targetNodeIndex = nodes.findIndex(n => n.id === target)
                
                const newId = typeof id === 'string' ? index + 1 : id
                const newSource = sourceNodeIndex !== -1 ? sourceNodeIndex + 1 : source
                const newTarget = targetNodeIndex !== -1 ? targetNodeIndex + 1 : target
                
                // Log ID conversion for debugging
                if (typeof id === 'string' || typeof source === 'string' || typeof target === 'string') {
                  console.log(`Converting edge ID: "${id}" → ${newId}, source: "${source}" → ${newSource}, target: "${target}" → ${newTarget}`)
                }
                
                return {
                  id: newId, // Convert string IDs to integers
                  source: newSource,
                  target: newTarget,
                  data: edgeData
                }
              })
            }
            
            if (isEnhancedFormat) {
              // Enhanced format - load all available data
              set({
                // Basic diagram data
                nodes: transformNodes(diagramData.nodes || []),
                edges: transformEdges(diagramData.edges || []),
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
              
            } else {
              // Legacy format - load basic data only
              set({
                nodes: transformNodes(diagramData.nodes || []),
                edges: transformEdges(diagramData.edges || []),
                diagramName: diagramData.diagramName || 'Untitled',
                selectedNode: null,
                selectedEdge: null,
                isLoading: false,
                // Clear undo/redo stacks when loading new diagram
                undoStack: [],
                redoStack: []
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
        // Try to find ReactFlow by looking for elements with ReactFlow-specific content
        const allDivs = document.querySelectorAll('div')
        for (let div of allDivs) {
          if (div.innerHTML.includes('react-flow') || 
              div.innerHTML.includes('rf__') ||
              div.querySelector('.react-flow') ||
              div.querySelector('[data-testid*="rf"]')) {
            reactFlowElement = div
            break
          }
        }
      }
      
      if (!reactFlowElement) {
        // As a last resort, try to export the entire viewport
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
    // Debug function removed for cleaner code
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
      // Disable arrow drawing mode when simulation mode is enabled
      arrowDrawingMode: !state.simulationMode ? false : state.arrowDrawingMode,
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
    const nodeIndex = nodes.findIndex(node => node.id == perturbedNodeId) // Use loose equality to handle string/number conversion
    
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
    const { simulationState } = get()
    if (simulationState.isRunning) return
    
    // Check if simulation is properly initialized
    if (!simulationState.isInitialized) {
      console.warn('Cannot run simulation: not initialized')
      return
    }
    
    // If simulation is completed, reset it to step 0 to allow re-running
    if (simulationState.currentStep >= simulationState.maxSteps) {
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
    const { isUndoRedoAction, undoStack: _undoStack, redoStack: _redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      return
    }
    
    const snapshot = createStateSnapshot()
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
  },
  
  undo: () => {
    const { undoStack, redoStack, isUndoRedoAction, createStateSnapshot } = get()
    
    if (undoStack.length === 0) {
      return false
    }
    
    // Prevent recursive undo calls
    if (isUndoRedoAction) {
      return false
    }
    
    // Create snapshot of current state for redo
    const currentSnapshot = createStateSnapshot()
    
    // Get the last state from undo stack
    const previousState = undoStack[undoStack.length - 1]
    
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
    
    return true
  },
  
  redo: () => {
    const { undoStack, redoStack, isUndoRedoAction, createStateSnapshot } = get()
    
    if (redoStack.length === 0) {
      return false
    }
    
    // Prevent recursive redo calls
    if (isUndoRedoAction) {
      return false
    }
    
    // Create snapshot of current state for undo
    const currentSnapshot = createStateSnapshot()
    
    // Get the last state from redo stack
    const nextState = redoStack[redoStack.length - 1]
    
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
    
    return true
  },
  
  clearUndoRedoStacks: () => {
    set({ undoStack: [], redoStack: [], isUndoRedoAction: false })
  },
  
  // Force reset undo/redo state (for debugging)
  resetUndoRedoState: () => {
    set({ 
      undoStack: [], 
      redoStack: [], 
      isUndoRedoAction: false 
    })
  },
  
  // Debug function to check undo/redo state
  debugUndoRedoState: () => {
    // Debug function removed for cleaner code
  },
  
  // Special function for drag operations - only records start and end positions
  recordDragStart: (nodeId, startPosition) => {
    const { isUndoRedoAction, undoStack: _undoStack, redoStack: _redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      return
    }
    
    const snapshot = createStateSnapshot()
    // Store the drag start position in the snapshot
    snapshot.dragStart = { nodeId, position: startPosition }
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
  },
  
  recordDragEnd: (nodeId, endPosition) => {
    const { isUndoRedoAction, undoStack: _undoStack, redoStack: _redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      return
    }
    
    const snapshot = createStateSnapshot()
    // Store the drag end position in the snapshot
    snapshot.dragEnd = { nodeId, position: endPosition }
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
  },
  
  // Test function for debugging propagation
  testPropagation: () => {
    // Test function removed for cleaner code
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
}

// Initialize when the store is first created
initializeStore()

// Make store available globally for debugging
if (typeof window !== 'undefined') {
  window.__CLD_STORE__ = useCLDStore
} 
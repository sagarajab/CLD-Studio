import { create } from 'zustand'
import { createNode, createEdge, NODE_TYPES, EDGE_POLARITIES } from './types'

const useGraphStore = create((set, get) => ({
  // Graph state
  nodes: [],
  edges: [],
  
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
    
    const newNode = createNode(nodes.length + 1, position, label, NODE_TYPES.VARIABLE)
    
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
  addEdge: (source, target, polarity = EDGE_POLARITIES.POSITIVE) => {
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
    
    const newEdge = createEdge(nextId, source, target, polarity)
    
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

  // Helper function to check if connection exists
  connectionExists: (sourceId, targetId) => {
    const { edges } = get()
    return edges.some(edge => edge.source === sourceId && edge.target === targetId)
  }
}))

export { useGraphStore } 
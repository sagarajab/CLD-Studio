import { create } from 'zustand'
import { loadConfig } from '../config/appConfig'

const useUIStore = create((set, get) => ({
  // UI state
  selectedNode: null,
  selectedEdge: null,
  selectedNodes: [], // Multiselect: array of selected node IDs
  selectedEdges: [], // Multiselect: array of selected edge IDs
  
  // Hovering state
  hoveredNode: null,
  hoveredEdge: null,
  
  // Loop highlighting
  highlightedLoop: null,
  loopViewMode: false,
  
  // View transform state
  viewTransform: { x: 0, y: 0, scale: 1 },
  
  // Mode states
  panningMode: false,
  arrowDrawingMode: false,
  
  // Modal states
  showStateVectorModal: false,
  showPlotsModal: false,
  
  // Node editing state
  editingNodeId: null,
  
  // Global dropdown state management
  activeDropdown: null, // 'designSettings' | 'nodeColor' | 'arrowColor' | 'export' | 'open' | 'simSettings' | null
  
  // Grid visibility state
  showGrid: loadConfig().ui.showGrid, // Load from config
  
  // Loading state
  isLoading: false,
  
  // Selection operations
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
  
  // Hovering operations
  setHoveredNode: (nodeId) => {
    set({ hoveredNode: nodeId })
  },

  clearHoveredNode: () => {
    set({ hoveredNode: null })
  },

  setHoveredEdge: (edgeId) => {
    set({ hoveredEdge: edgeId })
  },

  clearHoveredEdge: () => {
    set({ hoveredEdge: null })
  },
  
  // Loop highlighting operations
  setHighlightedLoop: (loopIndex) => {
    set({ highlightedLoop: loopIndex })
  },
  
  clearHighlightedLoop: () => {
    set({ highlightedLoop: null })
  },

  // Loop view mode operations
  enterLoopViewMode: () => {
    set({ loopViewMode: true })
  },

  exitLoopViewMode: () => {
    set({ loopViewMode: false, highlightedLoop: null })
  },
  
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
  
  // Mode operations
  togglePanningMode: () => {
    set((state) => ({ panningMode: !state.panningMode }))
  },
  
  toggleArrowDrawingMode: () => {
    set((state) => ({ arrowDrawingMode: !state.arrowDrawingMode }))
  },
  
  // Grid operations
  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }))
  },
  
  setShowGrid: (show) => {
    set({ showGrid: show })
  },
  
  // Modal operations
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
  
  // Global dropdown management operations
  setActiveDropdown: (dropdownType) => {
    set({ activeDropdown: dropdownType })
  },
  
  closeAllDropdowns: () => {
    set({ activeDropdown: null })
  },
  
  // Loading state operations
  setLoading: (loading) => {
    set({ isLoading: loading })
  },
  
  // Reset all UI state
  resetUIState: () => {
    set({
      selectedNode: null,
      selectedEdge: null,
      selectedNodes: [],
      selectedEdges: [],
      hoveredNode: null,
      hoveredEdge: null,
      highlightedLoop: null,
      loopViewMode: false,
      editingNodeId: null,
      activeDropdown: null,
      showStateVectorModal: false,
      showPlotsModal: false,
      isLoading: false
    })
  }
}))

export { useUIStore } 
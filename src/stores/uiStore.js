import { create } from 'zustand'
import { createViewTransform } from './types'

const useUIStore = create((set, get) => ({
  // View transform state
  viewTransform: createViewTransform(),
  panningMode: false,
  
  // Selection state
  selectedNode: null,
  selectedEdge: null,
  selectedNodes: [], // Multiselect: array of selected node IDs
  selectedEdges: [], // Multiselect: array of selected edge IDs
  
  // Hover state
  hoveredNode: null,
  hoveredEdge: null,
  
  // Loop highlighting state
  highlightedLoop: null,
  loopViewMode: false,
  
  // Loading state
  isLoading: false,
  
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
    set({ viewTransform: createViewTransform() })
  },
  
  // Panning mode operations
  togglePanningMode: () => {
    set((state) => ({ panningMode: !state.panningMode }))
  },
  
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

  // Hover operations
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
  
  // Loading state operations
  setLoading: (loading) => {
    set({ isLoading: loading })
  }
}))

export { useUIStore } 
import { create } from 'zustand'
import { nanoid } from 'nanoid'

const useCLDStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  mode: 'sandbox', // 'sandbox' or 'assessment'
  currentProblem: null,
  viewTransform: { x: 0, y: 0, scale: 1 }, // Zoom and pan state
  
  // Global styling settings
  globalStyles: {
    nodeFont: 'Arial',
    nodeFontSize: 12,
    arrowColor: '#6b7280', // Default gray for arrows
    arrowWidth: 2
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
  
  // Node operations
  addNode: (position, label = 'New Node') => {
    const newNode = {
      id: get().nodes.length + 1, // Using integer IDs as per user preference
      type: 'cldNode',
      position,
      data: { 
        label,
        type: 'variable', // 'variable', 'constant', 'parameter'
        color: '#000000' // Default black for individual node
      }
    }
    
    set((state) => ({
      nodes: [...state.nodes, newNode]
    }))
  },
  
  updateNode: (nodeId, updates) => {
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
  },
  
  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter(node => node.id !== nodeId),
      edges: state.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
    }))
  },
  
  // Edge operations
  addEdge: (source, target, polarity = 'positive') => {
    const newEdge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source,
      target,
      type: 'default',
      data: { 
        polarity, // 'positive' or 'negative'
        color: '#6b7280' // Default gray for individual edge
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
    
    console.log('🔗 Creating new edge in store:', newEdge)
    
    set((state) => {
      const newEdges = [...state.edges, newEdge]
      console.log('🔗 Updated edges in store:', newEdges)
      return { edges: newEdges }
    })
  },
  
  updateEdge: (edgeId, updates) => {
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
  },
  
  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter(edge => edge.id !== edgeId)
    }))
  },
  
  // Selection
  setSelectedNode: (nodeId) => {
    set({ selectedNode: nodeId })
  },
  
  setSelectedEdge: (edgeId) => {
    set({ selectedEdge: edgeId })
  },
  
  // Diagram operations
  clearDiagram: () => {
    set({ nodes: [], edges: [], selectedNode: null, selectedEdge: null })
  },
  
  saveDiagram: () => {
    const { nodes, edges } = get()
    const diagramData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    // Create JSON file for download
    const dataStr = JSON.stringify(diagramData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cld-diagram-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  },
  
  loadDiagram: () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const diagramData = JSON.parse(e.target.result)
            set({
              nodes: diagramData.nodes || [],
              edges: diagramData.edges || [],
              selectedNode: null,
              selectedEdge: null
            })
          } catch (error) {
            console.error('Error loading diagram:', error)
            alert('Error loading diagram file')
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
      mode: 'assessment'
    })
  },
  
  submitAssessment: () => {
    const { nodes, edges, currentProblem } = get()
    // TODO: Implement assessment scoring logic
    console.log('Submitting assessment:', { nodes, edges, problem: currentProblem })
  },
  
  // Global styling operations
  updateGlobalStyles: (updates) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, ...updates }
    }))
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
      globalStyles: { ...state.globalStyles, arrowWidth: parseInt(width) }
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
  }
}))

export { useCLDStore } 
import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { loadConfig, saveConfig } from '../config/appConfig'

const useCLDStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  highlightedLoop: null, // Currently highlighted loop
  loopViewMode: false, // Whether we're in loop view mode (dimming other elements)
  mode: 'sandbox', // 'sandbox' or 'assessment'
  currentProblem: null,
  viewTransform: { x: 0, y: 0, scale: 1 }, // Zoom and pan state
  diagramName: 'Untitled', // Add diagram name state
  isLoading: false, // Loading state for user feedback
  config: loadConfig(), // Load config from localStorage
  
  // Adjacency matrix and loop detection
  adjacencyMatrix: [], // Mathematical representation of the graph
  allLoops: [], // All detected loops in the graph
  
  // Global styling settings - now loaded from config
  globalStyles: loadConfig().globalStyles,
  
  // Grid visibility state
  showGrid: true, // Default to showing grid
  
  // Simulation state
  simulationMode: false,
  simulationState: {
    isRunning: false,
    isPaused: false,
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
  
  // Events log for status bar
  eventsLog: [],
  
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
  
  // Grid operations
  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }))
  },
  
  // Node operations
  addNode: (position, label = 'New Node') => {
    const { nodes, config, updateGraphAnalysis, simulationState, simulationMode, addEvent } = get()
    
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
    
    const newNode = {
      id: nodes.length + 1, // Using integer IDs as per user preference
      type: 'cldNode',
      position,
      data: { 
        label,
        type: 'variable', // 'variable', 'constant', 'parameter'
        color: config.colors.defaults.nodeColor // Default from config
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
    const { simulationState, simulationMode } = get()
    
    // Disable node updates during simulation mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot update nodes while simulation mode is enabled')
      return false
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
  },

  updateNodeDescription: (nodeId, description) => {
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
  },
  
  deleteNode: (nodeId) => {
    const { simulationState, simulationMode, addEvent } = get()
    
    // Disable node deletion during simulation mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot delete nodes while simulation mode is enabled')
      return false
    }
    
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
    const { edges, config, updateGraphAnalysis, simulationState, simulationMode, addEvent, nodes } = get()
    
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
        color: config.colors.defaults.arrowColor // Default from config
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
    const { simulationState, simulationMode } = get()
    
    // Disable edge updates during simulation mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot update edges while simulation mode is enabled')
      return false
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
  },

  updateEdgeDescription: (edgeId, description) => {
    const { simulationState } = get()
    
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
  },
  
  deleteEdge: (edgeId) => {
    const { simulationState, simulationMode, addEvent, nodes } = get()
    
    // Disable edge deletion during simulation mode
    if (simulationMode || simulationState.isRunning) {
      console.warn('Cannot delete edges while simulation mode is enabled')
      return false
    }
    
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
  
  // Loop highlighting
  setHighlightedLoop: (loopIndex) => {
    set({ highlightedLoop: loopIndex })
  },
  
  clearHighlightedLoop: () => {
    set({ highlightedLoop: null })
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
  
  // Diagram operations
  clearDiagram: () => {
    set({ 
      nodes: [], 
      edges: [], 
      selectedNode: null, 
      selectedEdge: null, 
      highlightedLoop: null,
      adjacencyMatrix: [],
      allLoops: [],
      diagramName: 'Untitled'
    })
  },
  
  saveDiagram: () => {
    const { nodes, edges, diagramName } = get()
    const diagramData = {
      nodes,
      edges,
      diagramName,
      timestamp: new Date().toISOString(),
      version: '1.0'
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
            set({
              nodes: diagramData.nodes || [],
              edges: diagramData.edges || [],
              diagramName: diagramData.diagramName || 'Untitled',
              selectedNode: null,
              selectedEdge: null,
              isLoading: false
            })
            
            // Update graph analysis asynchronously to avoid blocking UI
            setTimeout(() => {
              get().updateGraphAnalysis()
            }, 0)
          } catch (error) {
            console.error('Error loading diagram:', error)
            alert('Error loading diagram file')
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
    const { nodes, edges, currentProblem } = get()
    // TODO: Implement assessment scoring logic
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
      return
    }
    
    // Find the node index
    const nodeIndex = nodes.findIndex(node => node.id === perturbedNodeId)
    if (nodeIndex === -1) {
      console.warn(`Node ${perturbedNodeId} not found`)
      return
    }
    
    // Calculate clamped value
    const clampedValue = Math.max(-100, Math.min(100, perturbationValue))
    
    // Initialize with zero increments
    const stateVector = new Array(nodes.length).fill(0)
    stateVector[nodeIndex] = clampedValue
    
    // Initialize accumulated values with the initial perturbation
    const accumulatedValues = new Array(nodes.length).fill(0)
    accumulatedValues[nodeIndex] = clampedValue
    
    console.log('Initializing simulation with increments:', {
      perturbedNodeId,
      perturbationValue,
      nodeIndex,
      clampedValue,
      stateVector,
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
        isRunning: false
      }
    }))
  },
  
  runSimulation: () => {
    const { simulationState, nodes, edges } = get()
    if (simulationState.isRunning) return
    
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
      if (!currentState.isRunning || currentState.currentStep >= currentState.maxSteps) {
        set((state) => ({
          simulationState: {
            ...state.simulationState,
            isRunning: false
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
    const { simulationState, nodes, edges } = get()
    
    // Only step if we have a valid state vector
    if (simulationState.stateVector.length === 0 || simulationState.currentStep >= simulationState.maxSteps) {
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
    const { nodes, edges, simulationState } = get()
    
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
  }
}))

export { useCLDStore }

// Make store available globally for debugging
if (typeof window !== 'undefined') {
  window.__CLD_STORE__ = useCLDStore
} 
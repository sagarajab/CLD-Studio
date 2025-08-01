import { create } from 'zustand'
import { loadConfig } from '../config/appConfig'
import { generateUniqueNodeId, generateUniqueEdgeId } from '../utils/idGenerator'

const useGraphStore = create((set, get) => ({
  // Graph state
  nodes: [],
  edges: [],
  adjacencyMatrix: [],
  allLoops: [],
  config: loadConfig(), // Load config for constraints
  
  // Node operations
  addNode: (position, label = 'New Node', nodeColor = '#000000') => {
    const { nodes, config, updateGraphAnalysis } = get()
    
    // Check node limit constraint
    if (nodes.length >= config.constraints.maxNodes) {
      alert(`Cannot add more nodes. Maximum allowed: ${config.constraints.maxNodes}`)
      return false
    }
    
    const newNode = {
      id: generateUniqueNodeId(nodes), // Generate unique ID to avoid duplicates after deletions
      type: 'cldNode',
      position,
      data: { 
        label,
        type: 'variable', // 'variable', 'constant', 'parameter'
        color: nodeColor
      }
    }
    
    set((state) => ({
      nodes: [...state.nodes, newNode]
    }))
    
    updateGraphAnalysis()
    return true
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
    const nodeToDelete = get().nodes.find(node => node.id === nodeId)
    const nodeLabel = nodeToDelete?.data?.label || `Node ${nodeId}`
    
    set((state) => ({
      nodes: state.nodes.filter(node => node.id !== nodeId),
      edges: state.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
    }))
    get().updateGraphAnalysis()
    return nodeLabel
  },
  
  // Edge operations
  addEdge: (source, target, polarity = 'positive', edgeColor = '#6b7280') => {
    const { edges, config, updateGraphAnalysis, nodes } = get()
    
    // Check edge limit constraint
    if (edges.length >= config.constraints.maxEdges) {
      alert(`Cannot add more edges. Maximum allowed: ${config.constraints.maxEdges}`)
      return false
    }
    
    // Generate unique edge ID to avoid duplicates after deletions
    const nextId = generateUniqueEdgeId(edges)
    
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
        color: edgeColor
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
    return { success: true, sourceLabel, targetLabel }
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
    get().updateGraphAnalysis()
  },

  updateEdgeDescription: (edgeId, description) => {
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
    const { nodes } = get()
    const edgeToDelete = get().edges.find(edge => edge.id === edgeId)
    const sourceNode = nodes.find(n => n.id === edgeToDelete?.source)
    const targetNode = nodes.find(n => n.id === edgeToDelete?.target)
    const sourceLabel = sourceNode?.data?.label || `Node ${edgeToDelete?.source}`
    const targetLabel = targetNode?.data?.label || `Node ${edgeToDelete?.target}`
    
    set((state) => ({
      edges: state.edges.filter(edge => edge.id !== edgeId)
    }))
    get().updateGraphAnalysis()
    return { sourceLabel, targetLabel }
  },
  
  // Bulk operations
  updateNodesColor: (nodeIds, color) => {
    set((state) => ({
      nodes: state.nodes.map(node => 
        nodeIds.includes(node.id)
          ? { ...node, data: { ...node.data, color } }
          : node
      )
    }))
    get().updateGraphAnalysis()
  },

  updateEdgesColor: (edgeIds, color) => {
    set((state) => ({
      edges: state.edges.map(edge => 
        edgeIds.includes(edge.id)
          ? { ...edge, data: { ...edge.data, color } }
          : edge
      )
    }))
    get().updateGraphAnalysis()
  },

  deleteNodes: (nodeIds) => {
    const { nodes } = get()
    const nodeLabels = nodeIds.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId)
      return node?.data?.label || `Node ${nodeId}`
    })
    
    set((state) => ({
      nodes: state.nodes.filter(node => !nodeIds.includes(node.id)),
      edges: state.edges.filter(edge => 
        !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
      )
    }))
    
    get().updateGraphAnalysis()
    return nodeLabels
  },

  deleteEdges: (edgeIds) => {
    const { nodes } = get()
    const edgeLabels = edgeIds.map(edgeId => {
      const edge = get().edges.find(e => e.id === edgeId)
      const sourceNode = nodes.find(n => n.id === edge?.source)
      const targetNode = nodes.find(n => n.id === edge?.target)
      const sourceLabel = sourceNode?.data?.label || `Node ${edge?.source}`
      const targetLabel = targetNode?.data?.label || `Node ${edge?.target}`
      return `${sourceLabel} → ${targetLabel}`
    })
    
    set((state) => ({
      edges: state.edges.filter(edge => !edgeIds.includes(edge.id))
    }))
    
    get().updateGraphAnalysis()
    return edgeLabels
  },
  
  // Graph analysis
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

  // Graph data operations
  clearGraph: () => {
    set({ 
      nodes: [], 
      edges: [], 
      adjacencyMatrix: [],
      allLoops: []
    })
  },

  setGraphData: (nodes, edges) => {
    set({ nodes, edges })
    // Update graph analysis asynchronously to avoid blocking UI
    setTimeout(() => {
      get().updateGraphAnalysis()
    }, 0)
  },

  // Loop description updates
  updateLoopDescription: (loopIndex, description) => {
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
  }
}))

export { useGraphStore } 
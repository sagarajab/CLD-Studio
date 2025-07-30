import { create } from 'zustand'
import { LOOP_TYPES } from './types'

const useAnalysisStore = create((set, get) => ({
  // Analysis state
  adjacencyMatrix: [],
  allLoops: [],
  
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
            const loopType = negativeCount % 2 === 0 ? LOOP_TYPES.REINFORCING : LOOP_TYPES.BALANCING
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

  // Loop description operations
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

  // Export matrix functionality
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
  }
}))

export { useAnalysisStore } 
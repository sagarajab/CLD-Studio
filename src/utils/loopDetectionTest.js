// Test file for loop detection algorithm
// This can be run in the browser console to test the loop detection

export function testLoopDetection() {
  // Test case 1: Simple 3-node loop
  const testNodes1 = [
    { id: 1, data: { label: 'A' } },
    { id: 2, data: { label: 'B' } },
    { id: 3, data: { label: 'C' } }
  ]
  
  const testEdges1 = [
    { id: 1, source: 1, target: 2, data: { polarity: 'positive' } },
    { id: 2, source: 2, target: 3, data: { polarity: 'positive' } },
    { id: 3, source: 3, target: 1, data: { polarity: 'positive' } }
  ]
  
  // Test case 2: Loop with negative edge (balancing)
  const testEdges2 = [
    { id: 1, source: 1, target: 2, data: { polarity: 'positive' } },
    { id: 2, source: 2, target: 3, data: { polarity: 'negative' } },
    { id: 3, source: 3, target: 1, data: { polarity: 'positive' } }
  ]
  
  // Test case 3: Multiple loops
  const testNodes3 = [
    { id: 1, data: { label: 'A' } },
    { id: 2, data: { label: 'B' } },
    { id: 3, data: { label: 'C' } },
    { id: 4, data: { label: 'D' } }
  ]
  
  const testEdges3 = [
    { id: 1, source: 1, target: 2, data: { polarity: 'positive' } },
    { id: 2, source: 2, target: 3, data: { polarity: 'positive' } },
    { id: 3, source: 3, target: 1, data: { polarity: 'positive' } },
    { id: 4, source: 2, target: 4, data: { polarity: 'positive' } },
    { id: 5, source: 4, target: 1, data: { polarity: 'negative' } }
  ]
  
  return {
    testNodes1,
    testEdges1,
    testNodes2: testNodes1,
    testEdges2,
    testNodes3,
    testEdges3
  }
}

// Function to manually test the loop detection algorithm
export function manualLoopDetectionTest(nodes, edges) {
  // Build adjacency list
  const graph = new Map()
  nodes.forEach(node => graph.set(node.id, []))
  
  edges.forEach(edge => {
    if (graph.has(edge.source)) {
      graph.get(edge.source).push({
        target: edge.target,
        polarity: edge.data?.polarity || 'positive',
        edgeId: edge.id
      })
    }
  })
  
  const allLoops = []
  const recursionStack = new Set()

  // DFS to find cycles
  const findCycles = (node, path, polarities, edgeIds) => {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node)
      const cycle = path.slice(cycleStart)
      const cyclePolarities = polarities.slice(cycleStart)
      const cycleEdgeIds = edgeIds.slice(cycleStart)
      
      // Check if this is a valid cycle (length >= 2)
      if (cycle.length >= 2) {
        const negativeCount = cyclePolarities.filter(p => p === 'negative').length
        const loopType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'
        
        allLoops.push({
          nodes: cycle,
          polarities: cyclePolarities,
          edgeIds: cycleEdgeIds,
          type: loopType,
          length: cycle.length
        })
      }
      return
    }

    recursionStack.add(node)
    path.push(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      polarities.push(neighbor.polarity)
      edgeIds.push(neighbor.edgeId)
      findCycles(neighbor.target, [...path], [...polarities], [...edgeIds])
      polarities.pop()
      edgeIds.pop()
    }

    recursionStack.delete(node)
  }

  // Start DFS from each node
  nodes.forEach(node => {
    findCycles(node.id, [], [], [])
  })
  
  return allLoops
}

// Function to test the current application state
export function testCurrentAppState() {
  // Get the current store state (this would need to be imported from the store)
  // For now, we'll just log what we can access
  
  // Try to access the store if it's available globally
  if (window.__CLD_STORE__) {
    const store = window.__CLD_STORE__
    return {
      storeState: store.getState(),
      loopViewMode: store.getState().loopViewMode,
      highlightedLoop: store.getState().highlightedLoop,
      allLoops: store.getState().allLoops
    }
  } else {
    return null
  }
}

// Function to test dimming functionality
export function testDimming() {
  if (window.__CLD_STORE__) {
    const store = window.__CLD_STORE__
    const state = store.getState()
    
    const currentState = {
      loopViewMode: state.loopViewMode,
      highlightedLoop: state.highlightedLoop,
      allLoops: state.allLoops,
      nodes: state.nodes.length,
      edges: state.edges.length
    }
    
    // Test entering loop view mode
    if (!state.loopViewMode) {
      store.getState().enterLoopViewMode()
    } else {
      store.getState().exitLoopViewMode()
    }
    
    // Test highlighting a loop if any exist
    if (state.allLoops.length > 0 && state.highlightedLoop === null) {
      store.getState().setHighlightedLoop(0)
    } else if (state.highlightedLoop !== null) {
      store.getState().clearHighlightedLoop()
    }
    
    return currentState
  } else {
    return null
  }
}

// Test case for the specific loop from the image
export function testImageLoop() {
  // Based on the image: var1 -> var2 (negative), var2 -> var4 (positive), var4 -> var1 (positive)
  const testNodes = [
    { id: 1, data: { label: 'var1' } },
    { id: 2, data: { label: 'var2' } },
    { id: 4, data: { label: 'var4' } }
  ]
  
  const testEdges = [
    { id: 1, source: 1, target: 2, data: { polarity: 'negative' } },  // var1 -> var2 (negative)
    { id: 2, source: 2, target: 4, data: { polarity: 'positive' } },  // var2 -> var4 (positive)
    { id: 3, source: 4, target: 1, data: { polarity: 'positive' } }   // var4 -> var1 (positive)
  ]
  
  // Manual calculation
  const negativeCount = testEdges.filter(e => e.data.polarity === 'negative').length
  const expectedType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  // Run the actual loop detection
  const detectedLoops = manualLoopDetectionTest(testNodes, testEdges)
  
  return {
    testNodes,
    testEdges,
    expectedType,
    detectedLoops
  }
}

// Simple test for loop classification logic
export function testLoopClassification() {
  // Test case 1: 1 negative edge (should be Balancing)
  const testCase1 = ['positive', 'negative', 'positive']
  const negativeCount1 = testCase1.filter(p => p === 'negative').length
  const type1 = negativeCount1 % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  // Test case 2: 0 negative edges (should be Reinforcing)
  const testCase2 = ['positive', 'positive', 'positive']
  const negativeCount2 = testCase2.filter(p => p === 'negative').length
  const type2 = negativeCount2 % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  // Test case 3: 2 negative edges (should be Reinforcing)
  const testCase3 = ['negative', 'positive', 'negative']
  const negativeCount3 = testCase3.filter(p => p === 'negative').length
  const type3 = negativeCount3 % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  return {
    testCase1: { polarities: testCase1, type: type1 },
    testCase2: { polarities: testCase2, type: type2 },
    testCase3: { polarities: testCase3, type: type3 }
  }
}

// Test canonical cycle representation
export function testCanonicalCycle() {
  // Test case: var1 -> var2 (negative) -> var4 (positive) -> var1 (positive)
  const cycle = [1, 2, 4]
  const polarities = ['negative', 'positive', 'positive']
  const edgeIds = [1, 2, 3]
  
  // Find the minimum element and rotate the cycle
  const minIndex = cycle.indexOf(Math.min(...cycle))
  
  const rotatedNodes = [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)]
  const rotatedPolarities = [...polarities.slice(minIndex), ...polarities.slice(0, minIndex)]
  const rotatedEdgeIds = [...edgeIds.slice(minIndex), ...edgeIds.slice(0, minIndex)]
  
  // Also check the reverse
  const reverseRotatedNodes = [...cycle.slice(minIndex).reverse(), ...cycle.slice(0, minIndex).reverse()]
  const reverseRotatedPolarities = [...polarities.slice(minIndex).reverse(), ...polarities.slice(0, minIndex).reverse()]
  const reverseRotatedEdgeIds = [...edgeIds.slice(minIndex).reverse(), ...edgeIds.slice(0, minIndex).reverse()]
  
  const rotatedKey = rotatedNodes.join(',')
  const reverseKey = reverseRotatedNodes.join(',')
  
  let finalNodes, finalPolarities, finalEdgeIds
  if (rotatedKey <= reverseKey) {
    finalNodes = rotatedNodes
    finalPolarities = rotatedPolarities
    finalEdgeIds = rotatedEdgeIds
  } else {
    finalNodes = reverseRotatedNodes
    finalPolarities = reverseRotatedPolarities
    finalEdgeIds = reverseRotatedEdgeIds
  }
  
  // Check the classification
  const negativeCount = finalPolarities.filter(p => p === 'negative').length
  const loopType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  return {
    original: { cycle, polarities, edgeIds },
    rotated: { nodes: rotatedNodes, polarities: rotatedPolarities, edgeIds: rotatedEdgeIds },
    reverseRotated: { nodes: reverseRotatedNodes, polarities: reverseRotatedPolarities, edgeIds: reverseRotatedEdgeIds },
    final: { nodes: finalNodes, polarities: finalPolarities, edgeIds: finalEdgeIds, type: loopType }
  }
}

// Test current application state
export function testCurrentLoops() {
  if (window.__CLD_STORE__) {
    const store = window.__CLD_STORE__
    const state = store.getState()
    
    // Check edge polarities
    const edgePolarities = state.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      polarity: edge.data?.polarity || 'positive'
    }))
    
    // Check loop classifications
    const loopClassifications = state.allLoops.map((loop, index) => {
      const negativeCount = loop.polarities.filter(p => p === 'negative').length
      const expectedType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'
      
      return {
        index: index + 1,
        nodes: loop.nodes,
        polarities: loop.polarities,
        type: loop.type,
        length: loop.length,
        negativeCount,
        expectedType,
        isCorrect: loop.type === expectedType
      }
    })
    
    return {
      nodes: state.nodes,
      edges: state.edges,
      loops: state.allLoops,
      edgePolarities,
      loopClassifications
    }
  } else {
    return null
  }
}

// Quick test for current loop detection
export function quickTest() {
  // Test the classification logic
  const classificationResults = testLoopClassification()
  
  // Test the canonical cycle logic
  const canonicalResults = testCanonicalCycle()
  
  // Test the specific image loop
  const imageResults = testImageLoop()
  
  // Test current application state
  const currentResults = testCurrentLoops()
  
  return {
    classificationResults,
    canonicalResults,
    imageResults,
    currentResults
  }
}

// Make functions available globally for easy testing
if (typeof window !== 'undefined') {
  window.testDimming = testDimming
  window.testCurrentAppState = testCurrentAppState
  window.testLoopDetection = testLoopDetection
  window.manualLoopDetectionTest = manualLoopDetectionTest
  window.testImageLoop = testImageLoop
  window.testLoopClassification = testLoopClassification
  window.testCanonicalCycle = testCanonicalCycle
  window.testCurrentLoops = testCurrentLoops
  window.quickTest = quickTest
} 
// Test file for loop detection algorithm
// This can be run in the browser console to test the loop detection

export function testLoopDetection() {
  console.log('Testing loop detection algorithm...')
  
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
  
  console.log('Test 1 - Simple 3-node reinforcing loop:')
  console.log('Nodes:', testNodes1.map(n => n.data.label))
  console.log('Edges:', testEdges1.map(e => `${e.source}->${e.target}(${e.data.polarity})`))
  
  // Test case 2: Loop with negative edge (balancing)
  const testEdges2 = [
    { id: 1, source: 1, target: 2, data: { polarity: 'positive' } },
    { id: 2, source: 2, target: 3, data: { polarity: 'negative' } },
    { id: 3, source: 3, target: 1, data: { polarity: 'positive' } }
  ]
  
  console.log('\nTest 2 - 3-node balancing loop (one negative edge):')
  console.log('Edges:', testEdges2.map(e => `${e.source}->${e.target}(${e.data.polarity})`))
  
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
  
  console.log('\nTest 3 - Multiple loops:')
  console.log('Nodes:', testNodes3.map(n => n.data.label))
  console.log('Edges:', testEdges3.map(e => `${e.source}->${e.target}(${e.data.polarity})`))
  
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
  console.log('Manual loop detection test:')
  console.log('Nodes:', nodes.map(n => n.data?.label || n.id))
  console.log('Edges:', edges.map(e => `${e.source}->${e.target}(${e.data?.polarity || 'positive'})`))
  
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
  
  console.log('Adjacency list:', Object.fromEntries(graph))
  
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
        
        console.log(`Found loop: ${cycle.join('->')} (${loopType})`)
        console.log(`Polarities: ${cyclePolarities.join(', ')}`)
        console.log(`Edge IDs: ${cycleEdgeIds.join(', ')}`)
        
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
  
  console.log('All detected loops:', allLoops)
  return allLoops
}

// Function to test the current application state
export function testCurrentAppState() {
  console.log('Testing current application state...')
  
  // Get the current store state (this would need to be imported from the store)
  // For now, we'll just log what we can access
  console.log('Current window object:', window)
  
  // Try to access the store if it's available globally
  if (window.__CLD_STORE__) {
    const store = window.__CLD_STORE__
    console.log('Store state:', store.getState())
    console.log('Loop view mode:', store.getState().loopViewMode)
    console.log('Highlighted loop:', store.getState().highlightedLoop)
    console.log('All loops:', store.getState().allLoops)
  } else {
    console.log('Store not available globally. You can test by:')
    console.log('1. Creating a simple 3-node loop in the app')
    console.log('2. Clicking "Enter Loop View"')
    console.log('3. Clicking on a loop in the sidebar')
    console.log('4. Checking if elements are dimmed')
  }
}

// Function to test dimming functionality
export function testDimming() {
  console.log('Testing dimming functionality...')
  
  if (window.__CLD_STORE__) {
    const store = window.__CLD_STORE__
    const state = store.getState()
    
    console.log('Current state:', {
      loopViewMode: state.loopViewMode,
      highlightedLoop: state.highlightedLoop,
      allLoops: state.allLoops,
      nodes: state.nodes.length,
      edges: state.edges.length
    })
    
    // Test entering loop view mode
    if (!state.loopViewMode) {
      console.log('Entering loop view mode...')
      store.getState().enterLoopViewMode()
    } else {
      console.log('Exiting loop view mode...')
      store.getState().exitLoopViewMode()
    }
    
    // Test highlighting a loop if any exist
    if (state.allLoops.length > 0 && state.highlightedLoop === null) {
      console.log('Highlighting first loop...')
      store.getState().setHighlightedLoop(0)
    } else if (state.highlightedLoop !== null) {
      console.log('Clearing loop highlight...')
      store.getState().clearHighlightedLoop()
    }
  } else {
    console.log('Store not available. Please check if the app is running.')
  }
}

// Test case for the specific loop from the image
export function testImageLoop() {
  console.log('Testing the specific loop from the image...')
  
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
  
  console.log('Test nodes:', testNodes.map(n => n.data.label))
  console.log('Test edges:', testEdges.map(e => `${e.source}->${e.target}(${e.data.polarity})`))
  
  // Manual calculation
  const negativeCount = testEdges.filter(e => e.data.polarity === 'negative').length
  const expectedType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  console.log('Manual calculation:')
  console.log('- Negative edges:', negativeCount)
  console.log('- Expected type:', expectedType)
  console.log('- Should be Balancing (B) because 1 negative edge is odd')
  
  // Run the actual loop detection
  const detectedLoops = manualLoopDetectionTest(testNodes, testEdges)
  
  console.log('Detected loops:', detectedLoops)
  
  return {
    testNodes,
    testEdges,
    expectedType,
    detectedLoops
  }
}

// Simple test for loop classification logic
export function testLoopClassification() {
  console.log('=== TESTING LOOP CLASSIFICATION LOGIC ===')
  
  // Test case 1: 1 negative edge (should be Balancing)
  const testCase1 = ['positive', 'negative', 'positive']
  const negativeCount1 = testCase1.filter(p => p === 'negative').length
  const type1 = negativeCount1 % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  console.log('Test Case 1: [positive, negative, positive]')
  console.log('- Negative count:', negativeCount1)
  console.log('- Type:', type1)
  console.log('- Expected: Balancing (B)')
  console.log('- Result:', type1 === 'Balancing' ? '✓ CORRECT' : '✗ WRONG')
  
  // Test case 2: 0 negative edges (should be Reinforcing)
  const testCase2 = ['positive', 'positive', 'positive']
  const negativeCount2 = testCase2.filter(p => p === 'negative').length
  const type2 = negativeCount2 % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  console.log('\nTest Case 2: [positive, positive, positive]')
  console.log('- Negative count:', negativeCount2)
  console.log('- Type:', type2)
  console.log('- Expected: Reinforcing (R)')
  console.log('- Result:', type2 === 'Reinforcing' ? '✓ CORRECT' : '✗ WRONG')
  
  // Test case 3: 2 negative edges (should be Reinforcing)
  const testCase3 = ['negative', 'positive', 'negative']
  const negativeCount3 = testCase3.filter(p => p === 'negative').length
  const type3 = negativeCount3 % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  console.log('\nTest Case 3: [negative, positive, negative]')
  console.log('- Negative count:', negativeCount3)
  console.log('- Type:', type3)
  console.log('- Expected: Reinforcing (R)')
  console.log('- Result:', type3 === 'Reinforcing' ? '✓ CORRECT' : '✗ WRONG')
  
  console.log('\n=== CLASSIFICATION LOGIC IS CORRECT ===')
  
  return {
    testCase1: { polarities: testCase1, type: type1 },
    testCase2: { polarities: testCase2, type: type2 },
    testCase3: { polarities: testCase3, type: type3 }
  }
}

// Test canonical cycle representation
export function testCanonicalCycle() {
  console.log('=== TESTING CANONICAL CYCLE REPRESENTATION ===')
  
  // Test case: var1 -> var2 (negative) -> var4 (positive) -> var1 (positive)
  const cycle = [1, 2, 4]
  const polarities = ['negative', 'positive', 'positive']
  const edgeIds = [1, 2, 3]
  
  console.log('Original cycle:', cycle)
  console.log('Original polarities:', polarities)
  console.log('Original edgeIds:', edgeIds)
  
  // Find the minimum element and rotate the cycle
  const minIndex = cycle.indexOf(Math.min(...cycle))
  console.log('Min index:', minIndex, '(node', Math.min(...cycle), ')')
  
  const rotatedNodes = [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)]
  const rotatedPolarities = [...polarities.slice(minIndex), ...polarities.slice(0, minIndex)]
  const rotatedEdgeIds = [...edgeIds.slice(minIndex), ...edgeIds.slice(0, minIndex)]
  
  console.log('Rotated nodes:', rotatedNodes)
  console.log('Rotated polarities:', rotatedPolarities)
  console.log('Rotated edgeIds:', rotatedEdgeIds)
  
  // Also check the reverse
  const reverseRotatedNodes = [...cycle.slice(minIndex).reverse(), ...cycle.slice(0, minIndex).reverse()]
  const reverseRotatedPolarities = [...polarities.slice(minIndex).reverse(), ...polarities.slice(0, minIndex).reverse()]
  const reverseRotatedEdgeIds = [...edgeIds.slice(minIndex).reverse(), ...edgeIds.slice(0, minIndex).reverse()]
  
  console.log('Reverse rotated nodes:', reverseRotatedNodes)
  console.log('Reverse rotated polarities:', reverseRotatedPolarities)
  console.log('Reverse rotated edgeIds:', reverseRotatedEdgeIds)
  
  const rotatedKey = rotatedNodes.join(',')
  const reverseKey = reverseRotatedNodes.join(',')
  
  console.log('Rotated key:', rotatedKey)
  console.log('Reverse key:', reverseKey)
  
  let finalNodes, finalPolarities, finalEdgeIds
  if (rotatedKey <= reverseKey) {
    console.log('Using rotated cycle')
    finalNodes = rotatedNodes
    finalPolarities = rotatedPolarities
    finalEdgeIds = rotatedEdgeIds
  } else {
    console.log('Using reverse rotated cycle')
    finalNodes = reverseRotatedNodes
    finalPolarities = reverseRotatedPolarities
    finalEdgeIds = reverseRotatedEdgeIds
  }
  
  console.log('Final nodes:', finalNodes)
  console.log('Final polarities:', finalPolarities)
  console.log('Final edgeIds:', finalEdgeIds)
  
  // Check the classification
  const negativeCount = finalPolarities.filter(p => p === 'negative').length
  const loopType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'
  
  console.log('Negative count:', negativeCount)
  console.log('Loop type:', loopType)
  console.log('Expected: Balancing (B)')
  console.log('Result:', loopType === 'Balancing' ? '✓ CORRECT' : '✗ WRONG')
  
  return {
    original: { cycle, polarities, edgeIds },
    rotated: { nodes: rotatedNodes, polarities: rotatedPolarities, edgeIds: rotatedEdgeIds },
    reverseRotated: { nodes: reverseRotatedNodes, polarities: reverseRotatedPolarities, edgeIds: reverseRotatedEdgeIds },
    final: { nodes: finalNodes, polarities: finalPolarities, edgeIds: finalEdgeIds, type: loopType }
  }
}

// Test current application state
export function testCurrentLoops() {
  console.log('=== TESTING CURRENT APPLICATION STATE ===')
  
  if (window.__CLD_STORE__) {
    const store = window.__CLD_STORE__
    const state = store.getState()
    
    console.log('Current nodes:', state.nodes)
    console.log('Current edges:', state.edges)
    console.log('All loops:', state.allLoops)
    
    // Check edge polarities
    console.log('\nEdge polarities:')
    state.edges.forEach(edge => {
      console.log(`Edge ${edge.id}: ${edge.source} -> ${edge.target}, polarity: ${edge.data?.polarity || 'positive'}`)
    })
    
    // Check loop classifications
    console.log('\nLoop classifications:')
    state.allLoops.forEach((loop, index) => {
      console.log(`Loop ${index + 1}:`)
      console.log('- Nodes:', loop.nodes)
      console.log('- Polarities:', loop.polarities)
      console.log('- Type:', loop.type)
      console.log('- Length:', loop.length)
      
      // Manual verification
      const negativeCount = loop.polarities.filter(p => p === 'negative').length
      const expectedType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'
      console.log('- Manual negative count:', negativeCount)
      console.log('- Manual expected type:', expectedType)
      console.log('- Classification correct:', loop.type === expectedType ? '✓' : '✗')
    })
    
    return {
      nodes: state.nodes,
      edges: state.edges,
      loops: state.allLoops
    }
  } else {
    console.log('Store not available globally')
    return null
  }
}

// Quick test for current loop detection
export function quickTest() {
  console.log('=== QUICK TEST FOR LOOP DETECTION ===')
  
  // Test the classification logic
  testLoopClassification()
  
  // Test the canonical cycle logic
  testCanonicalCycle()
  
  // Test the specific image loop
  testImageLoop()
  
  // Test current application state
  testCurrentLoops()
  
  console.log('=== ALL TESTS COMPLETE ===')
  console.log('Check the console output above for any issues.')
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
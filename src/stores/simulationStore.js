import { create } from 'zustand'
import { createSimulationState } from './types'

const useSimulationStore = create((set, get) => ({
  // Simulation state
  simulationMode: false,
  simulationState: createSimulationState(),
  
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
    const nodeIndex = nodes.findIndex(node => node.id === perturbedNodeId)
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
    
    console.log('Initializing simulation with increments:', {
      perturbedNodeId,
      perturbationValue,
      nodeIndex,
      clampedValue,
      stateVector,
      accumulatedValues,
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
        isRunning: false,
        isPaused: false, // Ensure paused state is reset on initialization
        isInitialized: true
      }
    }))
    
    return true
  },
  
  runSimulation: () => {
    const { simulationState, nodes, edges } = get()
    if (simulationState.isRunning) return
    
    // Check if simulation is properly initialized
    if (!simulationState.isInitialized) {
      console.warn('Cannot run simulation: not initialized')
      return
    }
    
    // If simulation is completed, reset it to step 0 to allow re-running
    if (simulationState.currentStep >= simulationState.maxSteps) {
      console.log('Simulation completed, resetting to allow re-run')
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

export { useSimulationStore } 
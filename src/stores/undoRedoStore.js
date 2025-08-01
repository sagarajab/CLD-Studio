import { create } from 'zustand'

const useUndoRedoStore = create((set, get) => ({
  // Undo/Redo state
  undoStack: [], // Array of state snapshots for undo
  redoStack: [], // Array of state snapshots for redo
  maxUndoSteps: 50, // Maximum number of undo steps
  isUndoRedoAction: false, // Flag to prevent recording during undo/redo operations
  
  // Create state snapshot
  createStateSnapshot: (state) => {
    const { nodes, edges, viewTransform, diagramName, mode, currentProblem, problemStatement } = state
    return {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      viewTransform: { ...viewTransform },
      diagramName,
      mode,
      currentProblem: currentProblem ? { ...currentProblem } : null,
      problemStatement,
      timestamp: Date.now()
    }
  },
  
  // Record state change
  recordStateChange: (state) => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      return
    }
    
    const snapshot = createStateSnapshot(state)
    
    set((storeState) => ({
      undoStack: [...storeState.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
  },
  
  // Undo operation
  undo: (currentState, updateState) => {
    const { undoStack, redoStack, isUndoRedoAction, createStateSnapshot } = get()
    
    if (undoStack.length === 0) {
      return false
    }
    
    // Prevent recursive undo calls
    if (isUndoRedoAction) {
      return false
    }
    
    // Create snapshot of current state for redo
    const currentSnapshot = createStateSnapshot(currentState)
    
    // Get the last state from undo stack
    const previousState = undoStack[undoStack.length - 1]
    
    // Set flag to prevent recording this action
    set({ isUndoRedoAction: true })
    
    // Update the main state with the previous state
    updateState({
      nodes: previousState.nodes,
      edges: previousState.edges,
      viewTransform: previousState.viewTransform,
      diagramName: previousState.diagramName,
      mode: previousState.mode,
      currentProblem: previousState.currentProblem,
      problemStatement: previousState.problemStatement
    })
    
    // Update undo/redo stacks
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot],
      isUndoRedoAction: false // Reset flag immediately after state restoration
    })
    
    return true
  },
  
  // Redo operation
  redo: (currentState, updateState) => {
    const { undoStack, redoStack, isUndoRedoAction, createStateSnapshot } = get()
    
    if (redoStack.length === 0) {
      return false
    }
    
    // Prevent recursive redo calls
    if (isUndoRedoAction) {
      return false
    }
    
    // Create snapshot of current state for undo
    const currentSnapshot = createStateSnapshot(currentState)
    
    // Get the last state from redo stack
    const nextState = redoStack[redoStack.length - 1]
    
    // Set flag to prevent recording this action
    set({ isUndoRedoAction: true })
    
    // Update the main state with the next state
    updateState({
      nodes: nextState.nodes,
      edges: nextState.edges,
      viewTransform: nextState.viewTransform,
      diagramName: nextState.diagramName,
      mode: nextState.mode,
      currentProblem: nextState.currentProblem,
      problemStatement: nextState.problemStatement
    })
    
    // Update undo/redo stacks
    set({
      undoStack: [...undoStack, currentSnapshot],
      redoStack: redoStack.slice(0, -1),
      isUndoRedoAction: false // Reset flag immediately after state restoration
    })
    
    return true
  },
  
  // Clear undo/redo stacks
  clearUndoRedoStacks: () => {
    set({ undoStack: [], redoStack: [], isUndoRedoAction: false })
  },
  
  // Reset undo/redo state (for debugging)
  resetUndoRedoState: () => {
    set({ 
      undoStack: [], 
      redoStack: [], 
      isUndoRedoAction: false 
    })
  },
  
  // Special function for drag operations - only records start and end positions
  recordDragStart: (state, nodeId, startPosition) => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      return
    }
    
    const snapshot = createStateSnapshot(state)
    // Store the drag start position in the snapshot
    snapshot.dragStart = { nodeId, position: startPosition }
    
    set((storeState) => ({
      undoStack: [...storeState.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
  },
  
  recordDragEnd: (state, nodeId, endPosition) => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      return
    }
    
    const snapshot = createStateSnapshot(state)
    // Store the drag end position in the snapshot
    snapshot.dragEnd = { nodeId, position: endPosition }
    
    set((storeState) => ({
      undoStack: [...storeState.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
  }
}))

export { useUndoRedoStore } 
import { create } from 'zustand'
import { createStateSnapshot } from './types'

const useUndoRedoStore = create((set, get) => ({
  // Undo/Redo state
  undoStack: [], // Array of state snapshots for undo
  redoStack: [], // Array of state snapshots for redo
  maxUndoSteps: 50, // Maximum number of undo steps (increased from 10)
  isUndoRedoAction: false, // Flag to prevent recording during undo/redo operations
  
  // Create state snapshot
  createStateSnapshot: () => {
    const { nodes, edges, viewTransform, diagramName, mode, currentProblem, problemStatement } = get()
    return createStateSnapshot(nodes, edges, viewTransform, diagramName, mode, currentProblem, problemStatement)
  },
  
  // Record state change
  recordStateChange: () => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      console.log('Skipping state recording - undo/redo action in progress')
      return
    }
    
    const snapshot = createStateSnapshot()
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
    
    console.log(`State recorded. Undo stack: ${undoStack.length + 1}, Redo stack: 0`)
  },
  
  // Undo operation
  undo: () => {
    const { undoStack, redoStack, isUndoRedoAction, createStateSnapshot, nodes } = get()
    
    console.log(`Undo called. Stack sizes - Undo: ${undoStack.length}, Redo: ${redoStack.length}, isUndoRedoAction: ${isUndoRedoAction}`)
    console.log(`Current nodes before undo: ${nodes.length}`, nodes.map(n => n.id))
    
    if (undoStack.length === 0) {
      console.log('Nothing to undo')
      return false
    }
    
    // Prevent recursive undo calls
    if (isUndoRedoAction) {
      console.log('Undo/redo action already in progress, skipping')
      return false
    }
    
    // Create snapshot of current state for redo
    const currentSnapshot = createStateSnapshot()
    
    // Get the last state from undo stack
    const previousState = undoStack[undoStack.length - 1]
    
    console.log(`Restoring state from ${new Date(previousState.timestamp).toLocaleTimeString()}`)
    console.log(`Previous state nodes: ${previousState.nodes.length}`, previousState.nodes.map(n => n.id))
    
    // Set flag to prevent recording this action
    set({ isUndoRedoAction: true })
    
    // Restore the previous state (excluding selection states)
    set({
      nodes: previousState.nodes,
      edges: previousState.edges,
      viewTransform: previousState.viewTransform,
      diagramName: previousState.diagramName,
      mode: previousState.mode,
      currentProblem: previousState.currentProblem,
      problemStatement: previousState.problemStatement,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot],
      isUndoRedoAction: false // Reset flag immediately after state restoration
    })
    
    // Update graph analysis immediately after state restoration
    get().updateGraphAnalysis()
    
    // Verify the state was restored correctly
    setTimeout(() => {
      const currentState = get()
      console.log(`State after restoration - Nodes: ${currentState.nodes.length}`, currentState.nodes.map(n => n.id))
    }, 0)
    
    console.log(`Undo completed. New stack sizes - Undo: ${undoStack.length - 1}, Redo: ${redoStack.length + 1}`)
    return true
  },
  
  // Redo operation
  redo: () => {
    const { undoStack, redoStack, isUndoRedoAction, createStateSnapshot } = get()
    
    console.log(`Redo called. Stack sizes - Undo: ${undoStack.length}, Redo: ${redoStack.length}, isUndoRedoAction: ${isUndoRedoAction}`)
    
    if (redoStack.length === 0) {
      console.log('Nothing to redo')
      return false
    }
    
    // Prevent recursive redo calls
    if (isUndoRedoAction) {
      console.log('Undo/redo action already in progress, skipping')
      return false
    }
    
    // Create snapshot of current state for undo
    const currentSnapshot = createStateSnapshot()
    
    // Get the last state from redo stack
    const nextState = redoStack[redoStack.length - 1]
    
    console.log(`Restoring state from ${new Date(nextState.timestamp).toLocaleTimeString()}`)
    
    // Set flag to prevent recording this action
    set({ isUndoRedoAction: true })
    
    // Restore the next state (excluding selection states)
    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      viewTransform: nextState.viewTransform,
      diagramName: nextState.diagramName,
      mode: nextState.mode,
      currentProblem: nextState.currentProblem,
      problemStatement: nextState.problemStatement,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: redoStack.slice(0, -1),
      isUndoRedoAction: false // Reset flag immediately after state restoration
    })
    
    // Update graph analysis
    setTimeout(() => {
      get().updateGraphAnalysis()
    }, 0)
    
    console.log(`Redo completed. New stack sizes - Undo: ${undoStack.length + 1}, Redo: ${redoStack.length - 1}`)
    return true
  },
  
  // Clear undo/redo stacks
  clearUndoRedoStacks: () => {
    console.log('Clearing undo/redo stacks')
    set({ undoStack: [], redoStack: [], isUndoRedoAction: false })
  },
  
  // Force reset undo/redo state (for debugging)
  resetUndoRedoState: () => {
    console.log('Force resetting undo/redo state')
    set({ 
      undoStack: [], 
      redoStack: [], 
      isUndoRedoAction: false 
    })
  },
  
  // Debug function to check undo/redo state
  debugUndoRedoState: () => {
    const { undoStack, redoStack, isUndoRedoAction } = get()
    console.log('=== UNDO/REDO DEBUG STATE ===')
    console.log(`Undo stack size: ${undoStack.length}`)
    console.log(`Redo stack size: ${redoStack.length}`)
    console.log(`isUndoRedoAction flag: ${isUndoRedoAction}`)
    console.log('Undo stack timestamps:', undoStack.map(s => new Date(s.timestamp).toLocaleTimeString()))
    console.log('Redo stack timestamps:', redoStack.map(s => new Date(s.timestamp).toLocaleTimeString()))
    console.log('=== END DEBUG STATE ===')
  },
  
  // Special function for drag operations - only records start and end positions
  recordDragStart: (nodeId, startPosition) => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    console.log(`Drag start recorded for node ${nodeId} at position`, startPosition)
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      console.log('Skipping drag start recording - undo/redo action in progress')
      return
    }
    
    const snapshot = createStateSnapshot()
    // Store the drag start position in the snapshot
    snapshot.dragStart = { nodeId, position: startPosition }
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
    
    console.log(`Drag start state recorded. Undo stack: ${undoStack.length + 1}`)
  },
  
  recordDragEnd: (nodeId, endPosition) => {
    const { isUndoRedoAction, undoStack, redoStack, maxUndoSteps, createStateSnapshot } = get()
    
    console.log(`Drag end recorded for node ${nodeId} at position`, endPosition)
    
    // Don't record if this is an undo/redo action
    if (isUndoRedoAction) {
      console.log('Skipping drag end recording - undo/redo action in progress')
      return
    }
    
    const snapshot = createStateSnapshot()
    // Store the drag end position in the snapshot
    snapshot.dragEnd = { nodeId, position: endPosition }
    
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-maxUndoSteps),
      redoStack: [] // Clear redo stack when new action is performed
    }))
    
    console.log(`Drag end state recorded. Undo stack: ${undoStack.length + 1}`)
  }
}))

export { useUndoRedoStore } 
# Node Undo Issue Debugging Guide

## Problem Description
When adding 6 nodes and pressing undo, the 6th node is not removed on the first click, but the undo stack shows the correct state change.

## Console Output Analysis
```
State recorded. Undo stack: 1, Redo stack: 0
State recorded. Undo stack: 2, Redo stack: 0
State recorded. Undo stack: 3, Redo stack: 0
State recorded. Undo stack: 4, Redo stack: 0
State recorded. Undo stack: 5, Redo stack: 0
State recorded. Undo stack: 6, Redo stack: 0
Undo called. Stack sizes - Undo: 6, Redo: 0, isUndoRedoAction: false
Restoring state from 8:57:16 pm
Undo completed. New stack sizes - Undo: 5, Redo: 1
```

**Analysis**: The undo system is working correctly (stack sizes are correct), but the UI is not updating properly.

## Enhanced Debugging Added

### **1. Node Addition Debugging**
```javascript
// In addNode function
console.log(`Adding node "${label}" at position`, position, `Current nodes: ${nodes.length}`)

// After node addition
setTimeout(() => {
  const currentState = get()
  console.log(`Node added successfully. New node count: ${currentState.nodes.length}`, currentState.nodes.map(n => n.id))
}, 0)
```

### **2. Undo Operation Debugging**
```javascript
// Before undo
console.log(`Current nodes before undo: ${nodes.length}`, nodes.map(n => n.id))

// State being restored
console.log(`Previous state nodes: ${previousState.nodes.length}`, previousState.nodes.map(n => n.id))

// After state restoration
setTimeout(() => {
  const currentState = get()
  console.log(`State after restoration - Nodes: ${currentState.nodes.length}`, currentState.nodes.map(n => n.id))
}, 0)
```

## Testing Instructions

### **Step 1: Add Nodes with Debugging**
1. Open browser console
2. Add 6 nodes to the diagram
3. **Expected console output**:
   ```
   Adding node "New Node" at position {x: 100, y: 100} Current nodes: 0
   Node added successfully. New node count: 1 [1]
   State recorded. Undo stack: 1, Redo stack: 0
   
   Adding node "New Node" at position {x: 200, y: 100} Current nodes: 1
   Node added successfully. New node count: 2 [1, 2]
   State recorded. Undo stack: 2, Redo stack: 0
   
   ... (repeat for all 6 nodes)
   ```

### **Step 2: Undo Operation with Debugging**
1. Press undo button once
2. **Expected console output**:
   ```
   Undo called. Stack sizes - Undo: 6, Redo: 0, isUndoRedoAction: false
   Current nodes before undo: 6 [1, 2, 3, 4, 5, 6]
   Restoring state from 8:57:16 pm
   Previous state nodes: 5 [1, 2, 3, 4, 5]
   State after restoration - Nodes: 5 [1, 2, 3, 4, 5]
   Undo completed. New stack sizes - Undo: 5, Redo: 1
   ```

### **Step 3: Verify UI Update**
1. Check if the 6th node is actually removed from the canvas
2. If not, the issue is with React state update or component re-rendering

## Potential Root Causes

### **1. React State Update Timing**
- The state is being restored correctly, but React might not be re-rendering
- Could be a React batching issue

### **2. Graph Analysis Interference**
- `updateGraphAnalysis()` might be modifying the state after restoration
- The function calls `set({ adjacencyMatrix: [], allLoops: [] })` when no edges exist

### **3. Component Re-rendering Issue**
- The Canvas component might not be picking up the state change
- Could be a dependency issue in useEffect hooks

### **4. State Synchronization**
- The Zustand state might be correct, but the React components aren't synced
- Could be a subscription issue

## Debugging Steps

### **Step 1: Check State vs UI**
1. After pressing undo, run in console:
   ```javascript
   const state = window.__CLD_STORE__.getState()
   console.log('Current state nodes:', state.nodes.length, state.nodes.map(n => n.id))
   ```
2. Compare with what's visible on the canvas

### **Step 2: Check Component State**
1. In the Canvas component, add a console log to see if it's receiving the state change
2. Check if the `nodes` prop is being updated

### **Step 3: Force Re-render**
1. Try adding a small delay before the undo operation
2. Check if the issue is timing-related

### **Step 4: Isolate Graph Analysis**
1. Temporarily comment out the `updateGraphAnalysis()` call in the undo function
2. Test if the issue persists

## Temporary Workarounds

### **Option 1: Force Re-render**
```javascript
// In undo function, after state restoration
setTimeout(() => {
  // Force a re-render by updating a dummy state
  set((state) => ({ ...state }))
}, 10)
```

### **Option 2: Delay Graph Analysis**
```javascript
// In undo function, delay graph analysis
setTimeout(() => {
  get().updateGraphAnalysis()
}, 50)
```

### **Option 3: Batch State Updates**
```javascript
// In undo function, batch all updates together
set({
  nodes: previousState.nodes,
  edges: previousState.edges,
  // ... other state properties
  undoStack: undoStack.slice(0, -1),
  redoStack: [...redoStack, currentSnapshot],
  isUndoRedoAction: false,
  // Force a re-render
  _forceUpdate: Date.now()
})
```

## Expected Behavior After Debugging

### **If State is Correct but UI is Wrong**
- The issue is with React re-rendering
- Need to investigate component state synchronization

### **If State is Wrong**
- The issue is with state restoration
- Need to investigate the undo function logic

### **If Graph Analysis is Interfering**
- The issue is with `updateGraphAnalysis()`
- Need to modify when/how it's called

## Next Steps

1. **Run the enhanced debugging** to get detailed console output
2. **Compare state vs UI** to identify where the disconnect occurs
3. **Test the workarounds** to see if any resolve the issue
4. **Report the findings** with the console output for further analysis

## Debug Function Usage

To inspect the current state at any time:
```javascript
window.__CLD_STORE__.getState().debugUndoRedoState()
```

To force reset the undo/redo state:
```javascript
window.__CLD_STORE__.getState().resetUndoRedoState()
```

## Conclusion

The enhanced debugging will help identify exactly where the disconnect occurs between the state restoration and the UI update. Once we have the detailed console output, we can pinpoint the root cause and implement the appropriate fix. 
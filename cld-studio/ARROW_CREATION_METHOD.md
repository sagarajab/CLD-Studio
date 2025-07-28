# Arrow Creation Method in CLD Studio

## New Method: Right-Click to Start, Right-Click to Complete

The CLD Studio now supports a simplified arrow creation method using only right-click interactions:

### Step-by-Step Process:

1. **Right-click on the source node** (the "from" node)
   - The source node will be highlighted with an orange border
   - The cursor will change to a crosshair
   - Connection creation mode is activated
   - A dashed orange guide line appears from the source node to the cursor

2. **Right-click OR left-click on the target node** (the "to" node)
   - The arrow/edge is created between the two nodes
   - The orange border is removed from the source node
   - The guide line disappears
   - Connection creation mode is deactivated

### Visual Feedback:

- **Source node highlight**: Orange border (`#f97316`) appears around the source node
- **Cursor change**: Crosshair cursor indicates connection creation mode
- **Connection state**: The system tracks which node is selected as the source

### Cancellation Options:

- **Right-click on the same node again**: Cancels the connection creation
- **Right-click on empty canvas space**: Cancels the connection creation
- **Press Escape key**: Cancels the connection creation
- **Left-click on empty space**: Cancels the connection creation

### Error Handling:

- **Duplicate connections**: If a connection already exists between the selected nodes, the operation is cancelled
- **Simulation mode**: Arrow creation is disabled during simulation mode

### Technical Implementation:

The new method is implemented in `Canvas.jsx` with these key changes:

1. **Global mouse event handlers**: Handle right-click detection on nodes
2. **Connection state management**: Track source node and connection creation state
3. **Visual feedback**: Update node borders and cursor appearance
4. **Edge creation**: Use the existing `addEdge` function from the store

### Benefits:

- **Simplified interaction**: No need to hold buttons or use complex mouse combinations
- **Clear visual feedback**: Orange border clearly indicates the selected source node
- **Visual guide line**: Dashed line shows the connection being created
- **Flexible completion**: Can use either right-click or left-click to complete the connection
- **Intuitive workflow**: Right-click to start, right-click or left-click to complete
- **Easy cancellation**: Multiple ways to cancel the operation
- **Consistent behavior**: Works the same way across all nodes

This method provides a more user-friendly and intuitive way to create arrows in the CLD Studio application. 
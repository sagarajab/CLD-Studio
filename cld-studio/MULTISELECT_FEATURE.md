# Multiselect Feature in CLD Studio

## Overview

The CLD Studio now supports multiselect functionality, allowing users to select multiple nodes and edges simultaneously for bulk operations like color changes and deletion.

## How to Use

### Basic Multiselect
- **Ctrl+Click** (or Cmd+Click on Mac): Toggle selection of individual nodes or edges
- **Ctrl+A**: Select all nodes and edges
- **Ctrl+D**: Deselect all (clear all selections)
- **Escape**: Clear all selections

### Multiselect Dragging
- **Drag any selected node**: All multiselected nodes move together as a group
- **Maintains relative positions**: Nodes keep their relative distances and positions
- **Connected edges update**: Edge control points automatically adjust to maintain visual connections

### Visual Feedback
- **Selected elements**: Blue border/stroke (same for single and multiselect)
- **Consistent styling**: Multiselected elements use the same visual style as single selections

### Bulk Operations

#### Color Changes
- **Nodes**: Select multiple nodes with Ctrl+Click, then use the Node Color tool to change all selected nodes' colors at once
- **Edges**: Select multiple edges with Ctrl+Click, then use the Arrow Color tool to change all selected edges' colors at once

#### Deletion
- **Delete key**: Delete all selected nodes or edges
- **Backspace key**: Same as Delete key

### Keyboard Shortcuts
- `Ctrl+A`: Select all nodes and edges
- `Ctrl+D`: Deselect all
- `Delete` or `Backspace`: Delete selected elements
- `Escape`: Clear all selections

## Technical Implementation

### Store Changes
- Added `selectedNodes` and `selectedEdges` arrays to track multiselect state
- Added multiselect management functions:
  - `addToNodeSelection()`, `removeFromNodeSelection()`, `clearNodeSelection()`
  - `addToEdgeSelection()`, `removeFromEdgeSelection()`, `clearEdgeSelection()`
  - `clearAllSelections()`

### Bulk Operations
- `updateSelectedNodesColor()`: Apply color to all selected nodes
- `updateSelectedEdgesColor()`: Apply color to all selected edges
- `deleteSelectedNodes()`: Delete all selected nodes
- `deleteSelectedEdges()`: Delete all selected edges

### Visual Updates
- **CLDNode**: Added `isMultiSelected` prop for consistent blue border styling
- **Canvas**: Updated edge rendering to show consistent stroke width for multiselected edges
- **Consistent styling**: Multiselected elements use the same visual style as single selections

## Usage Examples

1. **Change multiple node colors**:
   - Ctrl+Click on several nodes
   - Click the Node Color tool
   - All selected nodes will change to the selected color

2. **Change multiple edge colors**:
   - Ctrl+Click on several edges
   - Click the Arrow Color tool
   - All selected edges will change to the selected color

3. **Delete multiple elements**:
   - Ctrl+Click to select multiple nodes/edges
   - Press Delete or Backspace
   - All selected elements will be deleted

4. **Select all and change colors**:
   - Press Ctrl+A to select all
   - Use color tools to change all elements at once

5. **Move multiple nodes as a group**:
   - Ctrl+Click to select multiple nodes
   - Drag any of the selected nodes
   - All selected nodes will move together maintaining their relative positions

## Benefits

- **Efficiency**: Change multiple elements at once instead of one by one
- **Consistency**: Ensure all related elements have the same styling
- **Productivity**: Faster diagram editing and formatting
- **Group Movement**: Move multiple nodes together while maintaining their relationships
- **Intuitive**: Follows standard software conventions (Ctrl+Click, Ctrl+A, etc.)

## Future Enhancements

Potential future improvements could include:
- Drag selection (click and drag to select multiple elements)
- Group operations (group selected elements for easier manipulation)
- Copy/paste functionality for selected elements
- Bulk property editing (font, size, etc.) 
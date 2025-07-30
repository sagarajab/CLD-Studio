# CLD Studio Store Architecture

This directory contains the modular store architecture for CLD Studio, which has been refactored from a single monolithic store into focused, specialized stores.

## Store Structure

### Core Stores

1. **`types.js`** - Common types and interfaces used across all stores
2. **`configStore.js`** - Configuration management and global settings
3. **`uiStore.js`** - UI state management (selections, view transforms, hover states)
4. **`graphStore.js`** - Graph operations (nodes and edges management)
5. **`analysisStore.js`** - Graph analysis (loop detection, adjacency matrix)
6. **`simulationStore.js`** - Simulation state and operations
7. **`undoRedoStore.js`** - Undo/redo functionality
8. **`mainStore.js`** - Application-level state and operations
9. **`unifiedStore.js`** - Unified interface combining all stores
10. **`index.js`** - Main export file

### Backward Compatibility

- **`cldStore.js`** - Legacy file that re-exports the unified store for backward compatibility

## Usage

### Importing Stores

```javascript
// Import individual stores
import { useConfigStore } from './stores/configStore'
import { useUIStore } from './stores/uiStore'
import { useGraphStore } from './stores/graphStore'
import { useAnalysisStore } from './stores/analysisStore'
import { useSimulationStore } from './stores/simulationStore'
import { useUndoRedoStore } from './stores/undoRedoStore'
import { useMainStore } from './stores/mainStore'

// Import unified store (recommended for most use cases)
import { useCLDStore } from './stores/unifiedStore'

// Import from index file
import { useCLDStore, useConfigStore, useUIStore } from './stores'
```

### Using Individual Stores

```javascript
// Configuration operations
const { config, globalStyles, updateConfig } = useConfigStore()

// UI operations
const { selectedNode, setSelectedNode, viewTransform } = useUIStore()

// Graph operations
const { nodes, edges, addNode, updateNode } = useGraphStore()

// Analysis operations
const { allLoops, adjacencyMatrix, updateGraphAnalysis } = useAnalysisStore()

// Simulation operations
const { simulationMode, runSimulation, pauseSimulation } = useSimulationStore()

// Undo/Redo operations
const { undo, redo, recordStateChange } = useUndoRedoStore()
```

### Using the Unified Store (Recommended)

```javascript
// All operations available in one store
const {
  // Config
  config,
  globalStyles,
  updateConfig,
  
  // UI
  selectedNode,
  setSelectedNode,
  viewTransform,
  
  // Graph
  nodes,
  edges,
  addNode,
  updateNode,
  
  // Analysis
  allLoops,
  adjacencyMatrix,
  updateGraphAnalysis,
  
  // Simulation
  simulationMode,
  runSimulation,
  pauseSimulation,
  
  // Undo/Redo
  undo,
  redo,
  recordStateChange
} = useCLDStore()
```

## Store Responsibilities

### ConfigStore
- Application configuration
- Global styling settings
- Color management
- Grid visibility
- Configuration persistence

### UIStore
- View transforms (zoom, pan)
- Selection states (single and multi-select)
- Hover states
- Loop highlighting
- Loading states

### GraphStore
- Node operations (add, update, delete)
- Edge operations (add, update, delete)
- Bulk operations
- Graph validation
- Connection management

### AnalysisStore
- Loop detection algorithms
- Adjacency matrix generation
- Graph analysis
- Export functionality

### SimulationStore
- Simulation state management
- Simulation algorithms
- Step-by-step execution
- State vector calculations

### UndoRedoStore
- State snapshots
- Undo/redo operations
- State history management
- Drag operation tracking

### MainStore
- Application-level state
- Diagram operations (save/load)
- Export functionality
- Event logging
- Problem management

## Benefits of Modular Architecture

1. **Separation of Concerns** - Each store has a focused responsibility
2. **Maintainability** - Easier to understand and modify individual stores
3. **Testability** - Each store can be tested independently
4. **Performance** - Components can subscribe only to relevant stores
5. **Scalability** - Easy to add new stores or modify existing ones
6. **Code Organization** - Clear structure and documentation

## Migration Guide

### From Old Store to New Stores

**Old way:**
```javascript
import { useCLDStore } from './stores/cldStore'

const { nodes, addNode, updateNode } = useCLDStore()
```

**New way (unified):**
```javascript
import { useCLDStore } from './stores/unifiedStore'

const { nodes, addNode, updateNode } = useCLDStore()
```

**New way (modular):**
```javascript
import { useGraphStore } from './stores/graphStore'

const { nodes, addNode, updateNode } = useGraphStore()
```

### Backward Compatibility

The old `cldStore.js` file still works and re-exports the unified store, so existing code will continue to work without changes.

## Best Practices

1. **Use the unified store** for most components that need multiple store features
2. **Use individual stores** for components that only need specific functionality
3. **Import from index.js** for clean imports
4. **Follow the store naming conventions** for consistency
5. **Use TypeScript types** from `types.js` for better type safety

## Future Enhancements

1. **TypeScript Migration** - Convert stores to TypeScript for better type safety
2. **Middleware Support** - Add middleware for logging, persistence, etc.
3. **Plugin System** - Allow custom stores to be added
4. **Performance Optimization** - Add memoization and selective subscriptions
5. **Testing Framework** - Add comprehensive test coverage for all stores 
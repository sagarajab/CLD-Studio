// Usage Examples for Refactored CLD Store Architecture

// Example 1: Using the refactored main store (backward compatible)
import { useCLDStoreRefactored } from './cldStoreRefactored'

function MyComponent() {
  const {
    nodes,
    edges,
    addNode,
    addEdge,
    selectedNode,
    setSelectedNode,
    viewTransform,
    setViewTransform,
    simulationMode,
    toggleSimulationMode
  } = useCLDStoreRefactored()

  const handleAddNode = () => {
    addNode({ x: 100, y: 100 }, 'New Node')
  }

  const handleAddEdge = () => {
    if (nodes.length >= 2) {
      addEdge(nodes[0].id, nodes[1].id, 'positive')
    }
  }

  return (
    <div>
      <button onClick={handleAddNode}>Add Node</button>
      <button onClick={handleAddEdge}>Add Edge</button>
      <button onClick={toggleSimulationMode}>
        {simulationMode ? 'Disable' : 'Enable'} Simulation
      </button>
      <p>Nodes: {nodes.length}</p>
      <p>Edges: {edges.length}</p>
      <p>Selected Node: {selectedNode}</p>
    </div>
  )
}

// Example 2: Using specialized stores directly (advanced usage)
import { useGraphStore } from './graphStore'
import { useUIStore } from './uiStore'
import { useSimulationStore } from './simulationStore'
import { useConfigStore } from './configStore'

function AdvancedComponent() {
  // Only subscribe to the state you need
  const { nodes, edges, addNode, updateNode } = useGraphStore()
  const { selectedNode, setSelectedNode, viewTransform } = useUIStore()
  const { simulationMode, toggleSimulationMode } = useSimulationStore()
  const { globalStyles, updateGlobalStyles } = useConfigStore()

  const handleNodeUpdate = (nodeId, updates) => {
    updateNode(nodeId, updates)
  }

  const handleStyleUpdate = (updates) => {
    updateGlobalStyles(updates)
  }

  return (
    <div>
      <h3>Graph Operations</h3>
      <button onClick={() => addNode({ x: 200, y: 200 }, 'Advanced Node')}>
        Add Node
      </button>
      
      <h3>UI Operations</h3>
      <button onClick={() => setSelectedNode(nodes[0]?.id)}>
        Select First Node
      </button>
      
      <h3>Simulation Operations</h3>
      <button onClick={toggleSimulationMode}>
        Toggle Simulation
      </button>
      
      <h3>Configuration Operations</h3>
      <button onClick={() => handleStyleUpdate({ arrowWidth: 2.0 })}>
        Make Arrows Thicker
      </button>
      
      <div>
        <h4>Current State:</h4>
        <p>Nodes: {nodes.length}</p>
        <p>Edges: {edges.length}</p>
        <p>Selected: {selectedNode}</p>
        <p>Simulation: {simulationMode ? 'On' : 'Off'}</p>
        <p>Arrow Width: {globalStyles.arrowWidth}</p>
      </div>
    </div>
  )
}

// Example 3: Custom hook for specific functionality
import { useCallback } from 'react'
import { useGraphStore } from './graphStore'
import { useUIStore } from './uiStore'
import { useEventsStore } from './eventsStore'

export function useNodeOperations() {
  const { nodes, addNode, updateNode, deleteNode } = useGraphStore()
  const { selectedNode, setSelectedNode, clearNodeSelection } = useUIStore()
  const { addEvent } = useEventsStore()

  const createNode = useCallback((position, label) => {
    const success = addNode(position, label)
    if (success) {
      addEvent(`Created node: ${label}`)
    }
    return success
  }, [addNode, addEvent])

  const selectNode = useCallback((nodeId) => {
    setSelectedNode(nodeId)
    addEvent(`Selected node: ${nodeId}`)
  }, [setSelectedNode, addEvent])

  const removeNode = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId)
    const label = node?.data?.label || `Node ${nodeId}`
    
    deleteNode(nodeId)
    addEvent(`Deleted node: ${label}`)
    
    if (selectedNode === nodeId) {
      clearNodeSelection()
    }
  }, [nodes, deleteNode, selectedNode, clearNodeSelection, addEvent])

  return {
    nodes,
    selectedNode,
    createNode,
    selectNode,
    removeNode,
    updateNode
  }
}

// Example 4: Using the custom hook
function NodeManager() {
  const { nodes, selectedNode, createNode, selectNode, removeNode } = useNodeOperations()

  return (
    <div>
      <h3>Node Manager</h3>
      <button onClick={() => createNode({ x: Math.random() * 400, y: Math.random() * 400 }, 'Random Node')}>
        Create Random Node
      </button>
      
      <div>
        <h4>Nodes:</h4>
        {nodes.map(node => (
          <div key={node.id} style={{ 
            padding: '8px', 
            margin: '4px', 
            border: selectedNode === node.id ? '2px solid blue' : '1px solid gray',
            cursor: 'pointer'
          }}>
            <span onClick={() => selectNode(node.id)}>
              {node.data.label} (ID: {node.id})
            </span>
            <button onClick={() => removeNode(node.id)} style={{ marginLeft: '8px' }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Example 5: Migration from old store to new architecture
function MigrationExample() {
  // OLD WAY (still works)
  // import { useCLDStore } from './cldStore'
  // const { nodes, addNode, selectedNode } = useCLDStore()

  // NEW WAY (recommended)
  import { useCLDStoreRefactored } from './cldStoreRefactored'
  const { nodes, addNode, selectedNode } = useCLDStoreRefactored()

  // OR EVEN BETTER - use specialized stores
  const { nodes, addNode } = useGraphStore()
  const { selectedNode } = useUIStore()

  return (
    <div>
      <h3>Migration Example</h3>
      <p>This component works with both old and new store architectures!</p>
      <p>Nodes: {nodes.length}</p>
      <p>Selected: {selectedNode}</p>
    </div>
  )
}

export {
  MyComponent,
  AdvancedComponent,
  NodeManager,
  MigrationExample,
  useNodeOperations
} 
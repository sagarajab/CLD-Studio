import React, { useCallback, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap
} from 'reactflow'
import { useCLDStore } from '../stores/cldStore'
import CLDNode from './CLDNode'
import CLDEdge from './CLDEdge'

const nodeTypes = {
  cldNode: CLDNode
}

const edgeTypes = {
  cldEdge: CLDEdge
}

function CLDEditor({ mode }) {
  const reactFlowWrapper = useRef(null)
  const {
    nodes: storeNodes,
    edges: storeEdges,
    addNode,
    addEdge: addStoreEdge,
    updateNode,
    updateEdge,
    deleteNode,
    deleteEdge,
    setSelectedNode,
    setSelectedEdge
  } = useCLDStore()

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)

  // Sync with store
  React.useEffect(() => {
    setNodes(storeNodes)
  }, [storeNodes, setNodes])

  React.useEffect(() => {
    setEdges(storeEdges)
  }, [storeEdges, setEdges])

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: storeEdges.length + 1,
        type: 'cldEdge',
        data: { polarity: 'positive' },
        style: {
          stroke: '#059669',
          strokeWidth: 2
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#059669'
        }
      }
      addStoreEdge(params.source, params.target, 'positive')
    },
    [addStoreEdge, storeEdges.length]
  )

  const onNodeDragStop = useCallback(
    (event, node) => {
      updateNode(node.id, { position: node.position })
    },
    [updateNode]
  )

  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node.id)
    },
    [setSelectedNode]
  )

  const onEdgeClick = useCallback(
    (event, edge) => {
      setSelectedEdge(edge.id)
    },
    [setSelectedEdge]
  )

  // Double-click on canvas to add node
  const onPaneDoubleClick = useCallback(
    (event) => {
      if (mode === 'sandbox') {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top
        }
        
        // Prompt user for node label
        const label = prompt('Enter node label:', 'New Node')
        if (label !== null) { // Only add node if user didn't cancel
          addNode(position, label.trim() || 'New Node')
        }
      }
    },
    [addNode, mode]
  )

  // Single click on canvas to deselect
  const onPaneClick = useCallback(
    (event) => {
      setSelectedNode(null)
      setSelectedEdge(null)
    },
    [setSelectedNode, setSelectedEdge]
  )

  const onNodesDelete = useCallback(
    (deleted) => {
      deleted.forEach(node => deleteNode(node.id))
    },
    [deleteNode]
  )

  const onEdgesDelete = useCallback(
    (deleted) => {
      deleted.forEach(edge => deleteEdge(edge.id))
    },
    [deleteEdge]
  )

  return (
    <div className="w-full h-full" ref={reactFlowWrapper} style={{ minHeight: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onPaneDoubleClick={onPaneDoubleClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ background: 'transparent' }}
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor="#6b7280"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  )
}

export default CLDEditor 
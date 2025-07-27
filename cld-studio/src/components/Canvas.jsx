import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import CLDNode from './CLDNode'
import './Canvas.css'
import { getEllipseDimensions } from '../utils/text'
import {
  calculateCircularArc,
  calculateEllipseIntersection,
  calculateLineSegmentEllipseIntersection,
  calculateReferenceCircle,
  findCircleEllipseIntersections,
  findConvexHullIntersection,
  calculateCircleEllipseIntersection,
  calculateArcEllipseIntersection
} from '../utils/geometry'

function Canvas({ mode, loops = [], dimmingEnabled = true, hoveredLoop = null, devMode = false, setDevMode }) {
  const canvasRef = useRef(null)
  const lastClickTimeRef = useRef(0)
  const lastClickPositionRef = useRef({ x: 0, y: 0 })
  const nodeIdCounterRef = useRef(1)
  
  // Connection creation state
  const [isCreatingConnection, setIsCreatingConnection] = useState(false)
  const [connectionSource, setConnectionSource] = useState(null)
  const [isRightMouseDown, setIsRightMouseDown] = useState(false)

  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  // Node dragging state
  const [isDraggingNode, setIsDraggingNode] = useState(false)
  const [draggedNodeId, setDraggedNodeId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  

  
  // Handle control point dragging
  const [isDraggingControlPoint, setIsDraggingControlPoint] = useState(false)
  const [draggedEdgeId, setDraggedEdgeId] = useState(null)
  const [draggedControlPoint, setDraggedControlPoint] = useState(null)
  
  // Add new state for direct arrow dragging
  const [isDraggingArrow, setIsDraggingArrow] = useState(false)
  const [draggedArrowId, setDraggedArrowId] = useState(null)
  
  // Polarity circle hover state
  const [hoveredPolarityEdge, setHoveredPolarityEdge] = useState(null)

  const {
    nodes: storeNodes,
    edges: storeEdges,
    addNode,
    addEdge,
    updateNode,
    updateEdge,
    deleteNode,
    deleteEdge,
    setSelectedNode,
    setSelectedEdge,
    selectedNode,
    selectedEdge,
    highlightedLoop,
    clearHighlightedLoop,
    loopViewMode,
    enterLoopViewMode,
    exitLoopViewMode,
    viewTransform,
    setViewTransform,
    updateViewTransform,
    globalStyles,
    showGrid,
    simulationMode
  } = useCLDStore();

  // Helper functions for loop highlighting
  const isNodeInHighlightedLoop = (nodeId) => {
    return highlightedLoop !== null && loops[highlightedLoop] && loops[highlightedLoop].nodes.includes(nodeId)
  }

  const isEdgeInHighlightedLoop = (edge) => {
    return highlightedLoop !== null && loops[highlightedLoop] && loops[highlightedLoop].edgeIds && loops[highlightedLoop].edgeIds.includes(edge.id)
  }

  const getHighlightedLoopColor = () => {
    if (highlightedLoop === null || !loops[highlightedLoop]) return null
    const loopType = loops[highlightedLoop].type
    return loopType === 'Balancing' ? '#10b981' : '#ef4444' // Green for balancing, red for reinforcing
  }

  // Get opacity for elements based on highlighted loop and dimming toggle
  const getElementOpacity = (isInLoop) => {
    if (highlightedLoop === null || !dimmingEnabled) return 1
    return isInLoop ? 1 : 0.1  // More obvious dimming
  }

  // Check if element is in hovered loop (for hover highlighting)
  const isNodeInHoveredLoop = (nodeId) => {
    return hoveredLoop !== null && loops[hoveredLoop] && loops[hoveredLoop].nodes.includes(nodeId)
  }

  const isEdgeInHoveredLoop = (edge) => {
    return hoveredLoop !== null && loops[hoveredLoop] && loops[hoveredLoop].edgeIds && loops[hoveredLoop].edgeIds.includes(edge.id)
  }

  // Debug loop view mode changes
  useEffect(() => {
    // Loop view mode state tracking (no console logging needed)
  }, [loopViewMode])


  // Global mouse event listeners for right-click and middle-click detection
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (event.button === 2) { // Right mouse button
        setIsRightMouseDown(true)
        
        // Check if right-click is on a node
        const target = event.target
        if (target && target.closest && target.closest('[data-node-id]')) {
          const nodeId = parseInt(target.closest('[data-node-id]').getAttribute('data-node-id'))
          if (nodeId) {
            if (!isCreatingConnection) {
              // Auto-assign this node as the FROM node
              setIsCreatingConnection(true)
              setConnectionSource(nodeId)
              // Highlight the source node
              updateNode(nodeId, { borderColor: '#f97316' }) // Orange border
            } else if (isCreatingConnection && connectionSource === nodeId) {
              // Right-click on the same node again - cancel connection
              setIsCreatingConnection(false)
              setConnectionSource(null)
              updateNode(nodeId, { borderColor: undefined })
            }
          }
        }
      } else if (event.button === 1) { // Middle mouse button
        setIsDragging(true)
        setDragStart({ x: event.clientX, y: event.clientY })
      }
    }

    const handleMouseUp = (event) => {
      if (event.button === 2) { // Right mouse button
        setIsRightMouseDown(false)
        
        // Don't cancel connection creation on right mouse up
        // Let the user complete the connection by clicking on another node
        // Only cancel if they right-click again or click on empty space
      } else if (event.button === 1) { // Middle mouse button
        setIsDragging(false)
      }
    }

    // Add global event listeners
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isCreatingConnection, connectionSource, updateNode])

  // Global keyboard event listeners for delete functionality
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Don't delete if we're in connection creation mode or simulation mode
        if (isCreatingConnection || simulationMode) {
          return
        }
        
        if (selectedNode) {
          deleteNode(selectedNode)
          setSelectedNode(null)
        } else if (selectedEdge) {
          deleteEdge(selectedEdge)
          setSelectedEdge(null)
        }
      } else if (event.key === 'Escape') {
        // Exit loop view mode or clear highlighting
        if (loopViewMode) {
          exitLoopViewMode()
          clearHighlightedLoop()
        } else if (highlightedLoop !== null) {
          clearHighlightedLoop()
        }
        // Also cancel connection creation
        if (isCreatingConnection) {
          setIsCreatingConnection(false)
          setConnectionSource(null)
          if (connectionSource) {
            updateNode(connectionSource, { borderColor: undefined })
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge, setSelectedNode, setSelectedEdge, isCreatingConnection, connectionSource, updateNode, loopViewMode, exitLoopViewMode, highlightedLoop, clearHighlightedLoop])

  // Handle canvas interactions
  const handleCanvasMouseDown = useCallback((event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left - viewTransform.x) / viewTransform.scale
    const y = (event.clientY - rect.top - viewTransform.y) / viewTransform.scale
    
    if (event.button === 0) { // Left mouse button
      // Check for double-click to add node
      const currentTime = Date.now()
      const currentPosition = { x: event.clientX, y: event.clientY }
      const timeDiff = currentTime - lastClickTimeRef.current
      const positionDiff = Math.sqrt(
        Math.pow(currentPosition.x - lastClickPositionRef.current.x, 2) +
        Math.pow(currentPosition.y - lastClickPositionRef.current.y, 2)
      )
      
      if (timeDiff < 300 && positionDiff < 10) {
        if (mode === 'sandbox' && !simulationMode) {
          const nodeName = `var${nodeIdCounterRef.current}`
          nodeIdCounterRef.current++
          
          // Adjust position so ellipse center is at double-click location
          // Node ellipse center is now dynamic, but we'll use base dimensions for initial positioning
          // Base ellipse dimensions: width=92, height=40, so center is at (46, 20)
          const adjustedX = x - 46
          const adjustedY = y - 20
          
          addNode({ x: adjustedX, y: adjustedY }, nodeName)
          
          // Reset click tracking
          lastClickTimeRef.current = 0
          lastClickPositionRef.current = { x: 0, y: 0 }
        }
      } else {
        // Single click - deselect and cancel connection creation if active
        setSelectedNode(null)
        setSelectedEdge(null)
        
        // Clear highlighted loop when clicking on empty space
        if (highlightedLoop !== null) {
          clearHighlightedLoop()
        }
        
        // Cancel connection creation if clicking on empty space
        if (isCreatingConnection) {
          setIsCreatingConnection(false)
          if (connectionSource) {
            updateNode(connectionSource, { borderColor: undefined })
          }
          setConnectionSource(null)
        }
        
        lastClickTimeRef.current = currentTime
        lastClickPositionRef.current = currentPosition
      }
    }
  }, [mode, addNode, setSelectedNode, setSelectedEdge, viewTransform, isCreatingConnection, connectionSource, updateNode, highlightedLoop, clearHighlightedLoop])

  // Update cursor based on interaction state
  useEffect(() => {
    if (isCreatingConnection || isRightMouseDown) {
      document.body.style.cursor = 'crosshair'
    } else if (isDragging) {
      document.body.style.cursor = 'grabbing'
    } else {
      document.body.style.cursor = 'default'
    }
    
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [isCreatingConnection, isRightMouseDown, isDragging])



  const CONTROL_BISECTOR_TOLERANCE = 20; // px, default tolerance

  // Function to update control points when nodes are moved
  const updateControlPointsForNodeMove = useCallback((nodeId, oldPosition, newPosition) => {
    // Find all edges connected to this node
    const connectedEdges = storeEdges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    )
    
    connectedEdges.forEach(edge => {
      const sourceNode = storeNodes.find(n => n.id === edge.source)
      const targetNode = storeNodes.find(n => n.id === edge.target)
      
      if (!sourceNode || !targetNode) return
      
      const sourceEllipse = getEllipseDimensions(sourceNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })
      const targetEllipse = getEllipseDimensions(targetNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })
      
      const sourceCenterX = sourceNode.position.x + sourceEllipse.centerX
      const sourceCenterY = sourceNode.position.y + sourceEllipse.centerY
      const targetCenterX = targetNode.position.x + targetEllipse.centerX
      const targetCenterY = targetNode.position.y + targetEllipse.centerY
      
      // Get current control point
      const edgeData = edge.data || {}
      const currentControlPoint = edgeData.controlPoint
      
      if (currentControlPoint) {
        // Calculate the perpendicular bisector constraint
        const midX = (sourceCenterX + targetCenterX) / 2
        const midY = (sourceCenterY + targetCenterY) / 2
        const dx = targetCenterX - sourceCenterX
        const dy = targetCenterY - sourceCenterY
        const perpDx = -dy
        const perpDy = dx
        const perpLen = Math.sqrt(perpDx * perpDx + perpDy * perpDy) || 1
        const perpUnitX = perpDx / perpLen
        const perpUnitY = perpDy / perpLen
        
        // Project current control point onto the new bisector
        const mx = currentControlPoint.x - midX
        const my = currentControlPoint.y - midY
        const proj = mx * perpUnitX + my * perpUnitY
        
        // Calculate perpendicular component (distance from bisector)
        const perpComponent = mx * perpUnitY - my * perpUnitX
        // Clamp perpendicular movement to tolerance band
        const clampedPerp = Math.max(-CONTROL_BISECTOR_TOLERANCE, Math.min(CONTROL_BISECTOR_TOLERANCE, perpComponent))
        
        // Final constrained position: along bisector + limited perpendicular movement
        const constrainedX = midX + perpUnitX * proj + perpUnitY * clampedPerp
        const constrainedY = midY + perpUnitY * proj - perpUnitX * clampedPerp
        
        // Update the control point
        updateEdge(edge.id, { controlPoint: { x: constrainedX, y: constrainedY } })
      }
    })
  }, [storeEdges, storeNodes, updateEdge, getEllipseDimensions, globalStyles])

  const handleCanvasMouseMove = useCallback((event) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x
      const deltaY = event.clientY - dragStart.y
      updateViewTransform({
        x: viewTransform.x + deltaX,
        y: viewTransform.y + deltaY
      })
      setDragStart({ x: event.clientX, y: event.clientY })
    } else if (isDraggingControlPoint && draggedEdgeId) {
      event.preventDefault()
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left - viewTransform.x) / viewTransform.scale
      const y = (event.clientY - rect.top - viewTransform.y) / viewTransform.scale

      // Get the edge data
      const edge = storeEdges.find(e => e.id === draggedEdgeId)
      if (!edge) return

      const sourceNode = storeNodes.find(n => n.id === edge.source)
      const targetNode = storeNodes.find(n => n.id === edge.target)
      if (!sourceNode || !targetNode) return

      const sourceEllipse = getEllipseDimensions(sourceNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })
      const targetEllipse = getEllipseDimensions(targetNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })

      const sourceCenterX = sourceNode.position.x + sourceEllipse.centerX
      const sourceCenterY = sourceNode.position.y + sourceEllipse.centerY
      const targetCenterX = targetNode.position.x + targetEllipse.centerX
      const targetCenterY = targetNode.position.y + targetEllipse.centerY

      // Perpendicular bisector calculation
      const midX = (sourceCenterX + targetCenterX) / 2
      const midY = (sourceCenterY + targetCenterY) / 2
      const dx = targetCenterX - sourceCenterX
      const dy = targetCenterY - sourceCenterY
      // Perpendicular direction
      const perpDx = -dy
      const perpDy = dx
      const perpLen = Math.sqrt(perpDx * perpDx + perpDy * perpDy) || 1
      const perpUnitX = perpDx / perpLen
      const perpUnitY = perpDy / perpLen

      // Project mouse position onto the bisector
      const mx = x - midX
      const my = y - midY
      const proj = mx * perpUnitX + my * perpUnitY
      
      // Calculate perpendicular component (distance from bisector)
      const perpComponent = mx * (perpUnitY) - my * (perpUnitX)
      // Clamp perpendicular movement to tolerance band
      const clampedPerp = Math.max(-CONTROL_BISECTOR_TOLERANCE, Math.min(CONTROL_BISECTOR_TOLERANCE, perpComponent))
      
      // Final constrained position: along bisector + limited perpendicular movement
      const constrainedX = midX + perpUnitX * proj + (perpUnitY) * clampedPerp
      const constrainedY = midY + perpUnitY * proj - (perpUnitX) * clampedPerp

      // Calculate the control point that would put the dummy control point at the constrained position
      // For a quadratic Bezier curve at t=0.5: B(0.5) = 0.25P₀ + 0.5P₁ + 0.25P₂
      // Solving for P₁ (control point): P₁ = 2*B(0.5) - 0.5P₀ - 0.5P₂
      const visualStartPoint = findConvexHullIntersection(
        draggedControlPoint || { x: midX, y: midY },
        sourceCenterX, sourceCenterY, sourceEllipse.radiusX, sourceEllipse.radiusY
      ) || { x: sourceCenterX, y: sourceCenterY }
      const visualEndPoint = findConvexHullIntersection(
        draggedControlPoint || { x: midX, y: midY },
        targetCenterX, targetCenterY, targetEllipse.radiusX, targetEllipse.radiusY
      ) || { x: targetCenterX, y: targetCenterY }

      const newControlPoint = {
        x: 2 * constrainedX - 0.5 * visualStartPoint.x - 0.5 * visualEndPoint.x,
        y: 2 * constrainedY - 0.5 * visualStartPoint.y - 0.5 * visualEndPoint.y
      }

      updateEdge(draggedEdgeId, { controlPoint: newControlPoint })
    } else if (isDraggingArrow && draggedArrowId) {
      event.preventDefault()
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (event.clientX - rect.left - viewTransform.x) / viewTransform.scale
      const y = (event.clientY - rect.top - viewTransform.y) / viewTransform.scale

      // Get the edge data
      const edge = storeEdges.find(e => e.id === draggedArrowId)
      if (!edge) return

      const sourceNode = storeNodes.find(n => n.id === edge.source)
      const targetNode = storeNodes.find(n => n.id === edge.target)
      if (!sourceNode || !targetNode) return

      const sourceEllipse = getEllipseDimensions(sourceNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })
      const targetEllipse = getEllipseDimensions(targetNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })

      const sourceCenterX = sourceNode.position.x + sourceEllipse.centerX
      const sourceCenterY = sourceNode.position.y + sourceEllipse.centerY
      const targetCenterX = targetNode.position.x + targetEllipse.centerX
      const targetCenterY = targetNode.position.y + targetEllipse.centerY

      // Use the same approach as control point dragging - project mouse position onto bisector
      const midX = (sourceCenterX + targetCenterX) / 2
      const midY = (sourceCenterY + targetCenterY) / 2
      const dx = targetCenterX - sourceCenterX
      const dy = targetCenterY - sourceCenterY
      const perpDx = -dy
      const perpDy = dx
      const perpLen = Math.sqrt(perpDx * perpDx + perpDy * perpDy) || 1
      const perpUnitX = perpDx / perpLen
      const perpUnitY = perpDy / perpLen

      // Project mouse position onto the bisector
      const mx = x - midX
      const my = y - midY
      const proj = mx * perpUnitX + my * perpUnitY
      
      // Calculate perpendicular component (distance from bisector)
      const perpComponent = mx * perpUnitY - my * perpUnitX
      // Clamp perpendicular movement to tolerance band
      const clampedPerp = Math.max(-CONTROL_BISECTOR_TOLERANCE, Math.min(CONTROL_BISECTOR_TOLERANCE, perpComponent))
      
      // Final constrained position: along bisector + limited perpendicular movement
      const constrainedX = midX + perpUnitX * proj + perpUnitY * clampedPerp
      const constrainedY = midY + perpUnitY * proj - perpUnitX * clampedPerp

      // Calculate the control point that would put the dummy control point at the constrained position
      // For a quadratic Bezier curve at t=0.5: B(0.5) = 0.25P₀ + 0.5P₁ + 0.25P₂
      // Solving for P₁ (control point): P₁ = 2*B(0.5) - 0.5P₀ - 0.5P₂
      const visualStartPoint = findConvexHullIntersection(
        draggedControlPoint || { x: midX, y: midY },
        sourceCenterX, sourceCenterY, sourceEllipse.radiusX, sourceEllipse.radiusY
      ) || { x: sourceCenterX, y: sourceCenterY }
      const visualEndPoint = findConvexHullIntersection(
        draggedControlPoint || { x: midX, y: midY },
        targetCenterX, targetCenterY, targetEllipse.radiusX, targetEllipse.radiusY
      ) || { x: targetCenterX, y: targetCenterY }

      const newControlPoint = {
        x: 2 * constrainedX - 0.5 * visualStartPoint.x - 0.5 * visualEndPoint.x,
        y: 2 * constrainedY - 0.5 * visualStartPoint.y - 0.5 * visualEndPoint.y
      }

      updateEdge(draggedArrowId, { controlPoint: newControlPoint })
    } else if (isCreatingConnection && connectionSource) {
      // Handle connection preview (optional)
    }
    
    // Handle node dragging
    if (isDraggingNode && draggedNodeId) {
      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = (event.clientX - rect.left - viewTransform.x) / viewTransform.scale
      const mouseY = (event.clientY - rect.top - viewTransform.y) / viewTransform.scale
      
      const newX = mouseX - dragOffset.x
      const newY = mouseY - dragOffset.y
      
      // Update node position in store
      const node = storeNodes.find(n => n.id === draggedNodeId)
      if (node) {
        const oldPosition = node.position
        const newPosition = { x: newX, y: newY }
        
        updateNode(draggedNodeId, { 
          position: newPosition
        })
        
        // Update control points for connected edges to maintain constraints
        updateControlPointsForNodeMove(draggedNodeId, oldPosition, newPosition)
      }
    }
     }, [isDragging, dragStart, isDraggingNode, draggedNodeId, dragOffset, viewTransform, storeNodes, updateNode, isDraggingControlPoint, draggedEdgeId, updateEdge, isCreatingConnection, connectionSource, updateControlPointsForNodeMove, globalStyles, isDraggingArrow, draggedArrowId])

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false)
    
    // Stop node dragging
    if (isDraggingNode) {
      setIsDraggingNode(false)
      setDraggedNodeId(null)
      setDragOffset({ x: 0, y: 0 })
    } else if (isDraggingControlPoint) {
      setIsDraggingControlPoint(false)
      setDraggedEdgeId(null)
      setDraggedControlPoint(null)
    } else if (isDraggingArrow) {
      setIsDraggingArrow(false)
      setDraggedArrowId(null)
      setDraggedControlPoint(null)
      // Always deselect the arrow after dragging
      setSelectedEdge(null)
    }
  }, [isDraggingNode, isDraggingControlPoint, isDraggingArrow, setSelectedEdge])

  const handleCanvasWheel = useCallback((event) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    
    const newScale = Math.max(0.1, Math.min(3, viewTransform.scale * delta))
    const scaleDiff = newScale / viewTransform.scale
    
    setViewTransform({
      x: mouseX - (mouseX - viewTransform.x) * scaleDiff,
      y: mouseY - (mouseY - viewTransform.y) * scaleDiff,
      scale: newScale
    })
      }, [viewTransform, setViewTransform])

  // Handle node interactions
  // Check if a connection already exists between two nodes in the same direction
  const connectionExists = (sourceId, targetId) => {
    return storeEdges.some(edge => 
      edge.source === sourceId && edge.target === targetId
    )
  }

  const handleNodeClick = (nodeId, event) => {
    if (isRightMouseDown && !isCreatingConnection && !simulationMode) {
      setIsCreatingConnection(true)
      setConnectionSource(nodeId)
      
      // Highlight the source node
      updateNode(nodeId, { borderColor: '#f97316' }) // Orange border
    } else if (isCreatingConnection && connectionSource && connectionSource !== nodeId) {
      // Check if connection already exists
      if (connectionExists(connectionSource, nodeId)) {
        // Reset connection state
        setIsCreatingConnection(false)
        setConnectionSource(null)
        // Remove highlight from source node
        updateNode(connectionSource, { borderColor: undefined })
        return
      }
      
      // Create the edge
      addEdge(connectionSource, nodeId, 'positive')
      
      // Reset connection state
      setIsCreatingConnection(false)
      setConnectionSource(null)
      
      // Remove highlight from source node
      updateNode(connectionSource, { borderColor: undefined })
    } else if (isCreatingConnection && connectionSource === nodeId) {
      setIsCreatingConnection(false)
      setConnectionSource(null)
      updateNode(nodeId, { borderColor: undefined })
    }
  }

  // Handle node drag start
  const handleNodeMouseDown = useCallback((event, node) => {
    // Don't stop propagation for right-click to allow global right-click detection
    if (event.button === 2) { // Right mouse button
      // Allow the global right-click detection to work
      return
    }
    
    event.stopPropagation()
    
    if (event.button === 0 && !isRightMouseDown && !simulationMode) { // Left click only, not during connection creation or simulation mode
      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = (event.clientX - rect.left - viewTransform.x) / viewTransform.scale
      const mouseY = (event.clientY - rect.top - viewTransform.y) / viewTransform.scale
      
      // Calculate offset from mouse to node center
      const offsetX = mouseX - node.position.x
      const offsetY = mouseY - node.position.y
      
      setIsDraggingNode(true)
      setDraggedNodeId(node.id)
      setDragOffset({ x: offsetX, y: offsetY })
      
      // Select the node
      setSelectedNode(node.id)
    }
  }, [isRightMouseDown, viewTransform, setSelectedNode, simulationMode])

  // Handle control point dragging
  const handleControlPointMouseDown = (e, edgeId) => {
    e.stopPropagation()
    setIsDraggingControlPoint(true)
    setDraggedEdgeId(edgeId)
  }

  const handleDummyControlPointMouseDown = (e, edgeId, currentControlPoint) => {
    e.stopPropagation()
    setIsDraggingControlPoint(true)
    setDraggedEdgeId(edgeId)
    // Store the current control point for reference during dragging
    setDraggedControlPoint(currentControlPoint)
  }

  // Handle direct arrow dragging
  const handleArrowMouseDown = (e, edgeId, currentControlPoint) => {
    e.stopPropagation()
    setIsDraggingArrow(true)
    setDraggedArrowId(edgeId)
    setDraggedControlPoint(currentControlPoint)
  }

  // Handle canvas background click to exit loop view mode
  const handleCanvasClick = (event) => {
    // Only exit if clicking on the canvas background (not on nodes or edges)
    if (event.target === event.currentTarget || event.target.tagName === 'rect') {
      if (loopViewMode) {
        exitLoopViewMode()
        clearHighlightedLoop()
      }
    }
  }


  // Render construction objects for dev mode
  const renderConstructionObjects = () => {
    if (!devMode) return null
    
    return storeEdges.map(edge => {
      const sourceNode = storeNodes.find(n => n.id === edge.source)
      const targetNode = storeNodes.find(n => n.id === edge.target)
      
      if (!sourceNode || !targetNode) return null
      
      const sourceEllipse = getEllipseDimensions(sourceNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })
      const targetEllipse = getEllipseDimensions(targetNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })
      
      const sourceCenterX = sourceNode.position.x + sourceEllipse.centerX
      const sourceCenterY = sourceNode.position.y + sourceEllipse.centerY
      const targetCenterX = targetNode.position.x + targetEllipse.centerX
      const targetCenterY = targetNode.position.y + targetEllipse.centerY
      
      const sourceRadiusX = sourceEllipse.radiusX
      const sourceRadiusY = sourceEllipse.radiusY
      const targetRadiusX = targetEllipse.radiusX
      const targetRadiusY = targetEllipse.radiusY
      
      // Get control point
      const edgeData = edge.data || {}
      const controlPoint = edgeData.controlPoint || {
        x: (sourceCenterX + targetCenterX) / 2,
        y: (sourceCenterY + targetCenterY) / 2
      }
      
      // Perpendicular bisector for control point constraint
      const midX = (sourceCenterX + targetCenterX) / 2
      const midY = (sourceCenterY + targetCenterY) / 2
      const dx = targetCenterX - sourceCenterX
      const dy = targetCenterY - sourceCenterY
      const perpDx = -dy
      const perpDy = dx
      const perpLen = Math.sqrt(perpDx * perpDx + perpDy * perpDy) || 1
      const perpUnitX = perpDx / perpLen
      const perpUnitY = perpDy / perpLen
      // Full bisector line endpoints (extend beyond the nodes)
      const bisectorLength = Math.max(100, Math.sqrt(dx * dx + dy * dy) * 0.8) // At least 100px or 80% of node distance
      const bisectorStart = { x: midX + perpUnitX * bisectorLength, y: midY + perpUnitY * bisectorLength }
      const bisectorEnd = { x: midX - perpUnitX * bisectorLength, y: midY - perpUnitY * bisectorLength }
      
      // Tolerance band lines (parallel to bisector, offset by tolerance)
      const toleranceBand1Start = { x: bisectorStart.x + perpUnitY * CONTROL_BISECTOR_TOLERANCE, y: bisectorStart.y - perpUnitX * CONTROL_BISECTOR_TOLERANCE }
      const toleranceBand1End = { x: bisectorEnd.x + perpUnitY * CONTROL_BISECTOR_TOLERANCE, y: bisectorEnd.y - perpUnitX * CONTROL_BISECTOR_TOLERANCE }
      const toleranceBand2Start = { x: bisectorStart.x - perpUnitY * CONTROL_BISECTOR_TOLERANCE, y: bisectorStart.y + perpUnitX * CONTROL_BISECTOR_TOLERANCE }
      const toleranceBand2End = { x: bisectorEnd.x - perpUnitY * CONTROL_BISECTOR_TOLERANCE, y: bisectorEnd.y + perpUnitX * CONTROL_BISECTOR_TOLERANCE }

      // Find where control lines intersect ellipse edges (same as normal mode)
      const sourceIntersection = findConvexHullIntersection(
        controlPoint, sourceCenterX, sourceCenterY, sourceRadiusX, sourceRadiusY
      )
      
      const targetIntersection = findConvexHullIntersection(
        controlPoint, targetCenterX, targetCenterY, targetRadiusX, targetRadiusY
      )
      
      // Use intersection points as visual start/end, or fallback to centers (same as normal mode)
      const visualStartPoint = sourceIntersection || { x: sourceCenterX, y: sourceCenterY }
      const visualEndPoint = targetIntersection || { x: targetCenterX, y: targetCenterY }
      
      // Calculate dummy control point on the actual Bezier curve at t=0.5 (middle) - same as normal mode
      const t = 0.5
      const dummyControlPoint = {
        x: (1-t)*(1-t) * visualStartPoint.x + 2*(1-t)*t * controlPoint.x + t*t * visualEndPoint.x,
        y: (1-t)*(1-t) * visualStartPoint.y + 2*(1-t)*t * controlPoint.y + t*t * visualEndPoint.y
      }
      
      // Calculate convex hull (triangle formed by start, control, and end points)
      const convexHullPoints = [
        { x: sourceCenterX, y: sourceCenterY },
        { x: controlPoint.x, y: controlPoint.y },
        { x: targetCenterX, y: targetCenterY }
      ]
      
      return (
        <g key={`dev-${edge.id}`}>
          {/* Perpendicular bisector line */}
          <line x1={bisectorStart.x} y1={bisectorStart.y} x2={bisectorEnd.x} y2={bisectorEnd.y} stroke="#0ea5e9" strokeWidth="2" strokeDasharray="5,3" opacity="0.4" />
          {/* Tolerance band lines */}
          <line x1={toleranceBand1Start.x} y1={toleranceBand1Start.y} x2={toleranceBand1End.x} y2={toleranceBand1End.y} stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2,2" opacity="0.2" />
          <line x1={toleranceBand2Start.x} y1={toleranceBand2Start.y} x2={toleranceBand2End.x} y2={toleranceBand2End.y} stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2,2" opacity="0.2" />
          {/* Node centers */}
          <circle
            cx={sourceCenterX}
            cy={sourceCenterY}
            r="4"
            fill="lightblue"
          />
          <circle
            cx={targetCenterX}
            cy={targetCenterY}
            r="4"
            fill="lightblue"
          />
          
          {/* Ellipse edges */}
          <ellipse
            cx={sourceCenterX}
            cy={sourceCenterY}
            rx={sourceRadiusX}
            ry={sourceRadiusY}
            fill="none"
            stroke="teal"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          <ellipse
            cx={targetCenterX}
            cy={targetCenterY}
            rx={targetRadiusX}
            ry={targetRadiusY}
            fill="none"
            stroke="teal"
            strokeWidth="2"
            strokeDasharray="3,3"
          />
          
          {/* Actual control point */}
          <circle
            cx={controlPoint.x}
            cy={controlPoint.y}
            r="6"
            fill="blue"
            stroke="white"
            strokeWidth="2"
          />
          
          {/* Convex hull (triangle) */}
          <polygon
            points={`${convexHullPoints[0].x},${convexHullPoints[0].y} ${convexHullPoints[1].x},${convexHullPoints[1].y} ${convexHullPoints[2].x},${convexHullPoints[2].y}`}
            fill="none"
            stroke="purple"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.6"
          />
          
          {/* Convex hull vertices */}
          {convexHullPoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="purple"
              opacity="0.8"
            />
          ))}
        </g>
      )
    })
  }

  // Render nodes
  const renderNodes = () => {
    return storeNodes.map(node => {
      const isInLoop = isNodeInHighlightedLoop(node.id)
      const isInHoveredLoop = isNodeInHoveredLoop(node.id)
      const shouldHighlight = isInLoop || isInHoveredLoop
      const opacity = getElementOpacity(shouldHighlight)
      
      return (
        <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`} data-node-id={node.id} style={{ opacity }}>
          <CLDNode 
            id={node.id}
            data={node.data}
            selected={selectedNode === node.id}
            isInHighlightedLoop={isInLoop}
            isInHoveredLoop={isInHoveredLoop}
            highlightedLoopType={highlightedLoop !== null && loops[highlightedLoop] ? loops[highlightedLoop].type : null}
            hoveredLoopType={hoveredLoop !== null && loops[hoveredLoop] ? loops[hoveredLoop].type : null}
            onClick={(e) => handleNodeClick(node.id, e)}
            onMouseDown={(e) => handleNodeMouseDown(e, node)}
            devMode={devMode}
            isFromNode={isCreatingConnection && connectionSource === node.id}
            isCreatingConnection={isCreatingConnection}
            isRightMouseDown={isRightMouseDown}
          />
        </g>
      )
    })
  }

  // Render edges
  const renderEdges = () => {
    return storeEdges.map(edge => {
      const sourceNode = storeNodes.find(n => n.id === edge.source)
      const targetNode = storeNodes.find(n => n.id === edge.target)
      
      if (!sourceNode || !targetNode) {
        return null
      }
      
      const sourceEllipse = getEllipseDimensions(sourceNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })
      const targetEllipse = getEllipseDimensions(targetNode.data?.label || 'New Node', { fontSize: globalStyles?.nodeFontSize || 16 })
      
      const sourceCenterX = sourceNode.position.x + sourceEllipse.centerX
      const sourceCenterY = sourceNode.position.y + sourceEllipse.centerY
      const targetCenterX = targetNode.position.x + targetEllipse.centerX
      const targetCenterY = targetNode.position.y + targetEllipse.centerY
      
      // Use ellipse centers as Bezier curve endpoints
      const startPoint = { x: sourceCenterX, y: sourceCenterY }
      const endPoint = { x: targetCenterX, y: targetCenterY }
      
      // Get or create control point for the Bezier curve
      const edgeData = edge.data || {}
      let controlPoint = edgeData.controlPoint
      
      // Initialize control point at midpoint if not set
      if (!controlPoint) {
        // Calculate the direction from source to target
        const dx = targetCenterX - sourceCenterX
        const dy = targetCenterY - sourceCenterY
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 0) {
          // Normalize direction
          const dirX = dx / distance
          const dirY = dy / distance
          
          // Calculate perpendicular direction for curve
          const perpX = -dirY
          const perpY = dirX
          
          // Calculate midpoint
          const midpointX = (sourceCenterX + targetCenterX) / 2
          const midpointY = (sourceCenterY + targetCenterY) / 2
          
          // Offset the control point perpendicularly to create a curve
          const curveOffset = Math.max(20, distance * 0.3) // At least 20px or 30% of distance
          
          controlPoint = {
            x: midpointX + perpX * curveOffset,
            y: midpointY + perpY * curveOffset
          }
        } else {
          // Fallback if nodes are at same position
          controlPoint = {
            x: (sourceCenterX + targetCenterX) / 2,
            y: (sourceCenterY + targetCenterY) / 2
          }
        }
      }
      
      // Find where control lines intersect ellipse edges
      const sourceRadiusX = sourceEllipse.radiusX
      const sourceRadiusY = sourceEllipse.radiusY
      const targetRadiusX = targetEllipse.radiusX
      const targetRadiusY = targetEllipse.radiusY
      
      const sourceIntersection = findConvexHullIntersection(
        controlPoint, sourceCenterX, sourceCenterY, sourceRadiusX, sourceRadiusY
      )
      
      const targetIntersection = findConvexHullIntersection(
        controlPoint, targetCenterX, targetCenterY, targetRadiusX, targetRadiusY
      )
      
      // Use intersection points as visual start/end, or fallback to centers
      const visualStartPoint = sourceIntersection || startPoint
      const visualEndPoint = targetIntersection || endPoint
      
      // Always use quadratic Bezier curve - no straight lines
      const arcPath = `M ${visualStartPoint.x} ${visualStartPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${visualEndPoint.x} ${visualEndPoint.y}`
      
      const polarity = edge.data?.polarity || 'positive'
      const strokeColor = polarity === 'positive' ? '#059669' : '#dc2626'
      const isInLoop = isEdgeInHighlightedLoop(edge)
      const isInHoveredLoop = isEdgeInHoveredLoop(edge)
      const shouldHighlight = isInLoop || isInHoveredLoop
      const loopColor = getHighlightedLoopColor()
      const arrowColor = isInLoop ? loopColor : (edge.data?.color || '#6b7280') // Only change color for selected loops, not hovered
      const arrowTransparency = globalStyles.arrowTransparency || 0.3
      const arrowHeadSize = globalStyles.arrowHeadSize || 3
      const opacity = getElementOpacity(shouldHighlight)
      
      // Add shadow effect ONLY for hovered loops (not selected loops)
      const shadowFilter = isInHoveredLoop && !isInLoop ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' : 'none'
      
      // Calculate position for polarity symbol (based on arrow head position)
      // First, calculate where the arrow head is positioned (at the end of the curve)
      const arrowHeadT = 1.0
      const arrowHeadX = (1-arrowHeadT)*(1-arrowHeadT) * visualStartPoint.x + 2*(1-arrowHeadT)*arrowHeadT * controlPoint.x + arrowHeadT*arrowHeadT * visualEndPoint.x
      const arrowHeadY = (1-arrowHeadT)*(1-arrowHeadT) * visualStartPoint.y + 2*(1-arrowHeadT)*arrowHeadT * controlPoint.y + arrowHeadT*arrowHeadT * visualEndPoint.y
      
      // Calculate a point slightly before the arrow head to get the direction
      const beforeArrowT = 0.90
      const beforeArrowX = (1-beforeArrowT)*(1-beforeArrowT) * visualStartPoint.x + 2*(1-beforeArrowT)*beforeArrowT * controlPoint.x + beforeArrowT*beforeArrowT * visualEndPoint.x
      const beforeArrowY = (1-beforeArrowT)*(1-beforeArrowT) * visualStartPoint.y + 2*(1-beforeArrowT)*beforeArrowT * controlPoint.y + beforeArrowT*beforeArrowT * visualEndPoint.y
      
      // Calculate direction vector from before arrow to arrow head
      const dirX = arrowHeadX - beforeArrowX
      const dirY = arrowHeadY - beforeArrowY
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY)
      
      // Position polarity symbol at fixed distance before arrow head
      const distanceBeforeArrow = 30 // pixels before arrow head
      let symbolX, symbolY
      
      if (dirLength > 0) {
        // Normalize direction and position symbol before arrow head
        const normalizedDirX = dirX / dirLength
        const normalizedDirY = dirY / dirLength
        
        symbolX = arrowHeadX - normalizedDirX * distanceBeforeArrow
        symbolY = arrowHeadY - normalizedDirY * distanceBeforeArrow
      } else {
        // Fallback: position slightly before the end point
        symbolX = visualEndPoint.x - 25
        symbolY = visualEndPoint.y
      }
      
      // Calculate dummy control point on the actual Bezier curve at t=0.5 (middle)
      // For a quadratic Bezier curve: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
      // At t=0.5: B(0.5) = 0.25P₀ + 0.5P₁ + 0.25P₂
      const t = 0.5
      const dummyControlPoint = {
        x: (1-t)*(1-t) * visualStartPoint.x + 2*(1-t)*t * controlPoint.x + t*t * visualEndPoint.x,
        y: (1-t)*(1-t) * visualStartPoint.y + 2*(1-t)*t * controlPoint.y + t*t * visualEndPoint.y
      }
      
      return (
        <g key={edge.id} style={{ opacity }}>
          {/* Edge path with wider hit area */}
          <path
            d={arcPath}
            stroke="transparent"
            strokeWidth="20"
            fill="none"
            cursor={isDraggingArrow && draggedArrowId === edge.id ? "pointer" : "pointer"}
            onClick={(e) => {
              // Only select if we're not dragging
              if (!isDraggingArrow) {
                setSelectedEdge(edge.id)
              }
            }}
            onMouseDown={(e) => handleArrowMouseDown(e, edge.id, controlPoint)}
            onMouseEnter={(event) => {
              if (selectedEdge !== edge.id && !isDraggingArrow) {
                // Add hover effect - increase stroke width of visual path
                const visualPath = event.target.nextElementSibling
                if (visualPath) {
                  visualPath.setAttribute('stroke-width', globalStyles.arrowWidth + 1)
                }
              }
            }}
            onMouseLeave={(event) => {
              if (selectedEdge !== edge.id && !isDraggingArrow) {
                // Remove hover effect - restore normal stroke width
                const visualPath = event.target.nextElementSibling
                if (visualPath) {
                  visualPath.setAttribute('stroke-width', globalStyles.arrowWidth)
                }
              }
            }}
          />
          
          {/* Visual edge path */}
          <path
            d={arcPath}
            stroke={arrowColor}
            strokeOpacity={arrowTransparency}
            strokeWidth={
              selectedEdge === edge.id ? globalStyles.arrowWidth + 2 : 
              shouldHighlight ? globalStyles.arrowWidth + 1 : 
              globalStyles.arrowWidth
            }
            fill="none"
            markerEnd={`url(#arrowhead-${edge.id})`}
            style={{ 
              pointerEvents: 'none',
              filter: shadowFilter
            }}
          />
          
          {/* Individual arrowhead marker for this edge */}
          <defs>
            <marker
              id={`arrowhead-${edge.id}`}
              markerWidth={20 * arrowHeadSize / 3}
              markerHeight={14 * arrowHeadSize / 3}
              refX={14 * arrowHeadSize / 3}
              refY={7 * arrowHeadSize / 3}
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon
                points={`0 0, ${20 * arrowHeadSize / 3} ${7 * arrowHeadSize / 3}, 0 ${14 * arrowHeadSize / 3}`}
                fill={isInLoop ? loopColor : arrowColor}
                fillOpacity={arrowTransparency}
                style={{
                  filter: shadowFilter
                }}
              />
            </marker>
          </defs>
          
          {/* Polarity symbol (always visible) */}
          <circle
            cx={symbolX}
            cy={symbolY}
            r="8"
            fill="white"
            stroke={hoveredPolarityEdge === edge.id ? "#e5e7eb" : "white"}
            strokeWidth={hoveredPolarityEdge === edge.id ? "2" : "1"}
            cursor="pointer"
            style={{
              transition: 'stroke 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease',
              filter: hoveredPolarityEdge === edge.id ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
            }}
            onMouseEnter={() => setHoveredPolarityEdge(edge.id)}
            onMouseLeave={() => setHoveredPolarityEdge(null)}
            onClick={() => {
              const newPolarity = polarity === 'positive' ? 'negative' : 'positive'
              updateEdge(edge.id, { polarity: newPolarity })
            }}
          />
          <text
            x={symbolX}
            y={symbolY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="16"
            fontWeight="bold"
            fill={polarity === 'positive' ? '#059669' : '#dc2626'}
            cursor="pointer"
            style={{ userSelect: 'none' }}
            onMouseEnter={() => setHoveredPolarityEdge(edge.id)}
            onMouseLeave={() => setHoveredPolarityEdge(null)}
            onClick={() => {
              const newPolarity = polarity === 'positive' ? 'negative' : 'positive'
              updateEdge(edge.id, { polarity: newPolarity })
            }}
          >
            {polarity === 'positive' ? '+' : '−'}
          </text>
          
          {/* Dummy control point (visible when selected or in dev mode) */}
          {(selectedEdge === edge.id || devMode) && (
            <circle
              cx={dummyControlPoint.x}
              cy={dummyControlPoint.y}
              r={devMode ? "5" : "8"}
              fill={devMode ? "red" : arrowColor}
              fillOpacity={devMode ? 1 : arrowTransparency}
              stroke="white"
              strokeWidth={devMode ? "2" : "3"}
              cursor={isDraggingArrow && draggedArrowId === edge.id ? "pointer" : "pointer"}
              style={{
                pointerEvents: 'all',
                transition: 'opacity 0.2s ease'
              }}
              onMouseDown={(e) => handleDummyControlPointMouseDown(e, edge.id, controlPoint)}
            />
          )}
        </g>
      )
    })
  }

  return (
    <div className="canvas-container" ref={canvasRef}>
      <svg
        width="100%"
        height="100%"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleCanvasWheel}
        onContextMenu={(e) => e.preventDefault()}
        onClick={handleCanvasClick}
        style={{ 
          cursor: isRightMouseDown ? 'crosshair' : 
                 (isDragging ? 'grabbing' : 
                 (isDraggingArrow ? 'pointer' : 'default')),
          userSelect: 'none'
        }}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="1"/>
          </pattern>
          
          {/* Arrowhead markers */}
          <marker
            id="arrowhead-consistent"
            markerWidth="20"
            markerHeight="14"
            refX="14"
            refY="7"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <polygon
              points="0 0, 20 7, 0 14"
              fill="#6b7280"
            />
          </marker>
        </defs>
        
        {/* Background grid - outside transform to cover full canvas */}
        {showGrid && <rect width="100%" height="100%" fill="url(#grid)" />}
        
        <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}>
          {/* Construction objects (dev mode) */}
          {renderConstructionObjects()}
          
          {/* Nodes */}
          {renderNodes()}
          
          {/* Edges */}
          {renderEdges()}
        </g>
      </svg>
    </div>
  )
}

export default Canvas
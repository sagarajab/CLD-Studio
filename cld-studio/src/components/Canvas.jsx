import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import CLDNode from './CLDNode'
import './Canvas.css'

function Canvas({ mode }) {
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
  
  // Dev mode state
  const [devMode, setDevMode] = useState(false)
  
  // Handle control point dragging
  const [isDraggingControlPoint, setIsDraggingControlPoint] = useState(false)
  const [draggedEdgeId, setDraggedEdgeId] = useState(null)
  const [draggedControlPoint, setDraggedControlPoint] = useState(null)
  
  // Polarity circle hover state
  const [hoveredPolarityEdge, setHoveredPolarityEdge] = useState(null)

  // Helper function to calculate ellipse dimensions with text wrapping
  const getEllipseDimensions = (node) => {
    const label = node.data?.label || 'New Node'
    const baseWidth = 60
    const baseHeight = 40
    const padding = 32 // increased padding to match CLDNode
    const maxTextWidth = 120
    const lineHeight = 16
    
    // Wrap text to fit maximum width
    const wrapText = (text, maxWidth) => {
      const words = text.split(' ')
      const lines = []
      let currentLine = ''
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const testWidth = testLine.length * 8
        
        if (testWidth <= maxWidth) {
          currentLine = testLine
        } else {
          if (currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            // Single word is too long, break it into chunks
            const wordChunks = []
            for (let i = 0; i < word.length; i += Math.floor(maxWidth / 8)) {
              wordChunks.push(word.slice(i, i + Math.floor(maxWidth / 8)))
            }
            lines.push(...wordChunks)
            currentLine = ''
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine)
      }
      
      return lines
    }
    
    const wrappedLines = wrapText(label, maxTextWidth)
    
    // Calculate the actual width needed for the text
    const calculateLineWidth = (line) => line.length * 8 // approximate character width
    const lineWidths = wrappedLines.map(calculateLineWidth)
    const maxLineWidth = Math.max(...lineWidths, 0)
    
    // Calculate final dimensions - hug the text tightly but ensure proper containment
    const textWidth = Math.min(maxLineWidth, maxTextWidth) // Don't exceed max width
    const width = Math.max(baseWidth, textWidth + padding)
    const height = Math.max(baseHeight, wrappedLines.length * lineHeight + padding)
    
    return {
      x: node.position.x + width / 2,
      y: node.position.y + height / 2,
      radiusX: width / 2,
      radiusY: height / 2
    }
  }

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
    setSelectedEdge,
    selectedNode,
    selectedEdge,
    viewTransform,
    setViewTransform,
    updateViewTransform,
    globalStyles
  } = useCLDStore()

  // Debug: Log store changes
  React.useEffect(() => {
    console.log('🔄 Store nodes updated:', storeNodes)
    console.log('📊 Store nodes count:', storeNodes.length)
  }, [storeNodes])

  React.useEffect(() => {
    console.log('🔗 Store edges updated:', storeEdges)
    console.log('🔗 Store edges count:', storeEdges.length)
  }, [storeEdges])

  // Global mouse event listeners for right-click and middle-click detection
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (event.button === 2) { // Right mouse button
        console.log('🖱️ Right mouse down detected')
        setIsRightMouseDown(true)
        
        // Check if right-click is on a node
        const target = event.target
        if (target && target.closest && target.closest('[data-node-id]')) {
          const nodeId = parseInt(target.closest('[data-node-id]').getAttribute('data-node-id'))
          if (nodeId) {
            if (!isCreatingConnection) {
              console.log('🔗 Right-click on node detected:', nodeId)
              // Auto-assign this node as the FROM node
              setIsCreatingConnection(true)
              setConnectionSource(nodeId)
              // Highlight the source node
              updateNode(nodeId, { borderColor: '#f97316' }) // Orange border
            } else if (isCreatingConnection && connectionSource === nodeId) {
              // Right-click on the same node again - cancel connection
              console.log('🔗 Right-click on same node - canceling connection')
              setIsCreatingConnection(false)
              setConnectionSource(null)
              updateNode(nodeId, { borderColor: undefined })
            }
          }
        }
      } else if (event.button === 1) { // Middle mouse button
        console.log('🖱️ Middle mouse down detected')
        setIsDragging(true)
        setDragStart({ x: event.clientX, y: event.clientY })
      }
    }

    const handleMouseUp = (event) => {
      if (event.button === 2) { // Right mouse button
        console.log('🖱️ Right mouse up detected')
        setIsRightMouseDown(false)
        
        // Don't cancel connection creation on right mouse up
        // Let the user complete the connection by clicking on another node
        // Only cancel if they right-click again or click on empty space
      } else if (event.button === 1) { // Middle mouse button
        console.log('🖱️ Middle mouse up detected')
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
        console.log('⌨️ Delete key pressed')
        
        // Don't delete if we're in connection creation mode
        if (isCreatingConnection) {
          console.log('❌ Cannot delete while creating connection')
          return
        }
        
        // Delete selected node
        if (selectedNode) {
          console.log('🗑️ Deleting selected node:', selectedNode)
          deleteNode(selectedNode)
          setSelectedNode(null)
          return
        }
        
        // Delete selected edge
        if (selectedEdge) {
          console.log('🗑️ Deleting selected edge:', selectedEdge)
          deleteEdge(selectedEdge)
          setSelectedEdge(null)
          return
        }
        
        console.log('ℹ️ No node or edge selected for deletion')
      }
    }

    // Add global keyboard event listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge, setSelectedNode, setSelectedEdge, isCreatingConnection])

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
        console.log('🎯 Double-click detected!')
        
        if (mode === 'sandbox') {
          const nodeName = `var${nodeIdCounterRef.current}`
          nodeIdCounterRef.current++
          
          // Adjust position so ellipse center is at double-click location
          // Node ellipse center is now dynamic, but we'll use base dimensions for initial positioning
          // Base ellipse dimensions: width=92, height=40, so center is at (46, 20)
          const adjustedX = x - 46
          const adjustedY = y - 20
          
          console.log('🚀 Adding node:', nodeName, 'at position:', { x: adjustedX, y: adjustedY }, 'ellipse center at:', { x, y })
          
          addNode({ x: adjustedX, y: adjustedY }, nodeName)
          
          // Reset click tracking
          lastClickTimeRef.current = 0
          lastClickPositionRef.current = { x: 0, y: 0 }
        }
      } else {
        // Single click - deselect and cancel connection creation if active
        setSelectedNode(null)
        setSelectedEdge(null)
        
        // Cancel connection creation if clicking on empty space
        if (isCreatingConnection) {
          console.log('❌ Canceling connection creation - clicked on empty space')
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
  }, [mode, addNode, setSelectedNode, setSelectedEdge, viewTransform, isCreatingConnection, connectionSource, updateNode])

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
      
      const sourceEllipse = getEllipseDimensions(sourceNode)
      const targetEllipse = getEllipseDimensions(targetNode)
      
      const sourceCenterX = sourceEllipse.x
      const sourceCenterY = sourceEllipse.y
      const targetCenterX = targetEllipse.x
      const targetCenterY = targetEllipse.y
      
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
  }, [storeEdges, storeNodes, updateEdge, getEllipseDimensions])

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

      const sourceEllipse = getEllipseDimensions(sourceNode)
      const targetEllipse = getEllipseDimensions(targetNode)

      const sourceCenterX = sourceEllipse.x
      const sourceCenterY = sourceEllipse.y
      const targetCenterX = targetEllipse.x
      const targetCenterY = targetEllipse.y

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
  }, [isDragging, dragStart, isDraggingNode, draggedNodeId, dragOffset, viewTransform, storeNodes, updateNode, isDraggingControlPoint, draggedEdgeId, updateEdge, isCreatingConnection, connectionSource, updateControlPointsForNodeMove])

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
    }
  }, [isDraggingNode, isDraggingControlPoint])

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
    console.log('🖱️ Node click detected:', nodeId, 'Right mouse down:', isRightMouseDown, 'Creating connection:', isCreatingConnection, 'Source:', connectionSource)
    
    if (isRightMouseDown && !isCreatingConnection) {
      console.log('🔗 Starting connection creation from node:', nodeId)
      setIsCreatingConnection(true)
      setConnectionSource(nodeId)
      
      // Highlight the source node
      updateNode(nodeId, { borderColor: '#f97316' }) // Orange border
    } else if (isCreatingConnection && connectionSource && connectionSource !== nodeId) {
      console.log('🔗 Completing connection from', connectionSource, 'to', nodeId)
      
      // Check if connection already exists
      if (connectionExists(connectionSource, nodeId)) {
        console.log('❌ Connection already exists between', connectionSource, 'and', nodeId)
        // Reset connection state
        setIsCreatingConnection(false)
        setConnectionSource(null)
        // Remove highlight from source node
        updateNode(connectionSource, { borderColor: undefined })
        return
      }
      
      // Create the edge
      console.log('🔗 Creating edge from', connectionSource, 'to', nodeId)
      console.log('🔗 Before adding edge - Store edges count:', storeEdges.length)
      addStoreEdge(connectionSource, nodeId, 'positive')
      console.log('🔗 After adding edge - Store edges count:', storeEdges.length)
      console.log('🔗 Current store edges:', storeEdges)
      
      // Reset connection state
      setIsCreatingConnection(false)
      setConnectionSource(null)
      
      // Remove highlight from source node
      updateNode(connectionSource, { borderColor: undefined })
    } else if (isCreatingConnection && connectionSource === nodeId) {
      console.log('🔗 Same node clicked, canceling connection')
      setIsCreatingConnection(false)
      setConnectionSource(null)
      updateNode(nodeId, { borderColor: undefined })
    } else {
      console.log('🔗 Connection conditions not met:', { isCreatingConnection, connectionSource, nodeId })
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
    
    if (event.button === 0 && !isRightMouseDown) { // Left click only, not during connection creation
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
  }, [isRightMouseDown, viewTransform, setSelectedNode])

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

  // Calculate intersection between circle and ellipse
  const calculateCircleEllipseIntersection = (circleCenterX, circleCenterY, circleRadius, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) => {
    // Simple approach: find where the line from circle center to ellipse center intersects the ellipse
    // This will give us a point on the ellipse that we can use
    
    return calculateEllipseIntersection(
      circleCenterX, circleCenterY, ellipseCenterX, ellipseCenterY,
      ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
    )
  }

  // Calculate intersection between circular arc and ellipse
  const calculateArcEllipseIntersection = (arcCenterX, arcCenterY, arcRadius, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY, startAngle, endAngle) => {
    // For now, let's use a simple approach: find where the line from arc center to ellipse center intersects the ellipse
    // This will give us a reasonable approximation
    
    const intersection = calculateEllipseIntersection(
      arcCenterX, arcCenterY, ellipseCenterX, ellipseCenterY,
      ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
    )
    
    if (!intersection) return null
    
    // Check if this intersection point is within the arc range
    const intersectionAngle = Math.atan2(intersection.y - arcCenterY, intersection.x - arcCenterX)
    
    // Normalize angles to [0, 2π]
    let normalizedStartAngle = startAngle
    let normalizedEndAngle = endAngle
    let normalizedIntersectionAngle = intersectionAngle
    
    while (normalizedStartAngle < 0) normalizedStartAngle += 2 * Math.PI
    while (normalizedEndAngle < 0) normalizedEndAngle += 2 * Math.PI
    while (normalizedIntersectionAngle < 0) normalizedIntersectionAngle += 2 * Math.PI
    
    // Ensure startAngle <= endAngle
    if (normalizedStartAngle > normalizedEndAngle) {
      normalizedEndAngle += 2 * Math.PI
    }
    
    // Check if intersection angle is within arc range
    if (normalizedIntersectionAngle >= normalizedStartAngle && normalizedIntersectionAngle <= normalizedEndAngle) {
      return intersection
    }
    
    // If not, use the closest endpoint
    const distToStart = Math.min(
      Math.abs(normalizedIntersectionAngle - normalizedStartAngle),
      Math.abs(normalizedIntersectionAngle - (normalizedStartAngle + 2 * Math.PI))
    )
    const distToEnd = Math.min(
      Math.abs(normalizedIntersectionAngle - normalizedEndAngle),
      Math.abs(normalizedIntersectionAngle - (normalizedEndAngle - 2 * Math.PI))
    )
    
    // Use the closest endpoint
    const useStart = distToStart < distToEnd
    const endpointAngle = useStart ? normalizedStartAngle : normalizedEndAngle
    
    // Calculate the endpoint on the circle
    const endpointX = arcCenterX + arcRadius * Math.cos(endpointAngle)
    const endpointY = arcCenterY + arcRadius * Math.sin(endpointAngle)
    
    // Find where the line from arc center to endpoint intersects the ellipse
    return calculateEllipseIntersection(
      arcCenterX, arcCenterY, endpointX, endpointY,
      ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
    )
  }

  // Calculate a circular arc through three points
  const calculateCircularArc = (startX, startY, controlX, controlY, endX, endY) => {
    console.log('🔧 Calculating circular arc for points:', { startX, startY, controlX, controlY, endX, endY })
    
    // Find the center of the circle that passes through all three points
    // Using the perpendicular bisectors of two chords
    
    // Midpoint of start-control chord
    const mid1X = (startX + controlX) / 2
    const mid1Y = (startY + controlY) / 2
    
    // Direction vector of start-control chord
    const dir1X = controlX - startX
    const dir1Y = controlY - startY
    
    // Perpendicular direction (rotate 90 degrees)
    const perp1X = -dir1Y
    const perp1Y = dir1X
    
    // Midpoint of control-end chord
    const mid2X = (controlX + endX) / 2
    const mid2Y = (controlY + endY) / 2
    
    // Direction vector of control-end chord
    const dir2X = endX - controlX
    const dir2Y = endY - controlY
    
    // Perpendicular direction (rotate 90 degrees)
    const perp2X = -dir2Y
    const perp2Y = dir2X
    
    // Find intersection of the two perpendicular bisectors
    // This is the center of the circle
    
    // Line 1: mid1 + t1 * perp1
    // Line 2: mid2 + t2 * perp2
    
    // Solve for t1 and t2 where the lines intersect
    const det = perp1X * perp2Y - perp1Y * perp2X
    
    console.log('🔧 Determinant:', det)
    
    if (Math.abs(det) < 1e-10) {
      // Lines are parallel, use a fallback
      console.log('❌ Lines are parallel, no arc calculated')
      
      // Fallback: create a straight line path
      console.log('🔧 Using fallback straight line path')
      return {
        centerX: (startX + endX) / 2,
        centerY: (startY + endY) / 2,
        radius: Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) / 2,
        startAngle: Math.atan2(startY - (startY + endY) / 2, startX - (startX + endX) / 2),
        endAngle: Math.atan2(endY - (startY + endY) / 2, endX - (startX + endX) / 2),
        isStraightLine: true
      }
    }
    
    const t1 = ((mid2X - mid1X) * perp2Y - (mid2Y - mid1Y) * perp2X) / det
    
    const centerX = mid1X + t1 * perp1X
    const centerY = mid1Y + t1 * perp1Y
    
    // Calculate radius
    const radius = Math.sqrt((startX - centerX) ** 2 + (startY - centerY) ** 2)
    
    // Calculate angles
    const startAngle = Math.atan2(startY - centerY, startX - centerX)
    const endAngle = Math.atan2(endY - centerY, endX - centerX)
    
    console.log('🔧 Arc calculated successfully:', { centerX, centerY, radius, startAngle, endAngle })
    
    return { centerX, centerY, radius, startAngle, endAngle }
  }

  // Calculate intersection between line and ellipse
  const calculateEllipseIntersection = (lineStartX, lineStartY, lineEndX, lineEndY, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) => {
    // Translate line to ellipse coordinate system
    const dx = lineEndX - lineStartX
    const dy = lineEndY - lineStartY
    const translatedStartX = lineStartX - ellipseCenterX
    const translatedStartY = lineStartY - ellipseCenterY
    
    // Normalize ellipse to unit circle
    const normalizedStartX = translatedStartX / ellipseRadiusX
    const normalizedStartY = translatedStartY / ellipseRadiusY
    const normalizedDx = dx / ellipseRadiusX
    const normalizedDy = dy / ellipseRadiusY
    
    // Solve quadratic equation for intersection
    const a = normalizedDx * normalizedDx + normalizedDy * normalizedDy
    const b = 2 * (normalizedStartX * normalizedDx + normalizedStartY * normalizedDy)
    const c = normalizedStartX * normalizedStartX + normalizedStartY * normalizedStartY - 1
    
    const discriminant = b * b - 4 * a * c
    
    if (discriminant < 0) {
      // No intersection
      return null
    }
    
    const sqrtDiscriminant = Math.sqrt(discriminant)
    const t1 = (-b + sqrtDiscriminant) / (2 * a)
    const t2 = (-b - sqrtDiscriminant) / (2 * a)
    
    // Convert back to original coordinate system
    const intersection1 = {
      x: lineStartX + t1 * dx,
      y: lineStartY + t1 * dy
    }
    
    const intersection2 = {
      x: lineStartX + t2 * dx,
      y: lineStartY + t2 * dy
    }
    
    // Return the intersection point that's in the direction of the line
    const lineLength = Math.sqrt(dx * dx + dy * dy)
    const dist1 = Math.sqrt((intersection1.x - lineStartX) ** 2 + (intersection1.y - lineStartY) ** 2)
    const dist2 = Math.sqrt((intersection2.x - lineStartX) ** 2 + (intersection2.y - lineStartY) ** 2)
    
    // Return the intersection point that's further along the line direction
    return dist1 > dist2 ? intersection1 : intersection2
  }

  // Calculate intersection between line segment and ellipse
  const calculateLineSegmentEllipseIntersection = (lineStartX, lineStartY, lineEndX, lineEndY, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) => {
    // Translate line to ellipse coordinate system
    const dx = lineEndX - lineStartX
    const dy = lineEndY - lineStartY
    const translatedStartX = lineStartX - ellipseCenterX
    const translatedStartY = lineStartY - ellipseCenterY
    
    // Normalize ellipse to unit circle
    const normalizedStartX = translatedStartX / ellipseRadiusX
    const normalizedStartY = translatedStartY / ellipseRadiusY
    const normalizedDx = dx / ellipseRadiusX
    const normalizedDy = dy / ellipseRadiusY
    
    // Solve quadratic equation for intersection
    const a = normalizedDx * normalizedDx + normalizedDy * normalizedDy
    const b = 2 * (normalizedStartX * normalizedDx + normalizedStartY * normalizedDy)
    const c = normalizedStartX * normalizedStartX + normalizedStartY * normalizedStartY - 1
    
    const discriminant = b * b - 4 * a * c
    
    if (discriminant < 0) {
      // No intersection
      return null
    }
    
    const sqrtDiscriminant = Math.sqrt(discriminant)
    const t1 = (-b + sqrtDiscriminant) / (2 * a)
    const t2 = (-b - sqrtDiscriminant) / (2 * a)
    
    // Convert back to original coordinate system
    const intersection1 = {
      x: lineStartX + t1 * dx,
      y: lineStartY + t1 * dy
    }
    
    const intersection2 = {
      x: lineStartX + t2 * dx,
      y: lineStartY + t2 * dy
    }
    
    // For line segment, we want the intersection point that's in the direction of the line
    // Check which intersection is closer to the line end point
    const dist1 = Math.sqrt((intersection1.x - lineEndX) ** 2 + (intersection1.y - lineEndY) ** 2)
    const dist2 = Math.sqrt((intersection2.x - lineEndX) ** 2 + (intersection2.y - lineEndY) ** 2)
    
    // Return the intersection point that's closer to the line end point
    // This ensures we get the intersection in the direction of the line segment
    return dist1 < dist2 ? intersection1 : intersection2
  }

  // Step 1: Calculate reference circle through two ellipse centers
  const calculateReferenceCircle = (center1X, center1Y, center2X, center2Y) => {
    // The reference circle passes through both centers
    // Its center is the midpoint of the line between centers
    const centerX = (center1X + center2X) / 2
    const centerY = (center1Y + center2Y) / 2
    
    // Its radius is half the distance between centers
    const radius = Math.sqrt((center2X - center1X) ** 2 + (center2Y - center1Y) ** 2) / 2
    
    return { centerX, centerY, radius }
  }

  // Step 2: Find intersections between circle and ellipse
  const findCircleEllipseIntersections = (circleCenterX, circleCenterY, circleRadius, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) => {
    console.log('🔍 Finding circle-ellipse intersections for:', {
      circleCenter: { x: circleCenterX, y: circleCenterY },
      circleRadius,
      ellipseCenter: { x: ellipseCenterX, y: ellipseCenterY },
      ellipseRadii: { x: ellipseRadiusX, y: ellipseRadiusY }
    })
    
    // Method: Find intersections by checking multiple points around the circle
    const intersections = []
    const numPoints = 360 // Check every degree around the circle
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / numPoints
      
      // Point on the circle
      const circlePointX = circleCenterX + circleRadius * Math.cos(angle)
      const circlePointY = circleCenterY + circleRadius * Math.sin(angle)
      
      // Check if this point is on the ellipse
      const dx = circlePointX - ellipseCenterX
      const dy = circlePointY - ellipseCenterY
      const normalizedX = dx / ellipseRadiusX
      const normalizedY = dy / ellipseRadiusY
      const distance = normalizedX * normalizedX + normalizedY * normalizedY
      
      // If distance is close to 1, this point is on the ellipse
      if (Math.abs(distance - 1) < 0.1) {
        const intersection = { x: circlePointX, y: circlePointY }
        
        // Check if this intersection is already found (avoid duplicates)
        const isDuplicate = intersections.some(existing => 
          Math.abs(existing.x - intersection.x) < 1 && Math.abs(existing.y - intersection.y) < 1
        )
        
        if (!isDuplicate) {
          intersections.push(intersection)
          console.log('🔍 Found intersection:', intersection)
        }
      }
    }
    
    console.log('🔍 Total intersections found:', intersections.length)
    return intersections
  }

  // Find intersection points that lie inside the convex hull of the Bezier curve
  const findConvexHullIntersection = (controlPoint, ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY) => {
    // Calculate the direction from control point to ellipse center
    const dx = ellipseCenterX - controlPoint.x
    const dy = ellipseCenterY - controlPoint.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return null
    
    // Normalize direction
    const dirX = dx / distance
    const dirY = dy / distance
    
    // Find intersection using the line from control point to ellipse center
    const intersection = calculateEllipseIntersection(
      controlPoint.x, controlPoint.y, ellipseCenterX, ellipseCenterY,
      ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
    )
    
    if (!intersection) return null
    
    // Check if the intersection point lies between control point and ellipse center
    // This ensures it's inside the convex hull of the Bezier curve
    const intersectionToControl = {
      x: intersection.x - controlPoint.x,
      y: intersection.y - controlPoint.y
    }
    
    const intersectionToCenter = {
      x: intersection.x - ellipseCenterX,
      y: intersection.y - ellipseCenterY
    }
    
    // Check if intersection is between control point and center
    // by verifying the dot products have opposite signs
    const dot1 = intersectionToControl.x * dirX + intersectionToControl.y * dirY
    const dot2 = intersectionToCenter.x * dirX + intersectionToCenter.y * dirY
    
    // If dot1 is positive and dot2 is negative, intersection is between them
    if (dot1 > 0 && dot2 < 0) {
      return intersection
    }
    
    // If not, find the other intersection point
    // Extend the line beyond the ellipse center
    const extendedPoint = {
      x: ellipseCenterX + dirX * distance,
      y: ellipseCenterY + dirY * distance
    }
    
    const otherIntersection = calculateEllipseIntersection(
      extendedPoint.x, extendedPoint.y, ellipseCenterX, ellipseCenterY,
      ellipseCenterX, ellipseCenterY, ellipseRadiusX, ellipseRadiusY
    )
    
    return otherIntersection
  }


  // Render construction objects for dev mode
  const renderConstructionObjects = () => {
    if (!devMode) return null
    
    return storeEdges.map(edge => {
      const sourceNode = storeNodes.find(n => n.id === edge.source)
      const targetNode = storeNodes.find(n => n.id === edge.target)
      
      if (!sourceNode || !targetNode) return null
      
      const sourceEllipse = getEllipseDimensions(sourceNode)
      const targetEllipse = getEllipseDimensions(targetNode)
      
      const sourceCenterX = sourceEllipse.x
      const sourceCenterY = sourceEllipse.y
      const targetCenterX = targetEllipse.x
      const targetCenterY = targetEllipse.y
      
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
    return storeNodes.map(node => (
      <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`} data-node-id={node.id}>
        <CLDNode 
          id={node.id}
          data={node.data}
          selected={selectedNode === node.id}
          onClick={(e) => handleNodeClick(node.id, e)}
          onMouseDown={(e) => handleNodeMouseDown(e, node)}
          devMode={devMode}
          isFromNode={isCreatingConnection && connectionSource === node.id}
          isCreatingConnection={isCreatingConnection}
          isRightMouseDown={isRightMouseDown}
        />
      </g>
    ))
  }

  // Render edges
  const renderEdges = () => {
    console.log('🔍 Rendering edges. Total edges:', storeEdges.length)
    
    return storeEdges.map(edge => {
      const sourceNode = storeNodes.find(n => n.id === edge.source)
      const targetNode = storeNodes.find(n => n.id === edge.target)
      
      if (!sourceNode || !targetNode) {
        console.log('❌ Missing source or target node for edge:', edge.id)
        return null
      }
      
      const sourceEllipse = getEllipseDimensions(sourceNode)
      const targetEllipse = getEllipseDimensions(targetNode)
      
      const sourceCenterX = sourceEllipse.x
      const sourceCenterY = sourceEllipse.y
      const targetCenterX = targetEllipse.x
      const targetCenterY = targetEllipse.y
      
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
      const arrowColor = edge.data?.color || '#6b7280' // Use individual edge color or default gray
      
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
      
      console.log('🎯 Rendering edge:', edge.id, 'with path:', arcPath)
      
      return (
        <g key={edge.id}>
          {/* Edge path with wider hit area */}
          <path
            d={arcPath}
            stroke="transparent"
            strokeWidth="20"
            fill="none"
            cursor="pointer"
            onClick={() => setSelectedEdge(edge.id)}
            onMouseEnter={(event) => {
              if (selectedEdge !== edge.id) {
                // Add hover effect - increase stroke width of visual path
                const visualPath = event.target.nextElementSibling
                if (visualPath) {
                  visualPath.setAttribute('stroke-width', globalStyles.arrowWidth + 1)
                }
              }
            }}
            onMouseLeave={(event) => {
              if (selectedEdge !== edge.id) {
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
            strokeWidth={selectedEdge === edge.id ? globalStyles.arrowWidth + 2 : globalStyles.arrowWidth}
            fill="none"
            markerEnd={`url(#arrowhead-${edge.id})`}
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Individual arrowhead marker for this edge */}
          <defs>
            <marker
              id={`arrowhead-${edge.id}`}
              markerWidth="20"
              markerHeight="14"
              refX="14"
              refY="7"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon
                points="0 0, 20 7, 0 14"
                fill={arrowColor}
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
              stroke="white"
              strokeWidth={devMode ? "2" : "3"}
              cursor="move"
              onMouseDown={(e) => handleDummyControlPointMouseDown(e, edge.id, controlPoint)}
            />
          )}
        </g>
      )
    })
  }

  return (
    <div className="canvas-container" ref={canvasRef}>
      {/* Dev mode toggle */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px',
        fontSize: '12px'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={devMode}
            onChange={(e) => setDevMode(e.target.checked)}
          />
          Dev Mode
        </label>
      </div>
      

      
      <svg
        width="100%"
        height="100%"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleCanvasWheel}
        onContextMenu={(e) => e.preventDefault()}
        style={{ 
          cursor: isRightMouseDown ? 'crosshair' : (isDragging ? 'grabbing' : 'default'),
          userSelect: 'none'
        }}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
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
        
        <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}>
          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Construction objects (dev mode) */}
          {renderConstructionObjects()}
          
          {/* Edges */}
          {renderEdges()}
          
          {/* Nodes */}
          {renderNodes()}
        </g>
      </svg>
    </div>
  )
}

export default Canvas
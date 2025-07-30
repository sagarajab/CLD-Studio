/**
 * Thumbnail Generator for CLD Diagrams
 * Generates SVG thumbnails for diagram previews
 */

export function generateDiagramThumbnail(diagramData, options = {}) {
  const {
    width = 300,
    height = 200,
    padding = 20,
    nodeRadius = 25,
    strokeWidth = 2,
    fontSize = 12
  } = options

  const { nodes = [], edges = [], globalStyles = {} } = diagramData
  
  // Calculate bounds to fit all nodes
  const bounds = calculateBounds(nodes, padding)
  const scale = Math.min(
    (width - 2 * padding) / (bounds.width || 1),
    (height - 2 * padding) / (bounds.height || 1)
  )
  
  // Generate SVG content
  const svgContent = generateSVGContent(nodes, edges, bounds, scale, {
    width,
    height,
    padding,
    nodeRadius,
    strokeWidth,
    fontSize,
    globalStyles
  })
  
  return svgContent
}

function calculateBounds(nodes, padding) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 }
  }
  
  const positions = nodes.map(node => node.position || { x: 0, y: 0 })
  const minX = Math.min(...positions.map(p => p.x)) - padding
  const minY = Math.min(...positions.map(p => p.y)) - padding
  const maxX = Math.max(...positions.map(p => p.x)) + padding
  const maxY = Math.max(...positions.map(p => p.y)) + padding
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  }
}

function generateSVGContent(nodes, edges, bounds, scale, options) {
  const {
    width,
    height,
    padding,
    nodeRadius,
    strokeWidth,
    fontSize,
    globalStyles
  } = options
  
  const nodeColor = globalStyles.nodeColor || '#3B82F6'
  const edgeColor = globalStyles.edgeColor || '#6B7280'
  const backgroundColor = globalStyles.backgroundColor || '#FFFFFF'
  
  // Generate nodes
  const nodeElements = nodes.map(node => {
    const x = (node.position.x - bounds.minX) * scale + padding
    const y = (node.position.y - bounds.minY) * scale + padding
    const color = node.color || nodeColor
    
    return `
      <circle 
        cx="${x}" 
        cy="${y}" 
        r="${nodeRadius}" 
        fill="${color}" 
        stroke="#374151" 
        stroke-width="${strokeWidth}"
      />
      <text 
        x="${x}" 
        y="${y + fontSize/3}" 
        text-anchor="middle" 
        font-size="${fontSize}" 
        font-family="Arial, sans-serif" 
        fill="white" 
        font-weight="bold"
      >
        ${node.label || 'Node'}
      </text>
    `
  }).join('')
  
  // Generate edges
  const edgeElements = edges.map(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return ''
    
    const sourceX = (sourceNode.position.x - bounds.minX) * scale + padding
    const sourceY = (sourceNode.position.y - bounds.minY) * scale + padding
    const targetX = (targetNode.position.x - bounds.minX) * scale + padding
    const targetY = (targetNode.position.y - bounds.minY) * scale + padding
    
    // Calculate edge path
    const dx = targetX - sourceX
    const dy = targetY - sourceY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return ''
    
    // Adjust endpoints to node boundaries
    const angle = Math.atan2(dy, dx)
    const startX = sourceX + Math.cos(angle) * nodeRadius
    const startY = sourceY + Math.sin(angle) * nodeRadius
    const endX = targetX - Math.cos(angle) * nodeRadius
    const endY = targetY - Math.sin(angle) * nodeRadius
    
    // Create curved path
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const curveOffset = Math.min(distance * 0.3, 30)
    const controlX = midX - Math.sin(angle) * curveOffset
    const controlY = midY + Math.cos(angle) * curveOffset
    
    const path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
    
    // Edge polarity indicator
    const polarity = edge.polarity || 'positive'
    const polarityColor = polarity === 'positive' ? '#10B981' : '#EF4444'
    const polaritySymbol = polarity === 'positive' ? '+' : '-'
    
    return `
      <path 
        d="${path}" 
        stroke="${edgeColor}" 
        stroke-width="${strokeWidth}" 
        fill="none"
        marker-end="url(#arrowhead)"
      />
      <text 
        x="${controlX}" 
        y="${controlY - 5}" 
        text-anchor="middle" 
        font-size="${fontSize - 2}" 
        font-family="Arial, sans-serif" 
        fill="${polarityColor}" 
        font-weight="bold"
      >
        ${polaritySymbol}
      </text>
    `
  }).join('')
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="${edgeColor}"
          />
        </marker>
      </defs>
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      ${edgeElements}
      ${nodeElements}
    </svg>
  `
}

/**
 * Convert SVG string to data URL for use as image source
 */
export function svgToDataURL(svgString) {
  const encoded = encodeURIComponent(svgString)
  return `data:image/svg+xml;charset=utf-8,${encoded}`
}

/**
 * Generate thumbnail for a specific example
 */
export function generateExampleThumbnail(exampleId, diagramData) {
  const svgContent = generateDiagramThumbnail(diagramData, {
    width: 300,
    height: 200,
    padding: 20,
    nodeRadius: 20,
    strokeWidth: 2,
    fontSize: 10
  })
  
  return svgToDataURL(svgContent)
} 
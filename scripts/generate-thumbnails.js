/**
 * Script to generate static thumbnail files for CLD examples
 * Run with: node scripts/generate-thumbnails.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple SVG generator for thumbnails
function generateSVGThumbnail(diagramData, options = {}) {
  const {
    width = 300,
    height = 200,
    padding = 20,
    nodeRadius = 20,
    strokeWidth = 2,
    fontSize = 10
  } = options

  const { nodes = [], edges = [], globalStyles = {} } = diagramData
  
  // Calculate bounds
  const positions = nodes.map(node => node.position || { x: 0, y: 0 })
  const minX = Math.min(...positions.map(p => p.x)) - padding
  const minY = Math.min(...positions.map(p => p.y)) - padding
  const maxX = Math.max(...positions.map(p => p.x)) + padding
  const maxY = Math.max(...positions.map(p => p.y)) + padding
  
  const boundsWidth = maxX - minX
  const boundsHeight = maxY - minY
  const scale = Math.min(
    (width - 2 * padding) / (boundsWidth || 1),
    (height - 2 * padding) / (boundsHeight || 1)
  )
  
  const nodeColor = globalStyles.nodeColor || '#3B82F6'
  const edgeColor = globalStyles.edgeColor || '#6B7280'
  const backgroundColor = globalStyles.backgroundColor || '#FFFFFF'
  
  // Generate nodes
  const nodeElements = nodes.map(node => {
    const x = (node.position.x - minX) * scale + padding
    const y = (node.position.y - minY) * scale + padding
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
    
    const sourceX = (sourceNode.position.x - minX) * scale + padding
    const sourceY = (sourceNode.position.y - minY) * scale + padding
    const targetX = (targetNode.position.x - minX) * scale + padding
    const targetY = (targetNode.position.y - minY) * scale + padding
    
    const dx = targetX - sourceX
    const dy = targetY - sourceY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance === 0) return ''
    
    const angle = Math.atan2(dy, dx)
    const startX = sourceX + Math.cos(angle) * nodeRadius
    const startY = sourceY + Math.sin(angle) * nodeRadius
    const endX = targetX - Math.cos(angle) * nodeRadius
    const endY = targetY - Math.sin(angle) * nodeRadius
    
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const curveOffset = Math.min(distance * 0.3, 30)
    const controlX = midX - Math.sin(angle) * curveOffset
    const controlY = midY + Math.cos(angle) * curveOffset
    
    const path = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
    
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
  
  return `<?xml version="1.0" encoding="UTF-8"?>
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
</svg>`
}

async function generateThumbnails() {
  try {
    // Read examples index
    const indexPath = path.join(__dirname, '../public/examples/index.json')
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    
    // Create thumbnails directory
    const thumbnailsDir = path.join(__dirname, '../public/examples/thumbnails')
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true })
    }
    
    console.log('Generating thumbnails for examples...')
    
    for (const example of indexData.examples) {
      try {
        // Read the .cld file
        const cldPath = path.join(__dirname, '../public/examples', example.filename)
        const diagramData = JSON.parse(fs.readFileSync(cldPath, 'utf8'))
        
        // Generate SVG thumbnail
        const svgContent = generateSVGThumbnail(diagramData, {
          width: 300,
          height: 200,
          padding: 20,
          nodeRadius: 20,
          strokeWidth: 2,
          fontSize: 10
        })
        
        // Save thumbnail file
        const thumbnailPath = path.join(thumbnailsDir, `${example.id}.svg`)
        fs.writeFileSync(thumbnailPath, svgContent)
        
        console.log(`✓ Generated thumbnail for ${example.name}`)
      } catch (error) {
        console.error(`✗ Error generating thumbnail for ${example.name}:`, error.message)
      }
    }
    
    console.log('\nThumbnail generation complete!')
    console.log(`Thumbnails saved to: ${thumbnailsDir}`)
    
  } catch (error) {
    console.error('Error generating thumbnails:', error)
  }
}

// Run the script
generateThumbnails() 
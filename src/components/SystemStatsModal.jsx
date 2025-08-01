import React, { useMemo, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'

function SystemStatsModal({ isOpen, onClose }) {
  const { 
    nodes, 
    edges, 
    allLoops,
    setHoveredNode,
    clearHoveredNode,
    setHighlightedLoop,
    clearHighlightedLoop
  } = useCLDStore()

  // Calculate in/out counts for nodes
  const nodeAnalysis = useMemo(() => {
    return nodes.map(node => {
      const inCount = edges.filter(edge => edge.target === node.id).length
      const outCount = edges.filter(edge => edge.source === node.id).length
      
      return {
        id: node.id,
        label: node.data?.label || 'Unnamed',
        inCount,
        outCount
      }
    })
  }, [nodes, edges])

  // Calculate system statistics
  const systemStats = useMemo(() => {
    const totalNodes = nodes.length
    const totalConnections = edges.length
    const avgConnectionsPerNode = totalNodes > 0 ? (totalConnections / totalNodes).toFixed(2) : 0
    const positiveConnections = edges.filter(edge => edge.data?.polarity === 'positive').length
    const negativeConnections = edges.filter(edge => edge.data?.polarity === 'negative').length
    
    // Find node with maximum out connections
    const maxOutNode = nodeAnalysis.length > 0 ? 
      nodeAnalysis.reduce((max, node) => node.outCount > max.outCount ? node : max) : null
    
    // Find node with maximum in connections
    const maxInNode = nodeAnalysis.length > 0 ? 
      nodeAnalysis.reduce((max, node) => node.inCount > max.inCount ? node : max) : null
    
    return {
      totalNodes,
      totalConnections,
      avgConnectionsPerNode,
      positiveConnections,
      negativeConnections,
      maxOutNode: maxOutNode ? { label: maxOutNode.label, count: maxOutNode.outCount, id: maxOutNode.id } : null,
      maxInNode: maxInNode ? { label: maxInNode.label, count: maxInNode.inCount, id: maxInNode.id } : null,
      topLoopsCount: allLoops.length
    }
  }, [nodes, edges, nodeAnalysis, allLoops])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>System Statistics</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="modal-table-container">
            <table className="analysis-table modal-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="metric-cell">Total Nodes</td>
                  <td className="value-cell">{systemStats.totalNodes}</td>
                </tr>
                <tr>
                  <td className="metric-cell">Total Connections</td>
                  <td className="value-cell">{systemStats.totalConnections}</td>
                </tr>
                <tr>
                  <td className="metric-cell">Avg Connections/Node</td>
                  <td className="value-cell">{systemStats.avgConnectionsPerNode}</td>
                </tr>
                <tr>
                  <td className="metric-cell">Positive Connections</td>
                  <td className="value-cell positive">{systemStats.positiveConnections}</td>
                </tr>
                <tr>
                  <td className="metric-cell">Negative Connections</td>
                  <td className="value-cell negative">{systemStats.negativeConnections}</td>
                </tr>
                <tr
                  onMouseEnter={() => {
                    if (systemStats.maxOutNode) {
                      setHoveredNode(systemStats.maxOutNode.id)
                    }
                  }}
                  onMouseLeave={() => clearHoveredNode()}
                >
                  <td className="metric-cell">Max Out Connections</td>
                  <td className="value-cell">{systemStats.maxOutNode ? `${systemStats.maxOutNode.label} (${systemStats.maxOutNode.count})` : 'N/A'}</td>
                </tr>
                <tr
                  onMouseEnter={() => {
                    if (systemStats.maxInNode) {
                      setHoveredNode(systemStats.maxInNode.id)
                    }
                  }}
                  onMouseLeave={() => clearHoveredNode()}
                >
                  <td className="metric-cell">Max In Connections</td>
                  <td className="value-cell">{systemStats.maxInNode ? `${systemStats.maxInNode.label} (${systemStats.maxInNode.count})` : 'N/A'}</td>
                </tr>
                <tr
                  onMouseEnter={() => {
                    if (systemStats.topLoopsCount > 0 && allLoops.length > 0) {
                      // Highlight the first (longest) loop
                      setHighlightedLoop(0)
                    }
                  }}
                  onMouseLeave={() => clearHighlightedLoop()}
                >
                  <td className="metric-cell">Top Loops</td>
                  <td className="value-cell">{systemStats.topLoopsCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemStatsModal 
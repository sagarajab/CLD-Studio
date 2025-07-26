import React from 'react'

function StatusBar({ nodes, edges, mode, selectedNode, selectedEdge }) {
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString()
  }

  const getDiagramStats = () => {
    const totalNodes = nodes.length
    const totalEdges = edges.length
    const positiveEdges = edges.filter(edge => edge.data?.polarity === 'positive').length
    const negativeEdges = edges.filter(edge => edge.data?.polarity === 'negative').length
    
    return {
      totalNodes,
      totalEdges,
      positiveEdges,
      negativeEdges
    }
  }

  const stats = getDiagramStats()

  return (
    <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-300">
      {/* Left side - Diagram information */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Mode:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            mode === 'sandbox' 
              ? 'bg-blue-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {mode === 'sandbox' ? 'Sandbox' : 'Assessment'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Nodes: <span className="font-medium">{stats.totalNodes}</span></span>
          <span>Edges: <span className="font-medium">{stats.totalEdges}</span></span>
          {stats.totalEdges > 0 && (
            <>
              <span className="text-green-600">+{stats.positiveEdges}</span>
              <span className="text-red-600">−{stats.negativeEdges}</span>
            </>
          )}
        </div>

        {/* Selected item information */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">Selected:</span>
          <span className="text-gray-400">
            {selectedNode ? `Node ${selectedNode}` : 
             selectedEdge ? `Arrow ${selectedEdge}` : 
             'None'}
          </span>
        </div>
      </div>

      {/* Right side - Status information */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full status-indicator"></div>
          <span>Ready</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Last saved:</span>
          <span className="font-medium">Never</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span>{getCurrentTime()}</span>
        </div>
      </div>
    </div>
  )
}

export default StatusBar 
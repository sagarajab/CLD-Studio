import React from 'react'

function StatusBar({ nodes, edges, mode, selectedNode, selectedEdge, allLoops = [], isAuthenticated = false }) {
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
      {/* Left side - Message console and stats */}
      <div className="flex items-center space-x-6">
        {/* Message console (mode display) - extreme left */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">Mode:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            mode === 'sandbox' 
              ? 'bg-orange-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {mode === 'sandbox' ? 'Sandbox' : 'Assessment'}
          </span>
        </div>
        
        {/* Normal text labels for stats */}
        <div className="flex items-center space-x-4">
          <span>
            <span className="text-blue-400">Variables:</span> 
            <span className="font-medium text-blue-300 ml-1">{stats.totalNodes}</span>
          </span>
          <span>
            <span className="text-green-400">Connections:</span> 
            <span className="font-medium text-green-300 ml-1">{stats.totalEdges}</span>
          </span>
          <span>
            <span className="text-purple-400">Loops:</span> 
            <span className="font-medium text-purple-300 ml-1">{allLoops.length}</span>
          </span>
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
        
        {/* Auth LED Indicator */}
        <div className="flex items-center space-x-2">
          <span>Auth:</span>
          <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
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
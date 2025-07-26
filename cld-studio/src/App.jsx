import { useState, useMemo } from 'react'
import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import Canvas from './components/Canvas'
import SysLoopHeader from './components/SysLoopHeader'
import SysLoopSidebar from './components/SysLoopSidebar'
import { useCLDStore } from './stores/cldStore'

function App() {
  const [mode, setMode] = useState('sandbox')
  const { nodes, edges, selectedNode, selectedEdge, viewTransform } = useCLDStore()

  // Calculate loops for status bar
  const loops = useMemo(() => {
    if (nodes.length === 0 || edges.length === 0) return []
    
    const graph = new Map()
    const visited = new Set()
    const loops = []

    edges.forEach(edge => {
      if (!graph.has(edge.source)) {
        graph.set(edge.source, [])
      }
      graph.get(edge.source).push({
        target: edge.target,
        polarity: edge.data?.polarity || 'positive'
      })
    })

    const dfs = (node, path, polarities) => {
      if (path.includes(node)) {
        const cycleStart = path.indexOf(node)
        const cycle = path.slice(cycleStart)
        const cyclePolarities = polarities.slice(cycleStart)
        
        const negativeCount = cyclePolarities.filter(p => p === 'negative').length
        const loopType = negativeCount % 2 === 0 ? 'Reinforcing' : 'Balancing'

        loops.push({
          nodes: cycle,
          polarities: cyclePolarities,
          type: loopType,
          length: cycle.length
        })
        return
      }

      if (visited.has(node)) return
      visited.add(node)
      path.push(node)

      const neighbors = graph.get(node) || []
      neighbors.forEach(neighbor => {
        polarities.push(neighbor.polarity)
        dfs(neighbor.target, [...path], [...polarities])
        polarities.pop()
      })
    }

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, [], [])
      }
    })

    return loops
  }, [nodes, edges])

  return (
    <div className="sysloop-app">
      {/* Header */}
      <SysLoopHeader mode={mode} setMode={setMode} />

      {/* Main Content */}
      <div className="main-layout">
        {/* Left Sidebar */}
        <SysLoopSidebar mode={mode} loops={loops} />
        
        {/* Main Canvas */}
        <div className="canvas-area">
          <ReactFlowProvider>
            <Canvas mode={mode} />
          </ReactFlowProvider>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <div className="status-item variables">
            <span className="status-count">{nodes.length}</span>
            <span className="status-label">Variables</span>
          </div>
          <div className="status-item connections">
            <span className="status-count">{edges.length}</span>
            <span className="status-label">Connections</span>
          </div>
          <div className="status-item loops">
            <span className="status-count">{loops.length}</span>
            <span className="status-label">Loops</span>
          </div>
          <div className="status-item selected">
            <span className="status-label">Selected:</span>
            <span className="status-text">
              {selectedNode ? `Node ${selectedNode}` : 
               selectedEdge ? `Arrow ${selectedEdge}` : 
               'None'}
            </span>
          </div>
        </div>
        <div className="status-right">
          <span className="status-text">No loop highlighted</span>
          <div className="status-controls">
            <span className="zoom-level">{Math.round(viewTransform.scale * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

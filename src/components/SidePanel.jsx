import React, { useMemo } from 'react'
import { useCLDStore } from '../stores/cldStore'

function SidePanel({ mode }) {
  const { nodes, edges, currentProblem } = useCLDStore()

  // Detect loops in the diagram
  const loops = useMemo(() => {
    if (nodes.length === 0 || edges.length === 0) return []

    const graph = new Map()
    const visited = new Set()
    const loops = []

    // Build adjacency list
    edges.forEach(edge => {
      if (!graph.has(edge.source)) {
        graph.set(edge.source, [])
      }
      graph.get(edge.source).push({
        target: edge.target,
        polarity: edge.data?.polarity || 'positive'
      })
    })

    // DFS to find cycles
    const dfs = (node, path, polarities) => {
      if (path.includes(node)) {
        const cycleStart = path.indexOf(node)
        const cycle = path.slice(cycleStart)
        const cyclePolarities = polarities.slice(cycleStart)
        
        // Calculate loop type (reinforcing or balancing)
        const negativeCount = cyclePolarities.filter(p => p === 'negative').length
        
        let loopType = 'Unknown'
        if (negativeCount % 2 === 0) {
          loopType = 'Reinforcing'
        } else {
          loopType = 'Balancing'
        }

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

    // Find cycles starting from each node
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, [], [])
      }
    })

    return loops
  }, [nodes, edges])

  // Sample problem statements for demonstration
  const problemStatements = {
    sandbox: {
      title: "Sandbox Mode",
      description: "Free-form causal loop diagram creation. Explore system dynamics and create models to understand complex relationships.",
      objectives: [
        "Create nodes representing system variables",
        "Connect variables with causal relationships",
        "Set appropriate polarities (+ or -)",
        "Identify reinforcing and balancing loops",
        "Analyze system behavior patterns"
      ]
    },
    assessment: {
      title: currentProblem?.title || "Assessment Mode",
      description: currentProblem?.description || "Complete the diagram according to the problem requirements and submit for assessment.",
      objectives: [
        "Follow the problem statement carefully",
        "Include all required variables",
        "Create correct causal relationships",
        "Set proper polarities",
        "Submit when complete"
      ]
    }
  }

  const currentProblemInfo = problemStatements[mode]

  return (
    <div className="side-panel">
      {/* Problem Statement Section */}
      <div className="panel-section">
        <div className="panel-title">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Problem Statement
        </div>
        <div className="panel-content">
          <h3 className="problem-title">{currentProblemInfo.title}</h3>
          <p className="problem-description">{currentProblemInfo.description}</p>
          
          <div className="objectives-list">
            <h4 className="objectives-title">Objectives:</h4>
            <ul className="objectives-items">
              {currentProblemInfo.objectives.map((objective, index) => (
                <li key={index} className="objective-item">
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Loops Section */}
      <div className="panel-section">
        <div className="panel-content">
          {loops.length === 0 ? (
            <div className="no-loops">
              <p className="no-loops-text">No loops detected yet.</p>
              <p className="no-loops-hint">Create connections between nodes to form loops.</p>
            </div>
          ) : (
            <div className="loops-list">
              {loops.map((loop, index) => (
                <div key={index} className="loop-item">
                  <div className="loop-header">
                    <span className={`loop-type ${loop.type.toLowerCase()}`}>
                      {loop.type} Loop
                    </span>
                    <span className="loop-length">{loop.length} nodes</span>
                  </div>
                  <div className="loop-path">
                    {loop.nodes.map((nodeId, nodeIndex) => {
                      const node = nodes.find(n => n.id === nodeId)
                      const polarity = loop.polarities[nodeIndex]
                      return (
                        <React.Fragment key={nodeId}>
                          <span className="loop-node">{node?.data?.label || nodeId}</span>
                          {nodeIndex < loop.nodes.length - 1 && (
                            <span className={`loop-arrow ${polarity}`}>
                              {polarity === 'positive' ? '→' : '⟷'}
                            </span>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </div>
                  <div className="loop-summary">
                    <span className="loop-polarity">
                      {loop.polarities.filter(p => p === 'positive').length} positive, 
                      {loop.polarities.filter(p => p === 'negative').length} negative
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loop Analysis */}
      {loops.length > 0 && (
        <div className="panel-section">
          <div className="panel-title">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Loop Analysis
          </div>
          <div className="panel-content">
            <div className="analysis-stats">
              <div className="stat-row">
                <span className="stat-label">Total Loops:</span>
                <span className="stat-value">{loops.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Reinforcing:</span>
                <span className="stat-value reinforcing">
                  {loops.filter(l => l.type === 'Reinforcing').length}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Balancing:</span>
                <span className="stat-value balancing">
                  {loops.filter(l => l.type === 'Balancing').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SidePanel 
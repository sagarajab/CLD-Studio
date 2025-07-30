import React, { useState } from 'react'
import { useCLDStore } from '../stores/cldStore'

// Sample problems for demonstration
const sampleProblems = [
  {
    id: 1,
    title: 'Population Growth',
    description: 'Model population dynamics with resources and growth rate.',
    nodes: [
      { id: 1, label: 'Population', type: 'variable' },
      { id: 2, label: 'Birth Rate', type: 'variable' },
      { id: 3, label: 'Death Rate', type: 'variable' },
      { id: 4, label: 'Resources', type: 'variable' }
    ],
    edges: [
      { id: 1, source: 1, target: 2, polarity: 'positive' },
      { id: 2, source: 2, target: 1, polarity: 'positive' },
      { id: 3, source: 1, target: 3, polarity: 'positive' },
      { id: 4, source: 3, target: 1, polarity: 'negative' },
      { id: 5, source: 1, target: 4, polarity: 'negative' },
      { id: 6, source: 4, target: 2, polarity: 'positive' }
    ]
  },
  {
    id: 2,
    title: 'Market Competition',
    description: 'Model competitive dynamics between companies.',
    nodes: [
      { id: 1, label: 'Company A Share', type: 'variable' },
      { id: 2, label: 'Company B Share', type: 'variable' },
      { id: 3, label: 'Price Competition', type: 'variable' },
      { id: 4, label: 'Customer Satisfaction', type: 'variable' }
    ],
    edges: [
      { id: 1, source: 1, target: 3, polarity: 'negative' },
      { id: 2, source: 3, target: 2, polarity: 'positive' },
      { id: 3, source: 2, target: 3, polarity: 'negative' },
      { id: 4, source: 3, target: 1, polarity: 'positive' },
      { id: 5, source: 1, target: 4, polarity: 'positive' },
      { id: 6, source: 4, target: 1, polarity: 'positive' }
    ]
  }
]

function CompactSidebar({ mode }) {
  const { loadProblem, currentProblem, nodes, edges } = useCLDStore()
  const [selectedProblem, setSelectedProblem] = useState(null)

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem)
    loadProblem(problem)
  }

  const getNodeTypeCount = (type) => {
    return nodes.filter(node => node.data?.type === type).length
  }

  const getPolarityCount = (polarity) => {
    return edges.filter(edge => edge.data?.polarity === polarity).length
  }

  return (
    <div className="compact-sidebar">
      {/* Mode Info */}
      <div className="sidebar-section">
        <div className="sidebar-title">
          {mode === 'sandbox' ? 'Sandbox Mode' : 'Assessment Mode'}
        </div>
        <div className="sidebar-content">
          {mode === 'sandbox' 
            ? 'Free-form diagram creation and exploration'
            : 'Complete problems and get assessed'
          }
        </div>
      </div>

      {/* Assessment Problems */}
      {mode === 'assessment' && (
        <div className="sidebar-section">
          <div className="sidebar-title">Available Problems</div>
          <div className="space-y-2">
            {sampleProblems.map((problem) => (
              <div
                key={problem.id}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  selectedProblem?.id === problem.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleProblemSelect(problem)}
              >
                <div className="font-medium text-sm text-gray-900">{problem.title}</div>
                <div className="text-xs text-gray-600 mt-1">{problem.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Problem */}
      {currentProblem && mode === 'assessment' && (
        <div className="sidebar-section">
          <div className="sidebar-title">Current Problem</div>
          <div className="bg-orange-50 p-2 rounded border border-orange-200">
            <div className="font-medium text-sm text-orange-900">{currentProblem.title}</div>
            <div className="text-xs text-orange-700 mt-1">{currentProblem.description}</div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="sidebar-section">
        <div className="sidebar-title">Statistics</div>
        <div className="stat-grid">
          <div className="stat-item">
            <div className="stat-label">Nodes</div>
            <div className="stat-value">{nodes.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Edges</div>
            <div className="stat-value">{edges.length}</div>
          </div>
          {nodes.length > 0 && (
            <>
              <div className="stat-item">
                <div className="stat-label">Variables</div>
                <div className="stat-value">{getNodeTypeCount('variable')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Constants</div>
                <div className="stat-value">{getNodeTypeCount('constant')}</div>
              </div>
            </>
          )}
          {edges.length > 0 && (
            <>
              <div className="stat-item">
                <div className="stat-label">Positive</div>
                <div className="stat-value text-green-600">{getPolarityCount('positive')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Negative</div>
                <div className="stat-value text-red-600">{getPolarityCount('negative')}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="sidebar-section">
        <div className="sidebar-title">Instructions</div>
        <div className="sidebar-content space-y-1">
          {mode === 'sandbox' ? (
            <>
              <div>• Click canvas to add nodes</div>
              <div>• Drag nodes to reposition</div>
              <div>• Connect nodes by dragging handles</div>
              <div>• Click edges to toggle polarity</div>
              <div>• Double-click nodes to edit</div>
            </>
          ) : (
            <>
              <div>• Select a problem above</div>
              <div>• Complete the diagram</div>
              <div>• Ensure correct polarity</div>
              <div>• Submit when finished</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompactSidebar 
import React, { useState } from 'react'
import { useCLDStore } from '../stores/cldStore'

// Sample problems for demonstration
const sampleProblems = [
  {
    id: 1,
    title: 'Population Growth Model',
    description: 'Create a causal loop diagram showing the relationship between population, resources, and growth rate.',
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
    description: 'Model the competitive dynamics between two companies in a market.',
    nodes: [
      { id: 1, label: 'Company A Market Share', type: 'variable' },
      { id: 2, label: 'Company B Market Share', type: 'variable' },
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

function Sidebar({ mode }) {
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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col sidebar">
      <div className="sidebar-section">
        <h2 className="sidebar-title mb-2">
          {mode === 'sandbox' ? 'Sandbox Mode' : 'Assessment Mode'}
        </h2>
        <p className="text-sm text-gray-600">
          {mode === 'sandbox' 
            ? 'Free-form diagram creation and exploration'
            : 'Complete problems and get assessed'
          }
        </p>
      </div>

      {mode === 'assessment' && (
        <div className="sidebar-section">
          <h3 className="text-md font-medium text-gray-900 mb-3">Available Problems</h3>
          <div className="space-y-3">
            {sampleProblems.map((problem) => (
              <div
                key={problem.id}
                className={`problem-card cursor-pointer ${
                  selectedProblem?.id === problem.id ? 'selected' : ''
                }`}
                onClick={() => handleProblemSelect(problem)}
              >
                <h4 className="font-medium text-gray-900">{problem.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-section">
        <h3 className="text-md font-medium text-gray-900 mb-3">Diagram Statistics</h3>
        <div className="space-y-2">
          <div className="stat-card">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Nodes:</span>
              <span className="font-medium">{nodes.length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Edges:</span>
              <span className="font-medium">{edges.length}</span>
            </div>
          </div>
          
          {nodes.length > 0 && (
            <>
              <div className="border-t pt-2 mt-2">
                <div className="text-xs font-medium text-gray-500 mb-1">Node Types:</div>
                <div className="space-y-1">
                  <div className="stat-card">
                    <div className="flex justify-between text-xs">
                      <span>Variables:</span>
                      <span>{getNodeTypeCount('variable')}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="flex justify-between text-xs">
                      <span>Constants:</span>
                      <span>{getNodeTypeCount('constant')}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="flex justify-between text-xs">
                      <span>Parameters:</span>
                      <span>{getNodeTypeCount('parameter')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {edges.length > 0 && (
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs font-medium text-gray-500 mb-1">Edge Polarity:</div>
                  <div className="space-y-1">
                    <div className="stat-card">
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">Positive (+):</span>
                        <span>{getPolarityCount('positive')}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="flex justify-between text-xs">
                        <span className="text-red-600">Negative (−):</span>
                        <span>{getPolarityCount('negative')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {currentProblem && mode === 'assessment' && (
        <div className="sidebar-section">
          <h3 className="text-md font-medium text-gray-900 mb-2">Current Problem</h3>
          <div className="problem-card selected">
            <h4 className="font-medium text-blue-900">{currentProblem.title}</h4>
            <p className="text-sm text-blue-700 mt-1">{currentProblem.description}</p>
          </div>
        </div>
      )}

      <div className="flex-1 sidebar-section">
        <h3 className="text-md font-medium text-gray-900 mb-3">Instructions</h3>
        <div className="text-sm text-gray-600 space-y-2">
          {mode === 'sandbox' ? (
            <>
              <p>• Click anywhere on the canvas to add nodes</p>
              <p>• Drag nodes to reposition them</p>
              <p>• Connect nodes by dragging from one handle to another</p>
              <p>• Click edges to toggle polarity (+/−)</p>
              <p>• Double-click nodes to edit labels</p>
              <p>• Use the dropdown to change node types</p>
            </>
          ) : (
            <>
              <p>• Select a problem from the list above</p>
              <p>• Complete the diagram according to requirements</p>
              <p>• Ensure all connections have correct polarity</p>
              <p>• Submit when finished for assessment</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar 
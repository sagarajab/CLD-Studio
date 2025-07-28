import React, { useMemo } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function SimulationVisualization() {
  const { nodes, simulationMode, simulationState } = useCLDStore()
  
  // Create simple test data to ensure chart works
  const testData = useMemo(() => {
    if (nodes.length === 0) return []
    
    return [
      { step: 0, var1: 10, var2: 20 },
      { step: 1, var1: 15, var2: 25 },
      { step: 2, var1: 20, var2: 30 },
      { step: 3, var1: 25, var2: 35 },
      { step: 4, var1: 30, var2: 40 }
    ]
  }, [nodes.length])
  
  // Memoize colors to prevent regeneration
  const colors = useMemo(() => [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
    '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#800080', '#008000', '#000080', '#808000', '#800080'
  ], [])
  
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!simulationState.valueHistory || simulationState.valueHistory.length === 0) {
      console.log('No simulation data, using test data')
      return testData
    }
    
    const data = simulationState.valueHistory.map((values, stepIndex) => {
      const dataPoint = { step: stepIndex }
      nodes.forEach((node, nodeIndex) => {
        const nodeLabel = node.data.label || `Node ${node.id}`
        const value = values[nodeIndex]
        dataPoint[nodeLabel] = typeof value === 'number' ? value : 0
      })
      return dataPoint
    })
    
    console.log('Chart data prepared:', {
      dataLength: data.length,
      firstDataPoint: data[0],
      lastDataPoint: data[data.length - 1],
      nodeLabels: nodes.map(n => n.data.label || `Node ${n.id}`),
      valueHistoryLength: simulationState.valueHistory.length,
      firstHistoryEntry: simulationState.valueHistory[0],
      fullData: data // Log the complete data array
    })
    
    return data
  }, [simulationState.valueHistory, nodes, testData])
  
  if (!simulationMode) return null
  
  // Debug info
  console.log('SimulationVisualization render:', {
    simulationMode,
    hasStateVector: !!simulationState.stateVector.length,
    valueHistoryLength: simulationState.valueHistory?.length || 0,
    chartDataLength: chartData.length,
    nodesCount: nodes.length,
    chartData: chartData
  })
  
  return (
    <div className="simulation-visualization">
      <div className="simulation-charts">
        <h4>Node Values Over Time</h4>
        
        {/* Debug info */}
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Data points: {chartData.length} | Nodes: {nodes.length} | 
          History: {simulationState.valueHistory?.length || 0} | 
          Using: {simulationState.valueHistory?.length > 0 ? 'Simulation' : 'Test'} data
        </div>
        
        {/* Accumulated Values Chart */}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151' }}>Accumulated Values</h5>
          <div style={{ 
            width: '100%', 
            height: '250px', 
            border: '1px solid #ddd',
            backgroundColor: '#f9f9f9'
          }}>
            {chartData.length > 0 ? (
              <LineChart
                width={window.innerWidth > 1200 ? 600 : 400}
                height={230}
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="step" 
                  label={{ value: 'Simulation Step', position: 'insideBottom', offset: -5 }}
                  domain={[0, simulationState.maxSteps]}
                />
                <YAxis 
                  label={{ value: 'Accumulated Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                
                {/* Show test lines only when no simulation data */}
                {(!simulationState.valueHistory || simulationState.valueHistory.length === 0) && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="var1"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                      isAnimationActive={false}
                      animationDuration={0}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="var2"
                      stroke="#82ca9d"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                      isAnimationActive={false}
                      animationDuration={0}
                      connectNulls={false}
                    />
                  </>
                )}
                
                {/* Show simulation lines only when there is simulation data */}
                {simulationState.valueHistory?.length > 0 && nodes.map((node, index) => {
                  const nodeLabel = node.data.label || `Node ${node.id}`
                  return (
                    <Line
                      key={node.id}
                      type="monotone"
                      dataKey={nodeLabel}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                      animationDuration={0}
                      connectNulls={false}
                    />
                  )
                })}
              </LineChart>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#666',
                fontSize: '14px',
                textAlign: 'center',
                padding: '20px'
              }}>
                {nodes.length > 0 ? 
                  'Sample data shown. Initialize and run a simulation to see real data.' : 
                  'No nodes available. Add nodes to see the chart.'
                }
              </div>
            )}
          </div>
        </div>
        
        {/* State Vector (Increments) Chart */}
        {simulationState.valueHistory?.length > 0 && (
          <div>
            <h5 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151' }}>Current Increments (State Vector)</h5>
            <div style={{ 
              width: '100%', 
              height: '250px', 
              border: '1px solid #ddd',
              backgroundColor: '#f9f9f9'
            }}>
              <LineChart
                width={window.innerWidth > 1200 ? 600 : 400}
                height={230}
                data={simulationState.history.map((stateVector, stepIndex) => {
                  const dataPoint = { step: stepIndex }
                  nodes.forEach((node, nodeIndex) => {
                    const nodeLabel = node.data.label || `Node ${node.id}`
                    dataPoint[nodeLabel] = stateVector[nodeIndex] || 0
                  })
                  return dataPoint
                })}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="step" 
                  label={{ value: 'Simulation Step', position: 'insideBottom', offset: -5 }}
                  domain={[0, simulationState.maxSteps]}
                />
                <YAxis 
                  label={{ value: 'Increment Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                {nodes.map((node, index) => {
                  const nodeLabel = node.data.label || `Node ${node.id}`
                  return (
                    <Line
                      key={`increment-${node.id}`}
                      type="monotone"
                      dataKey={nodeLabel}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                      animationDuration={0}
                      connectNulls={false}
                    />
                  )
                })}
              </LineChart>
            </div>
          </div>
        )}
        
        <div className="chart-info">
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
            Top chart shows accumulated values, bottom chart shows current increments (state vector) for each node over simulation steps
          </p>
        </div>
      </div>
    </div>
  )
}

export default SimulationVisualization 
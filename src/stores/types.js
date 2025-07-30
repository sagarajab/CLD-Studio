// Common types and interfaces for CLD Studio stores

export const NODE_TYPES = {
  VARIABLE: 'variable',
  CONSTANT: 'constant',
  PARAMETER: 'parameter'
}

export const EDGE_POLARITIES = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative'
}

export const LOOP_TYPES = {
  REINFORCING: 'Reinforcing',
  BALANCING: 'Balancing'
}

export const SIMULATION_MODES = {
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped'
}

// Node interface
export const createNode = (id, position, label = 'New Node', type = NODE_TYPES.VARIABLE) => ({
  id,
  type: 'cldNode',
  position,
  data: {
    label,
    type,
    color: '#000000',
    description: '',
    value: 0
  }
})

// Edge interface
export const createEdge = (id, source, target, polarity = EDGE_POLARITIES.POSITIVE) => ({
  id,
  source,
  target,
  type: 'default',
  data: {
    polarity,
    color: '#6b7280',
    width: 1.5,
    transparency: 1.0,
    radius: 30,
    description: ''
  },
  sourceX: 0,
  sourceY: 0,
  targetX: 0,
  targetY: 0,
  sourcePosition: 'bottom',
  targetPosition: 'top',
  selected: false,
  animated: false,
  style: {},
  className: '',
  zIndex: 0,
  interactionWidth: 20
})

// Loop interface
export const createLoop = (nodes, edges, type, description = '') => ({
  nodes,
  edges,
  edgeIds: edges.map(e => e.id),
  type,
  description,
  length: nodes.length
})

// View transform interface
export const createViewTransform = (x = 0, y = 0, scale = 1) => ({
  x,
  y,
  scale
})

// Simulation state interface
export const createSimulationState = () => ({
  isRunning: false,
  isPaused: false,
  isInitialized: false,
  currentStep: 0,
  maxSteps: 50,
  stepDelay: 500,
  stateVector: [],
  accumulatedValues: [],
  history: [],
  valueHistory: [],
  perturbedNode: null,
  perturbationValue: 0
})

// Event log interface
export const createEvent = (message, type = 'info') => ({
  id: Date.now(),
  timestamp: new Date().toLocaleTimeString(),
  message,
  type
})

// State snapshot interface
export const createStateSnapshot = (nodes, edges, viewTransform, diagramName, mode, currentProblem, problemStatement) => ({
  nodes: JSON.parse(JSON.stringify(nodes)),
  edges: JSON.parse(JSON.stringify(edges)),
  viewTransform: { ...viewTransform },
  diagramName,
  mode,
  currentProblem: currentProblem ? { ...currentProblem } : null,
  problemStatement,
  timestamp: Date.now()
}) 
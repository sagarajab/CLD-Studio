/**
 * @typedef {Object} Node
 * @property {string} id - Unique identifier for the node
 * @property {string} label - Display label for the node
 * @property {Object} position - Position coordinates
 * @property {number} position.x - X coordinate
 * @property {number} position.y - Y coordinate
 * @property {Object} data - Additional node data
 * @property {string} data.type - Node type (variable, constant, parameter)
 * @property {string} data.color - Node color
 * @property {string} data.fontSize - Font size for label
 * @property {string} data.fontFamily - Font family for label
 */

/**
 * @typedef {Object} Edge
 * @property {string} id - Unique identifier for the edge
 * @property {string} source - Source node ID
 * @property {string} target - Target node ID
 * @property {Object} data - Additional edge data
 * @property {string} data.polarity - Edge polarity (positive, negative)
 * @property {string} data.color - Edge color
 * @property {number} data.width - Edge width
 * @property {Array} data.controlPoints - Control points for curved edges
 */

/**
 * @typedef {Object} Loop
 * @property {string} id - Unique identifier for the loop
 * @property {Array<string>} nodes - Array of node IDs in the loop
 * @property {Array<string>} edges - Array of edge IDs in the loop
 * @property {string} type - Loop type (reinforcing, balancing)
 * @property {number} length - Number of nodes in the loop
 */

/**
 * @typedef {Object} ViewTransform
 * @property {number} x - X translation
 * @property {number} y - Y translation
 * @property {number} scale - Zoom scale factor
 */

/**
 * @typedef {Object} SimulationState
 * @property {boolean} isRunning - Whether simulation is currently running
 * @property {boolean} isPaused - Whether simulation is paused
 * @property {boolean} isInitialized - Whether simulation is initialized
 * @property {number} currentStep - Current simulation step
 * @property {number} maxSteps - Maximum number of steps
 * @property {number} stepDelay - Delay between steps in milliseconds
 * @property {Array<number>} stateVector - Current increment vector
 * @property {Array<number>} accumulatedValues - Accumulated node values
 * @property {Array} history - History of increment vectors
 * @property {Array} valueHistory - History of accumulated values
 * @property {string|null} perturbedNode - ID of perturbed node
 * @property {number} perturbationValue - Value of perturbation
 */

/**
 * @typedef {Object} User
 * @property {string} userId - Unique user identifier
 * @property {Object} signInDetails - Sign-in details
 * @property {string} signInDetails.loginId - User's login ID
 * @property {Object} attributes - User attributes
 * @property {string} attributes.email - User's email address
 */

/**
 * @typedef {Object} EventLog
 * @property {string} message - Event message
 * @property {string} timestamp - Event timestamp
 * @property {string} type - Event type
 */

/**
 * @typedef {Object} Config
 * @property {Object} globalStyles - Global styling configuration
 * @property {Object} ui - UI configuration
 * @property {Object} colors - Color configuration
 */

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
  REINFORCING: 'reinforcing',
  BALANCING: 'balancing'
}

export const MODES = {
  SANDBOX: 'sandbox',
  ASSESSMENT: 'assessment'
} 
// App Constants
export const APP_NAME = 'CLD Studio'
export const DEFAULT_DIAGRAM_NAME = 'Untitled'

// Modes
export const MODES = {
  SANDBOX: 'sandbox',
  ASSESSMENT: 'assessment'
}

// Modal Names
export const MODAL_NAMES = {
  SETTINGS: 'settings',
  S3_FILE_MANAGER: 's3FileManager',
  TBT_AUTH_TEST: 'tbtAuthTest',
  TBT_USER_ADMIN: 'tbtUserAdmin',
  STATE_VECTOR: 'stateVector',
  PLOTS: 'plots',
  NODE_ANALYSIS: 'nodeAnalysis',
  CONNECTION_ANALYSIS: 'connectionAnalysis',
  SYSTEM_STATS: 'systemStats',
  ADJACENCY_MATRIX: 'adjacencyMatrix'
}

// Simulation Constants
export const SIMULATION = {
  MAX_STEPS: 50,
  DEFAULT_STEP_DELAY: 500,
  DEFAULT_PERTURBATION_VALUE: 1
}

// Undo/Redo Constants
export const UNDO_REDO = {
  MAX_UNDO_STEPS: 50
}

// UI Constants
export const UI = {
  SIDEBAR_DEFAULT_WIDTH: 300,
  SIDEBAR_COLLAPSED_WIDTH: 60,
  MODAL_MAX_WIDTH: 800,
  MODAL_MAX_HEIGHT: 600
}

// Colors
export const COLORS = {
  POSITIVE: '#28a745',
  NEGATIVE: '#dc3545',
  NEUTRAL: '#6c757d',
  HIGHLIGHT: '#ffc107'
}

// Event Types
export const EVENT_TYPES = {
  NODE_ADDED: 'node_added',
  NODE_DELETED: 'node_deleted',
  EDGE_ADDED: 'edge_added',
  EDGE_DELETED: 'edge_deleted',
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_STOPPED: 'simulation_stopped'
} 
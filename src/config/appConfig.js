// Global application configuration
export const defaultConfig = {
  // Node and edge constraints
  constraints: {
    maxNodes: 50,
    maxEdges: 200,
    maxLoopsForAnalysis: 50, // Skip loop detection if more than this
  },
  
  // Global styling settings
  globalStyles: {
    nodeFont: 'Inter',
    nodeFontSize: 14,
    arrowColor: '#6b7280',
    arrowWidth: 1.5,
    arrowTransparency: 1.0,
    arrowHeadSize: 2.0,
  },
  
  // Color palette and default colors
  colors: {
    // Default color palette for nodes and arrows
    palette: [
      '#000000', // Black
      '#FFFFFF', // White
      '#FF0000', // Red
      '#00FF00', // Green
      '#0000FF', // Blue
      '#FFFF00', // Yellow
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#FFA500', // Orange
      '#800080', // Purple
      '#008000', // Dark Green
      '#FFC0CB', // Pink
      '#A52A2A', // Brown
      '#808080', // Gray
      '#000080', // Navy
      '#FFD700', // Gold
      '#32CD32', // Lime Green
      '#FF6347', // Tomato
      '#9370DB', // Medium Purple
      '#20B2AA', // Light Sea Green
    ],
    
    // Default selected colors (like PowerPoint)
    defaultSelected: {
      nodeColor: '#000000', // Default black for nodes
      arrowColor: '#6b7280', // Default gray for arrows
    },
    
    // Default colors for new elements
    defaults: {
      nodeColor: '#000000', // Default color for new nodes
      arrowColor: '#6b7280', // Default color for new arrows
    }
  },
  
  // Performance settings
  performance: {
    enableLoopDetection: true,
    enableAdjacencyMatrix: true,
    asyncGraphAnalysis: true,
  },
  
  // UI settings
  ui: {
    defaultZoom: 1.0,
    minZoom: 0.1,
    maxZoom: 3.0,
    showStatusBar: true,
    showGrid: false,
  },
  
  // File settings
  file: {
    defaultExtension: '.cld',
    supportedExtensions: ['.cld', '.json'],
    autoSave: false,
    autoSaveInterval: 30000, // 30 seconds
  },
  
  // Validation settings
  validation: {
    allowSelfLoops: false,
    allowMultipleEdges: false,
    requireNodeLabels: true,
  }
}

// Load config from localStorage or use defaults
export const loadConfig = () => {
  try {
    const savedConfig = localStorage.getItem('cldStudioConfig')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      return { ...defaultConfig, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load config from localStorage:', error)
  }
  return defaultConfig
}

// Save config to localStorage
export const saveConfig = (config) => {
  try {
    localStorage.setItem('cldStudioConfig', JSON.stringify(config))
    return true
  } catch (error) {
    console.error('Failed to save config to localStorage:', error)
    return false
  }
}

// Reset config to defaults
export const resetConfig = () => {
  try {
    localStorage.removeItem('cldStudioConfig')
    return true
  } catch (error) {
    console.error('Failed to reset config:', error)
    return false
  }
} 
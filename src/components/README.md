# CLD Studio Components

This directory contains all React components used in the CLD Studio application.

## Component Structure

### Core Components
- **App.jsx** - Main application component
- **Canvas.jsx** - Main diagram canvas with node/edge rendering
- **CLDNode.jsx** - Individual node component
- **CLDEdge.jsx** - Individual edge/connection component

### Layout Components
- **SysLoopHeader.jsx** - Application header with toolbar
- **SysLoopSidebar.jsx** - Left sidebar with analysis panels
- **StatusBar.jsx** - Bottom status bar with statistics

### Modal Components
- **SettingsModal.jsx** - Application settings
- **S3FileManager.jsx** - File management interface
- **StateVectorModal.jsx** - Simulation state vector display
- **PlotsModal.jsx** - Simulation plots and charts
- **NodeAnalysisModal.jsx** - Node analysis interface
- **ConnectionAnalysisModal.jsx** - Connection analysis interface
- **SystemStatsModal.jsx** - System statistics display
- **AdjacencyMatrixModal.jsx** - Adjacency matrix display
- **ExamplesModal.jsx** - Example diagrams browser

### Analysis Components
- **AnalysisTab.jsx** - Main analysis interface
- **SimplifiedAdjacencyMatrix.jsx** - Compact adjacency matrix
- **AdjacencyMatrix.jsx** - Full adjacency matrix component

### Simulation Components
- **SimulationControls.jsx** - Simulation control interface
- **SimulationControlsOverlay.jsx** - Overlay simulation controls
- **SimulationVisualization.jsx** - Simulation visualization

### Authentication Components
- **TBTAuthTest.jsx** - TBT authentication testing
- **TBTUserAdmin.jsx** - TBT user administration
- **TBTRegisteredStudentsAdmin.jsx** - Student administration
- **UserProgressDashboard.jsx** - User progress tracking

### Utility Components
- **Toolbar.jsx** - Main toolbar component
- **ErrorBoundary.jsx** - Error boundary for error handling

## Component Guidelines

### Props
- Use descriptive prop names
- Provide default values where appropriate
- Use PropTypes or TypeScript for type checking

### State Management
- Use Zustand stores for global state
- Use local state for component-specific state
- Avoid prop drilling by using stores

### Styling
- Use CSS modules or styled-components
- Follow the design system variables
- Ensure responsive design

### Performance
- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation
- Provide alt text for images
- Use semantic HTML elements

## File Naming Convention
- Use PascalCase for component files
- Use camelCase for utility files
- Include .jsx extension for React components
- Include .css extension for stylesheets

## Import/Export Pattern
```javascript
// Default export for main component
export default ComponentName

// Named exports for sub-components or utilities
export { SubComponent, utilityFunction }
``` 
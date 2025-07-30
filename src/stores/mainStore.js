import { create } from 'zustand'
import { useConfigStore } from './configStore'
import { useUIStore } from './uiStore'
import { useGraphStore } from './graphStore'
import { useAnalysisStore } from './analysisStore'
import { useSimulationStore } from './simulationStore'
import { useUndoRedoStore } from './undoRedoStore'
import { createEvent } from './types'

// Main store that combines all modular stores
const useMainStore = create((set, get) => ({
  // Application state
  mode: 'sandbox', // 'sandbox' or 'assessment'
  currentProblem: null,
  diagramName: 'Untitled',
  problemStatement: '',
  
  // Events log for status bar
  eventsLog: [],
  
  // Events log operations
  addEvent: (event) => {
    const timestamp = new Date().toLocaleTimeString()
    const newEvent = createEvent(event, 'info')
    
    set((state) => ({
      eventsLog: [newEvent, ...state.eventsLog.slice(0, 4)] // Keep only last 5 events
    }))
  },
  
  clearEventsLog: () => {
    set({ eventsLog: [] })
  },
  
  // Problem statement operations
  updateProblemStatement: (statement) => {
    set({ problemStatement: statement })
  },
  
  clearProblemStatement: () => {
    set({ problemStatement: '' })
  },
  
  // Diagram operations
  setDiagramName: (name) => {
    set({ diagramName: name })
    // Update browser title
    const title = name && name.trim() !== '' ? `${name} - CLD Studio` : 'CLD Studio'
    document.title = title
  },
  
  // Mode operations
  setMode: (mode) => {
    set({ mode })
  },
  
  // Assessment mode operations
  loadProblem: (problem) => {
    set({ 
      currentProblem: problem,
      nodes: problem.nodes || [],
      edges: problem.edges || [],
      diagramName: problem.name || 'Assessment Problem',
      mode: 'assessment'
    })
    
    // Update graph analysis asynchronously to avoid blocking UI
    setTimeout(() => {
      get().updateGraphAnalysis()
    }, 0)
  },
  
  submitAssessment: () => {
    // TODO: Implement assessment scoring logic
  },

  // Export operations
  saveDiagram: () => {
    const { 
      nodes, 
      edges, 
      diagramName, 
      mode, 
      currentProblem, 
      viewTransform, 
      globalStyles, 
      adjacencyMatrix, 
      allLoops,
      simulationState,
      showGrid,
      config,
      problemStatement
    } = get()
    
    // Enhanced diagram data with comprehensive metadata
    const diagramData = {
      // Basic diagram info
      diagramName,
      timestamp: new Date().toISOString(),
      version: '2.0',
      createdWith: 'CLD Studio',
      
      // Problem statement and context
      problemStatement: {
        mode,
        currentProblem: currentProblem ? {
          id: currentProblem.id,
          title: currentProblem.title,
          description: currentProblem.description
        } : null,
        // For sandbox mode, capture the problem statement from the sidebar
        description: mode === 'sandbox' ? problemStatement || 'Free-form causal loop diagram' : currentProblem?.description || '',
        customStatement: problemStatement || ''
      },
      
      // Complete node information
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label || 'New Node',
          type: node.data.type || 'variable', // variable, constant, parameter
          color: node.data.color || '#000000',
          description: node.data.description || '',
          value: node.data.value || 0, // For simulation
          // Any other custom node properties
          ...node.data
        }
      })),
      
      // Complete edge information
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        data: {
          polarity: edge.data.polarity || 'positive',
          color: edge.data.color || '#6b7280',
          width: edge.data.width || 1.5,
          transparency: edge.data.transparency || 1.0,
          radius: edge.data.radius || 30,
          description: edge.data.description || '',
          // Any other custom edge properties
          ...edge.data
        },
        style: edge.style,
        markerEnd: edge.markerEnd
      })),
      
      // View and layout information
      viewTransform,
      showGrid,
      
      // Global styling settings
      globalStyles,
      
      // Analysis data
      analysis: {
        adjacencyMatrix,
        allLoops: allLoops.map(loop => ({
          nodes: loop.nodes,
          edges: loop.edges,
          type: loop.type, // 'Reinforcing' or 'Balancing'
          description: loop.description || '',
          length: loop.nodes.length
        })),
        nodeCount: nodes.length,
        edgeCount: edges.length,
        positiveEdges: edges.filter(e => e.data.polarity === 'positive').length,
        negativeEdges: edges.filter(e => e.data.polarity === 'negative').length
      },
      
      // Simulation state (if any)
      simulation: simulationState.isInitialized ? {
        isRunning: simulationState.isRunning,
        isPaused: simulationState.isPaused,
        isInitialized: simulationState.isInitialized,
        currentStep: simulationState.currentStep,
        maxSteps: simulationState.maxSteps,
        stepDelay: simulationState.stepDelay,
        stateVector: simulationState.stateVector,
        accumulatedValues: simulationState.accumulatedValues,
        history: simulationState.history,
        valueHistory: simulationState.valueHistory,
        perturbedNode: simulationState.perturbedNode,
        perturbationValue: simulationState.perturbationValue
      } : null,
      
      // Configuration snapshot
      config: {
        constraints: config.constraints,
        colors: config.colors,
        performance: config.performance,
        ui: config.ui,
        file: config.file
      },
      
      // Metadata
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        nodeTypes: {
          variable: nodes.filter(n => n.data.type === 'variable').length,
          constant: nodes.filter(n => n.data.type === 'constant').length,
          parameter: nodes.filter(n => n.data.type === 'parameter').length
        },
        edgePolarities: {
          positive: edges.filter(e => e.data.polarity === 'positive').length,
          negative: edges.filter(e => e.data.polarity === 'negative').length
        },
        loops: {
          total: allLoops.length,
          reinforcing: allLoops.filter(l => l.type === 'Reinforcing').length,
          balancing: allLoops.filter(l => l.type === 'Balancing').length
        }
      }
    }
    
    // Create JSON file for download
    const dataStr = JSON.stringify(diagramData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    // Use diagram name with .cld extension, fallback to default if empty
    const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
    link.download = `${safeName}.cld`
    link.click()
    URL.revokeObjectURL(url)
  },
  
  loadDiagram: () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.cld,.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        // Set loading state
        set({ isLoading: true })
        
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const diagramData = JSON.parse(e.target.result)
            
            // Handle both new enhanced format (v2.0) and legacy format (v1.0)
            const isEnhancedFormat = diagramData.version === '2.0' || diagramData.problemStatement
            
            if (isEnhancedFormat) {
              // Enhanced format - load all available data
              set({
                // Basic diagram data
                nodes: diagramData.nodes || [],
                edges: diagramData.edges || [],
                diagramName: diagramData.diagramName || 'Untitled',
                
                // Problem statement and mode
                mode: diagramData.problemStatement?.mode || 'sandbox',
                currentProblem: diagramData.problemStatement?.currentProblem || null,
                problemStatement: diagramData.problemStatement?.customStatement || '',
                
                // View and layout
                viewTransform: diagramData.viewTransform || { x: 0, y: 0, scale: 1 },
                showGrid: diagramData.showGrid !== undefined ? diagramData.showGrid : false,
                
                // Global styles (merge with current config)
                globalStyles: diagramData.globalStyles ? 
                  { ...get().globalStyles, ...diagramData.globalStyles } : 
                  get().globalStyles,
                
                // Analysis data
                adjacencyMatrix: diagramData.analysis?.adjacencyMatrix || [],
                allLoops: diagramData.analysis?.allLoops || [],
                
                // Simulation state (if available)
                simulationState: diagramData.simulation ? {
                  ...get().simulationState,
                  ...diagramData.simulation,
                  isInitialized: diagramData.simulation.isInitialized || false
                } : get().simulationState,
                
                // Reset selection states
                selectedNode: null,
                selectedEdge: null,
                highlightedLoop: null,
                isLoading: false,
                // Clear undo/redo stacks when loading new diagram
                undoStack: [],
                redoStack: []
              })
              
              // Update config if provided
              if (diagramData.config) {
                const currentConfig = get().config
                const newConfig = { ...currentConfig, ...diagramData.config }
                set({ config: newConfig })
                saveConfig(newConfig)
              }
              
              // Log loading information
              console.log('Loaded enhanced diagram:', {
                name: diagramData.diagramName,
                version: diagramData.version,
                nodes: diagramData.nodes?.length || 0,
                edges: diagramData.edges?.length || 0,
                mode: diagramData.problemStatement?.mode,
                hasSimulation: !!diagramData.simulation,
                metadata: diagramData.metadata
              })
              
            } else {
              // Legacy format - load basic data only
              set({
                nodes: diagramData.nodes || [],
                edges: diagramData.edges || [],
                diagramName: diagramData.diagramName || 'Untitled',
                selectedNode: null,
                selectedEdge: null,
                isLoading: false,
                // Clear undo/redo stacks when loading new diagram
                undoStack: [],
                redoStack: []
              })
              
              console.log('Loaded legacy diagram:', {
                name: diagramData.diagramName,
                version: diagramData.version || '1.0',
                nodes: diagramData.nodes?.length || 0,
                edges: diagramData.edges?.length || 0
              })
            }
            
            // Update graph analysis asynchronously to avoid blocking UI
            setTimeout(() => {
              get().updateGraphAnalysis()
            }, 0)
            
          } catch (error) {
            console.error('Error loading diagram:', error)
            alert('Error loading diagram file. Please check if the file is a valid CLD Studio diagram.')
            set({ isLoading: false })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  },

  exportAsPNG: async () => {
    const { diagramName } = get()
    try {
      // Import html2canvas dynamically to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      
      // Wait a bit for the component to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the ReactFlow container - try multiple selectors
      console.log('Starting element search for export...')
      
      // First, let's see what's available in the DOM
      console.log('All divs with class containing "react":', document.querySelectorAll('div[class*="react"]'))
      console.log('All divs with class containing "flow":', document.querySelectorAll('div[class*="flow"]'))
      console.log('All divs with class containing "cld":', document.querySelectorAll('div[class*="cld"]'))
      
      // Try to find the main canvas area first
      let reactFlowElement = document.querySelector('.canvas-area')
      console.log('Trying .canvas-area first:', reactFlowElement)
      
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.cld-diagram-container')
        console.log('Trying .cld-diagram-container:', reactFlowElement)
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow')
        console.log('Trying .react-flow:', reactFlowElement)
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('[data-testid="rf__wrapper"]')
        console.log('Trying [data-testid="rf__wrapper"]:', reactFlowElement)
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow__viewport')
        console.log('Trying .react-flow__viewport:', reactFlowElement)
      }
      if (!reactFlowElement) {
        // Try to find any div containing ReactFlow content
        reactFlowElement = document.querySelector('.react-flow__renderer')
        console.log('Trying .react-flow__renderer:', reactFlowElement)
      }
      if (!reactFlowElement) {
        // Try to find ReactFlow by looking for elements with ReactFlow-specific content
        const allDivs = document.querySelectorAll('div')
        for (let div of allDivs) {
          if (div.innerHTML.includes('react-flow') || 
              div.innerHTML.includes('rf__') ||
              div.querySelector('.react-flow') ||
              div.querySelector('[data-testid*="rf"]')) {
            console.log('Found potential ReactFlow container:', div)
            reactFlowElement = div
            break
          }
        }
      }
      
      if (!reactFlowElement) {
        console.log('Available elements with react-flow in class:', document.querySelectorAll('[class*="react-flow"]'))
        console.log('All divs in document:', document.querySelectorAll('div'))
        
        // As a last resort, try to export the entire viewport
        console.log('Trying to export entire viewport as fallback...')
        reactFlowElement = document.body
      }

      // Capture the diagram as canvas
      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
        link.download = `${safeName}.png`
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (error) {
      console.error('Error exporting as PNG:', error)
      alert('Failed to export as PNG. Please try again.')
    }
  },

  exportAsSVG: () => {
    const { diagramName } = get()
    try {
      // Get the ReactFlow container - try multiple selectors
      let reactFlowElement = document.querySelector('.canvas-area')
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.cld-diagram-container')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('[data-testid="rf__wrapper"]')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow__viewport')
      }
      if (!reactFlowElement) {
        // Try to find any div containing ReactFlow content
        reactFlowElement = document.querySelector('.react-flow__renderer')
      }
      if (!reactFlowElement) {
        // As a last resort, try to export the entire viewport
        reactFlowElement = document.body
      }

      // Create SVG from the ReactFlow element
      const svgData = new XMLSerializer().serializeToString(reactFlowElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
      link.download = `${safeName}.svg`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting as SVG:', error)
      alert('Failed to export as SVG. Please try again.')
    }
  },

  exportAsPDF: async () => {
    const { diagramName } = get()
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      
      // Wait a bit for the component to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the ReactFlow container - try multiple selectors
      let reactFlowElement = document.querySelector('.canvas-area')
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.cld-diagram-container')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('[data-testid="rf__wrapper"]')
      }
      if (!reactFlowElement) {
        reactFlowElement = document.querySelector('.react-flow__viewport')
      }
      if (!reactFlowElement) {
        // Try to find any div containing ReactFlow content
        reactFlowElement = document.querySelector('.react-flow__renderer')
      }
      if (!reactFlowElement) {
        // As a last resort, try to export the entire viewport
        reactFlowElement = document.body
      }

      // Import html2canvas for capturing the diagram
      const html2canvas = (await import('html2canvas')).default
      
      // Capture the diagram as canvas
      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
      })

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png')
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const imgWidth = 297 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      
      // Download PDF
      const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
      pdf.save(`${safeName}.pdf`)
    } catch (error) {
      console.error('Error exporting as PDF:', error)
      alert('Failed to export as PDF. Please try again.')
    }
  },

  // Debug function to help troubleshoot export issues
  debugExportElements: () => {
    console.log('=== Export Debug Information ===')
    console.log('Canvas area:', document.querySelector('.canvas-area'))
    console.log('CLD diagram container:', document.querySelector('.cld-diagram-container'))
    console.log('ReactFlow:', document.querySelector('.react-flow'))
    console.log('ReactFlow wrapper:', document.querySelector('[data-testid="rf__wrapper"]'))
    console.log('ReactFlow viewport:', document.querySelector('.react-flow__viewport'))
    console.log('ReactFlow renderer:', document.querySelector('.react-flow__renderer'))
    console.log('All divs with react in class:', document.querySelectorAll('div[class*="react"]'))
    console.log('All divs with flow in class:', document.querySelectorAll('div[class*="flow"]'))
    console.log('All divs with cld in class:', document.querySelectorAll('div[class*="cld"]'))
    console.log('================================')
  }
}))

export { useMainStore } 
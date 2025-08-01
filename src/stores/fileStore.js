import { create } from 'zustand'

const useFileStore = create((set, get) => ({
  // File state
  diagramName: 'Untitled',
  mode: 'sandbox', // 'sandbox' or 'assessment'
  currentProblem: null,
  problemStatement: '',
  
  // File operations
  setDiagramName: (name) => {
    set({ diagramName: name })
    // Update browser title
    const title = name && name.trim() !== '' ? `${name} - CLD Studio` : 'CLD Studio'
    document.title = title
  },
  
  setMode: (mode) => {
    set({ mode })
  },
  
  updateProblemStatement: (statement) => {
    set({ problemStatement: statement })
  },
  
  clearProblemStatement: () => {
    set({ problemStatement: '' })
  },
  
  // Assessment mode operations
  loadProblem: (problem) => {
    set({ 
      currentProblem: problem,
      diagramName: problem.name || 'Assessment Problem',
      mode: 'assessment'
    })
    return { nodes: problem.nodes || [], edges: problem.edges || [] }
  },
  
  submitAssessment: () => {
    // TODO: Implement assessment scoring logic
  },
  
  // Save diagram
  saveDiagram: (state) => {
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
    } = state
    
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
  
  // Load diagram
  loadDiagram: (updateState) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.cld,.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        // Set loading state
        updateState({ isLoading: true })
        
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const diagramData = JSON.parse(e.target.result)
            
            // Handle both new enhanced format (v2.0) and legacy format (v1.0)
            const isEnhancedFormat = diagramData.version === '2.0' || diagramData.problemStatement
            
            // Transform nodes to match expected structure
            const transformNodes = (nodes) => {
              return nodes.map((node, index) => {
                // If node already has data property, use it as is
                if (node.data) {
                  return node
                }
                // Otherwise, wrap node properties in data object
                const { id, position, ...nodeData } = node
                const newId = typeof id === 'string' ? index + 1 : id
                
                // Log ID conversion for debugging
                if (typeof id === 'string') {
                  console.log(`Converting node ID: "${id}" → ${newId}`)
                }
                
                return {
                  id: newId, // Convert string IDs to integers
                  position,
                  data: nodeData
                }
              })
            }
            
            // Transform edges to match expected structure
            const transformEdges = (edges) => {
              return edges.map((edge, index) => {
                // If edge already has data property, use it as is
                if (edge.data) {
                  return edge
                }
                // Otherwise, wrap edge properties in data object
                const { id, source, target, ...edgeData } = edge
                
                // Convert string IDs to integers by finding the corresponding node indices
                const nodes = diagramData.nodes || []
                const sourceNodeIndex = nodes.findIndex(n => n.id === source)
                const targetNodeIndex = nodes.findIndex(n => n.id === target)
                
                const newId = typeof id === 'string' ? index + 1 : id
                const newSource = sourceNodeIndex !== -1 ? sourceNodeIndex + 1 : source
                const newTarget = targetNodeIndex !== -1 ? targetNodeIndex + 1 : target
                
                // Log ID conversion for debugging
                if (typeof id === 'string' || typeof source === 'string' || typeof target === 'string') {
                  console.log(`Converting edge ID: "${id}" → ${newId}, source: "${source}" → ${newSource}, target: "${target}" → ${newTarget}`)
                }
                
                return {
                  id: newId, // Convert string IDs to integers
                  source: newSource,
                  target: newTarget,
                  data: edgeData
                }
              })
            }
            
            if (isEnhancedFormat) {
              // Enhanced format - load all available data
              updateState({
                // Basic diagram data
                nodes: transformNodes(diagramData.nodes || []),
                edges: transformEdges(diagramData.edges || []),
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
                updateState({ config: newConfig })
                // Note: saveConfig should be called by the config store
              }
              
            } else {
              // Legacy format - load basic data only
              updateState({
                nodes: transformNodes(diagramData.nodes || []),
                edges: transformEdges(diagramData.edges || []),
                diagramName: diagramData.diagramName || 'Untitled',
                selectedNode: null,
                selectedEdge: null,
                isLoading: false,
                // Clear undo/redo stacks when loading new diagram
                undoStack: [],
                redoStack: []
              })
            }
            
            // Update graph analysis asynchronously to avoid blocking UI
            setTimeout(() => {
              // This should be called by the graph store
              // updateGraphAnalysis()
            }, 0)
            
          } catch (error) {
            console.error('Error loading diagram:', error)
            alert('Error loading diagram file. Please check if the file is a valid CLD Studio diagram.')
            updateState({ isLoading: false })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  },
  
  // Export functions
  exportMatrix: (nodes, edges) => {
    const nodeIds = nodes.map(node => node.id)
    const matrix = nodeIds.map(sourceId => 
      nodeIds.map(targetId => {
        const edge = edges.find(e => e.source === sourceId && e.target === targetId)
        if (!edge) return 0
        return edge.data.polarity === 'positive' ? 1 : -1
      })
    )
    
    // Create CSV file for download
    const csvContent = [
      ['', ...nodeIds],
      ...matrix.map((row, i) => [nodeIds[i], ...row])
    ].map(row => row.join(',')).join('\n')
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cld-matrix-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  },

  exportAsPNG: async (diagramName) => {
    try {
      // Import html2canvas dynamically to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      
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
        // Try to find ReactFlow by looking for elements with ReactFlow-specific content
        const allDivs = document.querySelectorAll('div')
        for (let div of allDivs) {
          if (div.innerHTML.includes('react-flow') || 
              div.innerHTML.includes('rf__') ||
              div.querySelector('.react-flow') ||
              div.querySelector('[data-testid*="rf"]')) {
            reactFlowElement = div
            break
          }
        }
      }
      
      if (!reactFlowElement) {
        // As a last resort, try to export the entire viewport
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

  exportAsSVG: (diagramName) => {
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

  exportAsPDF: async (diagramName) => {
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
  
  // Export detailed diagram data for analysis
  exportDetailedData: (state) => {
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
    } = state
    
    // Create comprehensive analysis data
    const analysisData = {
      // Basic info
      diagramName,
      timestamp: new Date().toISOString(),
      version: '2.0',
      createdWith: 'CLD Studio',
      
      // Problem context
      problemStatement: {
        mode,
        currentProblem: currentProblem ? {
          id: currentProblem.id,
          title: currentProblem.title,
          description: currentProblem.description
        } : null,
        description: mode === 'sandbox' ? problemStatement || 'Free-form causal loop diagram' : currentProblem?.description || '',
        customStatement: problemStatement || ''
      },
      
      // Complete node analysis
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label || 'New Node',
          type: node.data.type || 'variable',
          color: node.data.color || '#000000',
          description: node.data.description || '',
          value: node.data.value || 0
        },
        // Analysis data
        inDegree: edges.filter(e => e.target === node.id).length,
        outDegree: edges.filter(e => e.source === node.id).length,
        totalDegree: edges.filter(e => e.source === node.id || e.target === node.id).length
      })),
      
      // Complete edge analysis
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
          description: edge.data.description || ''
        },
        style: edge.style,
        markerEnd: edge.markerEnd
      })),
      
      // Graph analysis
      graphAnalysis: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        density: nodes.length > 1 ? edges.length / (nodes.length * (nodes.length - 1)) : 0,
        averageDegree: nodes.length > 0 ? (2 * edges.length) / nodes.length : 0,
        nodeTypes: {
          variable: nodes.filter(n => n.data.type === 'variable').length,
          constant: nodes.filter(n => n.data.type === 'constant').length,
          parameter: nodes.filter(n => n.data.type === 'parameter').length
        },
        edgePolarities: {
          positive: edges.filter(e => e.data.polarity === 'positive').length,
          negative: edges.filter(e => e.data.polarity === 'negative').length
        },
        // Node degree distribution
        degreeDistribution: {
          isolated: nodes.filter(n => edges.filter(e => e.source === n.id || e.target === n.id).length === 0).length,
          leaf: nodes.filter(n => edges.filter(e => e.source === n.id || e.target === n.id).length === 1).length,
          hub: nodes.filter(n => edges.filter(e => e.source === n.id || e.target === n.id).length > 3).length
        }
      },
      
      // Loop analysis
      loopAnalysis: {
        totalLoops: allLoops.length,
        reinforcingLoops: allLoops.filter(l => l.type === 'Reinforcing').length,
        balancingLoops: allLoops.filter(l => l.type === 'Balancing').length,
        loopLengths: allLoops.map(l => l.nodes.length),
        averageLoopLength: allLoops.length > 0 ? allLoops.reduce((sum, l) => sum + l.nodes.length, 0) / allLoops.length : 0,
        loops: allLoops.map(loop => ({
          nodes: loop.nodes,
          edges: loop.edges,
          type: loop.type,
          description: loop.description || '',
          length: loop.nodes.length
        }))
      },
      
      // Adjacency matrix
      adjacencyMatrix,
      
      // View and styling
      viewTransform,
      showGrid,
      globalStyles,
      
      // Simulation data (if available)
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
      
      // Configuration
      config: {
        constraints: config.constraints,
        colors: config.colors,
        performance: config.performance,
        ui: config.ui,
        file: config.file
      }
    }
    
    // Create JSON file for download
    const dataStr = JSON.stringify(analysisData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    const safeName = diagramName && diagramName.trim() !== '' ? diagramName.trim() : 'Untitled'
    link.download = `${safeName}-analysis.json`
    link.click()
    URL.revokeObjectURL(url)
  }
}))

export { useFileStore } 
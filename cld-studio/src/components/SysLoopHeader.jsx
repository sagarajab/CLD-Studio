import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { FolderOpen, Save, RotateCcw, RotateCw, Trash2, Download, Diamond, Spline, Brush, Settings, RefreshCw, Grid, LayoutGrid, Play, Pause, RotateCcw as StepBack, RotateCw as StepForward, Square, Settings as SettingsIcon, BarChart3, Activity, Menu, Undo2, Redo2, Eraser, Grid3x3, BowArrow, Dices, SkipForward, SkipBack, TimerReset, ZoomIn, ZoomOut, Move, Trash } from 'lucide-react'

import SettingsModal from './SettingsModal'
import StateVectorModal from './StateVectorModal'
import PlotsModal from './PlotsModal'
import { loadConfig } from '../config/appConfig'
import appIcon from '../assets/app_icon.png'
import tbtIcon from '../assets/tbt_icon.png'

function SysLoopHeader({ mode, setMode }) {
  const { 
    saveDiagram, 
    loadDiagram, 
    clearDiagram, 
    exportMatrix,
    exportAsPNG,
    exportAsSVG,
    exportAsPDF,
    exportDetailedData,
    nodes, 
    edges,
    globalStyles,
    selectedNode,
    selectedEdge,
    setNodeFont,
    setNodeFontSize,
    setArrowColor,
    setArrowWidth,
    setArrowTransparency,
    setArrowHeadSize,
    resetGlobalStyles,
    updateSelectedNodeColor,
    updateSelectedEdgeColor,
    setSelectedNodeColor,
    setSelectedArrowColor,
    selectedNodeColor,
    selectedArrowColor,
    diagramName,
    setDiagramName,
    showGrid,
    toggleGrid,
    viewTransform,
    setViewTransform,
    updateViewTransform,
    resetView,
    panningMode,
    togglePanningMode,
    simulationState,
    simulationMode,
    initializeSimulation,
    runSimulation,
    pauseSimulation,
    stepSimulation,
    stepBackSimulation,
    resetSimulation,
    updateSimulationSettings,
    toggleSimulationMode
  } = useCLDStore()
  const [showNodeColorDropdown, setShowNodeColorDropdown] = useState(false)
  const [showArrowColorDropdown, setShowArrowColorDropdown] = useState(false)
  const [showDesignSettingsDropdown, setShowDesignSettingsDropdown] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(diagramName)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showSimSettingsDropdown, setShowSimSettingsDropdown] = useState(false)
  const [selectedSimNode, setSelectedSimNode] = useState('')
  const [perturbationValue, setPerturbationValue] = useState(1)
  const [showPlotsModal, setShowPlotsModal] = useState(false)
  const [showStateVectorModal, setShowStateVectorModal] = useState(false)
  const [showHamburgerDropdown, setShowHamburgerDropdown] = useState(false)
  const [showHamburgerExportDropdown, setShowHamburgerExportDropdown] = useState(false)
  
  // Load config for colors
  const config = loadConfig()
  
  // Predefined colors for the dropdown (from config)
  const predefinedColors = config.colors.palette
  
  const headerRef = useRef(null)

  // Helper functions to get current colors
  const getSelectedNodeColor = () => {
    if (!selectedNode) return config.colors.defaults.nodeColor // Default from config
    const node = nodes.find(n => n.id === selectedNode)
    return node?.data?.color || config.colors.defaults.nodeColor
  }

  const getSelectedEdgeColor = () => {
    if (!selectedEdge) return config.colors.defaults.arrowColor // Default from config
    const edge = edges.find(e => e.id === selectedEdge)
    return edge?.data?.color || config.colors.defaults.arrowColor
  }

  // Helper functions to get the currently selected colors (like PowerPoint)
  const getCurrentNodeColor = () => {
    return selectedNodeColor
  }

  const getCurrentArrowColor = () => {
    return selectedArrowColor
  }

  const handleSave = () => {
    saveDiagram()
  }

  const handleLoad = () => {
    loadDiagram()
  }

  const handleClear = () => {
    if (window.confirm('Clear diagram?')) {
      clearDiagram()
    }
  }

  const handleExport = () => {
    exportMatrix()
  }

  const handleExportDropdownToggle = (e) => {
    e.stopPropagation()
    // Close other dropdowns if they're open
    if (showNodeColorDropdown) {
      setShowNodeColorDropdown(false)
    }
    if (showArrowColorDropdown) {
      setShowArrowColorDropdown(false)
    }
    if (showDesignSettingsDropdown) {
      setShowDesignSettingsDropdown(false)
    }
    setShowExportDropdown(!showExportDropdown)
  }

  const handleExportAsPNG = () => {
    exportAsPNG()
    setShowExportDropdown(false)
  }

  const handleExportAsSVG = () => {
    exportAsSVG()
    setShowExportDropdown(false)
  }

  const handleExportAsPDF = () => {
    exportAsPDF()
    setShowExportDropdown(false)
  }

  const handleExportDetailedData = () => {
    exportDetailedData()
    setShowExportDropdown(false)
  }

  const handleExportMatrix = () => {
    exportMatrix()
    setShowExportDropdown(false)
  }

  const handleUndo = () => {
    // TODO: Implement undo functionality
  }

  const handleRedo = () => {
    // TODO: Implement redo functionality
  }



  const handleNodeFontChange = (font) => {
    setNodeFont(font)
  }

  const handleNodeFontSizeChange = (size) => {
    setNodeFontSize(size)
  }

  const handleArrowColorChange = (color) => {
    setArrowColor(color)
  }

  const handleArrowWidthChange = (width) => {
    setArrowWidth(parseFloat(width))
  }

  const handleArrowTransparencyChange = (transparency) => {
    setArrowTransparency(parseFloat(transparency))
  }

  const handleArrowHeadSizeChange = (size) => {
    setArrowHeadSize(parseFloat(size))
  }

  const handleNodeColorClick = () => {
    // Like PowerPoint: apply the currently selected color to the selected node
    if (selectedNode) {
      updateSelectedNodeColor(selectedNodeColor)
    }
  }

  const handleNodeColorDropdownToggle = (e) => {
    e.stopPropagation()
    // Close arrow color dropdown if it's open
    if (showArrowColorDropdown) {
      setShowArrowColorDropdown(false)
    }
    setShowNodeColorDropdown(!showNodeColorDropdown)
  }

  const handleNodeColorSelect = (color) => {
    // Update the selected color (like PowerPoint)
    setSelectedNodeColor(color)
    setShowNodeColorDropdown(false)
    // Also close arrow color dropdown if it's open
    if (showArrowColorDropdown) {
      setShowArrowColorDropdown(false)
    }
    // Apply the color directly to the selected node if one is selected
    if (selectedNode) {
      updateSelectedNodeColor(color)
    }
  }

  const handleArrowColorClick = () => {
    // Like PowerPoint: apply the currently selected color to the selected edge
    if (selectedEdge) {
      updateSelectedEdgeColor(selectedArrowColor)
    }
  }

  const handleArrowColorDropdownToggle = (e) => {
    e.stopPropagation()
    // Close node color dropdown if it's open
    if (showNodeColorDropdown) {
      setShowNodeColorDropdown(false)
    }
    setShowArrowColorDropdown(!showArrowColorDropdown)
  }

  const handleArrowColorSelect = (color) => {
    // Update the selected color (like PowerPoint)
    setSelectedArrowColor(color)
    setShowArrowColorDropdown(false)
    // Also close node color dropdown if it's open
    if (showNodeColorDropdown) {
      setShowNodeColorDropdown(false)
    }
    // Apply the color directly to the selected edge if one is selected
    if (selectedEdge) {
      updateSelectedEdgeColor(color)
    }
  }





  const handleDesignSettingsDropdownToggle = (e) => {
    e.stopPropagation()
    setShowDesignSettingsDropdown(!showDesignSettingsDropdown)
  }

  const handleResetStyles = () => {
    resetGlobalStyles()
  }

  // Simulation functions
  const handleStartSimulation = () => {
    if (selectedSimNode && perturbationValue !== 0) {
      const success = initializeSimulation(parseInt(selectedSimNode), perturbationValue)
      if (success) {
        // Close the dropdown after successful initialization
        setShowSimSettingsDropdown(false)
      }
    }
  }

  const handlePlayWithAutoInit = () => {
    // If simulation is not initialized, initialize it first
    if (!simulationState.isInitialized && selectedSimNode && perturbationValue !== 0) {
      const success = initializeSimulation(parseInt(selectedSimNode), perturbationValue)
      if (!success) {
        console.error('Failed to initialize simulation')
        return
      }
    }
    // Run the simulation (either after initialization or if already initialized)
    if (simulationState.isInitialized && !simulationState.isRunning) {
      runSimulation()
    }
  }

  const handlePerturbationChange = (value) => {
    const clampedValue = Math.max(-100, Math.min(100, value))
    setPerturbationValue(clampedValue)
  }

  // Zoom, Pan, and Clear Canvas handlers
  const handleZoomIn = () => {
    const newScale = Math.min(viewTransform.scale * 1.2, 3.0) // Max zoom 300%
    updateViewTransform({ scale: newScale })
  }

  const handleZoomOut = () => {
    const newScale = Math.max(viewTransform.scale / 1.2, 0.1) // Min zoom 10%
    updateViewTransform({ scale: newScale })
  }

  const handleResetView = () => {
    resetView()
  }

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
      clearDiagram()
    }
  }

  const toggleSimSettingsDropdown = () => {
    setShowSimSettingsDropdown(!showSimSettingsDropdown)
  }

  const toggleHamburgerDropdown = () => {
    setShowHamburgerDropdown(!showHamburgerDropdown)
  }

  const toggleHamburgerExportDropdown = () => {
    setShowHamburgerExportDropdown(!showHamburgerExportDropdown)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside any dropdown
      const isInsideDesignDropdown = event.target.closest('.design-settings-dropdown')
      const isInsideNodeColorDropdown = event.target.closest('.node-color-dropdown')
      const isInsideArrowColorDropdown = event.target.closest('.arrow-color-dropdown')
      const isInsideExportDropdown = event.target.closest('.export-dropdown')
      const isInsideSimSettingsDropdown = event.target.closest('.sim-settings-dropdown')
      const isInsideHamburgerDropdown = event.target.closest('.hamburger-dropdown')
      const isInsideHamburgerExportDropdown = event.target.closest('.hamburger-export-dropdown')
      
      // Check if click is on the dropdown toggle button
      const isOnDesignToggle = event.target.closest('.design-settings-container')
      const isOnNodeColorToggle = event.target.closest('.node-color-container')
      const isOnArrowColorToggle = event.target.closest('.arrow-color-container')
      const isOnExportToggle = event.target.closest('.export-container')
      const isOnSimSettingsToggle = event.target.closest('.sim-settings-container')
      const isOnHamburgerToggle = event.target.closest('.hamburger-container')
      const isOnHamburgerExportToggle = event.target.closest('.hamburger-export-container')
      
      // Only close if clicking outside both the dropdown and its toggle button
      if (showDesignSettingsDropdown && !isInsideDesignDropdown && !isOnDesignToggle) {
        setShowDesignSettingsDropdown(false)
      }
      if (showNodeColorDropdown && !isInsideNodeColorDropdown && !isOnNodeColorToggle) {
        setShowNodeColorDropdown(false)
      }
      if (showArrowColorDropdown && !isInsideArrowColorDropdown && !isOnArrowColorToggle) {
        setShowArrowColorDropdown(false)
      }
      if (showExportDropdown && !isInsideExportDropdown && !isOnExportToggle) {
        setShowExportDropdown(false)
      }
      if (showSimSettingsDropdown && !isInsideSimSettingsDropdown && !isOnSimSettingsToggle) {
        setShowSimSettingsDropdown(false)
      }
      if (showHamburgerDropdown && !isInsideHamburgerDropdown && !isOnHamburgerToggle) {
        setShowHamburgerDropdown(false)
      }
      if (showHamburgerExportDropdown && !isInsideHamburgerExportDropdown && !isOnHamburgerExportToggle) {
        setShowHamburgerExportDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showDesignSettingsDropdown, showNodeColorDropdown, showArrowColorDropdown, showExportDropdown, showSimSettingsDropdown, showHamburgerDropdown, showHamburgerExportDropdown])

  // Update tempName when diagramName changes (e.g., when loading a file)
  useEffect(() => {
    setTempName(diagramName)
  }, [diagramName])

  const menuItems = [
    { 
      label: 'Undo', 
      action: handleUndo, 
      icon: Undo2,
      title: 'Undo' 
    },
    { 
      label: 'Redo', 
      action: handleRedo, 
      icon: Redo2,
      title: 'Redo' 
    },
    { 
      label: 'Clear', 
      action: handleClear, 
      icon: Eraser,
      title: 'Clear Canvas' 
    },
    { 
      label: 'Node Color', 
      type: 'nodeColor', 
      action: handleNodeColorClick,
      dropdownAction: handleNodeColorDropdownToggle,
      icon: Diamond,
      title: 'Node Color'
    },
    { 
      label: 'Arrow Color', 
      type: 'arrowColor', 
      action: handleArrowColorClick,
      dropdownAction: handleArrowColorDropdownToggle,
      icon: Spline,
      title: 'Arrow Color'
    },
    { 
      label: 'Design Settings', 
      type: 'designSettings', 
      dropdownAction: handleDesignSettingsDropdownToggle,
      icon: Brush,
      title: 'Global Design Settings' 
    },
    { 
      label: 'Reset Styles', 
      action: handleResetStyles, 
      icon: RefreshCw,
      title: 'Reset All Drawing Settings to Default' 
    },
    { 
      label: showGrid ? 'Hide Grid' : 'Show Grid', 
      action: toggleGrid, 
      icon: Grid3x3,
      title: showGrid ? 'Hide Grid' : 'Show Grid' 
    },

  ]

  // Hamburger menu items (file operations)
  const hamburgerMenuItems = [
    { 
      label: 'Open', 
      action: handleLoad, 
      icon: FolderOpen,
      title: 'Open' 
    },
    { 
      label: 'Save', 
      action: handleSave, 
      icon: Save,
      title: 'Save' 
    },
    { 
      label: 'Export', 
      type: 'export', 
      icon: Download,
      title: 'Export' 
    }
  ]

  return (
    <header className="sysloop-header" ref={headerRef}>
      <div className="header-left">
        {/* App Icon */}
        <div className="logo">
          <div className="logo-icon">
            <img 
              src={appIcon} 
              alt="CLD Studio" 
              className="app-icon"
            />
          </div>
        </div>

        {/* Editable Diagram Name Pill */}
        {editingName ? (
          <input
            className="diagram-name-pill-editable"
            type="text"
            value={tempName}
            autoFocus
            maxLength={20}
            onChange={e => setTempName(e.target.value)}
            onBlur={() => {
              setDiagramName(tempName.trim() || 'Untitled')
              setEditingName(false)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                setDiagramName(tempName.trim() || 'Untitled')
                setEditingName(false)
              } else if (e.key === 'Escape') {
                setTempName(diagramName)
                setEditingName(false)
              }
            }}
            style={{
              borderRadius: '9999px',
              padding: '4px 16px',
              fontWeight: 500,
              fontSize: '1rem',
              outline: 'none',
              width: '200px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
          />
        ) : (
          <button
            className="diagram-name-pill"
            onClick={() => {
              setTempName(diagramName)
              setEditingName(true)
            }}
            style={{
              borderRadius: '9999px',
              padding: '4px 16px',
              fontWeight: 500,
              fontSize: '1rem',
              width: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              boxSizing: 'border-box'
            }}
            title="Click to edit diagram name"
          >
            {diagramName}
          </button>
        )}
      </div>

      {/* Menu Bar - Centered */}
      <div className="header-center">
        <div className="menu-bar">
          {/* Hamburger Menu - Now part of the main menu bar */}
          <div className="menu-item hamburger-container" style={{ position: 'relative' }}>
            <button
              className="menu-icon-btn"
              onClick={toggleHamburgerDropdown}
              title="File Menu"
            >
              <Menu className="menu-icon" />
            </button>
          {showHamburgerDropdown && (
            <div 
              className="hamburger-dropdown" 
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '8px',
                zIndex: 1000,
                minWidth: '160px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {hamburgerMenuItems.map((item, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  {item.type === 'export' ? (
                    <div className="hamburger-export-container" style={{ position: 'relative' }}>
                      <button
                        onClick={toggleHamburgerExportDropdown}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#374151',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <item.icon size={14} />
                          {item.label}
                        </div>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                          <path d="M0 2l4 4 4-4z"/>
                        </svg>
                      </button>
                      {showHamburgerExportDropdown && (
                        <div 
                          className="hamburger-export-dropdown" 
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: '0',
                            left: '100%',
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '8px',
                            zIndex: 1001,
                            minWidth: '160px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }}
                        >
                          <button
                            onClick={() => {
                              handleExportAsPNG()
                              setShowHamburgerDropdown(false)
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#374151',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f3f4f6'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                            </svg>
                            Export as PNG
                          </button>
                          <button
                            onClick={() => {
                              handleExportAsSVG()
                              setShowHamburgerDropdown(false)
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#374151',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f3f4f6'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            Export as SVG
                          </button>
                          <button
                            onClick={() => {
                              handleExportAsPDF()
                              setShowHamburgerDropdown(false)
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#374151',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f3f4f6'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            Export as PDF
                          </button>
                          <button
                            onClick={() => {
                              handleExportDetailedData()
                              setShowHamburgerDropdown(false)
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#374151',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f3f4f6'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            Export Detailed Data
                          </button>
                          <button
                            onClick={() => {
                              handleExportMatrix()
                              setShowHamburgerDropdown(false)
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '12px',
                              color: '#374151',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f3f4f6'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 3h18v18H3z"/>
                              <path d="M9 9h6v6H9z"/>
                              <path d="M15 3v18"/>
                              <path d="M3 15h18"/>
                            </svg>
                            Export Matrix
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (item.action) {
                          item.action()
                          setShowHamburgerDropdown(false)
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#374151',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent'
                      }}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* <-- This closes the hamburger menu container */}

        {menuItems.map((item, index) => (
            <div key={index} className="menu-item">
              {item.type === 'color' ? (
                <div className="color-picker-container">
                  <input
                    type="color"
                    value={item.value}
                    onChange={(e) => item.action(e.target.value)}
                    className="color-picker-btn"
                    title={item.title}
                  />
                </div>
              ) : item.type === 'nodeColor' ? (
                <div className="menu-item" style={{ position: 'relative' }}>
                  <div className="node-color-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                      className="menu-icon-btn"
                      onClick={item.action}
                      title={item.title}
                    >
                      <item.icon className="menu-icon" />
                    </button>
                    <button
                      className="dropdown-arrow-btn"
                      onClick={item.dropdownAction}
                      title="Color options"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                        <path d="M0 2l4 4 4-4z"/>
                      </svg>
                    </button>
                  </div>
                  {/* Accent line showing currently selected color - always visible */}
                  <div 
                    className="accent-line"
                    style={{
                      position: 'absolute',
                      bottom: '-3px',
                      left: '0',
                      width: '32px', // Width of the main icon button only
                      height: '3px',
                      backgroundColor: getCurrentNodeColor(),
                      borderRadius: '1px',
                      opacity: 1,
                      zIndex: 999
                    }}
                  />
                  {showNodeColorDropdown && (
                    <div 
                      className="node-color-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        zIndex: 1000,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '4px',
                        minWidth: '200px'
                      }}
                    >
                      {predefinedColors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleNodeColorSelect(color)}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: color,
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : item.type === 'arrowColor' ? (
                <div className="menu-item" style={{ position: 'relative' }}>
                  <div className="arrow-color-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                      className="menu-icon-btn"
                      onClick={item.action}
                      title={item.title}
                    >
                      <item.icon className="menu-icon" />
                    </button>
                    <button
                      className="dropdown-arrow-btn"
                      onClick={item.dropdownAction}
                      title="Color options"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                        <path d="M0 2l4 4 4-4z"/>
                      </svg>
                    </button>
                  </div>
                  {/* Accent line showing currently selected color - always visible */}
                  <div 
                    className="accent-line"
                    style={{
                      position: 'absolute',
                      bottom: '-3px',
                      left: '0',
                      width: '32px', // Width of the main icon button only
                      height: '3px',
                      backgroundColor: getCurrentArrowColor(),
                      borderRadius: '1px',
                      opacity: 1,
                      zIndex: 999
                    }}
                  />
                  {showArrowColorDropdown && (
                    <div 
                      className="arrow-color-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        zIndex: 1000,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '4px',
                        minWidth: '200px'
                      }}
                    >
                      {predefinedColors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleArrowColorSelect(color)}
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: color,
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : item.type === 'select' ? (
                <div className="select-container">
                  <select
                    value={item.value}
                    onChange={(e) => item.action(e.target.value)}
                    className="select-btn"
                    title={item.title}
                  >
                    {item.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ) : item.type === 'slider' ? (
                <div className="slider-container" style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '4px',
                  minWidth: '80px',
                  maxWidth: '100px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    width: '100%'
                  }}>
                    <div className={item.iconClass} style={{ 
                      width: '16px',
                      height: '16px',
                      minWidth: '16px',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}></div>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={item.value}
                      onChange={(e) => item.action(e.target.value)}
                      className="slider-input"
                      title={item.title}
                      style={{
                        flex: 1,
                        height: '2px',
                        borderRadius: '1px',
                        background: '#d1d5db',
                        outline: 'none',
                        cursor: 'pointer',
                        minWidth: '40px',
                        opacity: '0.7',
                        transition: 'opacity 0.2s ease'
                      }}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    paddingLeft: '22px' // 16px icon width + 6px gap
                  }}>
                    <span style={{ 
                      fontSize: '9px', 
                      color: '#6b7280',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      {parseFloat(item.value).toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : item.type === 'designSettings' ? (
                <div className="design-settings-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {showDesignSettingsDropdown && (
                    <div 
                      className="design-settings-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '16px',
                        zIndex: 1000,
                        minWidth: '280px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Node Settings
                        </h4>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            Font Family
                          </label>
                          <select
                            value={globalStyles.nodeFont}
                            onChange={(e) => handleNodeFontChange(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            {['Arial', 'Helvetica', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Source Sans Pro', 'Nunito', 'Ubuntu', 'Segoe UI', 'SF Pro Display', 'Times New Roman', 'Georgia', 'Verdana'].map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            Font Size
                          </label>
                          <select
                            value={globalStyles.nodeFontSize}
                            onChange={(e) => handleNodeFontSizeChange(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          >
                            {[10, 12, 14, 16, 18, 20, 24].map((size) => (
                              <option key={size} value={size}>{size}px</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                          Arrow Settings
                        </h4>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            Stroke Width: {globalStyles.arrowWidth}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={globalStyles.arrowWidth}
                            onChange={(e) => handleArrowWidthChange(e.target.value)}
                            style={{
                              width: '100%',
                              height: '4px',
                              borderRadius: '2px',
                              background: '#e5e7eb',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            Transparency: {globalStyles.arrowTransparency}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={globalStyles.arrowTransparency}
                            onChange={(e) => handleArrowTransparencyChange(e.target.value)}
                            style={{
                              width: '100%',
                              height: '4px',
                              borderRadius: '2px',
                              background: '#e5e7eb',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            Head Size: {globalStyles.arrowHeadSize}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={globalStyles.arrowHeadSize}
                            onChange={(e) => handleArrowHeadSizeChange(e.target.value)}
                            style={{
                              width: '100%',
                              height: '4px',
                              borderRadius: '2px',
                              background: '#e5e7eb',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : item.type === 'export' ? (
                <div className="export-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {showExportDropdown && (
                    <div 
                      className="export-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '8px',
                        zIndex: 1000,
                        minWidth: '160px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <button
                        onClick={handleExportAsPNG}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#374151',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        Export as PNG
                      </button>
                      <button
                        onClick={handleExportAsSVG}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#374151',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        Export as SVG
                      </button>
                      <button
                        onClick={handleExportAsPDF}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#374151',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        Export as PDF
                      </button>
                      <div style={{
                        height: '1px',
                        backgroundColor: '#e5e7eb',
                        margin: '4px 0'
                      }}></div>
                      <button
                        onClick={handleExportDetailedData}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#374151',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        Export Detailed Data (JSON)
                      </button>
                      <button
                        onClick={handleExportMatrix}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#374151',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f3f4f6'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 3h18v18H3z"/>
                          <path d="M9 9h6v6H9z"/>
                          <path d="M15 3v18"/>
                          <path d="M3 15h18"/>
                        </svg>
                        Export Matrix (CSV)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="menu-icon-btn"
                  onClick={item.action}
                  title={item.title}
                >
                  <item.icon className="menu-icon" />
                </button>
              )}
            </div>
          ))}
        </div>
      
      </div>
      
      {/* Zoom, Pan, and Clear Canvas Controls */}
      <div className="header-center" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        borderLeft: '1px solid #374151',
        paddingLeft: '16px',
        marginLeft: '16px'
      }}>
        
        {/* Zoom, Pan, and Clear Controls Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '4px 8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="menu-icon-btn"
            title="Zoom In"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              padding: '4px 6px',
              color: '#9ca3af',
              marginRight: '0'
            }}
          >
            <ZoomIn className="menu-icon" />
          </button>
          
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="menu-icon-btn"
            title="Zoom Out"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              padding: '4px 6px',
              color: '#9ca3af',
              marginRight: '0'
            }}
          >
            <ZoomOut className="menu-icon" />
          </button>
          
          {/* Pan Mode Toggle */}
          <button
            onClick={togglePanningMode}
            className="menu-icon-btn"
            title={panningMode ? 'Exit Pan Mode' : 'Enter Pan Mode (Drag to pan)'}
            style={{
              background: panningMode ? '#3b82f6' : 'transparent',
              border: 'none',
              borderRadius: '50%',
              padding: '4px 6px',
              color: panningMode ? 'white' : '#9ca3af',
              marginRight: '0'
            }}
          >
            <Move className="menu-icon" />
          </button>
          
          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="menu-icon-btn"
            title="Reset View (Fit to Canvas)"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              padding: '4px 6px',
              color: '#9ca3af',
              marginRight: '0'
            }}
          >
            <RefreshCw className="menu-icon" />
          </button>
          
          {/* Clear Canvas */}
          <button
            onClick={handleClearCanvas}
            className="menu-icon-btn"
            title="Clear Canvas"
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              padding: '4px 6px',
              color: '#ef4444',
              marginRight: '0'
            }}
          >
            <Trash className="menu-icon" />
          </button>
          
          {/* Zoom Level Indicator */}
          <div style={{
            fontSize: '11px',
            color: '#9ca3af',
            padding: '2px 6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            minWidth: '40px',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}>
            {Math.round(viewTransform.scale * 100)}%
          </div>
          
        </div>
        
      </div>
      
      {/* Simulation Controls */}
      <div className="header-center" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        borderLeft: '1px solid #374151',
        paddingLeft: '16px',
        marginLeft: '16px'
      }}>
        
        {/* Simulation Controls Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '4px 8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Simulation Mode Toggle */}
          <button
            onClick={toggleSimulationMode}
            className="menu-icon-btn"
            title={simulationMode ? 'Disable Simulation Mode' : 'Enable Simulation Mode'}
            style={{
              background: simulationMode ? '#10b981' : 'transparent',
              border: 'none',
              borderRadius: '50%',
              padding: '4px 6px',
              color: simulationMode ? 'white' : '#9ca3af',
              marginRight: '0'
            }}
          >
            <BowArrow className="menu-icon" />
          </button>
          
          {/* Settings Dropdown - moved to second position */}
          <div className="sim-settings-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              className="menu-icon-btn"
              onClick={toggleSimSettingsDropdown}
              disabled={!simulationMode}
              title="Simulation settings"
              style={{
                opacity: !simulationMode ? 0.5 : 1
              }}
            >
              <Dices className="menu-icon" />
            </button>
            {showSimSettingsDropdown && (
              <div 
                className="sim-settings-dropdown" 
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  zIndex: 1000,
                  minWidth: '280px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Simulation Settings
                  </h4>
                  
                  {/* Node Selection */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Select Node
                    </label>
                    <select 
                      value={selectedSimNode} 
                      onChange={(e) => setSelectedSimNode(e.target.value)}
                      disabled={simulationState.isRunning}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: 'white'
                      }}
                    >
                      <option value="">Select node...</option>
                      {nodes.map(node => (
                        <option key={node.id} value={node.id}>
                          {node.data.label || `Node ${node.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Perturbation Value */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Perturbation Value
                    </label>
                    <input
                      type="number"
                      min="-100"
                      max="100"
                      value={perturbationValue}
                      onChange={(e) => handlePerturbationChange(parseInt(e.target.value))}
                      disabled={simulationState.isRunning}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Speed: {Math.round(2000 / simulationState.stepDelay * 10) / 10}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      step="0.5"
                      value={Math.round(2000 / simulationState.stepDelay * 10) / 10}
                      onChange={(e) => updateSimulationSettings({ stepDelay: Math.round(2000 / parseFloat(e.target.value)) })}
                      disabled={simulationState.isRunning}
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: '#d1d5db',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Max Steps: {simulationState.maxSteps}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={simulationState.maxSteps}
                      onChange={(e) => updateSimulationSettings({ maxSteps: parseInt(e.target.value) })}
                      disabled={simulationState.isRunning}
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: '#d1d5db',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  
                  {/* Initialize Button */}
                  <button
                    onClick={handleStartSimulation}
                    disabled={!selectedSimNode || simulationState.isRunning}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: !selectedSimNode || simulationState.isRunning ? 'not-allowed' : 'pointer',
                      opacity: !selectedSimNode || simulationState.isRunning ? 0.5 : 1
                    }}
                  >
                    Initialize Simulation
                  </button>
                </div>
              </div>
            )}
          
          
          {/* Control Buttons */}
          <button
            onClick={handlePlayWithAutoInit}
            disabled={!simulationMode || !simulationState.isInitialized || simulationState.isRunning}
            className="menu-icon-btn"
            title={
              !simulationState.isInitialized ? "Initialize simulation first" :
              simulationState.isRunning ? "Simulation is running" :
              simulationState.isPaused ? "Resume simulation" :
              simulationState.currentStep >= simulationState.maxSteps ? "Re-run simulation from beginning" :
              "Start simulation"
            }
            style={{
              opacity: !simulationMode || !simulationState.isInitialized || simulationState.isRunning ? 0.5 : 1,
              animation: simulationState.isRunning ? 'blink 1s infinite' : 'none',
              padding: '4px 6px',
              marginRight: '0'
            }}
          >
            <Play className="menu-icon" />
          </button>
          
          <button
            onClick={pauseSimulation}
            disabled={!simulationMode || !simulationState.isRunning}
            className="menu-icon-btn"
            title="Pause simulation"
            style={{
              opacity: !simulationMode || !simulationState.isRunning ? 0.5 : 1,
              padding: '4px 6px',
              marginRight: '0'
            }}
          >
            <Pause className="menu-icon" />
          </button>
          
          <button
            onClick={stepBackSimulation}
            disabled={!simulationMode || !simulationState.isInitialized || simulationState.isRunning}
            className="menu-icon-btn"
            title="Step back"
            style={{
              opacity: !simulationMode || !simulationState.isInitialized || simulationState.isRunning ? 0.5 : 1,
              padding: '4px 6px',
              marginRight: '0'
            }}
          >
            <SkipBack className="menu-icon" />
          </button>
          
          <button
            onClick={stepSimulation}
            disabled={!simulationMode || !simulationState.isInitialized || simulationState.isRunning}
            className="menu-icon-btn"
            title="Step forward"
            style={{
              opacity: !simulationMode || !simulationState.isInitialized || simulationState.isRunning ? 0.5 : 1,
              padding: '4px 6px',
              marginRight: '0'
            }}
          >
            <SkipForward className="menu-icon" />
          </button>
          
          <button
            onClick={resetSimulation}
            disabled={!simulationMode}
            className="menu-icon-btn"
            title="Reset simulation"
            style={{
              opacity: !simulationMode ? 0.5 : 1,
              padding: '4px 6px',
              marginRight: '0'
            }}
          >
            <TimerReset className="menu-icon" />
          </button>
        </div>
        
        {/* Progress Bar */}
        {simulationMode && simulationState.isInitialized && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            marginLeft: '5px'
          }}>
            <span style={{
              fontSize: '10px',
              color: '#9ca3af',
              textAlign: 'center'
            }}>
              {simulationState.currentStep}/{simulationState.maxSteps}
            </span>
            <div style={{
              width: '80px',
              height: '4px',
              backgroundColor: '#374151',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${Math.min(100, (simulationState.currentStep / simulationState.maxSteps) * 100)}%`,
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
                position: 'absolute',
                left: 0,
                top: 0
              }} />
            </div>
          </div>
        )}
        
        {/* Modal Buttons */}
        <button
          onClick={() => setShowStateVectorModal(true)}
          disabled={!simulationMode}
          className="menu-icon-btn"
          title="Show state vectors"
          style={{
            opacity: !simulationMode ? 0.5 : 1
          }}
        >
          <BarChart3 className="menu-icon" />
        </button>
        
        <button
          onClick={() => setShowPlotsModal(true)}
          disabled={!simulationMode}
          className="menu-icon-btn"
          title="Show plots"
          style={{
            opacity: !simulationMode ? 0.5 : 1
          }}
        >
          <Activity className="menu-icon" />
        </button>
        
        {/* LED Status Indicator */}
        <div 
          className={`simulation-led ${
            !simulationMode ? 'inactive' :
            !simulationState.isInitialized ? 'inactive' :
            simulationState.isRunning ? 'running' :
            simulationState.isPaused ? 'paused' :
            simulationState.currentStep >= simulationState.maxSteps ? 'completed' : 'ready'
          }`}
          title={
            !simulationMode ? 'Simulation mode disabled' :
            !simulationState.isInitialized ? 'Simulation not initialized' :
            simulationState.isRunning ? 'Simulation running' :
            simulationState.isPaused ? 'Simulation paused' :
            simulationState.currentStep >= simulationState.maxSteps ? 'Simulation completed' : 'Simulation ready'
          }
        />
        </div>
      </div>

      <div className="header-right" style={{ marginLeft: 'auto', paddingRight: '0' }}>
        {/* TBT Logo */}
        <div className="logo">
          <div className="logo-icon">
            <img 
              src={tbtIcon} 
              alt="TBT" 
              className="app-icon"
            />
          </div>
        </div>
      </div>



      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      )}

      {/* State Vector Modal */}
      {showStateVectorModal && (
        <StateVectorModal 
          isOpen={showStateVectorModal} 
          onClose={() => setShowStateVectorModal(false)} 
        />
      )}
      
      {/* Plots Modal */}
      {showPlotsModal && (
        <PlotsModal 
          isOpen={showPlotsModal} 
          onClose={() => setShowPlotsModal(false)} 
        />
      )}
    </header>
  )
}

export default SysLoopHeader 
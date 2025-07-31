import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { FolderOpen, Save, RotateCcw, RotateCw, Trash2, Download, Diamond, Spline, Brush, Settings, RefreshCw, Grid, LayoutGrid, Play, Pause, RotateCcw as StepBack, RotateCw as StepForward, Square, Settings as SettingsIcon, BarChart3, Activity, Undo2, Redo2, Eraser, Grid3x3, SplinePointer, Dices, SkipForward, SkipBack, TimerReset, ZoomIn, ZoomOut, Move, Trash, DraftingCompass, Laptop, Database, Gamepad2, Settings2, LogOut } from 'lucide-react'

import SettingsModal from './SettingsModal'
import StateVectorModal from './StateVectorModal'
import PlotsModal from './PlotsModal'
import ExamplesModal from './ExamplesModal'
import { loadConfig } from '../config/appConfig'
import appIcon from '../assets/app_icon.png'
import tbtIcon from '../assets/tbt_icon.png'
import './SysLoopHeader.css'

function SysLoopHeader({ signOut }) {
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
    globalStyles,
    selectedNode,
    selectedEdge,
    setNodeFont,
    setNodeFontSize,

    setArrowWidth,
    setArrowTransparency,
    setArrowHeadSize,

    updateSelectedNodeColor,
    updateSelectedEdgeColor,
    updateSelectedNodesColor,
    updateSelectedEdgesColor,
    setSelectedNodeColor,
    setSelectedArrowColor,
    selectedNodeColor,
    selectedArrowColor,
    selectedNodes,
    selectedEdges,
    diagramName,
    setDiagramName,
    showGrid,
    toggleGrid,

    resetView,

    arrowDrawingMode,
    toggleArrowDrawingMode,
    simulationState,
    simulationMode,
    initializeSimulation,
    runSimulation,
    pauseSimulation,
    stepSimulation,
    stepBackSimulation,
    resetSimulation,
    updateSimulationSettings,
    toggleSimulationMode,
    undo,
    redo,
    undoStack,
    redoStack,
    activeDropdown,
    setActiveDropdown,
    closeAllDropdowns
  } = useCLDStore()
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(diagramName)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedSimNode, setSelectedSimNode] = useState('')
  const [perturbationValue, setPerturbationValue] = useState(1)
  const [showPlotsModal, setShowPlotsModal] = useState(false)
  const [showStateVectorModal, setShowStateVectorModal] = useState(false)
  const [showExamplesModal, setShowExamplesModal] = useState(false)

  
  // Load config for colors
  const config = loadConfig()
  
  // Predefined colors for the dropdown (from config)
  const predefinedColors = config.colors.palette
  
  const headerRef = useRef(null)



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





  const handleExportAsPNG = () => {
    exportAsPNG()
    closeAllDropdowns()
  }

  const handleExportAsJPEG = () => {
    // For now, using PNG export - you can implement JPEG-specific export later
    exportAsPNG()
    closeAllDropdowns()
  }

  const handleExportAsSVG = () => {
    exportAsSVG()
    closeAllDropdowns()
  }

  const handleExportAsPDF = () => {
    exportAsPDF()
    closeAllDropdowns()
  }

  const handleExportDetailedData = () => {
    exportDetailedData()
    closeAllDropdowns()
  }

  const handleExportMatrix = () => {
    exportMatrix()
    closeAllDropdowns()
  }

  const handleUndo = () => {
    undo()
  }

  const handleRedo = () => {
    redo()
  }



  const handleNodeFontChange = (font) => {
    setNodeFont(font)
  }

  const handleNodeFontSizeChange = (size) => {
    setNodeFontSize(size)
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
    // Like PowerPoint: apply the currently selected color to the selected node(s)
    if (selectedNodes.length > 0) {
      // Apply to multiselected nodes
      updateSelectedNodesColor(selectedNodeColor)
    } else if (selectedNode) {
      // Apply to single selected node
      updateSelectedNodeColor(selectedNodeColor)
    }
  }

  const handleNodeColorDropdownToggle = (e) => {
    e.stopPropagation()
    if (activeDropdown === 'nodeColor') {
      closeAllDropdowns()
    } else {
      setActiveDropdown('nodeColor')
    }
  }

  const handleNodeColorSelect = (color) => {
    // Update the selected color (like PowerPoint)
    setSelectedNodeColor(color)
    closeAllDropdowns()
    // Apply the color directly to the selected node(s) if any are selected
    if (selectedNodes.length > 0) {
      updateSelectedNodesColor(color)
    } else if (selectedNode) {
      updateSelectedNodeColor(color)
    }
  }

  const handleArrowColorClick = () => {
    // Like PowerPoint: apply the currently selected color to the selected edge(s)
    if (selectedEdges.length > 0) {
      // Apply to multiselected edges
      updateSelectedEdgesColor(selectedArrowColor)
    } else if (selectedEdge) {
      // Apply to single selected edge
      updateSelectedEdgeColor(selectedArrowColor)
    }
  }

  const handleArrowColorDropdownToggle = (e) => {
    e.stopPropagation()
    if (activeDropdown === 'arrowColor') {
      closeAllDropdowns()
    } else {
      setActiveDropdown('arrowColor')
    }
  }

  const handleArrowColorSelect = (color) => {
    // Update the selected color (like PowerPoint)
    setSelectedArrowColor(color)
    closeAllDropdowns()
    // Apply the color directly to the selected edge(s) if any are selected
    if (selectedEdges.length > 0) {
      updateSelectedEdgesColor(color)
    } else if (selectedEdge) {
      updateSelectedEdgeColor(color)
    }
  }





  const handleDesignSettingsDropdownToggle = (e) => {
    e.stopPropagation()
    if (activeDropdown === 'designSettings') {
      closeAllDropdowns()
    } else {
      setActiveDropdown('designSettings')
    }
  }



  // Simulation functions
  const handleStartSimulation = () => {
    if (selectedSimNode && perturbationValue !== 0) {
      const success = initializeSimulation(parseInt(selectedSimNode), perturbationValue)
      if (success) {
        // Close the dropdown after successful initialization
        closeAllDropdowns()
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



  const handleResetView = () => {
    resetView()
  }

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
      clearDiagram()
    }
  }

  const handleOpenExamples = () => {
    setShowExamplesModal(true)
    closeAllDropdowns()
  }

  const toggleSimSettingsDropdown = () => {
    if (activeDropdown === 'simSettings') {
      closeAllDropdowns()
    } else {
      setActiveDropdown('simSettings')
    }
  }



  const toggleExportDropdown = (e) => {
    e.stopPropagation()
    if (activeDropdown === 'export') {
      closeAllDropdowns()
    } else {
      setActiveDropdown('export')
    }
  }

  const toggleOpenDropdown = (e) => {
    e.stopPropagation()
    if (activeDropdown === 'open') {
      closeAllDropdowns()
    } else {
      setActiveDropdown('open')
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside any dropdown
      const isInsideDesignDropdown = event.target.closest('.design-settings-dropdown')
      const isInsideNodeColorDropdown = event.target.closest('.node-color-dropdown')
      const isInsideArrowColorDropdown = event.target.closest('.arrow-color-dropdown')
      const isInsideExportDropdown = event.target.closest('.export-dropdown')
      const isInsideOpenDropdown = event.target.closest('.open-dropdown')
      const isInsideSimSettingsDropdown = event.target.closest('.sim-settings-dropdown')

      
      // Check if click is on the dropdown toggle button
      const isOnDesignToggle = event.target.closest('.design-settings-container')
      const isOnNodeColorToggle = event.target.closest('.node-color-container')
      const isOnArrowColorToggle = event.target.closest('.arrow-color-container')
      const isOnExportToggle = event.target.closest('.export-container')
      const isOnOpenToggle = event.target.closest('.open-container')
      const isOnSimSettingsToggle = event.target.closest('.sim-settings-container')

      
      // Only close if clicking outside both the dropdown and its toggle button
      if (activeDropdown === 'designSettings' && !isInsideDesignDropdown && !isOnDesignToggle) {
        closeAllDropdowns()
      }
      if (activeDropdown === 'nodeColor' && !isInsideNodeColorDropdown && !isOnNodeColorToggle) {
        closeAllDropdowns()
      }
      if (activeDropdown === 'arrowColor' && !isInsideArrowColorDropdown && !isOnArrowColorToggle) {
        closeAllDropdowns()
      }
      if (activeDropdown === 'export' && !isInsideExportDropdown && !isOnExportToggle) {
        closeAllDropdowns()
      }
      if (activeDropdown === 'open' && !isInsideOpenDropdown && !isOnOpenToggle) {
        closeAllDropdowns()
      }
      if (activeDropdown === 'simSettings' && !isInsideSimSettingsDropdown && !isOnSimSettingsToggle) {
        closeAllDropdowns()
      }

    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [activeDropdown, closeAllDropdowns])

  // Update tempName when diagramName changes (e.g., when loading a file)
  useEffect(() => {
    setTempName(diagramName)
  }, [diagramName])

  const menuItems = [
    { 
      label: 'Open', 
      type: 'open', 
      action: toggleOpenDropdown,
      dropdownAction: toggleOpenDropdown,
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
      action: toggleExportDropdown,
      dropdownAction: toggleExportDropdown,
      icon: Download,
      title: 'Export' 
    },
    { 
      label: `Undo${undoStack.length > 0 ? ` (${undoStack.length})` : ''}`, 
      action: handleUndo, 
      icon: Undo2,
      title: `Undo (Ctrl+Z)${undoStack.length > 0 ? ` - ${undoStack.length} steps available` : ' - Nothing to undo'}`,
      disabled: undoStack.length === 0
    },
    { 
      label: `Redo${redoStack.length > 0 ? ` (${redoStack.length})` : ''}`, 
      action: handleRedo, 
      icon: Redo2,
      title: `Redo (Ctrl+Y)${redoStack.length > 0 ? ` - ${redoStack.length} steps available` : ' - Nothing to redo'}`,
      disabled: redoStack.length === 0
    },
    { 
      label: 'Reset View', 
      action: handleResetView, 
      icon: RefreshCw,
      title: 'Reset View (Fit to Canvas)' 
    },
    { 
      label: 'Clear Canvas', 
      action: handleClearCanvas, 
      icon: Trash,
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
      label: 'Arrow Mode', 
      action: toggleArrowDrawingMode, 
      icon: SplinePointer,
      title: simulationMode ? 'Arrow Mode disabled during simulation' : (arrowDrawingMode ? 'Exit Arrow Drawing Mode' : 'Enter Arrow Drawing Mode'),
      disabled: simulationMode
    },
    { 
      label: 'Design Settings', 
      type: 'designSettings', 
      dropdownAction: handleDesignSettingsDropdownToggle,
      icon: DraftingCompass,
      title: 'Global Design Settings' 
    },
    { 
      label: 'Show Grid', 
      action: toggleGrid, 
      icon: Grid3x3,
      title: showGrid ? 'Hide Grid' : 'Show Grid' 
    },

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

        {/* Editable Diagram Name Pill with .cld suffix */}
        {editingName ? (
          <div className="file-name-container editing">
            <input
              className="file-name-input"
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
            />
            <span className="file-name-suffix">.cld</span>
          </div>
        ) : (
          <button
            className="file-name-container"
            onClick={() => {
              setTempName(diagramName)
              setEditingName(true)
            }}
            title="Click to edit diagram name"
          >
            <span className="file-name-input">{diagramName}</span>
            <span className="file-name-suffix">.cld</span>
          </button>
        )}
      </div>

      {/* Menu Bar - Centered */}
      <div className="header-center">
        <div className="menu-bar">
          {/* Group 1: File Operations */}
          {menuItems.slice(0, 3).map((item, index) => (
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
                <div className="menu-item menu-item-relative">
                  <div className="node-color-container node-color-container-relative">
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
                    className="accent-line accent-line-node"
                    style={{
                      backgroundColor: getCurrentNodeColor()
                    }}
                  />
                  {activeDropdown === 'nodeColor' && (
                    <div 
                      className="node-color-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {predefinedColors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleNodeColorSelect(color)}
                          className="color-button"
                          style={{
                            backgroundColor: color
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : item.type === 'arrowColor' ? (
                <div className="menu-item menu-item-relative">
                  <div className="arrow-color-container arrow-color-container-relative">
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
                    className="accent-line accent-line-arrow"
                    style={{
                      backgroundColor: getCurrentArrowColor()
                    }}
                  />
                  {activeDropdown === 'arrowColor' && (
                    <div 
                      className="arrow-color-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {predefinedColors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleArrowColorSelect(color)}
                          className="color-button"
                          style={{
                            backgroundColor: color
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
                <div className="slider-container slider-container-vertical">
                  <div className="slider-input-container">
                    <div className={`${item.iconClass} slider-icon`}></div>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={item.value}
                      onChange={(e) => item.action(e.target.value)}
                      className="slider-input slider-input-custom"
                      title={item.title}
                    />
                  </div>
                  <div className="slider-value-display">
                    <span className="slider-value-text">
                      {parseFloat(item.value).toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : item.type === 'designSettings' ? (
                <div className="design-settings-container design-settings-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'designSettings' && (
                    <div 
                      className="design-settings-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="form-section">
                        <h4 className="form-section-title">
                          Node Settings
                        </h4>
                        <div className="form-group">
                          <label className="form-label">
                            Font Family
                          </label>
                          <select
                            value={globalStyles.nodeFont}
                            onChange={(e) => handleNodeFontChange(e.target.value)}
                            className="form-select"
                          >
                            {['Arial', 'Helvetica', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Source Sans Pro', 'Nunito', 'Ubuntu', 'Segoe UI', 'SF Pro Display', 'Times New Roman', 'Georgia', 'Verdana'].map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Font Size
                          </label>
                          <select
                            value={globalStyles.nodeFontSize}
                            onChange={(e) => handleNodeFontSizeChange(e.target.value)}
                            className="form-select"
                          >
                            {[10, 12, 14, 16, 18, 20, 24].map((size) => (
                              <option key={size} value={size}>{size}px</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-section">
                        <h4 className="form-section-title">
                          Arrow Settings
                        </h4>
                        <div className="form-group">
                          <label className="form-label">
                            Stroke Width: {globalStyles.arrowWidth}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={globalStyles.arrowWidth}
                            onChange={(e) => handleArrowWidthChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Transparency: {globalStyles.arrowTransparency}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={globalStyles.arrowTransparency}
                            onChange={(e) => handleArrowTransparencyChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Head Size: {globalStyles.arrowHeadSize}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={globalStyles.arrowHeadSize}
                            onChange={(e) => handleArrowHeadSizeChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : item.type === 'export' ? (
                <div className="export-container export-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'export' && (
                    <div 
                      className="export-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleExportAsPNG}
                        className="dropdown-button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        Export as PNG
                      </button>
                      <button
                        onClick={handleExportAsJPEG}
                        className="dropdown-button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        Export as JPEG
                      </button>
                      <button
                        onClick={handleExportAsSVG}
                        className="dropdown-button"
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
                        className="dropdown-button"
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
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={handleExportDetailedData}
                        className="dropdown-button"
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
                        className="dropdown-button"
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
              ) : item.type === 'open' ? (
                <div className="open-container open-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'open' && (
                    <div 
                      className="open-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleLoad}
                        className="dropdown-button"
                      >
                        <Laptop size={14} />
                        From PC
                      </button>
                      <button
                        onClick={handleOpenExamples}
                        className="dropdown-button"
                      >
                        <Database size={14} />
                        Examples
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className={`menu-icon-btn ${item.label === 'Arrow Mode' && arrowDrawingMode ? 'arrow-mode-active' : ''} ${item.disabled ? 'menu-button-disabled' : 'menu-button-enabled'}`}
                  onClick={item.action}
                  disabled={item.disabled}
                  title={item.title}
                >
                  <item.icon className="menu-icon" />
                </button>
              )}
            </div>
          ))}
          
          {/* Separator between File Operations and Edit Actions */}
          <div className="menu-separator"></div>
          
          {/* Group 2: Edit Actions */}
          {menuItems.slice(3, 7).map((item, index) => (
            <div key={index + 3} className="menu-item">
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
                <div className="menu-item menu-item-relative">
                  <div className="node-color-container node-color-container-relative">
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
                    className="accent-line accent-line-node"
                    style={{
                      backgroundColor: getCurrentNodeColor()
                    }}
                  />
                  {activeDropdown === 'nodeColor' && (
                    <div 
                      className="node-color-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {predefinedColors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleNodeColorSelect(color)}
                          className="color-button"
                          style={{
                            backgroundColor: color
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : item.type === 'arrowColor' ? (
                <div className="menu-item menu-item-relative">
                  <div className="arrow-color-container arrow-color-container-relative">
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
                    className="accent-line accent-line-arrow"
                    style={{
                      backgroundColor: getCurrentArrowColor()
                    }}
                  />
                  {activeDropdown === 'arrowColor' && (
                    <div 
                      className="arrow-color-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {predefinedColors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleArrowColorSelect(color)}
                          className="color-button"
                          style={{
                            backgroundColor: color
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
                <div className="slider-container slider-container-vertical">
                  <div className="slider-input-container">
                    <div className={`${item.iconClass} slider-icon`}></div>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={item.value}
                      onChange={(e) => item.action(e.target.value)}
                      className="slider-input slider-input-custom"
                      title={item.title}
                    />
                  </div>
                  <div className="slider-value-display">
                    <span className="slider-value-text">
                      {parseFloat(item.value).toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : item.type === 'designSettings' ? (
                <div className="design-settings-container design-settings-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'designSettings' && (
                    <div 
                      className="design-settings-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="form-section">
                        <h4 className="form-section-title">
                          Node Settings
                        </h4>
                        <div className="form-group">
                          <label className="form-label">
                            Font Family
                          </label>
                          <select
                            value={globalStyles.nodeFont}
                            onChange={(e) => handleNodeFontChange(e.target.value)}
                            className="form-select"
                          >
                            {['Arial', 'Helvetica', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Source Sans Pro', 'Nunito', 'Ubuntu', 'Segoe UI', 'SF Pro Display', 'Times New Roman', 'Georgia', 'Verdana'].map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Font Size
                          </label>
                          <select
                            value={globalStyles.nodeFontSize}
                            onChange={(e) => handleNodeFontSizeChange(e.target.value)}
                            className="form-select"
                          >
                            {[10, 12, 14, 16, 18, 20, 24].map((size) => (
                              <option key={size} value={size}>{size}px</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-section">
                        <h4 className="form-section-title">
                          Arrow Settings
                        </h4>
                        <div className="form-group">
                          <label className="form-label">
                            Stroke Width: {globalStyles.arrowWidth}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={globalStyles.arrowWidth}
                            onChange={(e) => handleArrowWidthChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Transparency: {globalStyles.arrowTransparency}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={globalStyles.arrowTransparency}
                            onChange={(e) => handleArrowTransparencyChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Head Size: {globalStyles.arrowHeadSize}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={globalStyles.arrowHeadSize}
                            onChange={(e) => handleArrowHeadSizeChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : item.type === 'export' ? (
                <div className="export-container export-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'export' && (
                    <div 
                      className="export-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleExportAsPNG}
                        className="dropdown-button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        Export as PNG
                      </button>
                      <button
                        onClick={handleExportAsJPEG}
                        className="dropdown-button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        Export as JPEG
                      </button>
                      <button
                        onClick={handleExportAsSVG}
                        className="dropdown-button"
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
                        className="dropdown-button"
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
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={handleExportDetailedData}
                        className="dropdown-button"
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
                        className="dropdown-button"
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
              ) : item.type === 'open' ? (
                <div className="open-container open-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'open' && (
                    <div 
                      className="open-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleLoad}
                        className="dropdown-button"
                      >
                        <Laptop size={14} />
                        From PC
                      </button>
                      <button
                        onClick={handleOpenExamples}
                        className="dropdown-button"
                      >
                        <Database size={14} />
                        Examples
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className={`menu-icon-btn ${item.label === 'Arrow Mode' && arrowDrawingMode ? 'arrow-mode-active' : ''} ${item.disabled ? 'menu-button-disabled' : 'menu-button-enabled'}`}
                  onClick={item.action}
                  disabled={item.disabled}
                  title={item.title}
                >
                  <item.icon className="menu-icon" />
                </button>
              )}
            </div>
          ))}
          
          {/* Separator between Edit Actions and Drawing Tools */}
          <div className="menu-separator"></div>
          
          {/* Group 3: Drawing Tools */}
          {menuItems.slice(7, 12).map((item, index) => (
            <div key={index + 7} className="menu-item">
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
                <div className="menu-item menu-item-relative">
                  <div className="node-color-container node-color-container-relative">
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
                    className="accent-line accent-line-node"
                    style={{
                      backgroundColor: getCurrentNodeColor()
                    }}
                  />
                  {activeDropdown === 'nodeColor' && (
                    <div 
                      className="node-color-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {predefinedColors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleNodeColorSelect(color)}
                          className="color-button"
                          style={{
                            backgroundColor: color
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : item.type === 'arrowColor' ? (
                <div className="menu-item menu-item-relative">
                  <div className="arrow-color-container arrow-color-container-relative">
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
                    className="accent-line accent-line-arrow"
                    style={{
                      backgroundColor: getCurrentArrowColor()
                    }}
                  />
                  {activeDropdown === 'arrowColor' && (
                    <div 
                      className="arrow-color-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {predefinedColors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => handleArrowColorSelect(color)}
                          className="color-button"
                          style={{
                            backgroundColor: color
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
                <div className="slider-container slider-container-vertical">
                  <div className="slider-input-container">
                    <div className={`${item.iconClass} slider-icon`}></div>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={item.value}
                      onChange={(e) => item.action(e.target.value)}
                      className="slider-input slider-input-custom"
                      title={item.title}
                    />
                  </div>
                  <div className="slider-value-display">
                    <span className="slider-value-text">
                      {parseFloat(item.value).toFixed(1)}
                    </span>
                  </div>
                </div>
              ) : item.type === 'designSettings' ? (
                <div className="design-settings-container design-settings-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'designSettings' && (
                    <div 
                      className="design-settings-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="form-section">
                        <h4 className="form-section-title">
                          Node Settings
                        </h4>
                        <div className="form-group">
                          <label className="form-label">
                            Font Family
                          </label>
                          <select
                            value={globalStyles.nodeFont}
                            onChange={(e) => handleNodeFontChange(e.target.value)}
                            className="form-select"
                          >
                            {['Arial', 'Helvetica', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Source Sans Pro', 'Nunito', 'Ubuntu', 'Segoe UI', 'SF Pro Display', 'Times New Roman', 'Georgia', 'Verdana'].map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Font Size
                          </label>
                          <select
                            value={globalStyles.nodeFontSize}
                            onChange={(e) => handleNodeFontSizeChange(e.target.value)}
                            className="form-select"
                          >
                            {[10, 12, 14, 16, 18, 20, 24].map((size) => (
                              <option key={size} value={size}>{size}px</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-section">
                        <h4 className="form-section-title">
                          Arrow Settings
                        </h4>
                        <div className="form-group">
                          <label className="form-label">
                            Stroke Width: {globalStyles.arrowWidth}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={globalStyles.arrowWidth}
                            onChange={(e) => handleArrowWidthChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Transparency: {globalStyles.arrowTransparency}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={globalStyles.arrowTransparency}
                            onChange={(e) => handleArrowTransparencyChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Head Size: {globalStyles.arrowHeadSize}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={globalStyles.arrowHeadSize}
                            onChange={(e) => handleArrowHeadSizeChange(e.target.value)}
                            className="form-range"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : item.type === 'export' ? (
                <div className="export-container export-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'export' && (
                    <div 
                      className="export-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleExportAsPNG}
                        className="dropdown-button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        Export as PNG
                      </button>
                      <button
                        onClick={handleExportAsJPEG}
                        className="dropdown-button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                        Export as JPEG
                      </button>
                      <button
                        onClick={handleExportAsSVG}
                        className="dropdown-button"
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
                        className="dropdown-button"
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
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={handleExportDetailedData}
                        className="dropdown-button"
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
                        className="dropdown-button"
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
              ) : item.type === 'open' ? (
                <div className="open-container open-container-relative">
                  <button
                    className="menu-icon-btn"
                    onClick={item.dropdownAction}
                    title={item.title}
                  >
                    <item.icon className="menu-icon" />
                  </button>
                  {activeDropdown === 'open' && (
                    <div 
                      className="open-dropdown" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={handleLoad}
                        className="dropdown-button"
                      >
                        <Laptop size={14} />
                        From PC
                      </button>
                      <button
                        onClick={handleOpenExamples}
                        className="dropdown-button"
                      >
                        <Database size={14} />
                        Examples
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className={`menu-icon-btn ${item.label === 'Arrow Mode' && arrowDrawingMode ? 'arrow-mode-active' : ''} ${item.disabled ? 'menu-button-disabled' : 'menu-button-enabled'}`}
                  onClick={item.action}
                  disabled={item.disabled}
                  title={item.title}
                >
                  <item.icon className="menu-icon" />
                </button>
              )}
            </div>
          ))}
          {/* Separator before Simulation Controls */}
          <div className="menu-separator"></div>
          
          {/* Simulation Mode Toggle */}
          <button
            onClick={toggleSimulationMode}
            className={`menu-icon-btn simulation-mode-btn ${simulationMode ? 'simulation-active' : ''} simulation-button-enabled`}
            title={simulationMode ? 'Disable Simulation Mode' : 'Enable Simulation Mode'}
          >
            <Gamepad2 className="menu-icon" />
          </button>
          
          {/* Simulation Settings */}
          <div className="menu-item menu-item-relative">
            <div className="sim-settings-container sim-settings-container-relative">
              <button
                className="menu-icon-btn simulation-button-enabled"
                onClick={toggleSimSettingsDropdown}
                title="Simulation settings"
              >
                <Settings2 className="menu-icon" />
              </button>
              {activeDropdown === 'simSettings' && (
                <div 
                  className="sim-settings-dropdown" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="form-section">
                    <h4 className="form-section-title">
                      Simulation Settings
                    </h4>
                    
                    {/* Node Selection */}
                    <div className="form-group">
                      <label className="form-label">
                        Select Node
                      </label>
                      <select 
                        value={selectedSimNode} 
                        onChange={(e) => setSelectedSimNode(e.target.value)}
                        disabled={simulationState.isRunning}
                        className="form-select"
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
                    <div className="form-group">
                      <label className="form-label">
                        Perturbation Value
                      </label>
                      <input
                        type="number"
                        min="-100"
                        max="100"
                        value={perturbationValue}
                        onChange={(e) => handlePerturbationChange(parseInt(e.target.value))}
                        disabled={simulationState.isRunning}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
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
                        className="simulation-range"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
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
                        className="simulation-range"
                      />
                    </div>
                    
                    {/* Initialize Button */}
                    <button
                      onClick={handleStartSimulation}
                      disabled={!selectedSimNode || simulationState.isRunning}
                      className="initialize-button"
                    >
                      Initialize Simulation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Control Buttons */}
          <button
            onClick={handlePlayWithAutoInit}
            disabled={!simulationMode || !simulationState.isInitialized || simulationState.isRunning}
            className={`menu-icon-btn ${!simulationMode || !simulationState.isInitialized || simulationState.isRunning ? 'simulation-button-disabled' : simulationState.isRunning ? 'simulation-button-running' : 'simulation-button-enabled'}`}
            title={
              !simulationState.isInitialized ? "Initialize simulation first" :
              simulationState.isRunning ? "Simulation is running" :
              simulationState.isPaused ? "Resume simulation" :
              simulationState.currentStep >= simulationState.maxSteps ? "Re-run simulation from beginning" :
              "Start simulation"
            }
          >
            <Play className="menu-icon" />
          </button>
          
          <button
            onClick={pauseSimulation}
            disabled={!simulationMode || !simulationState.isRunning}
            className={`menu-icon-btn ${!simulationMode || !simulationState.isRunning ? 'simulation-button-disabled' : 'simulation-button-enabled'}`}
            title="Pause simulation"
          >
            <Pause className="menu-icon" />
          </button>
          
          <button
            onClick={stepBackSimulation}
            disabled={!simulationMode || !simulationState.isInitialized || simulationState.isRunning}
            className={`menu-icon-btn ${!simulationMode || !simulationState.isInitialized || simulationState.isRunning ? 'simulation-button-disabled' : 'simulation-button-enabled'}`}
            title="Step back"
          >
            <SkipBack className="menu-icon" />
          </button>
          
          <button
            onClick={stepSimulation}
            disabled={!simulationMode || !simulationState.isInitialized || simulationState.isRunning}
            className={`menu-icon-btn ${!simulationMode || !simulationState.isInitialized || simulationState.isRunning ? 'simulation-button-disabled' : 'simulation-button-enabled'}`}
            title="Step forward"
          >
            <SkipForward className="menu-icon" />
          </button>
          
          <button
            onClick={resetSimulation}
            disabled={!simulationMode}
            className={`menu-icon-btn ${!simulationMode ? 'simulation-button-disabled' : 'simulation-button-enabled'}`}
            title="Reset simulation"
          >
            <TimerReset className="menu-icon" />
          </button>
          
          {/* State Vector, Plot, and LED */}
          <button
            onClick={() => setShowStateVectorModal(true)}
            disabled={!simulationMode}
            className={`menu-icon-btn ${!simulationMode ? 'modal-button-disabled' : 'modal-button-enabled'}`}
            title="Show state vectors"
          >
            <BarChart3 className="menu-icon" />
          </button>
          
          <button
            onClick={() => setShowPlotsModal(true)}
            disabled={!simulationMode}
            className={`menu-icon-btn ${!simulationMode ? 'modal-button-disabled' : 'modal-button-enabled'}`}
            title="Show plots"
          >
            <Activity className="menu-icon" />
          </button>
          
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
          
          {/* Progress Bar */}
          {simulationMode && simulationState.isInitialized && (
            <div className="progress-container">
              <span className="progress-text">
                {simulationState.currentStep}/{simulationState.maxSteps}
              </span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, (simulationState.currentStep / simulationState.maxSteps) * 100)}%`
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Header Right - Sign Out and TBT Logo */}
      <div className="header-right">
        {/* Sign Out Button */}
        <button
          onClick={signOut}
          className="header-signout-btn"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
        <div className="bodhi-logo">
          <img 
            src={tbtIcon} 
            alt="TBT Logo" 
          />
        </div>
      </div>

      {/* Modal Buttons */}
      


      {/* Modals */}
      {showExamplesModal && (
        <ExamplesModal 
          isOpen={showExamplesModal} 
          onClose={() => setShowExamplesModal(false)} 
        />
      )}
    </header>
  )
}

export default SysLoopHeader 
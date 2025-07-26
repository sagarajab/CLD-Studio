import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { FolderOpen, Save, RotateCcw, RotateCw, Trash2, Download, Diamond, Spline, Brush, Settings, RefreshCw, Grid, LayoutGrid } from 'lucide-react'
import AdjacencyMatrix from './AdjacencyMatrix'
import SettingsModal from './SettingsModal'
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
    diagramName,
    setDiagramName,
    showGrid,
    toggleGrid
  } = useCLDStore()
  const [showNodeColorDropdown, setShowNodeColorDropdown] = useState(false)
  const [showArrowColorDropdown, setShowArrowColorDropdown] = useState(false)
  const [showDesignSettingsDropdown, setShowDesignSettingsDropdown] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(diagramName)
  const [showAdjacencyMatrix, setShowAdjacencyMatrix] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  
  // Load config for colors
  const config = loadConfig()
  
  // State for currently selected colors (like PowerPoint)
  const [selectedNodeColor, setSelectedNodeColor] = useState(config.colors.defaultSelected.nodeColor)
  const [selectedArrowColor, setSelectedArrowColor] = useState(config.colors.defaultSelected.arrowColor)
  
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



  const handleAdjacencyMatrix = () => {
    setShowAdjacencyMatrix(!showAdjacencyMatrix)
  }

  const handleDesignSettingsDropdownToggle = (e) => {
    e.stopPropagation()
    setShowDesignSettingsDropdown(!showDesignSettingsDropdown)
  }

  const handleResetStyles = () => {
    resetGlobalStyles()
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside any dropdown
      const isInsideDesignDropdown = event.target.closest('.design-settings-dropdown')
      const isInsideNodeColorDropdown = event.target.closest('.node-color-dropdown')
      const isInsideArrowColorDropdown = event.target.closest('.arrow-color-dropdown')
      const isInsideExportDropdown = event.target.closest('.export-dropdown')
      
      // Check if click is on the dropdown toggle button
      const isOnDesignToggle = event.target.closest('.design-settings-container')
      const isOnNodeColorToggle = event.target.closest('.node-color-container')
      const isOnArrowColorToggle = event.target.closest('.arrow-color-container')
      const isOnExportToggle = event.target.closest('.export-container')
      
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
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showDesignSettingsDropdown, showNodeColorDropdown, showArrowColorDropdown, showExportDropdown])

  // Update tempName when diagramName changes (e.g., when loading a file)
  useEffect(() => {
    setTempName(diagramName)
  }, [diagramName])

  const menuItems = [
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
      label: 'Undo', 
      action: handleUndo, 
      icon: RotateCcw,
      title: 'Undo' 
    },
    { 
      label: 'Redo', 
      action: handleRedo, 
      icon: RotateCw,
      title: 'Redo' 
    },
    { 
      label: 'Clear', 
      action: handleClear, 
      icon: Trash2,
      title: 'Clear Canvas' 
    },
    { 
      label: 'Export', 
      type: 'export', 
      dropdownAction: handleExportDropdownToggle,
      icon: Download,
      title: 'Export' 
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
      icon: LayoutGrid,
      title: showGrid ? 'Hide Grid' : 'Show Grid' 
    },
    { 
      label: showAdjacencyMatrix ? 'Close Matrix' : 'Adjacency Matrix', 
      action: handleAdjacencyMatrix, 
      icon: Grid,
      title: showAdjacencyMatrix ? 'Close Adjacency Matrix' : 'Show Adjacency Matrix' 
    },
    { 
      label: 'Settings', 
      action: () => setShowSettingsModal(true), 
      icon: Settings,
      title: 'Application Settings' 
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
                      right: '0',
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
                      right: '0',
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

      <div className="header-right">
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

      {/* Adjacency Matrix Modal */}
      {showAdjacencyMatrix && (
        <AdjacencyMatrix onClose={() => setShowAdjacencyMatrix(false)} />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      )}
    </header>
  )
}

export default SysLoopHeader 
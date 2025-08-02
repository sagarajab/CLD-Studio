import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import useAssignmentStore from '../stores/assignmentStore'
import useTBTAuthStore from '../stores/tbtAuthStore'
import { FolderOpen, Save, RotateCcw, RotateCw, Trash2, Download, Diamond, Spline, Brush, Settings, RefreshCw, Grid, LayoutGrid, Undo2, Redo2, Eraser, Grid3x3, SplinePointer, Trash, DraftingCompass, Laptop, Database, Gamepad2, LogOut, Info, HelpCircle, Wrench, Users, TestTube, FileText, BookOpen, BarChart3, User } from 'lucide-react'

import SettingsModal from './SettingsModal'
import ExamplesModal from './ExamplesModal'
import UserProgressDashboard from './UserProgressDashboard'
import { loadConfig } from '../config/appConfig'
import appIcon from '../assets/app_icon.png'
import './SysLoopHeader.css'

function SysLoopHeader({ signOut, onSettingsClick, onDevModeToggle, devMode, onAssignmentClick, userEmail }) {
  const { isAssignmentMode } = useAssignmentStore()
  const { tbtAuthStatus, hasTBTAccess } = useTBTAuthStore()
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
    simulationMode,
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
  const [showExamplesModal, setShowExamplesModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  
  // Load config for colors
  const config = loadConfig()
  const predefinedColors = config.colors.palette
  const headerRef = useRef(null)

  // Helper functions to get the currently selected colors
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
    if (selectedNodes.length > 0) {
      updateSelectedNodesColor(selectedNodeColor)
    } else if (selectedNode) {
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
    setSelectedNodeColor(color)
    closeAllDropdowns()
    if (selectedNodes.length > 0) {
      updateSelectedNodesColor(color)
    } else if (selectedNode) {
      updateSelectedNodeColor(color)
    }
  }

  const handleArrowColorClick = () => {
    if (selectedEdges.length > 0) {
      updateSelectedEdgesColor(selectedArrowColor)
    } else if (selectedEdge) {
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
    setSelectedArrowColor(color)
    closeAllDropdowns()
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

  const handleResetView = () => {
    resetView()
  }

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas? This action cannot be undone.')) {
      clearDiagram()
    }
  }

  const handleNewDiagram = () => {
    if (window.confirm('Are you sure you want to start a new diagram? This will clear the current diagram and reset the name to "Untitled". This action cannot be undone.')) {
      clearDiagram()
      setDiagramName('Untitled')
    }
  }

  const handleOpenExamples = () => {
    setShowExamplesModal(true)
    closeAllDropdowns()
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
      const isInsideDesignDropdown = event.target.closest('.design-settings-dropdown')
      const isInsideNodeColorDropdown = event.target.closest('.node-color-dropdown')
      const isInsideArrowColorDropdown = event.target.closest('.arrow-color-dropdown')
      const isInsideExportDropdown = event.target.closest('.export-dropdown')
      const isInsideOpenDropdown = event.target.closest('.open-dropdown')
      
      const isOnDesignToggle = event.target.closest('.design-settings-container')
      const isOnNodeColorToggle = event.target.closest('.node-color-container')
      const isOnArrowColorToggle = event.target.closest('.arrow-color-container')
      const isOnExportToggle = event.target.closest('.export-container')
      const isOnOpenToggle = event.target.closest('.open-container')

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
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [activeDropdown, closeAllDropdowns])

  // Update tempName when diagramName changes
  useEffect(() => {
    setTempName(diagramName)
  }, [diagramName])

  const menuItems = [
    { 
      label: 'New', 
      action: handleNewDiagram, 
      icon: FileText,
      title: 'New Diagram' 
    },
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
    }
  ]

  // TBT-specific menu items (only shown for TBT users)
  const tbtMenuItems = [
    {
      label: 'Assignment',
      action: onAssignmentClick,
      icon: BookOpen,
      title: isAssignmentMode ? 'Exit Assignment Mode' : 'Start Assignment Mode'
    },
    {
      label: 'Progress',
      action: () => setShowProgressModal(true),
      icon: BarChart3,
      title: 'View Progress Dashboard'
    },
    {
      label: 'Account Info',
      action: () => setShowAccountModal(true),
      icon: User,
      title: 'Account Information'
    }
  ]

  // Miscellaneous menu items
  const miscellaneousItems = [
    {
      label: 'Settings',
      action: onSettingsClick,
      icon: Settings,
      title: 'Application Settings'
    },
    {
      label: 'About',
      action: () => alert('About: CLD Studio v1.0'),
      icon: Info,
      title: 'About'
    },
    {
      label: 'Help',
      action: () => alert('Help: For assistance, visit the documentation.'),
      icon: HelpCircle,
      title: 'Help'
    },
    {
      label: 'Dev Mode',
      action: onDevModeToggle,
      icon: Wrench,
      title: 'Toggle Dev Mode'
    }
  ]

  // User-related menu items
  const userRelatedItems = [
    {
      label: 'Sign Out',
      action: signOut,
      icon: LogOut,
      title: 'Sign Out'
    }
  ]

  // Helper function to render menu item
  const renderMenuItem = (item, index) => (
    <div key={index} className="menu-item">
      {item.type === 'nodeColor' ? (
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
          <div 
            className="accent-line accent-line-node"
            style={{ backgroundColor: getCurrentNodeColor() }}
          />
          {activeDropdown === 'nodeColor' && (
            <div className="node-color-dropdown" onClick={(e) => e.stopPropagation()}>
              {predefinedColors.map((color, colorIndex) => (
                <button
                  key={colorIndex}
                  onClick={() => handleNodeColorSelect(color)}
                  className="color-button"
                  style={{ backgroundColor: color }}
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
          <div 
            className="accent-line accent-line-arrow"
            style={{ backgroundColor: getCurrentArrowColor() }}
          />
          {activeDropdown === 'arrowColor' && (
            <div className="arrow-color-dropdown" onClick={(e) => e.stopPropagation()}>
              {predefinedColors.map((color, colorIndex) => (
                <button
                  key={colorIndex}
                  onClick={() => handleArrowColorSelect(color)}
                  className="color-button"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
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
            <div className="design-settings-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="form-section">
                <h4 className="form-section-title">Node Settings</h4>
                <div className="form-group">
                  <label className="form-label">Font Family</label>
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
                  <label className="form-label">Font Size</label>
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
                <h4 className="form-section-title">Arrow Settings</h4>
                <div className="form-group">
                  <label className="form-label">Stroke Width: {globalStyles.arrowWidth}</label>
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
                  <label className="form-label">Transparency: {globalStyles.arrowTransparency}</label>
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
                  <label className="form-label">Head Size: {globalStyles.arrowHeadSize}</label>
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
            <div className="export-dropdown" onClick={(e) => e.stopPropagation()}>
              <button onClick={handleExportAsPNG} className="dropdown-button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                Export as PNG
              </button>
              <button onClick={handleExportAsJPEG} className="dropdown-button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                Export as JPEG
              </button>
              <button onClick={handleExportAsSVG} className="dropdown-button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Export as SVG
              </button>
              <button onClick={handleExportAsPDF} className="dropdown-button">
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
              <button onClick={handleExportDetailedData} className="dropdown-button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                Export Detailed Data (JSON)
              </button>
              <button onClick={handleExportMatrix} className="dropdown-button">
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
            <div className="open-dropdown" onClick={(e) => e.stopPropagation()}>
              <button onClick={handleLoad} className="dropdown-button">
                <Laptop size={14} />
                From PC
              </button>
              <button onClick={handleOpenExamples} className="dropdown-button">
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
  )

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
          {menuItems.slice(0, 4).map((item, index) => renderMenuItem(item, index))}
          
          {/* Separator between File Operations and Edit Actions */}
          <div className="menu-separator"></div>
          
          {/* Group 2: Edit Actions */}
          {menuItems.slice(4, 8).map((item, index) => renderMenuItem(item, index + 4))}
          
          {/* Separator between Edit Actions and Drawing Tools */}
          <div className="menu-separator"></div>
          
          {/* Group 3: Drawing Tools */}
          {menuItems.slice(8, 13).map((item, index) => renderMenuItem(item, index + 8))}
          
          {/* Separator before Simulation Mode Toggle */}
          <div className="menu-separator"></div>
          
          {/* Simulation Mode Toggle */}
          <button
            onClick={toggleSimulationMode}
            disabled={isAssignmentMode}
            className={`menu-icon-btn simulation-mode-btn ${simulationMode ? 'simulation-active' : ''} simulation-button-enabled ${isAssignmentMode ? 'disabled' : ''}`}
            title={isAssignmentMode ? 'Simulation disabled in assignment mode' : (simulationMode ? 'Disable Simulation Mode' : 'Enable Simulation Mode')}
          >
            <Gamepad2 className="menu-icon" />
          </button>

          {/* Separator before TBT Menu Items */}
          {hasTBTAccess() && <div className="menu-separator"></div>}

          {/* Group 4: TBT-specific Menu Items (only for TBT users) */}
          {hasTBTAccess() && (
            <div className="menu-group">
              {tbtMenuItems.map((item, index) => (
                <button
                  key={index}
                  className={`menu-icon-btn ${item.label === 'Assignment' && isAssignmentMode ? 'active' : ''}`}
                  onClick={item.action}
                  title={item.title}
                >
                  <item.icon className="menu-icon" />
                </button>
              ))}
            </div>
          )}

          {/* Separator before Miscellaneous */}
          <div className="menu-separator"></div>

          {/* Group 5: Miscellaneous */}
          <div className="menu-group">
            {miscellaneousItems.map((item, index) => (
              <button
                key={index}
                className={`menu-icon-btn ${item.label === 'Dev Mode' && devMode ? 'active' : ''}`}
                onClick={item.action}
                title={item.title}
              >
                <item.icon className="menu-icon" />
              </button>
            ))}
          </div>

          {/* Separator before User Related */}
          <div className="menu-separator"></div>

          {/* Group 6: User Related */}
          <div className="menu-group">
            {userRelatedItems.map((item, index) => (
              <button
                key={index}
                className="menu-icon-btn"
                onClick={item.action}
                title={item.title}
              >
                <item.icon className="menu-icon" />
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* Modals */}
      {showExamplesModal && (
        <ExamplesModal 
          isOpen={showExamplesModal} 
          onClose={() => setShowExamplesModal(false)} 
        />
      )}
      
      {/* Progress Dashboard Modal */}
      {showProgressModal && (
        <div className="modal-overlay" onClick={() => setShowProgressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Progress Dashboard</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowProgressModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <UserProgressDashboard userEmail={userEmail} />
            </div>
          </div>
        </div>
      )}
      
      {/* Account Info Modal */}
      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Account Information</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowAccountModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="account-info">
                <div className="info-section">
                  <h4>User Status</h4>
                  <p><strong>Status:</strong> {tbtAuthStatus === 'tbt' ? 'TBT User' : 'Guest'}</p>
                  <p><strong>Access Level:</strong> {tbtAuthStatus === 'tbt' ? 'Full Access' : 'Limited Access'}</p>
                </div>
                <div className="info-section">
                  <h4>Account Details</h4>
                  <p><strong>Email:</strong> {userEmail || 'Not available'}</p>
                  <p><strong>Authentication:</strong> {hasTBTAccess() ? 'Approved' : 'Not Approved'}</p>
                  <p><strong>Assignment Access:</strong> {hasTBTAccess() ? 'Available' : 'Not Available'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default SysLoopHeader 
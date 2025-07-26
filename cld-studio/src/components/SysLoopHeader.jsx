import React, { useState, useRef, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'

function SysLoopHeader({ mode, setMode }) {
  const { 
    saveDiagram, 
    loadDiagram, 
    clearDiagram, 
    exportMatrix, 
    nodes, 
    edges,
    globalStyles,
    selectedNode,
    selectedEdge,
    setNodeFont,
    setNodeFontSize,
    setArrowColor,
    setArrowWidth,
    updateSelectedNodeColor,
    updateSelectedEdgeColor
  } = useCLDStore()
  const [activeTab, setActiveTab] = useState('canvas')
  const [showNodeColorDropdown, setShowNodeColorDropdown] = useState(false)
  const [showArrowColorDropdown, setShowArrowColorDropdown] = useState(false)
  
  // Predefined colors for the dropdown
  const predefinedColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#FFC0CB', '#A52A2A', '#808080', '#000080'
  ]
  
  const headerRef = useRef(null)

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

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log('Undo')
  }

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log('Redo')
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
    setArrowWidth(width)
  }

  const handleNodeColorClick = () => {
    console.log('🎨 Node color click, selectedNode:', selectedNode)
    if (selectedNode) {
      // Apply current color to selected node
      updateSelectedNodeColor('#000000') // Default black
    }
  }

  const handleNodeColorDropdownToggle = (e) => {
    e.stopPropagation()
    setShowNodeColorDropdown(!showNodeColorDropdown)
  }

  const handleNodeColorSelect = (color) => {
    console.log('🎨 Node color select:', color, 'selectedNode:', selectedNode)
    if (selectedNode) {
      updateSelectedNodeColor(color)
    }
    setShowNodeColorDropdown(false)
  }

  const handleArrowColorClick = () => {
    console.log('🎨 Arrow color click, selectedEdge:', selectedEdge)
    if (selectedEdge) {
      // Apply current color to selected edge
      updateSelectedEdgeColor('#6b7280') // Default gray
    }
  }

  const handleArrowColorDropdownToggle = (e) => {
    e.stopPropagation()
    setShowArrowColorDropdown(!showArrowColorDropdown)
  }

  const handleArrowColorSelect = (color) => {
    console.log('🎨 Arrow color select:', color, 'selectedEdge:', selectedEdge)
    if (selectedEdge) {
      updateSelectedEdgeColor(color)
    }
    setShowArrowColorDropdown(false)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // TODO: Switch between canvas and analysis views
    console.log('Switched to:', tab)
  }

  const menuItems = [
    { 
      label: 'Open', 
      action: handleLoad, 
      iconClass: 'icon-open',
      title: 'Open' 
    },
    { 
      label: 'Save', 
      action: handleSave, 
      iconClass: 'icon-save',
      title: 'Save' 
    },
    { 
      label: 'Undo', 
      action: handleUndo, 
      iconClass: 'icon-undo',
      title: 'Undo' 
    },
    { 
      label: 'Redo', 
      action: handleRedo, 
      iconClass: 'icon-redo',
      title: 'Redo' 
    },
    { 
      label: 'Clear', 
      action: handleClear, 
      iconClass: 'icon-clear',
      title: 'Clear Canvas' 
    },
    { 
      label: 'Export', 
      action: handleExport, 
      iconClass: 'icon-export',
      title: 'Export' 
    },
    { 
      label: 'Node Color', 
      type: 'nodeColor', 
      action: handleNodeColorClick,
      dropdownAction: handleNodeColorDropdownToggle,
      iconClass: 'icon-node-color',
      title: 'Node Color',
      disabled: !selectedNode
    },
    { 
      label: 'Node Font', 
      type: 'select', 
      value: globalStyles.nodeFont, 
      action: handleNodeFontChange,
      options: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana'],
      iconClass: 'icon-node-font',
      title: 'Node Label Font'
    },
    { 
      label: 'Node Font Size', 
      type: 'select', 
      value: globalStyles.nodeFontSize, 
      action: handleNodeFontSizeChange,
      options: [10, 12, 14, 16, 18, 20, 24],
      iconClass: 'icon-node-font-size',
      title: 'Node Label Font Size'
    },
    { 
      label: 'Arrow Color', 
      type: 'arrowColor', 
      action: handleArrowColorClick,
      dropdownAction: handleArrowColorDropdownToggle,
      iconClass: 'icon-arrow-color',
      title: 'Arrow Color',
      disabled: !selectedEdge
    },
    { 
      label: 'Arrow Width', 
      type: 'select', 
      value: globalStyles.arrowWidth, 
      action: handleArrowWidthChange,
      options: [1, 2, 3, 4, 5],
      iconClass: 'icon-arrow-width',
      title: 'Arrow Width'
    }
  ]

  return (
    <header className="sysloop-header" ref={headerRef}>
      <div className="header-left">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">
            <svg className="icon-logo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span>SysLoop</span>
        </div>

        {/* Menu Bar - Independent Icons */}
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
                <div className="node-color-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button
                    className={`menu-icon-btn ${item.disabled ? 'disabled' : ''}`}
                    onClick={item.action}
                    title={item.title}
                    disabled={item.disabled}
                  >
                    <div className={item.iconClass}></div>
                  </button>
                  <button
                    className="dropdown-arrow-btn"
                    onClick={item.dropdownAction}
                    disabled={item.disabled}
                    title="Color options"
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                      <path d="M0 2l4 4 4-4z"/>
                    </svg>
                  </button>
                  {showNodeColorDropdown && (
                    <div className="color-dropdown" style={{
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
                    }}>
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
                <div className="arrow-color-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <button
                    className={`menu-icon-btn ${item.disabled ? 'disabled' : ''}`}
                    onClick={item.action}
                    title={item.title}
                    disabled={item.disabled}
                  >
                    <div className={item.iconClass}></div>
                  </button>
                  <button
                    className="dropdown-arrow-btn"
                    onClick={item.dropdownAction}
                    disabled={item.disabled}
                    title="Color options"
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                      <path d="M0 2l4 4 4-4z"/>
                    </svg>
                  </button>
                  {showArrowColorDropdown && (
                    <div className="color-dropdown" style={{
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
                    }}>
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
              ) : (
                <button
                  className="menu-icon-btn"
                  onClick={item.action}
                  title={item.title}
                >
                  <div className={item.iconClass}></div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="header-right">
        {/* Untitled Button */}
        <button className="untitled-btn">
          Untitled
        </button>

        {/* Bodhi Tree Logo */}
        <div className="bodhi-logo">
          <div>THE</div>
          <div>BODHI</div>
          <div>TREE</div>
        </div>

        {/* View Tabs */}
        <div className="view-tabs">
          <button 
            className={`view-tab ${activeTab === 'canvas' ? 'active' : ''}`} 
            onClick={() => handleTabChange('canvas')}
            title="Canvas View"
          >
            CANVAS
          </button>
          <button 
            className={`view-tab ${activeTab === 'analysis' ? 'active' : ''}`} 
            onClick={() => handleTabChange('analysis')}
            title="Analysis View"
          >
            ANALYSIS
          </button>
        </div>
      </div>
    </header>
  )
}

export default SysLoopHeader 
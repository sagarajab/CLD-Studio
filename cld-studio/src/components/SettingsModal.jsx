import React, { useState, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { defaultConfig } from '../config/appConfig'

function SettingsModal({ isOpen, onClose }) {
  const { config, updateConfig, resetConfig } = useCLDStore()
  const [localConfig, setLocalConfig] = useState(config)
  const [activeTab, setActiveTab] = useState('constraints')

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config)
    }
  }, [isOpen, config])

  const handleSave = () => {
    updateConfig(localConfig)
    onClose()
  }

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetConfig()
      setLocalConfig(defaultConfig)
    }
  }

  const handleCancel = () => {
    setLocalConfig(config)
    onClose()
  }

  const updateLocalConfig = (path, value) => {
    const pathArray = path.split('.')
    setLocalConfig(prev => {
      const newConfig = { ...prev }
      let current = newConfig
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]]
      }
      current[pathArray[pathArray.length - 1]] = value
      return newConfig
    })
  }

  if (!isOpen) return null

  return (
    <div className="settings-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="settings-modal" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          {[
            { id: 'constraints', label: 'Constraints', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'styling', label: 'Styling', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z' },
            { id: 'colors', label: 'Colors', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z' },
            { id: 'performance', label: 'Performance', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'ui', label: 'UI', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'file', label: 'File', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { id: 'validation', label: 'Validation', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg style={{ width: '16px', height: '16px', minWidth: '16px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'constraints' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Node and Edge Constraints</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Maximum Nodes: {localConfig.constraints.maxNodes}
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={localConfig.constraints.maxNodes}
                  onChange={(e) => updateLocalConfig('constraints.maxNodes', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Maximum Edges: {localConfig.constraints.maxEdges}
                </label>
                <input
                  type="range"
                  min="20"
                  max="500"
                  value={localConfig.constraints.maxEdges}
                  onChange={(e) => updateLocalConfig('constraints.maxEdges', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Loop Analysis Limit: {localConfig.constraints.maxLoopsForAnalysis}
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={localConfig.constraints.maxLoopsForAnalysis}
                  onChange={(e) => updateLocalConfig('constraints.maxLoopsForAnalysis', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'styling' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Global Styling</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Node Font
                </label>
                <select
                  value={localConfig.globalStyles.nodeFont}
                  onChange={(e) => updateLocalConfig('globalStyles.nodeFont', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  {['Arial', 'Helvetica', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Source Sans Pro', 'Nunito', 'Ubuntu', 'Segoe UI', 'SF Pro Display', 'Times New Roman', 'Georgia', 'Verdana'].map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Node Font Size: {localConfig.globalStyles.nodeFontSize}px
                </label>
                <input
                  type="range"
                  min="8"
                  max="24"
                  value={localConfig.globalStyles.nodeFontSize}
                  onChange={(e) => updateLocalConfig('globalStyles.nodeFontSize', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Arrow Width: {localConfig.globalStyles.arrowWidth}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={localConfig.globalStyles.arrowWidth}
                  onChange={(e) => updateLocalConfig('globalStyles.arrowWidth', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Arrow Transparency: {localConfig.globalStyles.arrowTransparency}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={localConfig.globalStyles.arrowTransparency}
                  onChange={(e) => updateLocalConfig('globalStyles.arrowTransparency', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Color Settings</h3>
              
              {/* Default Selected Colors */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Default Selected Colors
                </h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    Default Node Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={localConfig.colors.defaultSelected.nodeColor}
                      onChange={(e) => updateLocalConfig('colors.defaultSelected.nodeColor', e.target.value)}
                      style={{ width: '40px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {localConfig.colors.defaultSelected.nodeColor}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    Default Arrow Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={localConfig.colors.defaultSelected.arrowColor}
                      onChange={(e) => updateLocalConfig('colors.defaultSelected.arrowColor', e.target.value)}
                      style={{ width: '40px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {localConfig.colors.defaultSelected.arrowColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Default Element Colors */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Default Element Colors
                </h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    New Node Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={localConfig.colors.defaults.nodeColor}
                      onChange={(e) => updateLocalConfig('colors.defaults.nodeColor', e.target.value)}
                      style={{ width: '40px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {localConfig.colors.defaults.nodeColor}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    New Arrow Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={localConfig.colors.defaults.arrowColor}
                      onChange={(e) => updateLocalConfig('colors.defaults.arrowColor', e.target.value)}
                      style={{ width: '40px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {localConfig.colors.defaults.arrowColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Color Palette ({localConfig.colors.palette.length} colors)
                </h4>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                  Colors available in the color picker dropdown
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))', 
                  gap: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  backgroundColor: '#f9fafb'
                }}>
                  {localConfig.colors.palette.map((color, index) => (
                    <div
                      key={index}
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: color,
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      title={`${color} (Click to remove)`}
                      onClick={() => {
                        const newPalette = localConfig.colors.palette.filter((_, i) => i !== index)
                        updateLocalConfig('colors.palette', newPalette)
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: color === '#FFFFFF' ? '#000000' : '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textShadow: '0 0 2px rgba(0,0,0,0.8)'
                      }}>
                        ×
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add Color Input */}
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                    Add New Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      id="newColor"
                      style={{ width: '40px', height: '32px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <button
                      onClick={() => {
                        const newColor = document.getElementById('newColor').value
                        if (newColor && !localConfig.colors.palette.includes(newColor)) {
                          const newPalette = [...localConfig.colors.palette, newColor]
                          updateLocalConfig('colors.palette', newPalette)
                        }
                      }}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Performance Settings</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.performance.enableLoopDetection}
                    onChange={(e) => updateLocalConfig('performance.enableLoopDetection', e.target.checked)}
                  />
                  Enable Loop Detection
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.performance.enableAdjacencyMatrix}
                    onChange={(e) => updateLocalConfig('performance.enableAdjacencyMatrix', e.target.checked)}
                  />
                  Enable Adjacency Matrix
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.performance.asyncGraphAnalysis}
                    onChange={(e) => updateLocalConfig('performance.asyncGraphAnalysis', e.target.checked)}
                  />
                  Asynchronous Graph Analysis
                </label>
              </div>
            </div>
          )}

          {activeTab === 'ui' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>UI Settings</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Default Zoom: {localConfig.ui.defaultZoom}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={localConfig.ui.defaultZoom}
                  onChange={(e) => updateLocalConfig('ui.defaultZoom', parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.ui.showStatusBar}
                    onChange={(e) => updateLocalConfig('ui.showStatusBar', e.target.checked)}
                  />
                  Show Status Bar
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.ui.showToolbar}
                    onChange={(e) => updateLocalConfig('ui.showToolbar', e.target.checked)}
                  />
                  Show Toolbar
                </label>
              </div>
            </div>
          )}

          {activeTab === 'file' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>File Settings</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.file.autoSave}
                    onChange={(e) => updateLocalConfig('file.autoSave', e.target.checked)}
                  />
                  Enable Auto Save
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Auto Save Interval: {localConfig.file.autoSaveInterval / 1000}s
                </label>
                <input
                  type="range"
                  min="10000"
                  max="300000"
                  step="10000"
                  value={localConfig.file.autoSaveInterval}
                  onChange={(e) => updateLocalConfig('file.autoSaveInterval', parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Validation Settings</h3>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.validation.allowSelfLoops}
                    onChange={(e) => updateLocalConfig('validation.allowSelfLoops', e.target.checked)}
                  />
                  Allow Self Loops
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.validation.allowMultipleEdges}
                    onChange={(e) => updateLocalConfig('validation.allowMultipleEdges', e.target.checked)}
                  />
                  Allow Multiple Edges
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={localConfig.validation.requireNodeLabels}
                    onChange={(e) => updateLocalConfig('validation.requireNodeLabels', e.target.checked)}
                  />
                  Require Node Labels
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '20px',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px'
        }}>
          <button
            onClick={handleReset}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset to Defaults
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCancel}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal 
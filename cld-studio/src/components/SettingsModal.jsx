import React, { useState, useEffect } from 'react'
import { useCLDStore } from '../stores/cldStore'
import { defaultConfig } from '../config/appConfig'

function SettingsModal({ isOpen, onClose }) {
  const { config, updateConfig, resetConfig } = useCLDStore()
  const [localConfig, setLocalConfig] = useState(config)

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
        padding: '20px',
        maxWidth: '800px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '12px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Settings</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Content - Single Page with Subsections */}
        <div style={{ flex: 1, overflow: 'auto', paddingRight: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Left Column */}
            <div>
              {/* Constraints Section */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  marginBottom: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '4px'
                }}>
                  Constraints
                </h3>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px', color: '#6b7280' }}>
                    Max Nodes: {localConfig.constraints.maxNodes}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={localConfig.constraints.maxNodes}
                    onChange={(e) => updateLocalConfig('constraints.maxNodes', parseInt(e.target.value))}
                    style={{ width: '80%', height: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px', color: '#6b7280' }}>
                    Max Edges: {localConfig.constraints.maxEdges}
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    value={localConfig.constraints.maxEdges}
                    onChange={(e) => updateLocalConfig('constraints.maxEdges', parseInt(e.target.value))}
                    style={{ width: '80%', height: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px', color: '#6b7280' }}>
                    Loop Analysis Limit: {localConfig.constraints.maxLoopsForAnalysis}
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={localConfig.constraints.maxLoopsForAnalysis}
                    onChange={(e) => updateLocalConfig('constraints.maxLoopsForAnalysis', parseInt(e.target.value))}
                    style={{ width: '80%', height: '4px' }}
                  />
                </div>
              </div>

              {/* Styling Section */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  marginBottom: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '4px'
                }}>
                  Styling
                </h3>
                
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px', color: '#6b7280' }}>
                    Node Font
                  </label>
                  <select
                    value={localConfig.globalStyles.nodeFont}
                    onChange={(e) => updateLocalConfig('globalStyles.nodeFont', e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '4px 6px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}
                  >
                    {['Arial', 'Helvetica', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Source Sans Pro', 'Nunito', 'Ubuntu', 'Segoe UI', 'SF Pro Display', 'Times New Roman', 'Georgia', 'Verdana'].map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px', color: '#6b7280' }}>
                    Font Size: {localConfig.globalStyles.nodeFontSize}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={localConfig.globalStyles.nodeFontSize}
                    onChange={(e) => updateLocalConfig('globalStyles.nodeFontSize', parseInt(e.target.value))}
                    style={{ width: '80%', height: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px', color: '#6b7280' }}>
                    Arrow Width: {localConfig.globalStyles.arrowWidth}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={localConfig.globalStyles.arrowWidth}
                    onChange={(e) => updateLocalConfig('globalStyles.arrowWidth', parseFloat(e.target.value))}
                    style={{ width: '80%', height: '4px' }}
                  />
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px', color: '#6b7280' }}>
                    Arrow Transparency: {localConfig.globalStyles.arrowTransparency}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={localConfig.globalStyles.arrowTransparency}
                    onChange={(e) => updateLocalConfig('globalStyles.arrowTransparency', parseFloat(e.target.value))}
                    style={{ width: '80%', height: '4px' }}
                  />
                </div>
              </div>

              {/* Performance Section */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  marginBottom: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '4px'
                }}>
                  Performance
                </h3>
                
                <div style={{ marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <input
                      type="checkbox"
                      checked={localConfig.performance.enableLoopDetection}
                      onChange={(e) => updateLocalConfig('performance.enableLoopDetection', e.target.checked)}
                      style={{ width: '12px', height: '12px' }}
                    />
                    Enable Loop Detection
                  </label>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <input
                      type="checkbox"
                      checked={localConfig.performance.enableAdjacencyMatrix}
                      onChange={(e) => updateLocalConfig('performance.enableAdjacencyMatrix', e.target.checked)}
                      style={{ width: '12px', height: '12px' }}
                    />
                    Enable Adjacency Matrix
                  </label>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <input
                      type="checkbox"
                      checked={localConfig.performance.asyncGraphAnalysis}
                      onChange={(e) => updateLocalConfig('performance.asyncGraphAnalysis', e.target.checked)}
                      style={{ width: '12px', height: '12px' }}
                    />
                    Async Graph Analysis
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
                             {/* Colors Section */}
               <div style={{ marginBottom: '20px' }}>
                 <h3 style={{ 
                   marginBottom: '12px', 
                   fontSize: '14px', 
                   fontWeight: '600',
                   color: '#374151',
                   borderBottom: '1px solid #e5e7eb',
                   paddingBottom: '4px'
                 }}>
                   Colors
                 </h3>
                 
                 <div style={{ marginBottom: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '80px' }}>
                       Node Color:
                     </label>
                     <input
                       type="color"
                       value={localConfig.colors.defaults.nodeColor}
                       onChange={(e) => updateLocalConfig('colors.defaults.nodeColor', e.target.value)}
                       style={{ width: '25px', height: '20px', border: '1px solid #d1d5db', borderRadius: '2px' }}
                     />
                     <span style={{ fontSize: '10px', color: '#6b7280' }}>
                       {localConfig.colors.defaults.nodeColor}
                     </span>
                   </div>
                 </div>

                 <div style={{ marginBottom: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <label style={{ fontSize: '12px', color: '#6b7280', minWidth: '80px' }}>
                       Arrow Color:
                     </label>
                     <input
                       type="color"
                       value={localConfig.colors.defaults.arrowColor}
                       onChange={(e) => updateLocalConfig('colors.defaults.arrowColor', e.target.value)}
                       style={{ width: '25px', height: '20px', border: '1px solid #d1d5db', borderRadius: '2px' }}
                     />
                     <span style={{ fontSize: '10px', color: '#6b7280' }}>
                       {localConfig.colors.defaults.arrowColor}
                     </span>
                   </div>
                 </div>

                 <div style={{ marginBottom: '8px' }}>
                   <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280' }}>
                     Palette ({localConfig.colors.palette.length})
                   </label>
                   <div style={{ 
                     display: 'grid', 
                     gridTemplateColumns: 'repeat(auto-fill, minmax(16px, 1fr))', 
                     gap: '2px',
                     maxHeight: '60px',
                     overflowY: 'auto',
                     padding: '4px',
                     border: '1px solid #e5e7eb',
                     borderRadius: '3px',
                     backgroundColor: '#f9fafb'
                   }}>
                     {localConfig.colors.palette.map((color, index) => (
                       <div
                         key={index}
                         style={{
                           width: '16px',
                           height: '16px',
                           backgroundColor: color,
                           border: '1px solid #d1d5db',
                           borderRadius: '1px',
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
                           fontSize: '8px',
                           fontWeight: 'bold',
                           textShadow: '0 0 1px rgba(0,0,0,0.8)'
                         }}>
                           ×
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   {/* Add Color Input */}
                   <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <input
                       type="color"
                       id="newColor"
                       style={{ width: '25px', height: '20px', border: '1px solid #d1d5db', borderRadius: '2px' }}
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
                         padding: '2px 6px',
                         borderRadius: '2px',
                         cursor: 'pointer',
                         fontSize: '10px'
                       }}
                     >
                       Add
                     </button>
                   </div>
                 </div>
               </div>

              {/* UI Section */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  marginBottom: '12px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '4px'
                }}>
                  Interface
                </h3>
                
                                 <div style={{ marginBottom: '8px' }}>
                   <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px', color: '#6b7280' }}>
                     Default Zoom: {localConfig.ui.defaultZoom}
                   </label>
                   <input
                     type="range"
                     min="0.5"
                     max="2"
                     step="0.1"
                     value={localConfig.ui.defaultZoom}
                     onChange={(e) => updateLocalConfig('ui.defaultZoom', parseFloat(e.target.value))}
                     style={{ width: '80%', height: '4px' }}
                   />
                 </div>

                <div style={{ marginBottom: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <input
                      type="checkbox"
                      checked={localConfig.ui.showStatusBar}
                      onChange={(e) => updateLocalConfig('ui.showStatusBar', e.target.checked)}
                      style={{ width: '12px', height: '12px' }}
                    />
                    Show Status Bar
                  </label>
                </div>

                                 <div style={{ marginBottom: '6px' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                     <input
                       type="checkbox"
                       checked={localConfig.ui.showToolbar}
                       onChange={(e) => updateLocalConfig('ui.showToolbar', e.target.checked)}
                       style={{ width: '12px', height: '12px' }}
                     />
                     Show Toolbar
                   </label>
                 </div>

                 <div style={{ marginBottom: '6px' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                     <input
                       type="checkbox"
                       checked={localConfig.ui.showGrid}
                       onChange={(e) => updateLocalConfig('ui.showGrid', e.target.checked)}
                       style={{ width: '12px', height: '12px' }}
                     />
                     Show Grid
                   </label>
                 </div>
              </div>

                             {/* Validation Section */}
               <div style={{ marginBottom: '20px' }}>
                 <h3 style={{ 
                   marginBottom: '12px', 
                   fontSize: '14px', 
                   fontWeight: '600',
                   color: '#374151',
                   borderBottom: '1px solid #e5e7eb',
                   paddingBottom: '4px'
                 }}>
                   Validation
                 </h3>
                 
                 <div style={{ marginBottom: '6px' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                     <input
                       type="checkbox"
                       checked={localConfig.validation.allowSelfLoops}
                       onChange={(e) => updateLocalConfig('validation.allowSelfLoops', e.target.checked)}
                       style={{ width: '12px', height: '12px' }}
                     />
                     Allow Self Loops
                   </label>
                 </div>

                 <div style={{ marginBottom: '6px' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                     <input
                       type="checkbox"
                       checked={localConfig.validation.allowMultipleEdges}
                       onChange={(e) => updateLocalConfig('validation.allowMultipleEdges', e.target.checked)}
                       style={{ width: '12px', height: '12px' }}
                     />
                     Allow Multiple Edges
                   </label>
                 </div>

                 <div style={{ marginBottom: '6px' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                     <input
                       type="checkbox"
                       checked={localConfig.validation.requireNodeLabels}
                       onChange={(e) => updateLocalConfig('validation.requireNodeLabels', e.target.checked)}
                       style={{ width: '12px', height: '12px' }}
                     />
                     Require Node Labels
                   </label>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '16px',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '12px'
        }}>
          <button
            onClick={handleReset}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
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
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
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
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
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
import { create } from 'zustand'
import { loadConfig, saveConfig } from '../config/appConfig'

const useConfigStore = create((set, get) => ({
  // Configuration state
  config: loadConfig(),
  globalStyles: loadConfig().globalStyles,
  showGrid: loadConfig().ui.showGrid,
  
  // Selected colors state (like PowerPoint)
  selectedNodeColor: loadConfig().colors.defaultSelected.nodeColor,
  selectedArrowColor: loadConfig().colors.defaultSelected.arrowColor,
  
  // Configuration operations
  updateConfig: (updates) => {
    set((state) => {
      const newConfig = { ...state.config, ...updates }
      saveConfig(newConfig)
      return { config: newConfig }
    })
  },

  updateGlobalStyles: (updates) => {
    set((state) => {
      const newGlobalStyles = { ...state.globalStyles, ...updates }
      const newConfig = { ...state.config, globalStyles: newGlobalStyles }
      saveConfig(newConfig)
      return { 
        globalStyles: newGlobalStyles,
        config: newConfig
      }
    })
  },

  resetConfig: () => {
    const defaultConfig = loadConfig()
    set({ config: defaultConfig, globalStyles: defaultConfig.globalStyles })
    saveConfig(defaultConfig)
  },

  // Grid operations
  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }))
  },

  // Selected color operations (like PowerPoint)
  setSelectedNodeColor: (color) => {
    set({ selectedNodeColor: color })
  },

  setSelectedArrowColor: (color) => {
    set({ selectedArrowColor: color })
  },

  // Global styling operations
  setNodeFont: (font) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, nodeFont: font }
    }))
  },
  
  setNodeFontSize: (size) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, nodeFontSize: parseInt(size) }
    }))
  },
  
  setArrowColor: (color) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, arrowColor: color }
    }))
  },
  
  setArrowWidth: (width) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, arrowWidth: parseFloat(width) }
    }))
  },
  
  setArrowTransparency: (transparency) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, arrowTransparency: parseFloat(transparency) }
    }))
  },
  
  setArrowHeadSize: (size) => {
    set((state) => ({
      globalStyles: { ...state.globalStyles, arrowHeadSize: parseFloat(size) }
    }))
  },
  
  // Reset all global styles to defaults
  resetGlobalStyles: () => {
    set((state) => ({
      globalStyles: {
        ...state.globalStyles,
        arrowWidth: 1.5,
        arrowTransparency: 1.0,
        arrowHeadSize: 2.0
      }
    }))
  }
}))

export { useConfigStore } 
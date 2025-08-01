import { useState } from 'react'

export const useAppState = () => {
  const [mode, setMode] = useState('sandbox')
  const [dimmingEnabled, setDimmingEnabled] = useState(true)
  const [hoveredLoop, setHoveredLoop] = useState(null)
  const [devMode, setDevMode] = useState(false)
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 })

  return {
    mode,
    setMode,
    dimmingEnabled,
    setDimmingEnabled,
    hoveredLoop,
    setHoveredLoop,
    devMode,
    setDevMode,
    mouseCoords,
    setMouseCoords
  }
} 
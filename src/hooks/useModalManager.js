import { useState } from 'react'

export const useModalManager = () => {
  const [modals, setModals] = useState({
    settings: false,
    s3FileManager: false,
    stateVector: false,
    plots: false,
    nodeAnalysis: false,
    connectionAnalysis: false,
    systemStats: false,
    adjacencyMatrix: false
  })

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }))
  }

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }))
  }

  const closeAllModals = () => {
    setModals({
      settings: false,
      s3FileManager: false,
      stateVector: false,
      plots: false,
      nodeAnalysis: false,
      connectionAnalysis: false,
      systemStats: false,
      adjacencyMatrix: false
    })
  }

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals
  }
} 
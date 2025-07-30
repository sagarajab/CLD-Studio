// This file has been refactored into modular stores
// Please use the new modular store structure from ./index.js
// For backward compatibility, this file now re-exports the unified store

import { useCLDStore as useUnifiedStore } from './unifiedStore'

// Re-export the unified store for backward compatibility
export { useUnifiedStore as useCLDStore }

// Initialize the store with the initial state recorded
const initializeStore = () => {
  const { createStateSnapshot } = useUnifiedStore.getState()
  const initialSnapshot = createStateSnapshot()
  
  useUnifiedStore.setState({
    undoStack: [initialSnapshot]
  })
  
  console.log('Initial state recorded in undo stack')
}

// Initialize when the store is first created
initializeStore()

// Make store available globally for debugging
if (typeof window !== 'undefined') {
  window.__CLD_STORE__ = useUnifiedStore
} 
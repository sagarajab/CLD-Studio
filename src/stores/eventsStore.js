import { create } from 'zustand'

const useEventsStore = create((set, get) => ({
  // Events log for status bar
  eventsLog: [],
  
  // Events operations
  addEvent: (event) => {
    const timestamp = new Date().toLocaleTimeString()
    const newEvent = {
      id: Date.now(),
      timestamp,
      message: event,
      type: 'info'
    }
    
    set((state) => ({
      eventsLog: [newEvent, ...state.eventsLog.slice(0, 4)] // Keep only last 5 events
    }))
  },
  
  clearEventsLog: () => {
    set({ eventsLog: [] })
  }
}))

export { useEventsStore } 
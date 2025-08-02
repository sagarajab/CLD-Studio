import { create } from 'zustand';

const useUserProgressStore = create((set, get) => ({
  // Progress state
  currentSession: {
    startTime: null,
    activeTime: 0,
    idleTime: 0,
    actions: []
  },
  activityTimer: null,
  isActive: true,

  // Actions
  startActivityTracking: () => {
    const { currentSession } = get();
    if (!currentSession.startTime) {
      set({
        currentSession: {
          ...currentSession,
          startTime: new Date().toISOString()
        }
      });
    }

    // Start activity timer
    const timer = setInterval(() => {
      const { isActive, currentSession } = get();
      
      set({
        currentSession: {
          ...currentSession,
          activeTime: isActive ? currentSession.activeTime + 1 : currentSession.activeTime,
          idleTime: isActive ? currentSession.idleTime : currentSession.idleTime + 1
        }
      });
    }, 1000);

    set({ activityTimer: timer });
  },

  stopActivityTracking: () => {
    const { activityTimer } = get();
    if (activityTimer) {
      clearInterval(activityTimer);
      set({ activityTimer: null });
    }
  },

  setActivityStatus: (isActive) => {
    set({ isActive });
  },

  trackAction: (actionType) => {
    const { currentSession } = get();
    set({
      currentSession: {
        ...currentSession,
        actions: [...currentSession.actions, actionType]
      }
    });
  },

  // Progress tracking (simplified for CSV-based system)
  trackDiagramCreation: () => {
    get().trackAction('diagram_created');
    console.log('📊 Diagram creation tracked');
  },

  trackSimulationRun: () => {
    get().trackAction('simulation_run');
    console.log('📊 Simulation run tracked');
  },

  trackLoopIdentification: (loopCount = 1) => {
    get().trackAction('loop_identified');
    console.log(`📊 Loop identification tracked: ${loopCount} loops`);
  },

  // Get current session stats
  getSessionStats: () => {
    const { currentSession } = get();
    return {
      startTime: currentSession.startTime,
      activeTime: currentSession.activeTime,
      idleTime: currentSession.idleTime,
      totalActions: currentSession.actions.length,
      actions: currentSession.actions
    };
  },

  // Reset session
  resetSession: () => {
    set({
      currentSession: {
        startTime: null,
        activeTime: 0,
        idleTime: 0,
        actions: []
      },
      activityTimer: null,
      isActive: true
    });
  }
}));

export { useUserProgressStore }; 
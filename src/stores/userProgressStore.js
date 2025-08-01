import { create } from 'zustand';
import { TBTAuthService } from '../services/tbtAuthService';
import { useTBTAuthStore } from './tbtAuthStore';

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
      const { user } = useTBTAuthStore.getState();
      
      if (user) {
        TBTAuthService.updateUserActivity(user.id, isActive);
      }

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

  // Assignment tracking
  startAssignment: async (assignmentId) => {
    const { user } = useTBTAuthStore.getState();
    if (!user) throw new Error('No user logged in');
    
    try {
      const userAssignment = await TBTAuthService.startAssignment(user.id, assignmentId);
      return userAssignment;
    } catch (error) {
      console.error('Error starting assignment:', error);
      throw error;
    }
  },

  completeAssignment: async (userAssignmentId, score, diagramData) => {
    try {
      const completedAssignment = await TBTAuthService.completeAssignment(
        userAssignmentId, 
        score, 
        diagramData
      );
      return completedAssignment;
    } catch (error) {
      console.error('Error completing assignment:', error);
      throw error;
    }
  },

  // Progress tracking
  trackDiagramCreation: async () => {
    const { user } = useTBTAuthStore.getState();
    if (!user) return;
    
    try {
      await TBTAuthService.trackDiagramCreation(user.id);
      get().trackAction('diagram_created');
    } catch (error) {
      console.error('Error tracking diagram creation:', error);
    }
  },

  trackSimulationRun: async () => {
    const { user } = useTBTAuthStore.getState();
    if (!user) return;
    
    try {
      await TBTAuthService.trackSimulationRun(user.id);
      get().trackAction('simulation_run');
    } catch (error) {
      console.error('Error tracking simulation run:', error);
    }
  },

  trackLoopIdentification: async (loopCount = 1) => {
    const { user } = useTBTAuthStore.getState();
    if (!user) return;
    
    try {
      await TBTAuthService.trackLoopIdentification(user.id, loopCount);
      get().trackAction('loop_identified');
    } catch (error) {
      console.error('Error tracking loop identification:', error);
    }
  }
}));

export { useUserProgressStore }; 
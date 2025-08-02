import { create } from 'zustand';
import { TBTAuthService } from '../services/tbtAuthService';

const useTBTAuthStore = create((set, get) => ({
  // State
  tbtAuthStatus: 'guest',
  accessLevel: 'guest',
  isApproved: false,
  isLoading: false,
  error: null,

  // Actions
  authenticateUser: async (userEmail) => {
    if (!userEmail) {
      set({
        tbtAuthStatus: 'guest',
        accessLevel: 'guest',
        isApproved: false,
        isLoading: false
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const authStatus = await TBTAuthService.getTBTAuthStatus(userEmail);
      
      set({
        tbtAuthStatus: authStatus.tbtAuthStatus,
        accessLevel: authStatus.accessLevel,
        isApproved: authStatus.isApproved,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('TBT authentication error:', error);
      set({
        tbtAuthStatus: 'guest',
        accessLevel: 'guest',
        isApproved: false,
        isLoading: false,
        error: error.message
      });
    }
  },

  clearUser: () => {
    set({
      tbtAuthStatus: 'guest',
      accessLevel: 'guest',
      isApproved: false,
      isLoading: false,
      error: null
    });
  },

  // Helper functions
  hasTBTAccess: () => {
    const { tbtAuthStatus } = get();
    return tbtAuthStatus === 'tbt';
  },

  hasAdminAccess: () => {
    const { accessLevel } = get();
    return accessLevel === 'admin';
  }
}));

export default useTBTAuthStore; 
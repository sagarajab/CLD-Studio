import { create } from 'zustand';
import { TBTAuthService } from '../services/tbtAuthService';

const useTBTAuthStore = create((set, get) => ({
  // Authentication state
  amplifyAuthVerified: false,
  tbtAuthStatus: 'guest', // 'guest', 'tbt', 'pending'
  accessLevel: 'guest', // 'guest', 'tbt', 'admin'
  user: null,
  isNewUser: false,
  isLoading: false,
  error: null,

  // Actions
  performTBTAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const authResult = await TBTAuthService.performTBTAuth();
      set({
        amplifyAuthVerified: authResult.amplifyAuthVerified,
        tbtAuthStatus: authResult.tbtAuthStatus,
        accessLevel: authResult.accessLevel,
        user: authResult.user,
        isNewUser: authResult.isNewUser,
        isLoading: false
      });
      return authResult;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  upgradeAccess: async (newAccessLevel, newAuthStatus = 'tbt') => {
    const { user } = get();
    if (!user) throw new Error('No TBT user to upgrade');

    set({ isLoading: true, error: null });
    try {
      const updatedUser = await TBTAuthService.upgradeTBTUserAccess(
        user.id, 
        newAccessLevel, 
        newAuthStatus
      );
      set({
        user: updatedUser,
        tbtAuthStatus: updatedUser.tbtAuthStatus,
        accessLevel: updatedUser.accessLevel,
        isLoading: false
      });
      return updatedUser;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearAuth: () => {
    set({
      amplifyAuthVerified: false,
      tbtAuthStatus: 'guest',
      accessLevel: 'guest',
      user: null,
      isNewUser: false,
      error: null
    });
  },

  // Computed getters
  get isFullyAuthenticated() {
    const { amplifyAuthVerified, tbtAuthStatus } = get();
    return amplifyAuthVerified && tbtAuthStatus === 'tbt';
  },

  get canAccessTBTFeatures() {
    const { accessLevel } = get();
    return ['tbt', 'admin'].includes(accessLevel);
  },

  get canAccessAdminFeatures() {
    const { accessLevel } = get();
    return accessLevel === 'admin';
  }
}));

export { useTBTAuthStore }; 
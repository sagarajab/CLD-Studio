import { useTBTAuthStore } from '../stores/tbtAuthStore';

export const useTBTAccessControl = () => {
  const { 
    amplifyAuthVerified, 
    tbtAuthStatus, 
    accessLevel, 
    isFullyAuthenticated,
    canAccessTBTFeatures,
    canAccessAdminFeatures 
  } = useTBTAuthStore();

  const canAccessFeature = (feature) => {
    const featureAccess = {
      'basic-editing': ['guest', 'tbt', 'admin'],
      'advanced-simulation': ['tbt', 'admin'],
      'file-sharing': ['tbt', 'admin'],
      'tbt-admin-panel': ['admin'],
      'export-pdf': ['tbt', 'admin'],
      'collaboration': ['tbt', 'admin'],
      'assignment-tracking': ['tbt', 'admin'],
      'progress-analytics': ['tbt', 'admin']
    };

    return featureAccess[feature]?.includes(accessLevel) || false;
  };

  const requireFullAuth = (feature) => {
    if (!isFullyAuthenticated) {
      alert(`This feature requires full authentication (amplify_Auth + tbt_auth). Current status: amplify_Auth=${amplifyAuthVerified}, tbt_auth=${tbtAuthStatus}`);
      return false;
    }
    return canAccessFeature(feature);
  };

  const getAuthStatus = () => ({
    amplifyAuth: amplifyAuthVerified ? 'passed' : 'failed',
    tbtAuth: tbtAuthStatus,
    accessLevel,
    isFullyAuthenticated
  });

  return { 
    canAccessFeature, 
    requireFullAuth, 
    getAuthStatus,
    isFullyAuthenticated,
    canAccessTBTFeatures,
    canAccessAdminFeatures
  };
}; 
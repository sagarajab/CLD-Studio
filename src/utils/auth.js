import { fetchAuthSession, signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

// Initialize authentication for unauthenticated access
export const initializeAuth = async () => {
  try {
    // Try to get current auth session
    const session = await fetchAuthSession();
    console.log('Current auth session:', session);
    return session;
  } catch (error) {
    console.log('No current auth session, using unauthenticated access');
    // For unauthenticated access, we need to ensure the identity pool is configured
    // The identity pool should allow unauthenticated identities
    console.log('Identity pool configured for unauthenticated access');
    return null;
  }
};

// Sign in with email (for authenticated access)
export const signInWithEmail = async (email, password) => {
  try {
    const { isSignedIn, nextStep } = await signIn({ username: email, password });
    return { isSignedIn, nextStep };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUserInfo = async () => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.log('No authenticated user');
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens !== undefined;
  } catch (error) {
    return false;
  }
};

// Force refresh of credentials for unauthenticated access
export const refreshCredentials = async () => {
  try {
    // Force a new auth session to refresh credentials
    const session = await fetchAuthSession({ forceRefresh: true });
    console.log('Refreshed auth session:', session);
    return session;
  } catch (error) {
    console.error('Failed to refresh credentials:', error);
    throw error;
  }
}; 
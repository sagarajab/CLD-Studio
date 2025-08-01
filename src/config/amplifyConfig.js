// amplifyConfig.js - Simple Gen 2 Configuration
import { Amplify } from 'aws-amplify';
import { setDataClientInitialized } from './dataClientConfig';

// Simple setup function - Gen 2
export async function initializeAmplify() {
  try {
    const { default: outputs } = await import('../../amplify_outputs.json');
    
    // Simple configuration using outputs directly
    Amplify.configure(outputs);
    
    // Mark data client as ready for use
    setDataClientInitialized();
    
    console.log('✅ Amplify configured successfully with simple approach');
    console.log('📋 Configuration loaded from amplify_outputs.json');
  } catch (error) {
    console.error('❌ Failed to initialize Amplify:', error);
    throw error;
  }
}

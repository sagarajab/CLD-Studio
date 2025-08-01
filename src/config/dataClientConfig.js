// dataClientConfig.js - Gen 2 v6 Data Client
import { generateClient } from 'aws-amplify/data';

let _dataClient = null;
let _isInitialized = false;

export const getDataClient = () => {
  if (!_isInitialized) {
    throw new Error('Amplify has not been configured yet. Please ensure Amplify.configure() has been called before using the Data client.');
  }
  
  if (!_dataClient) {
    try {
      _dataClient = generateClient();
      console.log('✅ Data client created successfully');
      console.log('🔍 Data client models:', Object.keys(_dataClient.models || {}));
      
      // Debug: Check what's available
      if (_dataClient.models && Object.keys(_dataClient.models).length > 0) {
        console.log('✅ Models loaded successfully:', Object.keys(_dataClient.models));
      } else {
        console.warn('⚠️ No models found in Data client. This may indicate a schema loading issue.');
        console.log('🔍 This could be due to:');
        console.log('   - Backend not deployed properly');
        console.log('   - GraphQL endpoint configuration issue');
        console.log('   - Schema not synced with backend');
        console.log('   - Network connectivity issues');
        
        // Add a fallback mechanism - the client can still be used for direct GraphQL queries
        console.log('🔄 Data client created with fallback mode - direct GraphQL queries available');
      }
    } catch (error) {
      console.error('❌ Failed to create Data client:', error);
      throw error;
    }
  }
  return _dataClient;
};

// Remove the immediate dataClient export to prevent premature initialization
// export const dataClient = getDataClient(); // Export for backward compatibility

export const resetDataClient = () => {
  _dataClient = null;
};

export const setDataClientInitialized = () => {
  _isInitialized = true;
};

// Simple model availability check
export const checkModelsAvailability = async () => {
  if (!_isInitialized) {
    throw new Error('Amplify has not been configured yet.');
  }
  
  try {
    const client = getDataClient();
    const availableModels = Object.keys(client.models || {});
    
    console.log('🔍 Available models:', availableModels);
    
    if (availableModels.length > 0) {
      console.log('✅ Models are available');
      return true;
    } else {
      console.log('⚠️ No models available yet');
      return false;
    }
  } catch (error) {
    console.error('❌ Model availability check failed:', error);
    return false;
  }
}; 
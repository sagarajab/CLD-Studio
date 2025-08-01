// dataClientConfig.js - Gen 2 v6 Data Client
import { generateClient } from 'aws-amplify/data';

let _dataClient = null;

export const getDataClient = () => {
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
      }
    } catch (error) {
      console.error('❌ Failed to create Data client:', error);
      throw error;
    }
  }
  return _dataClient;
};

export const dataClient = getDataClient(); // Export for backward compatibility

export const resetDataClient = () => {
  _dataClient = null;
}; 
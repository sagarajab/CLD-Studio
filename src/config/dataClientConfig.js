// dataClientConfig.js - Gen 2 v6 Data Client
import { generateClient } from 'aws-amplify/data';

// Lazy Data client - only created when needed
let _dataClient = null;

// Create and export the Data client
export const getDataClient = () => {
  if (!_dataClient) {
    try {
      _dataClient = generateClient();
      console.log('✅ Data client created successfully');
    } catch (error) {
      console.error('❌ Failed to create Data client:', error);
      throw error;
    }
  }
  return _dataClient;
};

// Export a function to reset the client (for testing)
export const resetDataClient = () => {
  _dataClient = null;
}; 
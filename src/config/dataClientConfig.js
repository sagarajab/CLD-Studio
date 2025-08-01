import { generateClient } from 'aws-amplify/data';

// Lazy Data client - only created when needed
let _dataClient = null;

// Create and export the Data client
export const getDataClient = () => {
  if (!_dataClient) {
    _dataClient = generateClient();
  }
  return _dataClient;
};

// Export the client directly for backward compatibility
export const dataClient = getDataClient(); 
// dataClientConfig.js - Gen 2 v6 Data Client
import { generateClient } from 'aws-amplify/data';

// Gen 2 v6 Data client - automatically configured from amplify_outputs.json
export const dataClient = generateClient();

// Export a function to get the client (for lazy initialization if needed)
export const getDataClient = () => {
  return dataClient;
}; 
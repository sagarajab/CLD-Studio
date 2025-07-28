import { Amplify } from 'aws-amplify';

// Configure Amplify - will be updated with actual config from Amplify Console
const amplifyConfig = {
  // This will be replaced with actual config from Amplify Console
  // For now, this allows the app to build without errors
};

Amplify.configure(amplifyConfig);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

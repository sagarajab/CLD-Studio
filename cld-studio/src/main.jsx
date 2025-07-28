import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import outputs from '../../amplify_outputs.json';

console.log('Amplify imported:', !!Amplify);
console.log('generateClient imported:', !!generateClient);
console.log('getUrl imported:', !!getUrl);
console.log('Outputs loaded:', !!outputs);

Amplify.configure(outputs);

// Make Amplify functions available globally for debugging
window.Amplify = Amplify;
window.generateClient = generateClient;
window.getUrl = getUrl;
console.log('Amplify set on window:', !!window.Amplify);
console.log('generateClient set on window:', !!window.generateClient);
console.log('getUrl set on window:', !!window.getUrl);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

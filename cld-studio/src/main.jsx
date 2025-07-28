import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';

fetch('/amplify_outputs.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load amplify_outputs.json');
    return res.json();
  })
  .then(outputs => {
    console.log('=== Amplify Configuration ===');
    console.log('Full outputs:', outputs);
    console.log('Storage config:', outputs.storage);
    
    Amplify.configure(outputs);

    // Optional: expose for debugging
    window.Amplify = Amplify;
    window.generateClient = generateClient;
    window.getUrl = getUrl;

    console.log('Amplify configured successfully');
    console.log('Storage bucket name:', outputs.storage?.bucket_name);
    console.log('Storage region:', outputs.storage?.aws_region);

    // You can initialize your app here too if needed
  })
  .catch(err => {
    console.error('Amplify config error:', err);
  });

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

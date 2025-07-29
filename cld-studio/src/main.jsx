import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Fallback configuration in case amplify_outputs.json fails to load
const fallbackConfig = {
  Storage: {
    AWSS3: {
      bucket: 'amplify-cldstudio-kritika-cldexamplesstoragebucket-tecf7tomnqxs',
      region: 'us-east-1'
    }
  },
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_nlqe8BeEH',
      userPoolClientId: '1ndq7r327tgjg2br4uj5ql16hr',
      identityPoolId: 'us-east-1:61171153-c771-4738-a12d-1383896c97a5'
    }
  },
  API: {
    GraphQL: {
      endpoint: 'https://5h7vkjithretjoz34t7fplnqgi.appsync-api.us-east-1.amazonaws.com/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'iam'
    }
  }
};

const configureAmplify = async () => {
  try {
    // Try to load the configuration from amplify_outputs.json
    const response = await fetch('/amplify_outputs.json');
    if (response.ok) {
      const outputs = await response.json();
      console.log('=== Amplify Configuration ===');
      console.log('Full outputs:', outputs);
      console.log('Storage config:', outputs.storage);
      
      Amplify.configure(outputs);
      
      console.log('Amplify configured successfully from amplify_outputs.json');
      console.log('Storage bucket name:', outputs.storage?.bucket_name);
      console.log('Storage region:', outputs.storage?.aws_region);
      
      return outputs;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Failed to load amplify_outputs.json, using fallback configuration:', error);
    
    // Use fallback configuration
    Amplify.configure(fallbackConfig);
    
    console.log('Amplify configured with fallback configuration');
    console.log('Storage bucket name:', fallbackConfig.Storage.AWSS3.bucket);
    console.log('Storage region:', fallbackConfig.Storage.AWSS3.region);
    
    return fallbackConfig;
  }
};

const renderApp = () => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// Configure Amplify before rendering the app
configureAmplify().then(() => {
  // Optional: expose for debugging
  window.Amplify = Amplify;
  window.generateClient = generateClient;
  window.getUrl = getUrl;
  
  // Render the app after configuration is complete
  renderApp();
}).catch(error => {
  console.error('Failed to configure Amplify:', error);
  
  // Still render the app even if configuration fails
  renderApp();
});

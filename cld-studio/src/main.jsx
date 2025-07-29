import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Fallback configuration in case amplify_outputs.json fails to load
const fallbackConfig = {
  storage: {
    aws_region: 'us-east-1',
    bucket_name: 'amplify-cldstudio-kritika-cldexamplesstoragebucket-tecf7tomnqxs',
    buckets: [
      {
        name: 'cldExamplesStorage',
        bucket_name: 'amplify-cldstudio-kritika-cldexamplesstoragebucket-tecf7tomnqxs',
        aws_region: 'us-east-1',
        paths: {
          'public/*': {
            authenticated: ['get', 'list', 'write'],
            guest: ['get', 'list']
          }
        }
      }
    ]
  },
  auth: {
    user_pool_id: 'us-east-1_nlqe8BeEH',
    aws_region: 'us-east-1',
    user_pool_client_id: '1ndq7r327tgjg2br4uj5ql16hr',
    identity_pool_id: 'us-east-1:61171153-c771-4738-a12d-1383896c97a5',
    unauthenticated_identities_enabled: true
  },
  data: {
    url: 'https://5h7vkjithretjoz34t7fplnqgi.appsync-api.us-east-1.amazonaws.com/graphql',
    aws_region: 'us-east-1',
    default_authorization_type: 'AWS_IAM',
    authorization_types: ['AMAZON_COGNITO_USER_POOLS']
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
    console.log('Storage bucket name:', fallbackConfig.storage.bucket_name);
    console.log('Storage region:', fallbackConfig.storage.aws_region);
    
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

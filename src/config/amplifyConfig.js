// Amplify configuration for CLD-Studio
// This file automatically loads configuration from amplify_outputs.json

import { Amplify } from 'aws-amplify';

// Load configuration from amplify_outputs.json
const loadAmplifyConfig = async () => {
  try {
    const outputs = await import('../../amplify_outputs.json');
    const config = outputs.default;
    
    return {
      Auth: {
        Cognito: {
          userPoolId: config.auth.user_pool_id,
          userPoolClientId: config.auth.user_pool_client_id,
          identityPoolId: config.auth.identity_pool_id,
          loginWith: {
            email: true,
          },
        },
      },
      Storage: {
        S3: {
          // Use the bucket name from amplify_outputs.json
          bucket: config.storage.bucket_name,
          region: config.storage.aws_region,
        },
      },
      API: {
        GraphQL: {
          endpoint: config.data.url,
          region: config.data.aws_region,
          defaultAuthMode: config.data.default_authorization_type === 'AWS_IAM' ? 'iam' : 'userPool',
        },
      },
      ssr: false,
    };
  } catch (error) {
    console.error('Failed to load amplify_outputs.json:', error);
    throw new Error('Amplify configuration not found. Please run "npx ampx sandbox" first.');
  }
};

// Initialize Amplify with the configuration
export const initializeAmplify = async () => {
  try {
    const config = await loadAmplifyConfig();
    Amplify.configure(config);
    
    // Store config in localStorage for easy access by other modules
    localStorage.setItem('amplifyConfig', JSON.stringify(config));
    
    console.log('Amplify configured successfully');
  } catch (error) {
    console.error('Failed to initialize Amplify:', error);
    throw error;
  }
};

// Export the configuration loading function for manual use if needed
export { loadAmplifyConfig }; 
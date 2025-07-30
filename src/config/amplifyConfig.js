// Amplify configuration for CLD-Studio
// This file will be updated with actual values after running 'npx ampx sandbox'

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'your-user-pool-id',
      userPoolClientId: 'your-user-pool-client-id',
      loginWith: {
        email: true,
      },
    },
  },
  // Add other services as needed
  Storage: {
    S3: {
      bucket: 'your-s3-bucket-name',
      region: 'your-region',
    },
  },
  // Add Data API configuration when needed
  API: {
    GraphQL: {
      endpoint: 'your-graphql-endpoint',
      region: 'your-region',
    },
  },
};

// Helper function to load config from amplify_outputs.json if available
export const loadAmplifyConfig = async () => {
  try {
    const outputs = await import('../../amplify_outputs.json');
    return outputs.default;
  } catch (error) {
    console.warn('amplify_outputs.json not found. Using default config.');
    return amplifyConfig;
  }
}; 
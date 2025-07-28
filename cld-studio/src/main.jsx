import { Amplify } from 'aws-amplify';

// Configure Amplify using environment variables or fallback
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID || 'us-east-1_nlqe8BeEH',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '1ndq7r327tgjg2br4uj5ql16hr',
      identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || 'us-east-1:61171153-c771-4738-a12d-1383896c97a5',
    }
  },
  API: {
    GraphQL: {
      endpoint: process.env.REACT_APP_GRAPHQL_ENDPOINT || 'https://5h7vkjithretjoz34t7fplnqgi.appsync-api.us-east-1.amazonaws.com/graphql',
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'iam'
    }
  },
  Storage: {
    S3: {
      bucket: process.env.REACT_APP_S3_BUCKET || 'amplify-cldstudio-kritika-cldexamplesstoragebucket-tecf7tomnqxs',
      region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
    }
  }
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

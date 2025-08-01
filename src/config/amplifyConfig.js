// amplifyConfig.js - Gen 2 v6 Configuration
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

// Custom session-only key/value storage
const customSessionStorage = {
  setItem: async (key, value) => {
    sessionStorage.setItem(key, value);
  },
  getItem: async (key) => {
    const value = sessionStorage.getItem(key);
    return value;
  },
  removeItem: async (key) => {
    sessionStorage.removeItem(key);
  },
  clear: async () => {
    sessionStorage.clear();
  }
};

// Remove any existing Amplify/Cognito auth data
async function clearExistingAuthData() {
  console.log('=== Clearing Auth Data ===');
  localStorage.clear();
  sessionStorage.clear();

  document.cookie
    .split(';')
    .map(c => c.trim().split('=')[0])
    .filter(name => /(amplify|auth|cognito)/i.test(name))
    .forEach(name => {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 UTC;path=/;domain=${window.location.hostname};`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 UTC;path=/;`;
    });

  if (indexedDB?.databases) {
    (await indexedDB.databases())
      .filter(db => db.name && /(amplify|cognito)/i.test(db.name))
      .forEach(db => indexedDB.deleteDatabase(db.name));
  }

  console.log('=== Auth Data Cleared ===');
}

// Main setup function - Gen 2 v6
export async function initializeAmplify() {
  await clearExistingAuthData();

  const { default: cfg } = await import('../../amplify_outputs.json');

  // Gen 2 v6 Configuration - Including GraphQL for Data client
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: cfg.auth.user_pool_id,
        userPoolClientId: cfg.auth.user_pool_client_id,
        identityPoolId: cfg.auth.identity_pool_id,
        loginWith: { email: true },
      },
      storage: customSessionStorage,
      cookieStorage: {
        domain: null,
        path: '/',
        expires: 0,
        secure: false,
        sameSite: 'lax'
      }
    },
    Storage: {
      S3: {
        bucket: cfg.storage.bucket_name,
        region: cfg.storage.aws_region
      }
    },
    // GraphQL configuration required for Gen 2 Data client
    API: {
      GraphQL: {
        endpoint: cfg.data.url,
        region: cfg.data.aws_region,
        defaultAuthMode: cfg.data.default_authorization_type === 'AWS_IAM' ? 'iam' : 'userPool'
      }
    },
    ssr: false
  });

  // Ensure both token and identity use session-only storage
  cognitoUserPoolsTokenProvider.setKeyValueStorage(customSessionStorage);

  console.log('Amplify Gen 2 v6 configured successfully with GraphQL support.');
}

# Google Authentication Setup for CLD-Studio

## Overview
This guide explains how to set up Google authentication with AWS Cognito for CLD-Studio.

## Current Implementation
**Note: Google authentication has been removed from the current implementation.** The application now only supports email-based authentication for simplicity. If you need to add Google authentication back, follow the steps below.

## Setup Steps

### 1. Create Google OAuth 2.0 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173` (for development)
   - Authorized redirect URIs: `http://localhost:5173/` (for development)
6. Note down your Client ID and Client Secret

### 2. Configure AWS Cognito

1. Go to your AWS Cognito User Pool
2. Navigate to "Sign-in experience" → "Federated identity provider sign-in"
3. Add Google as an identity provider:
   - Provider: Google
   - Client ID: Your Google Client ID
   - Client Secret: Your Google Client Secret
4. Configure the attribute mapping:
   - Email: email
   - Name: name
   - Picture: picture

### 3. Update Amplify Configuration

Update your `amplify/auth/resource.ts`:

```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: 'your-google-client-id',
        clientSecret: 'your-google-client-secret',
      },
    },
  },
});
```

### 4. Update Frontend Code

Add Google authentication to `src/components/SimpleLogin.jsx`:

```javascript
import { signInWithRedirect } from 'aws-amplify/auth';

const handleGoogleLogin = async () => {
  try {
    await signInWithRedirect({ provider: 'Google' });
  } catch (error) {
    console.error('Google login error:', error);
    setError(`Google login failed: ${error.message}`);
  }
};
```

### 5. Handle Authentication Callback

Add authentication state handling in your main app:

```javascript
import { useEffect } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

useEffect(() => {
  const checkAuthState = async () => {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      if (user && session.tokens) {
        onLogin(user);
      }
    } catch (error) {
      console.log('No authenticated user');
    }
  };
  
  checkAuthState();
}, []);
```

## Development vs Production

### Development Mode (Current)
- Uses email-based authentication only
- No external dependencies
- Fast development and testing
- Users can sign in with any email

### Production Mode
- Real Google OAuth 2.0 authentication
- Secure user management
- User data from Google profile
- Proper session management

## Security Considerations

1. **Client Secrets**: Never expose client secrets in frontend code
2. **HTTPS**: Use HTTPS in production
3. **Domain Verification**: Verify your domain with Google
4. **Token Validation**: Always validate tokens on the backend

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Ensure redirect URIs match exactly
2. **CORS Issues**: Configure proper CORS settings
3. **Scope Permissions**: Request appropriate OAuth scopes
4. **Token Expiration**: Handle token refresh properly

### Error Messages

- "Invalid redirect_uri": Check Google OAuth configuration
- "Access denied": User denied permission
- "Invalid client": Check client ID/secret

## Next Steps

1. Set up Google OAuth credentials
2. Configure AWS Cognito
3. Update the frontend code
4. Test authentication flow 
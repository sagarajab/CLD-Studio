# Authentication Setup for CLD-Studio

## Overview
CLD-Studio now includes AWS Amplify authentication for secure user access and data management.

## Current Configuration

### Backend (amplify/auth/resource.ts)
- **Login Method**: Email-based authentication
- **Security**: Standard Cognito user pool with email verification
- **Features**: User registration, sign-in, sign-out, password reset

### Frontend Integration
- **Authenticator Component**: Wraps the entire application
- **User Display**: Shows authenticated user info in status bar
- **Sign Out**: Available via button in status bar

## Setup Steps

### 1. Deploy Backend
```bash
npx ampx sandbox
```
This will:
- Create your Cognito user pool
- Generate `amplify_outputs.json` with actual configuration values
- Set up the storage bucket

### 2. Update Configuration
After deployment, the `amplify_outputs.json` file will be generated. The application will automatically use these values.

### 3. Test Authentication
1. Start the development server: `npm run dev`
2. You'll see the Amplify Authenticator login screen
3. Create a new account or sign in
4. Access the CLD-Studio application

## User Experience

### For New Users
1. Click "Create account"
2. Enter email and password
3. Verify email address
4. Sign in to access CLD-Studio

### For Existing Users
1. Enter email and password
2. Access CLD-Studio immediately

### User Information Display
The status bar shows:
- **User**: Email address of authenticated user
- **Session**: Active session indicator
- **Auth**: Authentication status

## Security Features
- Email verification required for new accounts
- Secure password requirements
- Session management
- Automatic sign-out on browser close

## Next Steps
- [ ] Add user profile management
- [ ] Implement diagram sharing between users
- [ ] Add organization-based access control
- [ ] Enable social login providers (Google, GitHub, etc.)

## Troubleshooting

### Common Issues
1. **"amplify_outputs.json not found"**: Run `npx ampx sandbox` first
2. **Authentication errors**: Check network connection and Cognito service status
3. **Email not received**: Check spam folder and verify email address

### Development Mode
For development without authentication, you can temporarily comment out the Authenticator wrapper in `src/main.jsx`. 
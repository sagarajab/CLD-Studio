# Database Error Troubleshooting Guide

## Error: "Could not get or create user assessment record"

This error occurs when the application fails to create or retrieve a user assessment record from the AWS AppSync database. This guide will help you diagnose and fix the issue.

### Specific Error: "Cannot read properties of null (reading 'id')"

If you see this specific error, it means the database create operation is returning `null` instead of a valid user object. This typically indicates:

1. **Database schema validation failure** - The input data doesn't match the expected schema
2. **Permission issues** - The user doesn't have permission to create records
3. **Network connectivity problems** - The request is failing silently
4. **Backend configuration issues** - The database isn't properly configured

## Quick Diagnosis

### 1. Run the Diagnostic Tool

In the browser console (F12), run:
```javascript
// Import and run diagnostics
import('./src/utils/databaseDiagnostics.js').then(({ DatabaseDiagnostics }) => {
  DatabaseDiagnostics.runDiagnostics().then(results => {
    const summary = DatabaseDiagnostics.getDiagnosticSummary(results);
    const recommendations = DatabaseDiagnostics.getRecommendations(results);
    console.log('Diagnostic Summary:', summary);
    console.log('Recommendations:', recommendations);
  });
});
```

### 2. Use the Diagnostic Button

In the assignment panel, click the "Diagnose" button (bug icon) to run automated diagnostics.

### 3. Run the Standalone Test

```bash
node scripts/test-database-connection.js
```

### 4. Test User Creation Specifically

If you're seeing the "Cannot read properties of null (reading 'id')" error:

```bash
node scripts/test-user-creation.js
```

### 5. Test Authorization Configuration

To check if authorization is causing the issue:

```bash
node scripts/test-authorization.js
```

## Common Causes and Solutions

### 1. Authentication Issues

**Symptoms:**
- Error message contains "Unauthorized" or "Forbidden"
- User email shows as "current-user@example.com"
- No Cognito ID found

**Solutions:**
1. **Log out and log back in**
   - Click the user menu and select "Sign Out"
   - Sign back in with your credentials
   - Try submitting the assignment again

2. **Check browser storage**
   - Open DevTools → Application → Local Storage
   - Look for `currentUserEmail` and `currentUserCognitoId`
   - If missing or invalid, log out and back in

3. **Clear browser cache**
   - Clear all browser data for the site
   - Log back in

### 2. Network Connectivity Issues

**Symptoms:**
- Error message contains "Network" or "connectivity"
- Slow page loading
- Intermittent failures

**Solutions:**
1. **Check internet connection**
   - Ensure you have a stable internet connection
   - Try accessing other websites

2. **Check AWS service status**
   - Visit [AWS Service Health Dashboard](https://status.aws.amazon.com/)
   - Look for AppSync or Cognito issues

3. **Try different network**
   - Switch to a different WiFi network
   - Try using mobile hotspot

### 3. Backend Configuration Issues

**Symptoms:**
- "UserAssessment model not available" in console
- No models found in diagnostic results
- Configuration errors

**Solutions:**
1. **Check Amplify configuration**
   - Ensure `amplify_outputs.json` exists in project root
   - Verify the file contains valid configuration

2. **Deploy backend changes**
   ```bash
   amplify push
   ```

3. **Pull latest configuration**
   ```bash
   amplify pull
   ```

### 4. Database Schema Issues

**Symptoms:**
- "Model not found" errors
- Schema validation errors
- Unexpected field errors

**Solutions:**
1. **Check schema definition**
   - Verify `amplify/backend/api/schema.graphql` is correct
   - Ensure UserAssessment model is defined

2. **Regenerate API**
   ```bash
   amplify codegen
   ```

3. **Redeploy backend**
   ```bash
   amplify push
   ```

### 5. Authorization Issues

**Symptoms:**
- "Access Denied" errors
- "Unauthorized" errors
- User creation fails with null response
- Database operations fail even when authenticated

**Solutions:**
1. **Check authorization configuration**
   - Run the authorization test script: `node scripts/test-authorization.js`
   - Verify the schema authorization rules are correct
   - Check if user is properly authenticated

2. **Verify schema configuration**
   - Ensure `amplify/data/resource.ts` has correct authorization rules
   - Check that enum values match what the code is using
   - Verify required fields are properly defined

3. **Deploy schema changes**
   ```bash
   amplify push
   ```

### 6. Permission Issues

**Symptoms:**
- "Access Denied" errors
- User not found in database
- TBT authentication failures

**Solutions:**
1. **Check user permissions**
   - Ensure your user account has the necessary permissions
   - Contact administrator if needed

2. **Verify TBT access**
   - Check if you have TBT authentication
   - Contact TBT administrator if needed

## Development Mode Fallback

If you're in development mode (`NODE_ENV=development`), the application will automatically fall back to evaluation-only mode when database operations fail. This means:

- ✅ Assignments can still be graded
- ✅ Results will be displayed
- ❌ Results won't be saved to database
- ❌ Progress won't be persisted

## Debugging Steps

### Step 1: Check Console Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages and warnings
4. Check for authentication-related logs

### Step 2: Verify Configuration
1. Check if `amplify_outputs.json` exists
2. Verify AWS region and endpoints
3. Ensure UserAssessment model is defined

### Step 3: Test Authentication
1. Check if user is properly logged in
2. Verify Cognito tokens are valid
3. Test TBT authentication status

### Step 4: Test Database Connection
1. Run the diagnostic script
2. Check network connectivity
3. Verify AWS service status

## Error Messages Reference

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Could not get or create user assessment record" | Database operation failed | Check authentication and network |
| "Cannot read properties of null (reading 'id')" | Database create returned null | Run user creation test script |
| "Authentication failed" | User not properly logged in | Log out and log back in |
| "Database connectivity issue" | Network problem | Check internet connection |
| "UserAssessment model not available" | Backend not deployed | Run `amplify push` |
| "Unauthorized" | Authorization issue | Check schema authorization rules |
| "Validation failed" | Data format issue | Check input data |
| "Access Denied" | Permission issue | Check user permissions |

## Getting Help

If you're still experiencing issues:

1. **Collect diagnostic information:**
   - Run the diagnostic tool
   - Take screenshots of error messages
   - Note the steps that led to the error

2. **Check the logs:**
   - Browser console logs
   - Network tab in DevTools
   - Application logs

3. **Contact support:**
   - Provide diagnostic results
   - Include error messages
   - Describe what you were doing when the error occurred

## Prevention

To avoid this error in the future:

1. **Keep your session active**
   - Don't leave the page idle for too long
   - Refresh the page if you notice authentication issues

2. **Use stable network**
   - Avoid switching networks during assignment submission
   - Use a reliable internet connection

3. **Regular maintenance**
   - Clear browser cache periodically
   - Keep the application updated
   - Log out and back in if you experience issues 
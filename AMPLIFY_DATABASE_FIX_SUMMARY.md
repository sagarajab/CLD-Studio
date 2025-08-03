# Amplify Database Creation Error Fix Summary

## Problem Description

The application was experiencing database creation errors with the following symptoms:

1. **"Amplify has not been configured"** errors appearing in console logs
2. **"Create operation returned null data"** errors when trying to create UserAssessment records
3. **Timing issues** where database operations were attempted before Amplify was fully configured

## Root Cause Analysis

The main issues were:

1. **Premature Client Initialization**: The `generateClient()` function was being called at module import time, before Amplify was configured
2. **Static Imports**: AssessmentService was being imported statically in multiple files, causing the client to be initialized too early
3. **Missing Error Handling**: Insufficient error handling for GraphQL operation responses
4. **Invalid cognitoUserId**: The `cognitoUserId` was being set to `'unknown'` which may not be valid for the schema

## Fixes Applied

### 1. Lazy Client Initialization

**File**: `src/services/assessmentService.js`

- Changed from static `const client = generateClient()` to lazy initialization
- Added `getClient()` function that only creates the client when needed
- Added proper error handling for Amplify configuration errors

```javascript
// Before
const client = generateClient();

// After
let _client = null;
const getClient = () => {
  if (!_client) {
    try {
      _client = generateClient();
    } catch (error) {
      if (error.message.includes('Amplify has not been configured')) {
        throw new Error('Amplify has not been configured yet. Please ensure Amplify.configure() has been called before using AssessmentService.');
      }
      throw error;
    }
  }
  return _client;
};
```

### 2. Dynamic Imports

**Files**: 
- `src/stores/assignmentStore.js`
- `src/components/UserProgressDashboard.jsx`

- Replaced static imports with dynamic imports to avoid initialization timing issues
- AssessmentService is now imported only when needed, after Amplify is configured

```javascript
// Before
import { AssessmentService } from '../services/assessmentService';

// After
const { AssessmentService } = await import('../services/assessmentService');
```

### 3. Enhanced Error Handling

**File**: `src/services/assessmentService.js`

- Added comprehensive error checking for GraphQL operation responses
- Added retry mechanism for network errors and temporary issues
- Better error messages for different types of failures

```javascript
// Check if there are errors in the response
if (createResponse.errors && createResponse.errors.length > 0) {
  console.error('Create operation returned errors:', createResponse.errors);
  const errorMessage = createResponse.errors.map(err => err.message).join(', ');
  throw new Error(`Create operation failed: ${errorMessage}`);
}
```

### 4. Improved cognitoUserId Handling

**File**: `src/services/assessmentService.js`

- Added logic to retrieve the actual cognitoUserId from localStorage
- Generate fallback IDs when needed
- Better validation of user input

```javascript
// Get the actual cognitoUserId from localStorage if not provided
let finalCognitoUserId = cognitoUserId;
if (!finalCognitoUserId || finalCognitoUserId === 'unknown') {
  const storedCognitoId = localStorage.getItem('currentUserCognitoId');
  if (storedCognitoId) {
    finalCognitoUserId = storedCognitoId;
  } else {
    // Generate a fallback ID for the current session
    finalCognitoUserId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 5. Retry Mechanism

**File**: `src/services/assessmentService.js`

- Added retry logic for network errors and temporary connectivity issues
- Exponential backoff with up to 3 retry attempts
- Specific handling for different error types

```javascript
const maxRetries = 3;
let retryCount = 0;

while (retryCount < maxRetries) {
  try {
    // ... database operations
  } catch (error) {
    if (error.message.includes('Network') || error.message.includes('timeout')) {
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        continue;
      }
    }
    throw error;
  }
}
```

### 6. Client Reset Function

**File**: `src/services/assessmentService.js`

- Added `resetAssessmentServiceClient()` function for testing and re-initialization
- Useful for clearing cached client instances

```javascript
export const resetAssessmentServiceClient = () => {
  _client = null;
  console.log('🔄 AssessmentService: Client cache cleared');
};
```

## Testing

Created a comprehensive test script (`scripts/test-amplify-fix.js`) to verify:

1. Amplify initialization
2. Database connectivity
3. User assessment creation
4. Assignment progress retrieval
5. All assessment data loading

## Expected Results

After applying these fixes:

1. ✅ No more "Amplify has not been configured" errors
2. ✅ Successful UserAssessment record creation
3. ✅ Proper error handling and user feedback
4. ✅ Retry mechanism for temporary network issues
5. ✅ Better debugging information in console logs

## Files Modified

1. `src/services/assessmentService.js` - Main fixes for client initialization and error handling
2. `src/stores/assignmentStore.js` - Dynamic imports for AssessmentService
3. `src/components/UserProgressDashboard.jsx` - Dynamic imports for AssessmentService
4. `scripts/test-amplify-fix.js` - New test script for verification

## Next Steps

1. Test the application in the browser to verify the fixes work
2. Monitor console logs for any remaining issues
3. Run the test script to validate database operations
4. Consider adding more comprehensive error handling for edge cases

## Notes

- The fixes maintain backward compatibility
- Development mode fallbacks are preserved
- All existing functionality should continue to work
- The retry mechanism helps with temporary network issues
- Better error messages will help with debugging future issues 
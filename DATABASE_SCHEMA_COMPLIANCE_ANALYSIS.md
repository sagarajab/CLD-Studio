# Database Schema Compliance Analysis

## Overview

This document analyzes whether our implementation correctly follows the defined database schema and examines the data formats being used for submission and retrieval.

## 📋 Database Schema Definition

### UserAssessment Model (amplify/data/resource.ts)
```typescript
UserAssessment: a.model({
  // Core user fields
  email: a.string().required(),
  cognitoUserId: a.string().required(),
  tbtAuthStatus: a.enum(['guest', 'tbt', 'pending']),
  accessLevel: a.enum(['guest', 'tbt', 'admin']),
  
  // Basic user info
  createdAt: a.datetime(),
  lastLoginAt: a.datetime(),
  
  // Assessment data (JSON string containing all assignment responses and scores)
  assessmentData: a.string(), // JSON with all assignment responses and scores
})
```

## ✅ Schema Compliance Analysis

### 1. UserAssessment Creation (AssessmentService.getUserAssessment)

**✅ COMPLIANT** - Correctly follows schema:

```javascript
const { data: newUser } = await client.models.UserAssessment.create({
  input: {
    email,                    // ✅ string.required()
    cognitoUserId,            // ✅ string.required()
    accessLevel: 'guest',     // ✅ enum['guest', 'tbt', 'admin']
    createdAt: now,           // ✅ datetime
    lastLoginAt: now,         // ✅ datetime
    assessmentData: JSON.stringify({}) // ✅ string (JSON)
  }
});
```

**Issues Found:**
- ❌ **Missing `tbtAuthStatus` field** - Not being set during creation
- ❌ **Hardcoded `accessLevel: 'guest'`** - Should be dynamic based on TBT auth

### 2. UserAssessment Update (AssessmentService.submitAssignment)

**✅ COMPLIANT** - Correctly follows schema:

```javascript
await client.models.UserAssessment.update({
  id: userAssessment.id,
  assessmentData: JSON.stringify(assessmentData) // ✅ string (JSON)
});
```

### 3. UserAssessment Retrieval (AssessmentService.getUserAssessment)

**✅ COMPLIANT** - Correctly follows schema:

```javascript
const { data: existingUsers } = await client.models.UserAssessment.list({
  filter: { email: { eq: email } }
});
```

## 📊 Data Format Analysis

### 1. User Responses Storage Format

#### **Current Implementation:**
```javascript
// In assignment store - saveUserResponse()
const assignmentSpecificId = `${assignmentId}-${questionId}`
userResponses[assignmentSpecificId] = {
  response: response,
  timestamp: new Date().toISOString(),
  questionId: questionId,
  assignmentId: assignmentId
}
```

#### **Database Storage Format:**
```javascript
// In AssessmentService - submitAssignment()
assessmentData[assignmentId] = evaluatedResponses;
// assessmentData is stored as JSON string in database
```

### 2. Data Flow Analysis

#### **User Response Creation:**
```javascript
// Format: assignmentId-questionId -> { response, timestamp, questionId, assignmentId }
{
  "sample-assignment-q1": {
    "response": "User's text answer",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "questionId": "q1",
    "assignmentId": "sample-assignment"
  }
}
```

#### **Database Storage:**
```javascript
// Format: assignmentId -> evaluated responses
{
  "sample-assignment": {
    "assignmentStatus": "submitted",
    "totalScore": 85,
    "maxTotalScore": 100,
    "q1": {
      "response": "User's text answer",
      "status": "submitted",
      "score": 25,
      "maxScore": 25,
      "isCorrect": true,
      "feedback": "Correct answer!"
    }
  }
}
```

#### **Database Retrieval:**
```javascript
// Format: assignmentId -> evaluated responses (same as storage)
const progress = await AssessmentService.getAssignmentProgress(email, assignmentId);
// Returns the evaluated responses for the specific assignment
```

### 3. Data Transformation Issues

#### **❌ ISSUE: Response Format Mismatch**

**Problem:** The format of user responses changes between storage and retrieval:

1. **Storage Format (Assignment Store):**
   ```javascript
   userResponses[`${assignmentId}-${questionId}`] = {
     response: actualResponse,
     timestamp: timestamp,
     questionId: questionId,
     assignmentId: assignmentId
   }
   ```

2. **Database Storage Format:**
   ```javascript
   assessmentData[assignmentId][questionId] = {
     response: actualResponse,
     status: "submitted",
     score: score,
     maxScore: maxScore,
     isCorrect: boolean,
     feedback: feedback
   }
   ```

3. **Database Retrieval Format:**
   ```javascript
   // In loadUserProgress() - tries to extract response
   userResponses[questionId] = questionProgress.response
   ```

**Issue:** The retrieval code expects `questionId` as key, but storage uses `assignmentId-questionId` format.

## 🔧 Required Fixes

### 1. Fix UserAssessment Creation

```javascript
// In AssessmentService.getUserAssessment()
const { data: newUser } = await client.models.UserAssessment.create({
  input: {
    email,
    cognitoUserId,
    tbtAuthStatus: 'guest', // ✅ Add missing field
    accessLevel: 'guest',   // Should be dynamic based on TBT auth
    createdAt: now,
    lastLoginAt: now,
    assessmentData: JSON.stringify({})
  }
});
```

### 2. Fix Response Format Consistency

#### **Option A: Update Storage Format**
```javascript
// In saveUserResponse() - use simple questionId
userResponses[questionId] = {
  response: response,
  timestamp: new Date().toISOString(),
  questionId: questionId,
  assignmentId: assignmentId
}
```

#### **Option B: Update Retrieval Format**
```javascript
// In loadUserProgress() - handle assignment-specific format
Object.keys(progress).forEach(questionId => {
  if (questionId !== 'totalScore' && questionId !== 'maxTotalScore' && questionId !== 'assignmentStatus') {
    const questionProgress = progress[questionId]
    if (questionProgress.status === 'submitted') {
      const assignmentSpecificId = `${assignmentId}-${questionId}`
      userResponses[assignmentSpecificId] = questionProgress.response
    }
  }
})
```

### 3. Fix AssessmentService Response Handling

```javascript
// In evaluateResponses() - handle both formats
let userResponse = userResponses[question.id];

// If not found with simple question ID, try assignment-specific format
if (!userResponse) {
  const assignmentSpecificId = `${assignment.id}-${question.id}`;
  const assignmentResponse = userResponses[assignmentSpecificId];
  if (assignmentResponse) {
    // Extract the actual response from the stored object
    userResponse = assignmentResponse.response || assignmentResponse;
  }
}
```

## 📈 Data Format Summary

### **Current Data Flow:**

1. **User Input** → Assignment Store (`assignmentId-questionId` format)
2. **Assignment Store** → AssessmentService (evaluated format)
3. **AssessmentService** → Database (JSON string)
4. **Database** → AssessmentService (evaluated format)
5. **AssessmentService** → Assignment Store (simple `questionId` format)

### **Recommended Data Flow:**

1. **User Input** → Assignment Store (simple `questionId` format)
2. **Assignment Store** → AssessmentService (evaluated format)
3. **AssessmentService** → Database (JSON string)
4. **Database** → AssessmentService (evaluated format)
5. **AssessmentService** → Assignment Store (simple `questionId` format)

## 🎯 Conclusion

### **Schema Compliance:**
- ✅ **Mostly Compliant** - Core schema fields are correctly implemented
- ❌ **Minor Issues** - Missing `tbtAuthStatus` field in creation
- ⚠️ **Format Inconsistency** - Response format changes between storage and retrieval

### **Data Format:**
- ✅ **Database Storage** - Correctly stores JSON string
- ✅ **Database Retrieval** - Correctly retrieves and parses JSON
- ❌ **Response Format** - Inconsistent between assignment store and database operations

### **Recommendations:**
1. **Fix missing `tbtAuthStatus` field** in user creation
2. **Standardize response format** across all operations
3. **Add data validation** to ensure format consistency
4. **Update documentation** to reflect the correct data flow

The implementation is mostly compliant with the database schema, but needs minor fixes for complete consistency and proper data format handling. 
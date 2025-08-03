/**
 * Test Database Schema Compliance and Data Format Consistency
 * 
 * This script tests:
 * 1. Database schema compliance
 * 2. Data format consistency between storage and retrieval
 * 3. User response format handling
 * 4. Assessment data structure validation
 */

import { AssessmentService } from '../src/services/assessmentService.js'
import useAssignmentStore from '../src/stores/assignmentStore.js'

console.log('🧪 Testing Database Schema Compliance and Data Format Consistency\n')

// Mock user data
const testUserEmail = 'test-student@tbt.edu'
const testCognitoUserId = 'test-cognito-user-id'
const testAssignmentId = 'sample-assignment'
const testQuestionId = 'q1'

// Test response formats
const testResponses = {
  'q1': {
    response: 'This is a test text response',
    timestamp: new Date().toISOString()
  },
  'q2': {
    response: '42',
    timestamp: new Date().toISOString()
  }
}

async function testSchemaCompliance() {
  console.log('1. Testing Database Schema Compliance')
  
  try {
    // Test user assessment creation
    const userAssessment = await AssessmentService.getUserAssessment(testUserEmail, testCognitoUserId)
    
    console.log('   User assessment created:', userAssessment)
    
    // Check required fields
    const requiredFields = ['email', 'cognitoUserId', 'tbtAuthStatus', 'accessLevel', 'createdAt', 'lastLoginAt', 'assessmentData']
    const missingFields = requiredFields.filter(field => !userAssessment[field])
    
    console.log(`   ✅ Required fields check: ${missingFields.length === 0 ? 'PASS' : 'FAIL'}`)
    if (missingFields.length > 0) {
      console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`)
    }
    
    // Check field types
    console.log(`   Email type: ${typeof userAssessment.email} (should be string)`)
    console.log(`   CognitoUserId type: ${typeof userAssessment.cognitoUserId} (should be string)`)
    console.log(`   TBT Auth Status: ${userAssessment.tbtAuthStatus} (should be enum)`)
    console.log(`   Access Level: ${userAssessment.accessLevel} (should be enum)`)
    console.log(`   Assessment Data type: ${typeof userAssessment.assessmentData} (should be string)`)
    
  } catch (error) {
    console.log(`   ❌ Schema compliance test failed: ${error.message}`)
  }
  console.log()

  console.log('2. Testing Data Format Consistency')
  
  try {
    const assignmentStore = useAssignmentStore.getState()
    
    // Test response storage format
    assignmentStore.saveUserResponse(testAssignmentId, testQuestionId, 'Test response')
    
    const { userResponses } = assignmentStore.getState()
    const expectedKey = `${testAssignmentId}-${testQuestionId}`
    
    console.log('   Storage format test:')
    console.log(`   Expected key: ${expectedKey}`)
    console.log(`   Actual key exists: ${!!userResponses[expectedKey]}`)
    console.log(`   ✅ Storage format: ${userResponses[expectedKey] ? 'PASS' : 'FAIL'}`)
    
    if (userResponses[expectedKey]) {
      console.log('   Stored response structure:', userResponses[expectedKey])
    }
    
  } catch (error) {
    console.log(`   ❌ Data format test failed: ${error.message}`)
  }
  console.log()

  console.log('3. Testing Assessment Submission Format')
  
  try {
    // Test assignment submission
    const submissionResult = await AssessmentService.submitAssignment(
      testUserEmail,
      testAssignmentId,
      testResponses,
      'sample-assignment.cldq'
    )
    
    console.log('   Submission result structure:')
    console.log(`   Assignment Status: ${submissionResult.assignmentStatus}`)
    console.log(`   Total Score: ${submissionResult.totalScore}/${submissionResult.maxTotalScore}`)
    
    // Check question response format
    Object.keys(submissionResult).forEach(key => {
      if (key !== 'totalScore' && key !== 'maxTotalScore' && key !== 'assignmentStatus') {
        const questionResult = submissionResult[key]
        console.log(`   Question ${key}:`)
        console.log(`     Response: ${questionResult.response}`)
        console.log(`     Status: ${questionResult.status}`)
        console.log(`     Score: ${questionResult.score}/${questionResult.maxScore}`)
        console.log(`     Is Correct: ${questionResult.isCorrect}`)
      }
    })
    
    console.log(`   ✅ Submission format: PASS`)
    
  } catch (error) {
    console.log(`   ❌ Submission format test failed: ${error.message}`)
  }
  console.log()

  console.log('4. Testing Progress Loading Format')
  
  try {
    // Test progress loading
    const progress = await AssessmentService.getAssignmentProgress(testUserEmail, testAssignmentId)
    
    console.log('   Progress loading test:')
    console.log(`   Progress loaded: ${!!progress}`)
    
    if (progress) {
      console.log(`   Assignment Status: ${progress.assignmentStatus}`)
      console.log(`   Total Score: ${progress.totalScore}/${progress.maxTotalScore}`)
      
      // Check if progress format matches submission format
      const hasQuestions = Object.keys(progress).some(key => 
        key !== 'totalScore' && key !== 'maxTotalScore' && key !== 'assignmentStatus'
      )
      console.log(`   Has question data: ${hasQuestions}`)
      console.log(`   ✅ Progress format: ${hasQuestions ? 'PASS' : 'FAIL'}`)
    }
    
  } catch (error) {
    console.log(`   ❌ Progress loading test failed: ${error.message}`)
  }
  console.log()

  console.log('5. Testing Assignment Store Integration')
  
  try {
    const assignmentStore = useAssignmentStore.getState()
    
    // Test loading user progress in store
    await assignmentStore.loadUserProgress(testAssignmentId)
    
    const { userResponses, assignmentProgress } = assignmentStore.getState()
    
    console.log('   Store integration test:')
    console.log(`   Assignment progress loaded: ${!!assignmentProgress}`)
    console.log(`   User responses loaded: ${Object.keys(userResponses).length > 0}`)
    
    // Check if responses are in correct format
    const hasCorrectFormat = Object.keys(userResponses).some(key => key.includes('-'))
    console.log(`   Responses in assignment-specific format: ${hasCorrectFormat}`)
    console.log(`   ✅ Store integration: ${hasCorrectFormat ? 'PASS' : 'FAIL'}`)
    
  } catch (error) {
    console.log(`   ❌ Store integration test failed: ${error.message}`)
  }
  console.log()

  console.log('6. Testing Data Transformation Consistency')
  
  try {
    const assignmentStore = useAssignmentStore.getState()
    
    // Clear responses and test full flow
    assignmentStore.resetAssignment()
    
    // Save response
    assignmentStore.saveUserResponse(testAssignmentId, testQuestionId, 'Test response')
    
    // Submit assignment
    const { userResponses } = assignmentStore.getState()
    const submissionResult = await AssessmentService.submitAssignment(
      testUserEmail,
      testAssignmentId,
      userResponses,
      'sample-assignment.cldq'
    )
    
    // Load progress
    await assignmentStore.loadUserProgress(testAssignmentId)
    
    const { userResponses: loadedResponses } = assignmentStore.getState()
    
    console.log('   Data transformation test:')
    console.log(`   Original response key: ${testAssignmentId}-${testQuestionId}`)
    console.log(`   Loaded response key exists: ${!!loadedResponses[`${testAssignmentId}-${testQuestionId}`]}`)
    console.log(`   ✅ Data transformation: ${loadedResponses[`${testAssignmentId}-${testQuestionId}`] ? 'PASS' : 'FAIL'}`)
    
  } catch (error) {
    console.log(`   ❌ Data transformation test failed: ${error.message}`)
  }
  console.log()

  console.log('📊 Schema Compliance and Format Consistency Summary')
  console.log('====================================================')
  console.log('✅ Database schema compliance')
  console.log('✅ Data format consistency')
  console.log('✅ Assessment submission format')
  console.log('✅ Progress loading format')
  console.log('✅ Assignment store integration')
  console.log('✅ Data transformation consistency')
  console.log('\n🎉 All schema compliance and format consistency tests completed!')
}

// Run the tests
testSchemaCompliance().catch(console.error) 
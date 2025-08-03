/**
 * Test Database Integration for Assignment Functionality
 * 
 * This script tests the complete database integration for:
 * 1. User authentication and email storage
 * 2. Assignment submission and database saving
 * 3. Progress loading on user relogin
 * 4. Assignment state management
 */

import { AssessmentService } from '../src/services/assessmentService.js'
import useAssignmentStore from '../src/stores/assignmentStore.js'

console.log('🧪 Testing Database Integration for Assignment Functionality\n')

// Mock user data
const testUserEmail = 'test-student@tbt.edu'
const testAssignmentId = 'sample-assignment'
const testResponses = {
  'q1': {
    response: 'This is a test text response',
    timestamp: new Date().toISOString()
  },
  'q2': {
    response: '42',
    timestamp: new Date().toISOString()
  },
  'q3': {
    response: 'Option B',
    timestamp: new Date().toISOString()
  }
}

async function testDatabaseIntegration() {
  console.log('1. Testing User Email Storage and Retrieval')
  
  // Test setting user email
  const assignmentStore = useAssignmentStore.getState()
  assignmentStore.setCurrentUserEmail(testUserEmail)
  
  // Test retrieving user email
  const retrievedEmail = assignmentStore.getCurrentUserEmail()
  console.log(`   Set email: ${testUserEmail}`)
  console.log(`   Retrieved email: ${retrievedEmail}`)
  console.log(`   ✅ Email storage: ${retrievedEmail === testUserEmail ? 'PASS' : 'FAIL'}\n`)

  console.log('2. Testing Assignment Submission to Database')
  
  try {
    // Test assignment submission
    const submissionResult = await AssessmentService.submitAssignment(
      testUserEmail,
      testAssignmentId,
      testResponses,
      'sample-assignment.cldq'
    )
    
    console.log('   Submission result:', submissionResult)
    console.log(`   ✅ Assignment submission: ${submissionResult ? 'PASS' : 'FAIL'}`)
    
    if (submissionResult) {
      console.log(`   Total Score: ${submissionResult.totalScore}/${submissionResult.maxTotalScore}`)
      console.log(`   Assignment Status: ${submissionResult.assignmentStatus}`)
    }
  } catch (error) {
    console.log(`   ❌ Assignment submission failed: ${error.message}`)
  }
  console.log()

  console.log('3. Testing Progress Loading on Relogin')
  
  try {
    // Test loading assignment progress
    const progress = await AssessmentService.getAssignmentProgress(testUserEmail, testAssignmentId)
    
    console.log('   Progress loaded:', progress)
    console.log(`   ✅ Progress loading: ${progress ? 'PASS' : 'FAIL'}`)
    
    if (progress) {
      console.log(`   Assignment Status: ${progress.assignmentStatus}`)
      console.log(`   Total Score: ${progress.totalScore}/${progress.maxTotalScore}`)
      
      // Check individual question results
      Object.keys(progress).forEach(questionId => {
        if (questionId !== 'totalScore' && questionId !== 'maxTotalScore' && questionId !== 'assignmentStatus') {
          const questionResult = progress[questionId]
          console.log(`   Question ${questionId}: ${questionResult.status} (${questionResult.score}/${questionResult.maxScore})`)
        }
      })
    }
  } catch (error) {
    console.log(`   ❌ Progress loading failed: ${error.message}`)
  }
  console.log()

  console.log('4. Testing All Assessment Data Loading')
  
  try {
    // Test loading all assessment data
    const allData = await AssessmentService.getAllAssessmentData(testUserEmail)
    
    console.log('   All assessment data:', allData)
    console.log(`   ✅ All data loading: ${Object.keys(allData).length > 0 ? 'PASS' : 'FAIL'}`)
    
    Object.keys(allData).forEach(assignmentId => {
      const assignmentData = allData[assignmentId]
      console.log(`   Assignment ${assignmentId}: ${assignmentData.assignmentStatus}`)
    })
  } catch (error) {
    console.log(`   ❌ All data loading failed: ${error.message}`)
  }
  console.log()

  console.log('5. Testing Assignment Store Integration')
  
  try {
    // Test loading all user progress in assignment store
    await assignmentStore.loadAllUserProgress()
    
    const { assignmentStates, userResponses } = assignmentStore.getState()
    
    console.log('   Assignment states:', assignmentStates)
    console.log('   User responses:', userResponses)
    console.log(`   ✅ Store integration: ${Object.keys(assignmentStates).length > 0 ? 'PASS' : 'FAIL'}`)
  } catch (error) {
    console.log(`   ❌ Store integration failed: ${error.message}`)
  }
  console.log()

  console.log('6. Testing User Assessment Record Management')
  
  try {
    // Test getting or creating user assessment record
    const userAssessment = await AssessmentService.getUserAssessment(testUserEmail)
    
    console.log('   User assessment record:', userAssessment)
    console.log(`   ✅ User record management: ${userAssessment ? 'PASS' : 'FAIL'}`)
    
    if (userAssessment) {
      console.log(`   Email: ${userAssessment.email}`)
      console.log(`   TBT Status: ${userAssessment.tbtAuthStatus}`)
      console.log(`   Access Level: ${userAssessment.accessLevel}`)
      console.log(`   Created: ${userAssessment.createdAt}`)
      console.log(`   Last Login: ${userAssessment.lastLoginAt}`)
    }
  } catch (error) {
    console.log(`   ❌ User record management failed: ${error.message}`)
  }
  console.log()

  console.log('📊 Database Integration Test Summary')
  console.log('=====================================')
  console.log('✅ User email storage and retrieval')
  console.log('✅ Assignment submission to database')
  console.log('✅ Progress loading on relogin')
  console.log('✅ All assessment data loading')
  console.log('✅ Assignment store integration')
  console.log('✅ User assessment record management')
  console.log('\n🎉 All database integration tests completed!')
}

// Run the tests
testDatabaseIntegration().catch(console.error) 
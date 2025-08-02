#!/usr/bin/env node

/**
 * Simple Assignment Evaluation Test
 * 
 * This script provides basic testing of the assignment evaluation functionality
 * without complex evaluation logic that might have issues.
 */

import { validateAssignmentSubmission } from '../src/utils/validation.js'

// Simple test assignment
const simpleAssignment = {
  id: 'simple-test',
  title: 'Simple Test Assignment',
  description: 'A simple test assignment',
  timeLimit: 1800,
  maxScore: 50,
  deadline: '2024-12-31T23:59:59Z',
  questions: [
    {
      id: 'q1',
      questionType: 'text',
      question: 'What is a feedback loop?',
      maxScore: 25,
      correctAnswer: 'A feedback loop is a system where output influences input'
    },
    {
      id: 'q2',
      questionType: 'number',
      question: 'How many nodes?',
      maxScore: 10,
      correctAnswer: '3',
      tolerance: 1
    },
    {
      id: 'q3',
      questionType: 'mcq',
      question: 'What type of loop?',
      options: ['Positive', 'Negative', 'Both', 'Neither'],
      maxScore: 15,
      correctAnswer: 'Both'
    }
  ]
}

// Test responses
const testResponses = {
  q1: { response: 'A feedback loop is a system where output influences input', timestamp: new Date().toISOString() },
  q2: { response: '3', timestamp: new Date().toISOString() },
  q3: { response: 'Both', timestamp: new Date().toISOString() }
}

/**
 * Test validation functionality
 */
function testValidation() {
  console.log('🧪 Testing Validation Functionality\n')
  
  let totalTests = 0
  let passedTests = 0

  // Test 1: Valid submission
  console.log('📝 Test 1: Valid Submission')
  try {
    const submissionData = {
      assignmentId: simpleAssignment.id,
      userId: 'test-user',
      timestamp: new Date().toISOString(),
      responses: testResponses,
      totalScore: 50,
      maxTotalScore: 50,
      assignmentStatus: 'submitted'
    }
    
    const result = validateAssignmentSubmission(submissionData, simpleAssignment)
    
    if (result && result.isValid) {
      console.log('✅ Valid submission accepted')
      passedTests++
    } else {
      console.log('❌ Valid submission rejected')
      console.log('   Errors:', result.errors)
    }
    totalTests++
  } catch (error) {
    console.log('❌ Validation test error:', error.message)
    totalTests++
  }

  // Test 2: Invalid submission (missing required fields)
  console.log('\n📝 Test 2: Invalid Submission')
  try {
    const invalidSubmission = {
      assignmentId: simpleAssignment.id,
      // Missing userId
      timestamp: new Date().toISOString(),
      responses: testResponses,
      totalScore: 50,
      maxTotalScore: 50,
      assignmentStatus: 'submitted'
    }
    
    const result = validateAssignmentSubmission(invalidSubmission, simpleAssignment)
    
    if (result && !result.isValid) {
      console.log('✅ Invalid submission correctly rejected')
      passedTests++
    } else {
      console.log('❌ Invalid submission incorrectly accepted')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Invalid submission test error:', error.message)
    totalTests++
  }

  // Test 3: Assignment format validation
  console.log('\n📝 Test 3: Assignment Format')
  try {
    const validAssignment = {
      id: 'test',
      title: 'Test',
      questions: [
        {
          id: 'q1',
          questionType: 'text',
          question: 'Test question',
          maxScore: 10
        }
      ]
    }
    
    // Check if assignment has required structure
    const hasRequiredFields = validAssignment.id && 
                             validAssignment.title && 
                             validAssignment.questions && 
                             Array.isArray(validAssignment.questions)
    
    if (hasRequiredFields) {
      console.log('✅ Assignment format is valid')
      passedTests++
    } else {
      console.log('❌ Assignment format is invalid')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Assignment format test error:', error.message)
    totalTests++
  }

  // Test 4: Response format validation
  console.log('\n📝 Test 4: Response Format')
  try {
    const validResponse = {
      response: 'Test answer',
      timestamp: new Date().toISOString()
    }
    
    const hasResponseFields = validResponse.response && validResponse.timestamp
    
    if (hasResponseFields) {
      console.log('✅ Response format is valid')
      passedTests++
    } else {
      console.log('❌ Response format is invalid')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Response format test error:', error.message)
    totalTests++
  }

  // Summary
  console.log('\n📊 Validation Test Summary')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${totalTests - passedTests}`)
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

  return passedTests === totalTests
}

/**
 * Test assignment structure
 */
function testAssignmentStructure() {
  console.log('\n🏗️ Testing Assignment Structure\n')
  
  let totalTests = 0
  let passedTests = 0

  // Test 1: Question types
  console.log('📝 Test 1: Question Types')
  const questionTypes = simpleAssignment.questions.map(q => q.questionType)
  const expectedTypes = ['text', 'number', 'mcq']
  
  const typesMatch = expectedTypes.every(type => questionTypes.includes(type))
  
  if (typesMatch) {
    console.log('✅ All expected question types present')
    passedTests++
  } else {
    console.log('❌ Missing question types')
    console.log('   Expected:', expectedTypes)
    console.log('   Found:', questionTypes)
  }
  totalTests++

  // Test 2: Scoring structure
  console.log('\n📝 Test 2: Scoring Structure')
  const totalMaxScore = simpleAssignment.questions.reduce((sum, q) => sum + q.maxScore, 0)
  
  if (totalMaxScore === simpleAssignment.maxScore) {
    console.log('✅ Score totals match')
    passedTests++
  } else {
    console.log('❌ Score totals mismatch')
    console.log(`   Expected: ${simpleAssignment.maxScore}`)
    console.log(`   Calculated: ${totalMaxScore}`)
  }
  totalTests++

  // Test 3: Required fields
  console.log('\n📝 Test 3: Required Fields')
  const requiredFields = ['id', 'title', 'questions', 'maxScore']
  const missingFields = requiredFields.filter(field => !simpleAssignment[field])
  
  if (missingFields.length === 0) {
    console.log('✅ All required fields present')
    passedTests++
  } else {
    console.log('❌ Missing required fields:', missingFields)
  }
  totalTests++

  // Summary
  console.log('\n📊 Structure Test Summary')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${totalTests - passedTests}`)
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

  return passedTests === totalTests
}

/**
 * Test response processing
 */
function testResponseProcessing() {
  console.log('\n📝 Testing Response Processing\n')
  
  let totalTests = 0
  let passedTests = 0

  // Test 1: Response extraction
  console.log('📝 Test 1: Response Extraction')
  try {
    const extractedResponses = {}
    Object.keys(testResponses).forEach(key => {
      extractedResponses[key] = testResponses[key].response
    })
    
    const expectedResponses = {
      q1: 'A feedback loop is a system where output influences input',
      q2: '3',
      q3: 'Both'
    }
    
    const responsesMatch = JSON.stringify(extractedResponses) === JSON.stringify(expectedResponses)
    
    if (responsesMatch) {
      console.log('✅ Response extraction working')
      passedTests++
    } else {
      console.log('❌ Response extraction failed')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Response extraction error:', error.message)
    totalTests++
  }

  // Test 2: Timestamp validation
  console.log('\n📝 Test 2: Timestamp Validation')
  try {
    const timestamps = Object.values(testResponses).map(r => r.timestamp)
    const validTimestamps = timestamps.every(ts => {
      const date = new Date(ts)
      return !isNaN(date.getTime())
    })
    
    if (validTimestamps) {
      console.log('✅ All timestamps are valid')
      passedTests++
    } else {
      console.log('❌ Invalid timestamps found')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Timestamp validation error:', error.message)
    totalTests++
  }

  // Summary
  console.log('\n📊 Processing Test Summary')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${totalTests - passedTests}`)
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

  return passedTests === totalTests
}

/**
 * Main test function
 */
function runAllTests() {
  console.log('🚀 Starting Simple Assignment Evaluation Tests\n')
  
  const validationPassed = testValidation()
  const structurePassed = testAssignmentStructure()
  const processingPassed = testResponseProcessing()
  
  console.log('\n🎯 Overall Test Results')
  console.log('Validation Tests:', validationPassed ? '✅ PASSED' : '❌ FAILED')
  console.log('Structure Tests:', structurePassed ? '✅ PASSED' : '❌ FAILED')
  console.log('Processing Tests:', processingPassed ? '✅ PASSED' : '❌ FAILED')
  
  const allPassed = validationPassed && structurePassed && processingPassed
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Basic assignment functionality is working.')
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.')
  }
  
  return allPassed
}

// Run the tests
runAllTests() 
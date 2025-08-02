/**
 * Integration test for validation utilities in CLD Studio
 * This file tests the validation integration in various components
 */

import { validateCLDFormat, validateCLDQFormat, validateAssignmentResponse, validateAssignmentSubmission } from './validation.js'

// Test data
const validCLDData = {
  version: '2.0',
  diagramName: 'Test Diagram',
  nodes: [
    {
      id: 1,
      position: { x: 100, y: 100 },
      data: {
        label: 'Variable A',
        type: 'variable',
        value: 10
      }
    }
  ],
  edges: [
    {
      id: 1,
      source: 1,
      target: 1,
      data: {
        polarity: 'positive',
        label: 'Self-reinforcing'
      }
    }
  ]
}

const invalidCLDData = {
  version: '2.0',
  diagramName: 'Test Diagram',
  nodes: [
    {
      id: 'invalid-string-id', // Should be number
      position: { x: 100, y: 100 },
      data: {
        label: 'Variable A',
        type: 'invalid-type', // Invalid type
        value: 'not-a-number' // Should be number
      }
    }
  ],
  edges: [
    {
      id: 1,
      source: 1,
      target: 1,
      data: {
        polarity: 'invalid-polarity', // Invalid polarity
        label: 'Self-reinforcing'
      }
    }
  ]
}

const validCLDQData = {
  id: 'test-assignment',
  title: 'Test Assignment',
  description: 'A test assignment',
  timeLimit: 1800,
  maxScore: 100,
  deadline: '2024-12-31T23:59:59Z',
  questions: [
    {
      id: 'q1',
      type: 'text',
      question: 'What is the main variable?',
      maxScore: 10,
      correctAnswer: 'Variable A'
    }
  ]
}

const validResponseData = {
  questionId: 'q1',
  response: 'Variable A',
  timestamp: new Date().toISOString()
}

/**
 * Test CLD validation integration
 */
export function testCLDValidationIntegration() {
  console.log('Testing CLD validation integration...')
  
  // Test valid CLD data
  const validResult = validateCLDFormat(validCLDData)
  console.log('Valid CLD validation:', validResult.isValid ? 'PASS' : 'FAIL')
  if (!validResult.isValid) {
    console.error('Valid CLD validation failed:', validResult.errors)
  }
  
  // Test invalid CLD data
  const invalidResult = validateCLDFormat(invalidCLDData)
  console.log('Invalid CLD validation:', !invalidResult.isValid ? 'PASS' : 'FAIL')
  if (invalidResult.isValid) {
    console.error('Invalid CLD validation should have failed')
  } else {
    console.log('Invalid CLD validation correctly failed with errors:', invalidResult.errors)
  }
  
  return {
    validCLD: validResult.isValid,
    invalidCLD: !invalidResult.isValid
  }
}

/**
 * Test CLDQ validation integration
 */
export function testCLDQValidationIntegration() {
  console.log('Testing CLDQ validation integration...')
  
  // Test valid CLDQ data
  const validResult = validateCLDQFormat(validCLDQData)
  console.log('Valid CLDQ validation:', validResult.isValid ? 'PASS' : 'FAIL')
  if (!validResult.isValid) {
    console.error('Valid CLDQ validation failed:', validResult.errors)
  }
  
  return {
    validCLDQ: validResult.isValid
  }
}

/**
 * Test assignment response validation integration
 */
export function testAssignmentResponseValidationIntegration() {
  console.log('Testing assignment response validation integration...')
  
  // Test valid response data
  const validResult = validateAssignmentResponse(validResponseData, validCLDQData)
  console.log('Valid response validation:', validResult.isValid ? 'PASS' : 'FAIL')
  if (!validResult.isValid) {
    console.error('Valid response validation failed:', validResult.errors)
  }
  
  return {
    validResponse: validResult.isValid
  }
}

/**
 * Test assignment submission validation integration
 */
export function testAssignmentSubmissionValidationIntegration() {
  console.log('Testing assignment submission validation integration...')
  
  // Test valid submission data
  const submissionData = {
    assignmentId: 'test-assignment',
    responses: {
      q1: validResponseData
    },
    submittedAt: new Date().toISOString()
  }
  
  const validResult = validateAssignmentSubmission(submissionData, validCLDQData)
  console.log('Valid submission validation:', validResult.isValid ? 'PASS' : 'FAIL')
  if (!validResult.isValid) {
    console.error('Valid submission validation failed:', validResult.errors)
  }
  
  return {
    validSubmission: validResult.isValid
  }
}

/**
 * Run all integration tests
 */
export function runIntegrationTests() {
  console.log('=== CLD Studio Validation Integration Tests ===\n')
  
  const results = {
    cld: testCLDValidationIntegration(),
    cldq: testCLDQValidationIntegration(),
    response: testAssignmentResponseValidationIntegration(),
    submission: testAssignmentSubmissionValidationIntegration()
  }
  
  console.log('\n=== Integration Test Results ===')
  console.log('CLD Validation:', results.cld.validCLD && results.cld.invalidCLD ? 'PASS' : 'FAIL')
  console.log('CLDQ Validation:', results.cldq.validCLDQ ? 'PASS' : 'FAIL')
  console.log('Response Validation:', results.response.validResponse ? 'PASS' : 'FAIL')
  console.log('Submission Validation:', results.submission.validSubmission ? 'PASS' : 'FAIL')
  
  const allPassed = results.cld.validCLD && results.cld.invalidCLD && 
                   results.cldq.validCLDQ && 
                   results.response.validResponse && 
                   results.submission.validSubmission
  
  console.log('\nOverall Result:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED')
  
  return allPassed
}

// Export test data for use in other tests
export {
  validCLDData,
  invalidCLDData,
  validCLDQData,
  validResponseData
} 
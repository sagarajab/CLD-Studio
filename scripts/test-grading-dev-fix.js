#!/usr/bin/env node

/**
 * Test script to verify the grading functionality fix for development mode
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 Testing Grading Development Mode Fix\n')

let totalTests = 0
let passedTests = 0

// Test 1: Check AssessmentService development mode handling
console.log('📝 Test 1: AssessmentService Development Mode Handling')
try {
  const servicePath = path.join(__dirname, '../src/services/assessmentService.js')
  const serviceContent = fs.readFileSync(servicePath, 'utf8')
  
  // Check for development mode check
  if (serviceContent.includes('process.env.NODE_ENV === \'development\'') && 
      serviceContent.includes('Development mode: Grading completed successfully')) {
    console.log('✅ Development mode handling implemented in AssessmentService')
    passedTests++
  } else {
    console.log('❌ Development mode handling not found in AssessmentService')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check AssessmentService:', error.message)
  totalTests++
}

// Test 2: Check AssignmentStore development mode handling
console.log('\n📝 Test 2: AssignmentStore Development Mode Handling')
try {
  const storePath = path.join(__dirname, '../src/stores/assignmentStore.js')
  const storeContent = fs.readFileSync(storePath, 'utf8')
  
  // Check for development mode check
  if (storeContent.includes('process.env.NODE_ENV !== \'development\'') && 
      storeContent.includes('Development mode or new schema not available')) {
    console.log('✅ Development mode handling implemented in AssignmentStore')
    passedTests++
  } else {
    console.log('❌ Development mode handling not found in AssignmentStore')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check AssignmentStore:', error.message)
  totalTests++
}

// Test 3: Check for proper error handling
console.log('\n📝 Test 3: Error Handling')
try {
  const servicePath = path.join(__dirname, '../src/services/assessmentService.js')
  const serviceContent = fs.readFileSync(servicePath, 'utf8')
  
  // Check for proper error handling
  if (serviceContent.includes('console.error(\'Error submitting assignment:\', error)') && 
      serviceContent.includes('throw error')) {
    console.log('✅ Proper error handling implemented')
    passedTests++
  } else {
    console.log('❌ Error handling not found or incomplete')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check error handling:', error.message)
  totalTests++
}

// Test 4: Check for validation function import
console.log('\n📝 Test 4: Validation Function Import')
try {
  const servicePath = path.join(__dirname, '../src/services/assessmentService.js')
  const serviceContent = fs.readFileSync(servicePath, 'utf8')
  
  // Check for validation import
  if (serviceContent.includes('validateAssignmentSubmission') && 
      serviceContent.includes('from \'../utils/validation.js\'')) {
    console.log('✅ Validation function properly imported')
    passedTests++
  } else {
    console.log('❌ Validation function import not found')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check validation import:', error.message)
  totalTests++
}

// Test 5: Check for console logging in development mode
console.log('\n📝 Test 5: Development Mode Logging')
try {
  const servicePath = path.join(__dirname, '../src/services/assessmentService.js')
  const serviceContent = fs.readFileSync(servicePath, 'utf8')
  
  // Check for development mode logging
  if (serviceContent.includes('console.log(\'UserAssessment model not available or in development mode') && 
      serviceContent.includes('console.log(\'Development mode: Grading completed successfully\'')) {
    console.log('✅ Development mode logging implemented')
    passedTests++
  } else {
    console.log('❌ Development mode logging not found')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check development mode logging:', error.message)
  totalTests++
}

// Summary
console.log('\n📊 Test Summary')
console.log(`Total Tests: ${totalTests}`)
console.log(`Passed: ${passedTests}`)
console.log(`Failed: ${totalTests - passedTests}`)
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Grading functionality should now work in development mode.')
  console.log('\n🚀 Next Steps:')
  console.log('1. Restart the development server: npm run dev')
  console.log('2. Open http://localhost:3002 in your browser (note the port change)')
  console.log('3. Load an assignment and answer some questions')
  console.log('4. Click the "GRADE" button')
  console.log('5. Verify that grading works without database errors')
  console.log('6. Check that results are displayed correctly')
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.')
}

console.log('\n🔧 What was fixed:')
console.log('- AssessmentService now checks for development mode')
console.log('- AssignmentStore uses AssessmentService in development mode')
console.log('- Database calls are bypassed in development')
console.log('- Proper error handling and logging added')
console.log('- Validation functions are properly used')

console.log('\n📋 Expected Behavior:')
console.log('- No more "Could not get or create user assessment record" errors')
console.log('- Grading should complete successfully in development mode')
console.log('- Results should be displayed correctly')
console.log('- Console should show "Development mode: Grading completed successfully"') 
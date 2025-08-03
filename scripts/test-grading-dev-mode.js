#!/usr/bin/env node

/**
 * Test script for grading functionality in development mode
 * This script tests the complete grading workflow
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 Testing Grading Functionality in Development Mode\n')

let totalTests = 0
let passedTests = 0

// Test 1: Check if development server is running
console.log('📝 Test 1: Development Server Status')
try {
  const response = await fetch('http://localhost:5173')
  if (response.ok) {
    console.log('✅ Development server is running on http://localhost:5173')
    passedTests++
  } else {
    console.log('❌ Development server not responding properly')
  }
  totalTests++
} catch (error) {
  console.log('❌ Development server not running. Please start with: npm run dev')
  totalTests++
}

// Test 2: Check AssignmentPanel grading implementation
console.log('\n📝 Test 2: AssignmentPanel Grading Implementation')
try {
  const panelPath = path.join(__dirname, '../src/components/AssignmentPanel.jsx')
  const panelContent = fs.readFileSync(panelPath, 'utf8')
  
  // Check for GRADE button
  if (panelContent.includes('grade-btn-header') && 
      panelContent.includes('handleGrade') && 
      panelContent.includes('GRADE')) {
    console.log('✅ GRADE button found and implemented')
    passedTests++
  } else {
    console.log('❌ GRADE button not found or incomplete')
  }
  totalTests++
  
  // Check for grading state management
  if (panelContent.includes('isGraded') && 
      panelContent.includes('isGrading') && 
      panelContent.includes('setIsGraded')) {
    console.log('✅ Grading state management implemented')
    passedTests++
  } else {
    console.log('❌ Grading state management not found')
  }
  totalTests++
  
  // Check for response locking
  if (panelContent.includes('disabled={isGraded}')) {
    console.log('✅ Response locking implemented')
    passedTests++
  } else {
    console.log('❌ Response locking not found')
  }
  totalTests++
  
  // Check for grading results display
  if (panelContent.includes('grading-results-area') && 
      panelContent.includes('assignmentProgress')) {
    console.log('✅ Grading results display implemented')
    passedTests++
  } else {
    console.log('❌ Grading results display not found')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check AssignmentPanel:', error.message)
  totalTests += 4
}

// Test 3: Check CSS styles for grading
console.log('\n📝 Test 3: CSS Styles for Grading')
try {
  const cssPath = path.join(__dirname, '../src/components/AssignmentPanel.css')
  const cssContent = fs.readFileSync(cssPath, 'utf8')
  
  // Check for grade button styles
  if (cssContent.includes('.grade-btn-header')) {
    console.log('✅ Grade button styles found')
    passedTests++
  } else {
    console.log('❌ Grade button styles not found')
  }
  totalTests++
  
  // Check for grading results styles
  if (cssContent.includes('.grading-results-area')) {
    console.log('✅ Grading results styles found')
    passedTests++
  } else {
    console.log('❌ Grading results styles not found')
  }
  totalTests++
  
  // Check for disabled input styles
  if (cssContent.includes('.text-response:disabled') || 
      cssContent.includes('.number-response:disabled')) {
    console.log('✅ Disabled input styles found')
    passedTests++
  } else {
    console.log('❌ Disabled input styles not found')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check CSS styles:', error.message)
  totalTests += 3
}

// Test 4: Check AssessmentService integration
console.log('\n📝 Test 4: AssessmentService Integration')
try {
  const storePath = path.join(__dirname, '../src/stores/assignmentStore.js')
  const storeContent = fs.readFileSync(storePath, 'utf8')
  
  // Check for AssessmentService usage
  if (storeContent.includes('AssessmentService') && 
      storeContent.includes('submitAssignment')) {
    console.log('✅ AssessmentService integration found')
    passedTests++
  } else {
    console.log('❌ AssessmentService integration not found')
  }
  totalTests++
  
  // Check for assignment progress tracking
  if (storeContent.includes('assignmentProgress')) {
    console.log('✅ Assignment progress tracking found')
    passedTests++
  } else {
    console.log('❌ Assignment progress tracking not found')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check AssessmentService integration:', error.message)
  totalTests += 2
}

// Test 5: Check sample assignment files
console.log('\n📝 Test 5: Sample Assignment Files')
try {
  const assignmentsDir = path.join(__dirname, '../public/assignments')
  const files = fs.readdirSync(assignmentsDir)
  const cldqFiles = files.filter(file => file.endsWith('.cldq'))
  
  if (cldqFiles.length > 0) {
    console.log(`✅ Found ${cldqFiles.length} assignment files: ${cldqFiles.join(', ')}`)
    passedTests++
  } else {
    console.log('❌ No assignment files found')
  }
  totalTests++
  
  // Check if sample assignment has grading data
  const samplePath = path.join(assignmentsDir, 'sample-assignment.cldq')
  if (fs.existsSync(samplePath)) {
    const sampleContent = fs.readFileSync(samplePath, 'utf8')
    const sampleData = JSON.parse(sampleContent)
    
    if (sampleData.questions && sampleData.questions.length > 0) {
      const hasCorrectAnswers = sampleData.questions.some(q => q.correctAnswer)
      if (hasCorrectAnswers) {
        console.log('✅ Sample assignment has correct answers for grading')
        passedTests++
      } else {
        console.log('❌ Sample assignment missing correct answers')
      }
    } else {
      console.log('❌ Sample assignment has no questions')
    }
  } else {
    console.log('❌ Sample assignment file not found')
  }
  totalTests++
  
} catch (error) {
  console.log('❌ Failed to check assignment files:', error.message)
  totalTests += 2
}

// Summary
console.log('\n📊 Test Summary')
console.log(`Total Tests: ${totalTests}`)
console.log(`Passed: ${passedTests}`)
console.log(`Failed: ${totalTests - passedTests}`)
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Grading functionality is ready for development testing.')
  console.log('\n🚀 Next Steps:')
  console.log('1. Open http://localhost:5173 in your browser')
  console.log('2. Click on the assignment button (📚) in the header')
  console.log('3. Select "Sample Assignment" or any other assignment')
  console.log('4. Answer some questions')
  console.log('5. Click the "GRADE" button to test grading functionality')
  console.log('6. Verify that responses are locked after grading')
  console.log('7. Check that grading results are displayed correctly')
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation before testing.')
}

console.log('\n📋 Manual Testing Checklist:')
console.log('□ Load an assignment')
console.log('□ Answer text questions')
console.log('□ Answer number questions')
console.log('□ Answer MCQ questions')
console.log('□ Create/edit diagram questions')
console.log('□ Click GRADE button')
console.log('□ Verify responses are locked')
console.log('□ Check grading results display')
console.log('□ Verify score calculation')
console.log('□ Test navigation after grading') 
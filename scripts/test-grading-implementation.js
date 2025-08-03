import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 Testing Grading Implementation\n')

let totalTests = 0
let passedTests = 0

// Test 1: Check for GRADE button implementation
console.log('📝 Test 1: GRADE Button Implementation')
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
} catch (error) {
  console.log('❌ Failed to check GRADE button:', error.message)
  totalTests++
}

// Test 2: Check for response locking functionality
console.log('\n📝 Test 2: Response Locking Implementation')
try {
  const panelPath = path.join(__dirname, '../src/components/AssignmentPanel.jsx')
  const panelContent = fs.readFileSync(panelPath, 'utf8')
  
  // Check for disabled states on inputs
  if (panelContent.includes('disabled={isGraded}') && 
      panelContent.includes('isGraded') && 
      panelContent.includes('setIsGraded')) {
    console.log('✅ Response locking implemented with disabled states')
    passedTests++
  } else {
    console.log('❌ Response locking not found or incomplete')
  }
  totalTests++
} catch (error) {
  console.log('❌ Failed to check response locking:', error.message)
  totalTests++
}

// Test 3: Check for grading results display
console.log('\n📝 Test 3: Grading Results Display')
try {
  const panelPath = path.join(__dirname, '../src/components/AssignmentPanel.jsx')
  const panelContent = fs.readFileSync(panelPath, 'utf8')
  
  // Check for grading results display
  if (panelContent.includes('grading-results-area') && 
      panelContent.includes('assignmentProgress') && 
      panelContent.includes('Total Score:')) {
    console.log('✅ Grading results display implemented')
    passedTests++
  } else {
    console.log('❌ Grading results display not found or incomplete')
  }
  totalTests++
} catch (error) {
  console.log('❌ Failed to check grading results display:', error.message)
  totalTests++
}

// Test 4: Check for CSS styles
console.log('\n📝 Test 4: CSS Styles for Grading')
try {
  const cssPath = path.join(__dirname, '../src/components/AssignmentPanel.css')
  const cssContent = fs.readFileSync(cssPath, 'utf8')
  
  // Check for grade button styles
  if (cssContent.includes('.grade-btn-header') && 
      cssContent.includes('.grading-results-area') && 
      cssContent.includes('.text-response:disabled')) {
    console.log('✅ CSS styles for grading implemented')
    passedTests++
  } else {
    console.log('❌ CSS styles for grading not found or incomplete')
  }
  totalTests++
} catch (error) {
  console.log('❌ Failed to check CSS styles:', error.message)
  totalTests++
}

// Test 5: Check for integration with AssessmentService
console.log('\n📝 Test 5: AssessmentService Integration')
try {
  const storePath = path.join(__dirname, '../src/stores/assignmentStore.js')
  const storeContent = fs.readFileSync(storePath, 'utf8')
  
  // Check for AssessmentService usage
  if (storeContent.includes('AssessmentService') && 
      storeContent.includes('submitAssignment') && 
      storeContent.includes('assignmentProgress')) {
    console.log('✅ AssessmentService integration found')
    passedTests++
  } else {
    console.log('❌ AssessmentService integration not found or incomplete')
  }
  totalTests++
} catch (error) {
  console.log('❌ Failed to check AssessmentService integration:', error.message)
  totalTests++
}

// Summary
console.log('\n📊 Test Summary')
console.log(`Total Tests: ${totalTests}`)
console.log(`Passed: ${passedTests}`)
console.log(`Failed: ${totalTests - passedTests}`)
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! Grading functionality is properly implemented.')
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.')
} 
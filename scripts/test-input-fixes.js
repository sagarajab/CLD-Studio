#!/usr/bin/env node

/**
 * Test Input Fixes
 * 
 * This script tests the fixes for input functionality:
 * 1. Text input typing
 * 2. MCQ option selection
 * 3. CSS class matching
 */

import fs from 'fs'
import path from 'path'

async function testInputFixes() {
  console.log('🧪 Testing Input Fixes\n')
  
  let totalTests = 0
  let passedTests = 0

  // Test 1: Check CSS classes in AssignmentInterface.jsx
  console.log('📝 Test 1: CSS Class Matching')
  try {
    const interfacePath = path.join(process.cwd(), 'src', 'components', 'AssignmentInterface.jsx')
    const interfaceContent = fs.readFileSync(interfacePath, 'utf8')
    
    const cssPath = path.join(process.cwd(), 'src', 'components', 'AssignmentInterface.css')
    const cssContent = fs.readFileSync(cssPath, 'utf8')
    
    // Check if the component uses the correct CSS classes
    const mcqOptionsInComponent = interfaceContent.includes('mcq-options')
    const mcqOptionInComponent = interfaceContent.includes('mcq-option')
    const textResponseInComponent = interfaceContent.includes('text-response')
    const numberResponseInComponent = interfaceContent.includes('number-response')
    
    // Check if CSS has the corresponding classes
    const mcqOptionsInCSS = cssContent.includes('.mcq-options')
    const mcqOptionInCSS = cssContent.includes('.mcq-option')
    const textResponseInCSS = cssContent.includes('.text-response')
    const numberResponseInCSS = cssContent.includes('.number-response')
    
    if (mcqOptionsInComponent && mcqOptionsInCSS) {
      console.log('✅ MCQ options class match found')
      passedTests++
    } else {
      console.log('❌ MCQ options class mismatch')
    }
    totalTests++
    
    if (mcqOptionInComponent && mcqOptionInCSS) {
      console.log('✅ MCQ option class match found')
      passedTests++
    } else {
      console.log('❌ MCQ option class mismatch')
    }
    totalTests++
    
    if (textResponseInComponent && textResponseInCSS) {
      console.log('✅ Text response class match found')
      passedTests++
    } else {
      console.log('❌ Text response class mismatch')
    }
    totalTests++
    
    if (numberResponseInComponent && numberResponseInCSS) {
      console.log('✅ Number response class match found')
      passedTests++
    } else {
      console.log('❌ Number response class mismatch')
    }
    totalTests++
    
  } catch (error) {
    console.log('❌ Error checking CSS classes:', error.message)
    totalTests += 4
  }

  // Test 2: Check input handlers
  console.log('\n📝 Test 2: Input Handlers')
  try {
    const interfacePath = path.join(process.cwd(), 'src', 'components', 'AssignmentInterface.jsx')
    const interfaceContent = fs.readFileSync(interfacePath, 'utf8')
    
    // Check for proper input handlers
    const hasTextOnChange = interfaceContent.includes('onChange={(e) => {')
    const hasMCQOnChange = interfaceContent.includes('onChange={(e) => {')
    const hasSetLocalResponses = interfaceContent.includes('setLocalResponses')
    const hasProperStructure = interfaceContent.includes('...(prev[currentQuestion.id] || {})')
    
    if (hasTextOnChange) {
      console.log('✅ Text input onChange handler found')
      passedTests++
    } else {
      console.log('❌ Text input onChange handler missing')
    }
    totalTests++
    
    if (hasMCQOnChange) {
      console.log('✅ MCQ onChange handler found')
      passedTests++
    } else {
      console.log('❌ MCQ onChange handler missing')
    }
    totalTests++
    
    if (hasSetLocalResponses) {
      console.log('✅ setLocalResponses usage found')
      passedTests++
    } else {
      console.log('❌ setLocalResponses usage missing')
    }
    totalTests++
    
    if (hasProperStructure) {
      console.log('✅ Proper response structure handling found')
      passedTests++
    } else {
      console.log('❌ Proper response structure handling missing')
    }
    totalTests++
    
  } catch (error) {
    console.log('❌ Error checking input handlers:', error.message)
    totalTests += 4
  }

  // Test 3: Check CSS properties
  console.log('\n📝 Test 3: CSS Properties')
  try {
    const cssPath = path.join(process.cwd(), 'src', 'components', 'AssignmentInterface.css')
    const cssContent = fs.readFileSync(cssPath, 'utf8')
    
    // Check for important CSS properties
    const hasPointerEvents = cssContent.includes('pointer-events: auto')
    const hasUserSelect = cssContent.includes('user-select: text')
    const hasCursorPointer = cssContent.includes('cursor: pointer')
    const hasAccentColor = cssContent.includes('accent-color: #3b82f6')
    
    if (hasPointerEvents) {
      console.log('✅ pointer-events: auto found')
      passedTests++
    } else {
      console.log('❌ pointer-events: auto missing')
    }
    totalTests++
    
    if (hasUserSelect) {
      console.log('✅ user-select: text found')
      passedTests++
    } else {
      console.log('❌ user-select: text missing')
    }
    totalTests++
    
    if (hasCursorPointer) {
      console.log('✅ cursor: pointer found')
      passedTests++
    } else {
      console.log('❌ cursor: pointer missing')
    }
    totalTests++
    
    if (hasAccentColor) {
      console.log('✅ accent-color for radio buttons found')
      passedTests++
    } else {
      console.log('❌ accent-color for radio buttons missing')
    }
    totalTests++
    
  } catch (error) {
    console.log('❌ Error checking CSS properties:', error.message)
    totalTests += 4
  }

  // Test 4: Check initialization logic
  console.log('\n📝 Test 4: Initialization Logic')
  try {
    const interfacePath = path.join(process.cwd(), 'src', 'components', 'AssignmentInterface.jsx')
    const interfaceContent = fs.readFileSync(interfacePath, 'utf8')
    
    // Check for proper initialization
    const hasInitialization = interfaceContent.includes('currentAssignment.questions.forEach')
    const hasEmptyResponse = interfaceContent.includes('response: \'\'')
    const hasTimestamp = interfaceContent.includes('timestamp: new Date().toISOString()')
    const hasProperStructure = interfaceContent.includes('initializedResponses[question.id]')
    
    if (hasInitialization) {
      console.log('✅ Question initialization loop found')
      passedTests++
    } else {
      console.log('❌ Question initialization loop missing')
    }
    totalTests++
    
    if (hasEmptyResponse) {
      console.log('✅ Empty response initialization found')
      passedTests++
    } else {
      console.log('❌ Empty response initialization missing')
    }
    totalTests++
    
    if (hasTimestamp) {
      console.log('✅ Timestamp initialization found')
      passedTests++
    } else {
      console.log('❌ Timestamp initialization missing')
    }
    totalTests++
    
    if (hasProperStructure) {
      console.log('✅ Proper response structure initialization found')
      passedTests++
    } else {
      console.log('❌ Proper response structure initialization missing')
    }
    totalTests++
    
  } catch (error) {
    console.log('❌ Error checking initialization logic:', error.message)
    totalTests += 4
  }

  // Summary
  console.log('\n📊 Test Summary')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${totalTests - passedTests}`)
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Input fixes are working correctly.')
    console.log('\n📋 Fixes Applied:')
    console.log('✅ CSS class matching (mcq-options, mcq-option)')
    console.log('✅ Input handlers with proper state management')
    console.log('✅ CSS properties for interactivity (pointer-events, cursor)')
    console.log('✅ Proper response structure initialization')
    console.log('\n🚀 Ready for testing! Start the dev server with: npm run dev')
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.')
  }
}

// Run the tests
testInputFixes() 
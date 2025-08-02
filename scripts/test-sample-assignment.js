#!/usr/bin/env node

/**
 * Test Sample Assignment Validation
 * 
 * This script tests the validation of the sample assignment file
 * to verify that the validation fixes work correctly.
 */

import { validateCLDQFormat } from '../src/utils/validation.js'
import fs from 'fs'
import path from 'path'

async function testSampleAssignment() {
  console.log('🧪 Testing Sample Assignment Validation\n')
  
  try {
    // Read the sample assignment file
    const sampleAssignmentPath = path.join(process.cwd(), 'public', 'assignments', 'sample-assignment.cldq')
    const sampleAssignmentData = fs.readFileSync(sampleAssignmentPath, 'utf8')
    const sampleAssignment = JSON.parse(sampleAssignmentData)
    
    console.log('📝 Test 1: Loading Sample Assignment')
    console.log('✅ Sample assignment loaded successfully')
    console.log(`   Title: ${sampleAssignment.title}`)
    console.log(`   Questions: ${sampleAssignment.questions.length}`)
    
    // Test validation
    console.log('\n📝 Test 2: Validating Sample Assignment')
    const validationResult = validateCLDQFormat(sampleAssignment)
    
    if (validationResult.isValid) {
      console.log('✅ Sample assignment validation passed')
    } else {
      console.log('❌ Sample assignment validation failed')
      console.log('   Errors:')
      validationResult.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }
    
    // Test individual questions
    console.log('\n📝 Test 3: Question Type Analysis')
    sampleAssignment.questions.forEach((question, index) => {
      console.log(`   Question ${index + 1}: ${question.questionType}`)
      if (question.questionType === 'diagram' && question.correctAnswer) {
        console.log(`     - Has diagram answer: ${typeof question.correctAnswer}`)
        if (typeof question.correctAnswer === 'object') {
          console.log(`     - Nodes: ${question.correctAnswer.nodes?.length || 0}`)
          console.log(`     - Edges: ${question.correctAnswer.edges?.length || 0}`)
        }
      }
    })
    
    // Summary
    console.log('\n📊 Validation Summary')
    console.log(`Valid: ${validationResult.isValid}`)
    console.log(`Errors: ${validationResult.errors.length}`)
    console.log(`Warnings: ${validationResult.warnings.length}`)
    
    if (validationResult.isValid) {
      console.log('\n🎉 Sample assignment is valid and ready for testing!')
    } else {
      console.log('\n⚠️ Sample assignment has validation issues that need to be fixed.')
    }
    
  } catch (error) {
    console.error('❌ Error testing sample assignment:', error.message)
  }
}

// Run the test
testSampleAssignment() 
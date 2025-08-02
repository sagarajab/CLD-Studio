#!/usr/bin/env node

/**
 * Assignment Evaluation Test Script
 * 
 * This script provides immediate testing capabilities for the assignment evaluation functionality.
 * Run with: node scripts/test-assignment-evaluation.js
 */

import { AssessmentService } from '../src/services/assessmentService.js'
import { validateAssignmentSubmission } from '../src/utils/validation.js'

// Test data
const sampleAssignment = {
  id: 'test-assignment-001',
  title: 'Feedback Loop Analysis Test',
  description: 'Test assignment for evaluation functionality',
  timeLimit: 1800,
  maxScore: 100,
  deadline: '2024-12-31T23:59:59Z',
  questions: [
    {
      id: 'q1',
      questionType: 'text',
      question: 'What is a feedback loop? Explain in your own words.',
      maxScore: 15,
      correctAnswer: 'A feedback loop is a system where the output of a process influences the input, creating a circular cause-and-effect relationship that can either amplify or dampen changes in the system.',
      keywords: ['feedback', 'loop', 'output', 'input', 'circular', 'cause', 'effect', 'amplify', 'dampen', 'system']
    },
    {
      id: 'q2',
      questionType: 'number',
      question: 'How many nodes are in your diagram?',
      maxScore: 5,
      correctAnswer: '3',
      tolerance: 1
    },
    {
      id: 'q3',
      questionType: 'mcq',
      question: 'What type of feedback loop did you create?',
      options: ['Positive feedback', 'Negative feedback', 'Both', 'Neither'],
      maxScore: 10,
      correctAnswer: 'Both'
    },
    {
      id: 'q4',
      questionType: 'diagram',
      question: 'Create a causal loop diagram showing a simple feedback loop with at least 3 nodes.',
      maxScore: 30,
      evaluationCriteria: {
        minNodes: 3,
        minEdges: 2,
        requireLoops: true,
        requirePolarity: true
      }
    },
    {
      id: 'q5',
      questionType: 'text',
      question: 'Explain how your diagram demonstrates a feedback loop.',
      maxScore: 20,
      correctAnswer: 'The diagram shows how variables influence each other in a circular pattern, where changes in one variable affect another, which in turn affects the first variable, creating a continuous cycle.',
      keywords: ['variables', 'influence', 'circular', 'pattern', 'cycle', 'continuous']
    }
  ]
}

// Test user responses
const testResponses = {
  q1: { response: 'A feedback loop is a system where the output influences the input, creating a circular relationship that can amplify or dampen changes.', timestamp: new Date().toISOString() },
  q2: { response: '3', timestamp: new Date().toISOString() },
  q3: { response: 'Both', timestamp: new Date().toISOString() },
  q4: { response: JSON.stringify({
    nodes: [
      { id: 'node1', label: 'Population', x: 100, y: 100 },
      { id: 'node2', label: 'Birth Rate', x: 200, y: 100 },
      { id: 'node3', label: 'Resources', x: 150, y: 200 }
    ],
    edges: [
      { source: 'node1', target: 'node2', polarity: 'positive' },
      { source: 'node2', target: 'node1', polarity: 'positive' },
      { source: 'node1', target: 'node3', polarity: 'negative' },
      { source: 'node3', target: 'node2', polarity: 'negative' }
    ]
  }), timestamp: new Date().toISOString() },
  q5: { response: 'The diagram shows how population and birth rate create a reinforcing loop, while resources create a balancing loop that limits growth.', timestamp: new Date().toISOString() }
}

// Test scenarios
const testScenarios = [
  {
    name: 'Perfect Answers',
    responses: testResponses,
    expectedScore: 80 // Should get high score
  },
  {
    name: 'Partial Answers',
    responses: {
      q1: { response: 'feedback loop system', timestamp: new Date().toISOString() },
      q2: { response: '4', timestamp: new Date().toISOString() }, // Within tolerance
      q3: { response: 'Positive feedback', timestamp: new Date().toISOString() }, // Wrong but partial
      q4: { response: JSON.stringify({
        nodes: [
          { id: 'node1', label: 'Variable A', x: 100, y: 100 },
          { id: 'node2', label: 'Variable B', x: 200, y: 100 }
        ],
        edges: [
          { source: 'node1', target: 'node2', polarity: 'positive' }
        ]
      }), timestamp: new Date().toISOString() },
      q5: { response: 'variables influence each other', timestamp: new Date().toISOString() }
    },
    expectedScore: 40 // Should get partial score
  },
  {
    name: 'Wrong Answers',
    responses: {
      q1: { response: 'completely wrong answer', timestamp: new Date().toISOString() },
      q2: { response: '10', timestamp: new Date().toISOString() }, // Way off
      q3: { response: 'Neither', timestamp: new Date().toISOString() },
      q4: { response: JSON.stringify({
        nodes: [{ id: 'node1', label: 'Single Node', x: 100, y: 100 }],
        edges: []
      }), timestamp: new Date().toISOString() },
      q5: { response: 'wrong explanation', timestamp: new Date().toISOString() }
    },
    expectedScore: 0 // Should get low score
  },
  {
    name: 'Missing Answers',
    responses: {
      q1: { response: 'A feedback loop is a system where the output influences the input.', timestamp: new Date().toISOString() },
      // q2 missing
      q3: { response: 'Both', timestamp: new Date().toISOString() },
      // q4 missing
      q5: { response: 'The diagram shows feedback loops.', timestamp: new Date().toISOString() }
    },
    expectedScore: 25 // Should get partial score for answered questions
  }
]

/**
 * Run evaluation tests
 */
async function runEvaluationTests() {
  console.log('🧪 Starting Assignment Evaluation Tests\n')
  
  let totalTests = 0
  let passedTests = 0

  // Test 1: Basic evaluation functionality
  console.log('📝 Test 1: Basic Evaluation Functionality')
  try {
    const result = AssessmentService.evaluateResponses(testResponses, sampleAssignment)
    
    if (result && result.totalScore !== undefined && result.maxTotalScore !== undefined) {
      console.log('✅ Basic evaluation working')
      console.log(`   Score: ${result.totalScore}/${result.maxTotalScore}`)
      passedTests++
    } else {
      console.log('❌ Basic evaluation failed')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Basic evaluation error:', error.message)
    totalTests++
  }

  // Test 2: Individual question evaluation
  console.log('\n📝 Test 2: Individual Question Evaluation')
  try {
    const textQuestion = sampleAssignment.questions[0]
    const textResult = AssessmentService.evaluateQuestion(textQuestion, testResponses.q1.response)
    
    if (textResult && textResult.score !== undefined) {
      console.log('✅ Text question evaluation working')
      console.log(`   Score: ${textResult.score}/${textQuestion.maxScore}`)
      passedTests++
    } else {
      console.log('❌ Text question evaluation failed')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Text question evaluation error:', error.message)
    totalTests++
  }

  // Test 3: Validation functionality
  console.log('\n📝 Test 3: Validation Functionality')
  try {
    const submissionData = {
      assignmentId: sampleAssignment.id,
      userId: 'test-user',
      timestamp: new Date().toISOString(),
      responses: testResponses,
      totalScore: 0,
      maxTotalScore: 100,
      assignmentStatus: 'submitted'
    }
    
    const validationResult = validateAssignmentSubmission(submissionData, sampleAssignment)
    
    if (validationResult && validationResult.isValid !== undefined) {
      console.log('✅ Validation working')
      console.log(`   Valid: ${validationResult.isValid}`)
      if (!validationResult.isValid) {
        console.log('   Errors:', validationResult.errors.slice(0, 3)) // Show first 3 errors
      }
      passedTests++
    } else {
      console.log('❌ Validation failed')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Validation error:', error.message)
    totalTests++
  }

  // Test 4: Test scenarios
  console.log('\n📝 Test 4: Test Scenarios')
  for (const scenario of testScenarios) {
    try {
      // Convert response objects to simple responses for evaluation
      const simpleResponses = {}
      Object.keys(scenario.responses).forEach(key => {
        simpleResponses[key] = scenario.responses[key].response
      })
      
      const result = AssessmentService.evaluateResponses(simpleResponses, sampleAssignment)
      const scorePercentage = Math.round((result.totalScore / result.maxTotalScore) * 100)
      
      console.log(`\n   Scenario: ${scenario.name}`)
      console.log(`   Expected: ~${scenario.expectedScore}%`)
      console.log(`   Actual: ${scorePercentage}% (${result.totalScore}/${result.maxTotalScore})`)
      
      // Check if score is reasonable (within 20% of expected)
      const scoreDiff = Math.abs(scorePercentage - scenario.expectedScore)
      if (scoreDiff <= 20) {
        console.log('   ✅ Score within expected range')
        passedTests++
      } else {
        console.log('   ⚠️ Score outside expected range')
      }
      totalTests++
    } catch (error) {
      console.log(`   ❌ Scenario "${scenario.name}" failed:`, error.message)
      totalTests++
    }
  }

  // Test 5: Edge cases
  console.log('\n📝 Test 5: Edge Cases')
  
  // Empty responses
  try {
    const emptyResult = AssessmentService.evaluateResponses({}, sampleAssignment)
    if (emptyResult && emptyResult.totalScore === 0) {
      console.log('✅ Empty responses handled correctly')
      passedTests++
    } else {
      console.log('❌ Empty responses not handled correctly')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Empty responses error:', error.message)
    totalTests++
  }

  // Invalid diagram data
  try {
    const invalidDiagramResponses = {
      q4: 'invalid json string'
    }
    const invalidResult = AssessmentService.evaluateResponses(invalidDiagramResponses, sampleAssignment)
    if (invalidResult) {
      console.log('✅ Invalid diagram data handled gracefully')
      passedTests++
    } else {
      console.log('❌ Invalid diagram data not handled')
    }
    totalTests++
  } catch (error) {
    console.log('❌ Invalid diagram data error:', error.message)
    totalTests++
  }

  // Summary
  console.log('\n📊 Test Summary')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${totalTests - passedTests}`)
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Assignment evaluation is working correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.')
  }
}

/**
 * Interactive testing mode
 */
async function interactiveTest() {
  console.log('\n🎮 Interactive Testing Mode')
  console.log('You can test specific evaluation scenarios here.')
  
  // Example: Test a specific question
  console.log('\nExample: Testing text question evaluation')
  const question = sampleAssignment.questions[0]
  const testAnswer = 'A feedback loop is a system where output influences input'
  
  try {
    const result = AssessmentService.evaluateQuestion(question, testAnswer)
    console.log('Question:', question.question)
    console.log('Your answer:', testAnswer)
    console.log('Score:', result.score, '/', question.maxScore)
    console.log('Correct:', result.isCorrect)
    console.log('Feedback:', result.feedback)
  } catch (error) {
    console.log('Error:', error.message)
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--interactive') || args.includes('-i')) {
    await interactiveTest()
  } else {
    await runEvaluationTests()
  }
}

// Run the tests
main().catch(console.error) 
/**
 * Test file demonstrating the validation utilities
 * This file shows how to use the validation functions with example data
 */

import {
  validateCLDFormat,
  validateCLDQFormat,
  validateAssignmentResponse,
  validateAssignmentSubmission,
  validateFileFormat,
  sanitizeCLDData,
  getValidationSummary
} from './validation.js'

// Example CLD data for testing
const validCLDData = {
  version: "2.0",
  diagramName: "Test Diagram",
  description: "A test diagram",
  category: "Test",
  nodes: [
    {
      id: "node1",
      label: "Population",
      type: "variable",
      position: { x: 200, y: 150 },
      color: "#3B82F6",
      size: 60
    },
    {
      id: "node2",
      label: "Birth Rate",
      type: "variable",
      position: { x: 400, y: 150 },
      color: "#10B981",
      size: 60
    }
  ],
  edges: [
    {
      id: "edge1",
      source: "node1",
      target: "node2",
      polarity: "positive",
      type: "causal",
      label: "More population leads to more births"
    },
    {
      id: "edge2",
      source: "node2",
      target: "node1",
      polarity: "positive",
      type: "causal",
      label: "More births increase population"
    }
  ],
  viewTransform: { x: 0, y: 0, scale: 1 },
  showGrid: true,
  globalStyles: {
    nodeColor: "#3B82F6",
    edgeColor: "#6B7280",
    backgroundColor: "#FFFFFF"
  },
  problemStatement: {
    mode: "sandbox",
    currentProblem: null,
    customStatement: "Test statement"
  },
  analysis: {
    adjacencyMatrix: [],
    allLoops: []
  },
  simulation: {
    isInitialized: false,
    timeStep: 1,
    duration: 100
  }
}

// Invalid CLD data for testing
const invalidCLDData = {
  version: "2.0",
  // Missing diagramName
  nodes: [
    {
      id: "node1",
      // Missing label
      position: { x: "invalid", y: 150 }, // Invalid x coordinate type
      type: "invalid_type" // Invalid node type
    }
  ],
  edges: [
    {
      id: "edge1",
      source: "nonexistent_node", // References non-existent node
      target: "node1",
      polarity: "invalid_polarity" // Invalid polarity
    }
  ]
}

// Example CLDQ data for testing
const validCLDQData = {
  id: "assignment-001",
  title: "Test Assignment",
  description: "A test assignment",
  timeLimit: 3300,
  maxScore: 85,
  deadline: "2024-12-31T23:59:59Z",
  questions: [
    {
      id: "q1",
      questionType: "text",
      question: "What is a feedback loop?",
      maxScore: 10,
      timeLimit: 300,
      correctAnswer: "A feedback loop is a system where output influences input.",
      keywords: ["feedback", "loop", "system"]
    },
    {
      id: "q2",
      questionType: "mcq",
      question: "What type of feedback loop is this?",
      maxScore: 5,
      timeLimit: 120,
      options: ["Positive", "Negative", "Both", "Neither"],
      correctAnswer: "Positive"
    },
    {
      id: "q3",
      questionType: "diagram",
      question: "Create a simple feedback loop",
      maxScore: 25,
      timeLimit: 1200,
      correctAnswer: JSON.stringify(validCLDData),
      evaluationCriteria: {
        minNodes: 2,
        minEdges: 1,
        requireLoops: true,
        requirePolarity: true
      }
    }
  ]
}

// Example assignment response data
const validResponseData = {
  questionId: "q1",
  response: "A feedback loop is a system where the output influences the input.",
  timestamp: "2024-01-01T12:00:00Z",
  attempts: 1
}

// Example assignment submission data
const validSubmissionData = {
  assignmentId: "assignment-001",
  userId: "user123",
  timestamp: "2024-01-01T12:00:00Z",
  responses: {
    q1: validResponseData,
    q2: {
      questionId: "q2",
      response: "Positive",
      timestamp: "2024-01-01T12:05:00Z",
      attempts: 1
    }
  },
  totalScore: 15,
  maxTotalScore: 40,
  assignmentStatus: "submitted"
}

/**
 * Run validation tests
 */
export function runValidationTests() {
  console.log("=== CLD Validation Tests ===\n")

  // Test valid CLD data
  console.log("Testing valid CLD data:")
  const validCLDResult = validateCLDFormat(validCLDData)
  console.log(getValidationSummary(validCLDResult))

  // Test invalid CLD data
  console.log("\nTesting invalid CLD data:")
  const invalidCLDResult = validateCLDFormat(invalidCLDData)
  console.log(getValidationSummary(invalidCLDResult))

  console.log("\n=== CLDQ Validation Tests ===\n")

  // Test valid CLDQ data
  console.log("Testing valid CLDQ data:")
  const validCLDQResult = validateCLDQFormat(validCLDQData)
  console.log(getValidationSummary(validCLDQResult))

  console.log("\n=== Assignment Response Validation Tests ===\n")

  // Test valid response data
  console.log("Testing valid response data:")
  const validResponseResult = validateAssignmentResponse(validResponseData, validCLDQData)
  console.log(getValidationSummary(validResponseResult))

  console.log("\n=== Assignment Submission Validation Tests ===\n")

  // Test valid submission data
  console.log("Testing valid submission data:")
  const validSubmissionResult = validateAssignmentSubmission(validSubmissionData, validCLDQData)
  console.log(getValidationSummary(validSubmissionResult))

  console.log("\n=== File Format Validation Tests ===\n")

  // Test file format validation
  console.log("Testing .cld file format:")
  const cldFileResult = validateFileFormat(validCLDData, '.cld')
  console.log(getValidationSummary(cldFileResult))

  console.log("\nTesting .cldq file format:")
  const cldqFileResult = validateFileFormat(validCLDQData, '.cldq')
  console.log(getValidationSummary(cldqFileResult))

  console.log("\n=== CLD Sanitization Test ===\n")

  // Test CLD sanitization
  try {
    const sanitizedCLD = sanitizeCLDData(validCLDData)
    console.log("CLD sanitization successful:")
    console.log("Sanitized diagram name:", sanitizedCLD.diagramName)
    console.log("Number of nodes:", sanitizedCLD.nodes.length)
    console.log("Number of edges:", sanitizedCLD.edges.length)
  } catch (error) {
    console.log("CLD sanitization failed:", error.message)
  }
}

/**
 * Validate a file from URL or file input
 * @param {File|string} file - File object or URL string
 * @param {string} fileExtension - File extension (.cld, .cldq, etc.)
 * @returns {Promise<ValidationResult>}
 */
export async function validateFile(file, fileExtension) {
  try {
    let data

    if (typeof file === 'string') {
      // File is a URL
      const response = await fetch(file)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }
      data = await response.json()
    } else {
      // File is a File object
      const text = await file.text()
      data = JSON.parse(text)
    }

    return validateFileFormat(data, fileExtension)
  } catch (error) {
    return {
      isValid: false,
      errors: [`Failed to parse file: ${error.message}`],
      warnings: []
    }
  }
}

/**
 * Validate assignment response before submission
 * @param {Object} responses - Object containing question responses
 * @param {Object} assignment - Assignment data
 * @returns {ValidationResult}
 */
export function validateAssignmentResponses(responses, assignment) {
  const errors = []
  const warnings = []

  if (!assignment || !assignment.questions) {
    return { isValid: false, errors: ['Invalid assignment data'], warnings: [] }
  }

  // Validate each response
  for (const [questionId, response] of Object.entries(responses)) {
    const question = assignment.questions.find(q => q.id === questionId)
    if (!question) {
      errors.push(`Question ID '${questionId}' not found in assignment`)
      continue
    }

    const responseValidation = validateAssignmentResponse(response, assignment)
    if (!responseValidation.isValid) {
      errors.push(`Response for question ${questionId}:`)
      errors.push(...responseValidation.errors.map(e => `  ${e}`))
    }
    warnings.push(...responseValidation.warnings.map(w => `Question ${questionId}: ${w}`))
  }

  // Check for missing required questions
  const answeredQuestions = new Set(Object.keys(responses))
  for (const question of assignment.questions) {
    if (!answeredQuestions.has(question.id)) {
      warnings.push(`Question '${question.id}' not answered`)
    }
  }

  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * Get validation statistics
 * @param {ValidationResult} result - Validation result
 * @returns {Object} Statistics object
 */
export function getValidationStats(result) {
  return {
    isValid: result.isValid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    totalIssues: result.errors.length + result.warnings.length
  }
}

// Export test data for external use
export {
  validCLDData,
  invalidCLDData,
  validCLDQData,
  validResponseData,
  validSubmissionData
} 
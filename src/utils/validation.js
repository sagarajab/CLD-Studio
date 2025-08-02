/**
 * Validation utilities for CLD Studio file formats
 * Provides comprehensive validation for .cld, .cldq, assignment, and response JSON files
 */

import { NODE_TYPES, EDGE_POLARITIES, LOOP_TYPES, MODES } from '../types/index.js'

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the data is valid
 * @property {Array<string>} errors - Array of error messages
 * @property {Array<string>} warnings - Array of warning messages
 */

/**
 * Create a validation result object
 * @param {boolean} isValid - Whether validation passed
 * @param {Array<string>} errors - Error messages
 * @param {Array<string>} warnings - Warning messages
 * @returns {ValidationResult}
 */
function createValidationResult(isValid, errors = [], warnings = []) {
  return { isValid, errors, warnings }
}

/**
 * Validate required fields in an object
 * @param {Object} obj - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @param {string} context - Context for error messages
 * @returns {Array<string>} Array of error messages
 */
function validateRequiredFields(obj, requiredFields, context) {
  const errors = []
  for (const field of requiredFields) {
    if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
      errors.push(`${context}: Missing required field '${field}'`)
    }
  }
  return errors
}

/**
 * Validate field types
 * @param {Object} obj - Object to validate
 * @param {Object} typeSchema - Schema defining expected types
 * @param {string} context - Context for error messages
 * @returns {Array<string>} Array of error messages
 */
function validateFieldTypes(obj, typeSchema, context) {
  const errors = []
  for (const [field, expectedType] of Object.entries(typeSchema)) {
    if (obj[field] !== undefined && obj[field] !== null) {
      const actualType = Array.isArray(obj[field]) ? 'array' : typeof obj[field]
      if (actualType !== expectedType) {
        errors.push(`${context}: Field '${field}' should be ${expectedType}, got ${actualType}`)
      }
    }
  }
  return errors
}

/**
 * Validate enum values
 * @param {Object} obj - Object to validate
 * @param {Object} enumSchema - Schema defining valid enum values
 * @param {string} context - Context for error messages
 * @returns {Array<string>} Array of error messages
 */
function validateEnumValues(obj, enumSchema, context) {
  const errors = []
  for (const [field, validValues] of Object.entries(enumSchema)) {
    if (obj[field] !== undefined && obj[field] !== null) {
      if (!validValues.includes(obj[field])) {
        errors.push(`${context}: Field '${field}' has invalid value '${obj[field]}'. Valid values: ${validValues.join(', ')}`)
      }
    }
  }
  return errors
}

/**
 * Validate CLD (.cld) file format
 * @param {Object} cldData - The CLD data to validate
 * @returns {ValidationResult}
 */
export function validateCLDFormat(cldData) {
  const errors = []
  const warnings = []

  // Check if data is an object
  if (!cldData || typeof cldData !== 'object') {
    return createValidationResult(false, ['CLD data must be a valid JSON object'])
  }

  // Validate required top-level fields
  const requiredFields = ['version', 'diagramName', 'nodes', 'edges']
  errors.push(...validateRequiredFields(cldData, requiredFields, 'CLD'))

  // Validate field types
  const typeSchema = {
    version: 'string',
    diagramName: 'string',
    description: 'string',
    category: 'string',
    nodes: 'array',
    edges: 'array',
    viewTransform: 'object',
    showGrid: 'boolean',
    globalStyles: 'object',
    problemStatement: 'object',
    analysis: 'object',
    simulation: 'object'
  }
  errors.push(...validateFieldTypes(cldData, typeSchema, 'CLD'))

  // Validate nodes
  if (Array.isArray(cldData.nodes)) {
    cldData.nodes.forEach((node, index) => {
      const nodeContext = `CLD node ${index}`
      
      // Required node fields
      const requiredNodeFields = ['id', 'label', 'position']
      errors.push(...validateRequiredFields(node, requiredNodeFields, nodeContext))

      // Node field types
      const nodeTypeSchema = {
        id: 'string',
        label: 'string',
        type: 'string',
        position: 'object',
        color: 'string',
        size: 'number'
      }
      errors.push(...validateFieldTypes(node, nodeTypeSchema, nodeContext))

      // Validate position object
      if (node.position && typeof node.position === 'object') {
        const positionErrors = validateFieldTypes(node.position, { x: 'number', y: 'number' }, `${nodeContext} position`)
        errors.push(...positionErrors)
      }

      // Validate node type enum
      if (node.type) {
        const nodeTypeErrors = validateEnumValues(node, { type: Object.values(NODE_TYPES) }, nodeContext)
        errors.push(...nodeTypeErrors)
      }

      // Validate color format (hex or named color)
      if (node.color && typeof node.color === 'string') {
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/
        if (!colorRegex.test(node.color)) {
          warnings.push(`${nodeContext}: Color '${node.color}' may not be a valid color format`)
        }
      }
    })
  }

  // Validate edges
  if (Array.isArray(cldData.edges)) {
    cldData.edges.forEach((edge, index) => {
      const edgeContext = `CLD edge ${index}`
      
      // Required edge fields
      const requiredEdgeFields = ['id', 'source', 'target']
      errors.push(...validateRequiredFields(edge, requiredEdgeFields, edgeContext))

      // Edge field types
      const edgeTypeSchema = {
        id: 'string',
        source: 'string',
        target: 'string',
        polarity: 'string',
        type: 'string',
        label: 'string'
      }
      errors.push(...validateFieldTypes(edge, edgeTypeSchema, edgeContext))

      // Validate polarity enum
      if (edge.polarity) {
        const polarityErrors = validateEnumValues(edge, { polarity: Object.values(EDGE_POLARITIES) }, edgeContext)
        errors.push(...polarityErrors)
      }

      // Validate edge type
      if (edge.type && edge.type !== 'causal') {
        warnings.push(`${edgeContext}: Edge type '${edge.type}' is not standard, expected 'causal'`)
      }
    })
  }

  // Validate viewTransform
  if (cldData.viewTransform && typeof cldData.viewTransform === 'object') {
    const viewErrors = validateFieldTypes(cldData.viewTransform, { x: 'number', y: 'number', scale: 'number' }, 'CLD viewTransform')
    errors.push(...viewErrors)
  }

  // Validate globalStyles
  if (cldData.globalStyles && typeof cldData.globalStyles === 'object') {
    const styleErrors = validateFieldTypes(cldData.globalStyles, {
      nodeColor: 'string',
      edgeColor: 'string',
      backgroundColor: 'string'
    }, 'CLD globalStyles')
    errors.push(...styleErrors)
  }

  // Validate problemStatement
  if (cldData.problemStatement && typeof cldData.problemStatement === 'object') {
    const problemErrors = validateFieldTypes(cldData.problemStatement, {
      mode: 'string',
      currentProblem: 'string',
      customStatement: 'string'
    }, 'CLD problemStatement')
    errors.push(...problemErrors)

    if (cldData.problemStatement.mode) {
      const modeErrors = validateEnumValues(cldData.problemStatement, { mode: Object.values(MODES) }, 'CLD problemStatement')
      errors.push(...modeErrors)
    }
  }

  // Validate analysis
  if (cldData.analysis && typeof cldData.analysis === 'object') {
    const analysisErrors = validateFieldTypes(cldData.analysis, {
      adjacencyMatrix: 'array',
      allLoops: 'array'
    }, 'CLD analysis')
    errors.push(...analysisErrors)
  }

  // Validate simulation
  if (cldData.simulation && typeof cldData.simulation === 'object') {
    const simulationErrors = validateFieldTypes(cldData.simulation, {
      isInitialized: 'boolean',
      timeStep: 'number',
      duration: 'number'
    }, 'CLD simulation')
    errors.push(...simulationErrors)
  }

  // Check for circular references in edges
  if (Array.isArray(cldData.edges)) {
    const nodeIds = new Set(cldData.nodes.map(n => n.id))
    for (const edge of cldData.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`CLD edge references non-existent source node: ${edge.source}`)
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`CLD edge references non-existent target node: ${edge.target}`)
      }
    }
  }

  return createValidationResult(errors.length === 0, errors, warnings)
}

/**
 * Validate simplified diagram format for assignment answers
 * This is a more lenient validation for diagram answers in assignments
 */
export function validateSimplifiedDiagramFormat(diagramData) {
  const errors = []
  const warnings = []

  // Check if data is an object
  if (!diagramData || typeof diagramData !== 'object') {
    return createValidationResult(false, ['Diagram data must be a valid JSON object'])
  }

  // Validate required top-level fields
  const requiredFields = ['nodes', 'edges']
  errors.push(...validateRequiredFields(diagramData, requiredFields, 'Diagram'))

  // Validate field types
  const typeSchema = {
    nodes: 'array',
    edges: 'array'
  }
  errors.push(...validateFieldTypes(diagramData, typeSchema, 'Diagram'))

  // Validate nodes
  if (Array.isArray(diagramData.nodes)) {
    diagramData.nodes.forEach((node, index) => {
      const nodeContext = `Diagram node ${index}`
      
      // Required node fields for simplified format
      const requiredNodeFields = ['id', 'label']
      errors.push(...validateRequiredFields(node, requiredNodeFields, nodeContext))

      // Node field types for simplified format
      const nodeTypeSchema = {
        id: 'string',
        label: 'string',
        x: 'number',
        y: 'number'
      }
      errors.push(...validateFieldTypes(node, nodeTypeSchema, nodeContext))
    })
  }

  // Validate edges
  if (Array.isArray(diagramData.edges)) {
    diagramData.edges.forEach((edge, index) => {
      const edgeContext = `Diagram edge ${index}`
      
      // Required edge fields for simplified format
      const requiredEdgeFields = ['source', 'target']
      errors.push(...validateRequiredFields(edge, requiredEdgeFields, edgeContext))

      // Edge field types for simplified format
      const edgeTypeSchema = {
        source: 'string',
        target: 'string',
        polarity: 'string'
      }
      errors.push(...validateFieldTypes(edge, edgeTypeSchema, edgeContext))

      // Validate polarity enum
      if (edge.polarity) {
        const validPolarities = ['positive', 'negative']
        if (!validPolarities.includes(edge.polarity)) {
          errors.push(`${edgeContext}: Invalid polarity '${edge.polarity}', expected one of: ${validPolarities.join(', ')}`)
        }
      }
    })
  }

  return createValidationResult(errors.length === 0, errors, warnings)
}

/**
 * Validate CLDQ (.cldq) file format
 * @param {Object} cldqData - The CLDQ data to validate
 * @returns {ValidationResult}
 */
export function validateCLDQFormat(cldqData) {
  const errors = []
  const warnings = []

  // Check if data is an object
  if (!cldqData || typeof cldqData !== 'object') {
    return createValidationResult(false, ['CLDQ data must be a valid JSON object'])
  }

  // Validate required top-level fields
  const requiredFields = ['id', 'title', 'questions']
  errors.push(...validateRequiredFields(cldqData, requiredFields, 'CLDQ'))

  // Validate field types
  const typeSchema = {
    id: 'string',
    title: 'string',
    description: 'string',
    timeLimit: 'number',
    maxScore: 'number',
    deadline: 'string',
    questions: 'array'
  }
  errors.push(...validateFieldTypes(cldqData, typeSchema, 'CLDQ'))

  // Validate deadline format
  if (cldqData.deadline) {
    const deadlineDate = new Date(cldqData.deadline)
    if (isNaN(deadlineDate.getTime())) {
      errors.push('CLDQ: Invalid deadline format, expected ISO 8601 date string')
    }
  }

  // Validate questions array
  if (Array.isArray(cldqData.questions)) {
    cldqData.questions.forEach((question, index) => {
      const questionContext = `CLDQ question ${index}`
      
      // Required question fields
      const requiredQuestionFields = ['id', 'questionType', 'question', 'maxScore']
      errors.push(...validateRequiredFields(question, requiredQuestionFields, questionContext))

      // Question field types - handle correctAnswer type based on question type
      const questionTypeSchema = {
        id: 'string',
        questionType: 'string',
        question: 'string',
        maxScore: 'number',
        timeLimit: 'number',
        keywords: 'array',
        tolerance: 'number',
        options: 'array',
        evaluationCriteria: 'object',
        originalDiagram: 'string',
        requiredElements: 'object',
        cldContext: 'string'
      }
      
      // Add correctAnswer validation based on question type
      if (question.correctAnswer !== undefined) {
        if (question.questionType === 'edit-cld') {
          // For edit-cld questions, correctAnswer should be an adjacency matrix array
          if (!Array.isArray(question.correctAnswer)) {
            errors.push(`${questionContext}: Field 'correctAnswer' should be array for edit-cld questions, got ${typeof question.correctAnswer}`)
          }
        } else if (['select-nodes', 'select-connections'].includes(question.questionType)) {
          // For select questions, correctAnswer should be an array of IDs
          if (!Array.isArray(question.correctAnswer)) {
            errors.push(`${questionContext}: Field 'correctAnswer' should be array for ${question.questionType} questions, got ${typeof question.correctAnswer}`)
          }
        } else {
          // For other question types (mcq, nat, text), correctAnswer should be string
          if (typeof question.correctAnswer !== 'string') {
            errors.push(`${questionContext}: Field 'correctAnswer' should be string for ${question.questionType} questions, got ${typeof question.correctAnswer}`)
          }
        }
      }
      
      errors.push(...validateFieldTypes(question, questionTypeSchema, questionContext))

      // Validate question type enum
      const validQuestionTypes = ['mcq', 'nat', 'text', 'edit-cld', 'select-nodes', 'select-connections']
      const questionTypeErrors = validateEnumValues(question, { questionType: validQuestionTypes }, questionContext)
      errors.push(...questionTypeErrors)

      // Validate question-specific fields
      if (question.questionType === 'mcq') {
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push(`${questionContext}: MCQ must have at least 2 options`)
        }
      }

      if (question.questionType === 'nat') {
        if (typeof question.tolerance !== 'number') {
          errors.push(`${questionContext}: NAT questions must have a tolerance value`)
        }
      }

      if (question.questionType === 'text') {
        if (!Array.isArray(question.keywords)) {
          errors.push(`${questionContext}: TEXT questions must have keywords array`)
        }
      }

      // Validate CLD context for all CLD question types
      if (['edit-cld', 'select-nodes', 'select-connections'].includes(question.questionType)) {
        if (!question.cldContext) {
          errors.push(`${questionContext}: CLD questions must have cldContext`)
        }
      }

      // Validate correct answer for edit-cld (adjacency matrix)
      if (question.questionType === 'edit-cld' && question.correctAnswer) {
        try {
          const adjacencyMatrix = typeof question.correctAnswer === 'string' 
            ? JSON.parse(question.correctAnswer) 
            : question.correctAnswer
          
          if (typeof adjacencyMatrix !== 'object' || !Array.isArray(adjacencyMatrix)) {
            errors.push(`${questionContext}: edit-cld correctAnswer must be an adjacency matrix array`)
          }
        } catch (e) {
          errors.push(`${questionContext}: Invalid JSON in edit-cld correctAnswer`)
        }
      }

      // Validate correct answer for select questions (array of IDs)
      if (['select-nodes', 'select-connections'].includes(question.questionType) && question.correctAnswer) {
        if (!Array.isArray(question.correctAnswer)) {
          errors.push(`${questionContext}: select questions must have correctAnswer as array of IDs`)
        }
      }
    })
  }

  return createValidationResult(errors.length === 0, errors, warnings)
}

/**
 * Validate assignment response format
 * @param {Object} responseData - The response data to validate
 * @param {Object} assignment - The assignment data for context
 * @returns {ValidationResult}
 */
export function validateAssignmentResponse(responseData, assignment) {
  const errors = []
  const warnings = []

  // Check if data is an object
  if (!responseData || typeof responseData !== 'object') {
    return createValidationResult(false, ['Response data must be a valid JSON object'])
  }

  // Validate assignment parameter
  if (!assignment || typeof assignment !== 'object') {
    return createValidationResult(false, ['Assignment data is required for response validation'])
  }

  // Validate response structure
  const typeSchema = {
    questionId: 'string',
    response: 'string',
    timestamp: 'string',
    attempts: 'number'
  }
  errors.push(...validateFieldTypes(responseData, typeSchema, 'Response'))

  // Validate timestamp format
  if (responseData.timestamp) {
    const timestampDate = new Date(responseData.timestamp)
    if (isNaN(timestampDate.getTime())) {
      errors.push('Response: Invalid timestamp format, expected ISO 8601 date string')
    }
  }

  // Validate response against question type
  if (responseData.questionId && assignment.questions) {
    const question = assignment.questions.find(q => q.id === responseData.questionId)
    if (!question) {
      errors.push(`Response: Question ID '${responseData.questionId}' not found in assignment`)
    } else {
      // Validate response format based on question type
      switch (question.questionType) {
        case 'text':
          if (typeof responseData.response !== 'string') {
            errors.push(`Response: Text question response must be a string`)
          }
          break
        case 'number':
          if (isNaN(Number(responseData.response))) {
            errors.push(`Response: Number question response must be a valid number`)
          }
          break
        case 'mcq':
          if (typeof responseData.response !== 'string') {
            errors.push(`Response: MCQ response must be a string`)
          }
          if (question.options && !question.options.includes(responseData.response)) {
            warnings.push(`Response: MCQ response '${responseData.response}' not in valid options`)
          }
          break
        case 'diagram':
        case 'edit diagram':
          try {
            const diagramData = JSON.parse(responseData.response)
            const diagramValidation = validateCLDFormat(diagramData)
            if (!diagramValidation.isValid) {
              errors.push(`Response: Invalid diagram format`)
              errors.push(...diagramValidation.errors.map(e => `  ${e}`))
            }
          } catch (e) {
            errors.push(`Response: Invalid JSON in diagram response`)
          }
          break
      }
    }
  }

  return createValidationResult(errors.length === 0, errors, warnings)
}

/**
 * Validate complete assignment submission
 * @param {Object} submissionData - The complete submission data
 * @param {Object} assignment - The assignment data
 * @returns {ValidationResult}
 */
export function validateAssignmentSubmission(submissionData, assignment) {
  const errors = []
  const warnings = []

  // Check if data is an object
  if (!submissionData || typeof submissionData !== 'object') {
    return createValidationResult(false, ['Submission data must be a valid JSON object'])
  }

  // Validate assignment parameter
  if (!assignment || typeof assignment !== 'object') {
    return createValidationResult(false, ['Assignment data is required for submission validation'])
  }

  // Validate submission structure
  const typeSchema = {
    assignmentId: 'string',
    userId: 'string',
    timestamp: 'string',
    responses: 'object',
    totalScore: 'number',
    maxTotalScore: 'number',
    assignmentStatus: 'string'
  }
  errors.push(...validateFieldTypes(submissionData, typeSchema, 'Submission'))

  // Validate timestamp
  if (submissionData.timestamp) {
    const timestampDate = new Date(submissionData.timestamp)
    if (isNaN(timestampDate.getTime())) {
      errors.push('Submission: Invalid timestamp format, expected ISO 8601 date string')
    }
  }

  // Validate assignment status
  if (submissionData.assignmentStatus) {
    const validStatuses = ['submitted', 'in-progress', 'completed', 'graded']
    const statusErrors = validateEnumValues(submissionData, { assignmentStatus: validStatuses }, 'Submission')
    errors.push(...statusErrors)
  }

  // Validate responses object
  if (submissionData.responses && typeof submissionData.responses === 'object') {
    for (const [questionId, response] of Object.entries(submissionData.responses)) {
      const responseValidation = validateAssignmentResponse(response, assignment)
      if (!responseValidation.isValid) {
        errors.push(`Submission response ${questionId}:`)
        errors.push(...responseValidation.errors.map(e => `  ${e}`))
      }
      warnings.push(...responseValidation.warnings.map(w => `Response ${questionId}: ${w}`))
    }
  }

  // Validate score calculations
  if (typeof submissionData.totalScore === 'number' && typeof submissionData.maxTotalScore === 'number') {
    if (submissionData.totalScore > submissionData.maxTotalScore) {
      errors.push('Submission: Total score cannot exceed maximum total score')
    }
    if (submissionData.totalScore < 0) {
      errors.push('Submission: Total score cannot be negative')
    }
  }

  return createValidationResult(errors.length === 0, errors, warnings)
}

/**
 * Validate file format based on file extension
 * @param {Object} data - The data to validate
 * @param {string} fileExtension - The file extension (.cld, .cldq, etc.)
 * @param {Object} assignment - Optional assignment data for response validation
 * @returns {ValidationResult}
 */
export function validateFileFormat(data, fileExtension, assignment = null) {
  switch (fileExtension.toLowerCase()) {
    case '.cld':
      return validateCLDFormat(data)
    case '.cldq':
      return validateCLDQFormat(data)
    case '.json':
      // Try to determine format based on content
      if (data.questions && Array.isArray(data.questions)) {
        return validateCLDQFormat(data)
      } else if (data.nodes && Array.isArray(data.nodes)) {
        return validateCLDFormat(data)
      } else {
        return createValidationResult(false, ['Unknown JSON format. Expected .cld or .cldq format'])
      }
    default:
      return createValidationResult(false, [`Unsupported file extension: ${fileExtension}`])
  }
}

/**
 * Validate and sanitize CLD data for import
 * @param {Object} cldData - The CLD data to validate and sanitize
 * @returns {Object} Sanitized CLD data
 */
export function sanitizeCLDData(cldData) {
  const validation = validateCLDFormat(cldData)
  if (!validation.isValid) {
    throw new Error(`Invalid CLD format: ${validation.errors.join(', ')}`)
  }

  // Create a sanitized copy with default values
  const sanitized = {
    version: cldData.version || '2.0',
    diagramName: cldData.diagramName || 'Untitled Diagram',
    description: cldData.description || '',
    category: cldData.category || 'General',
    nodes: cldData.nodes || [],
    edges: cldData.edges || [],
    viewTransform: cldData.viewTransform || { x: 0, y: 0, scale: 1 },
    showGrid: cldData.showGrid !== undefined ? cldData.showGrid : true,
    globalStyles: cldData.globalStyles || {
      nodeColor: '#3B82F6',
      edgeColor: '#6B7280',
      backgroundColor: '#FFFFFF'
    },
    problemStatement: cldData.problemStatement || {
      mode: 'sandbox',
      currentProblem: null,
      customStatement: ''
    },
    analysis: cldData.analysis || {
      adjacencyMatrix: [],
      allLoops: []
    },
    simulation: cldData.simulation || {
      isInitialized: false,
      timeStep: 1,
      duration: 100
    }
  }

  // Sanitize nodes
  sanitized.nodes = sanitized.nodes.map(node => ({
    id: node.id,
    label: node.label || 'Unnamed',
    type: node.type || 'variable',
    position: {
      x: node.position?.x || 0,
      y: node.position?.y || 0
    },
    color: node.color || '#3B82F6',
    size: node.size || 60
  }))

  // Sanitize edges
  sanitized.edges = sanitized.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    polarity: edge.polarity || 'positive',
    type: edge.type || 'causal',
    label: edge.label || ''
  }))

  return sanitized
}

/**
 * Get validation summary as a formatted string
 * @param {ValidationResult} validationResult - The validation result
 * @returns {string} Formatted validation summary
 */
export function getValidationSummary(validationResult) {
  const { isValid, errors, warnings } = validationResult
  
  let summary = `Validation ${isValid ? 'PASSED' : 'FAILED'}\n`
  
  if (errors.length > 0) {
    summary += `\nErrors (${errors.length}):\n`
    errors.forEach((error, index) => {
      summary += `${index + 1}. ${error}\n`
    })
  }
  
  if (warnings.length > 0) {
    summary += `\nWarnings (${warnings.length}):\n`
    warnings.forEach((warning, index) => {
      summary += `${index + 1}. ${warning}\n`
    })
  }
  
  return summary
}

export default {
  validateCLDFormat,
  validateSimplifiedDiagramFormat,
  validateCLDQFormat,
  validateAssignmentResponse,
  validateAssignmentSubmission,
  validateFileFormat,
  sanitizeCLDData,
  getValidationSummary
} 
/**
 * Integration examples showing how to use validation utilities in CLD Studio components
 * This file demonstrates practical usage patterns for the validation utilities
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

import {
  validateFile,
  validateAssignmentResponses,
  getValidationStats
} from './validation.test.js'

/**
 * Example: Integration with file import functionality
 * This could be used in S3FileManager or similar file handling components
 */
export class FileImportValidator {
  /**
   * Validate and import a CLD file
   * @param {File} file - File object from file input
   * @returns {Promise<Object>} Import result with validation info
   */
  static async validateAndImportCLD(file) {
    try {
      // Validate file format
      const validation = await validateFile(file, '.cld')
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      // Parse file content
      const text = await file.text()
      const cldData = JSON.parse(text)

      // Sanitize data for import
      const sanitizedData = sanitizeCLDData(cldData)

      return {
        success: true,
        data: sanitizedData,
        warnings: validation.warnings
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to process file: ${error.message}`],
        warnings: []
      }
    }
  }

  /**
   * Validate and import a CLDQ assignment file
   * @param {File} file - File object from file input
   * @returns {Promise<Object>} Import result with validation info
   */
  static async validateAndImportCLDQ(file) {
    try {
      const validation = await validateFile(file, '.cldq')
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        }
      }

      const text = await file.text()
      const cldqData = JSON.parse(text)

      return {
        success: true,
        data: cldqData,
        warnings: validation.warnings
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to process file: ${error.message}`],
        warnings: []
      }
    }
  }
}

/**
 * Example: Integration with assignment interface
 * This could be used in AssignmentPanel component
 */
export class AssignmentValidator {
  /**
   * Validate user response before saving
   * @param {Object} response - User response object
   * @param {Object} question - Question object from assignment
   * @param {Object} assignment - Full assignment object
   * @returns {Object} Validation result
   */
  static validateUserResponse(response, question, assignment) {
    const validation = validateAssignmentResponse(response, assignment)
    
    return {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      canSave: validation.isValid,
      canSubmit: validation.isValid && validation.warnings.length === 0
    }
  }

  /**
   * Validate all responses before assignment submission
   * @param {Object} responses - All user responses
   * @param {Object} assignment - Assignment object
   * @returns {Object} Validation result with submission readiness
   */
  static validateAssignmentSubmission(responses, assignment) {
    const validation = validateAssignmentResponses(responses, assignment)
    
    const stats = getValidationStats(validation)
    const missingQuestions = assignment.questions.filter(q => 
      !responses[q.id]
    ).map(q => q.id)

    return {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      stats,
      missingQuestions,
      canSubmit: validation.isValid && missingQuestions.length === 0,
      completionPercentage: ((assignment.questions.length - missingQuestions.length) / assignment.questions.length) * 100
    }
  }

  /**
   * Get validation feedback for user
   * @param {Object} validationResult - Validation result
   * @returns {Object} User-friendly feedback
   */
  static getValidationFeedback(validationResult) {
    const { isValid, errors, warnings } = validationResult
    
    if (isValid && warnings.length === 0) {
      return {
        type: 'success',
        message: 'All responses are valid and ready for submission!',
        details: []
      }
    }

    if (isValid && warnings.length > 0) {
      return {
        type: 'warning',
        message: 'Responses are valid but have some warnings:',
        details: warnings
      }
    }

    return {
      type: 'error',
      message: 'Please fix the following errors before submitting:',
      details: errors
    }
  }
}

/**
 * Example: Integration with assessment service
 * This could be used in assessmentService.js
 */
export class AssessmentValidator {
  /**
   * Validate submission before processing
   * @param {Object} submission - Submission data
   * @param {Object} assignment - Assignment data
   * @returns {Object} Validation result
   */
  static validateSubmission(submission, assignment) {
    const validation = validateAssignmentSubmission(submission, assignment)
    
    if (!validation.isValid) {
      throw new Error(`Invalid submission: ${validation.errors.join(', ')}`)
    }

    return {
      isValid: true,
      warnings: validation.warnings,
      submission: submission
    }
  }

  /**
   * Validate assignment data before evaluation
   * @param {Object} assignment - Assignment data
   * @returns {Object} Validation result
   */
  static validateAssignment(assignment) {
    const validation = validateCLDQFormat(assignment)
    
    if (!validation.isValid) {
      throw new Error(`Invalid assignment format: ${validation.errors.join(', ')}`)
    }

    return {
      isValid: true,
      warnings: validation.warnings,
      assignment: assignment
    }
  }
}

/**
 * Example: Integration with diagram editor
 * This could be used in Canvas component or CLD store
 */
export class DiagramValidator {
  /**
   * Validate diagram data before saving
   * @param {Object} diagramData - Current diagram data
   * @returns {Object} Validation result
   */
  static validateDiagram(diagramData) {
    const validation = validateCLDFormat(diagramData)
    
    return {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      canSave: validation.isValid,
      canExport: validation.isValid && validation.warnings.length === 0
    }
  }

  /**
   * Validate diagram before simulation
   * @param {Object} diagramData - Diagram data
   * @returns {Object} Simulation readiness check
   */
  static validateForSimulation(diagramData) {
    const validation = validateCLDFormat(diagramData)
    
    if (!validation.isValid) {
      return {
        canSimulate: false,
        errors: validation.errors,
        message: 'Diagram has errors that prevent simulation'
      }
    }

    // Additional simulation-specific checks
    const simulationChecks = []
    
    if (!diagramData.nodes || diagramData.nodes.length === 0) {
      simulationChecks.push('No nodes found in diagram')
    }
    
    if (!diagramData.edges || diagramData.edges.length === 0) {
      simulationChecks.push('No connections found in diagram')
    }

    const hasLoops = diagramData.edges && diagramData.edges.some(edge => 
      diagramData.edges.some(otherEdge => 
        otherEdge.source === edge.target && otherEdge.target === edge.source
      )
    )

    if (!hasLoops) {
      simulationChecks.push('No feedback loops detected')
    }

    return {
      canSimulate: simulationChecks.length === 0,
      errors: simulationChecks,
      message: simulationChecks.length === 0 
        ? 'Diagram is ready for simulation' 
        : 'Diagram needs adjustments for simulation'
    }
  }
}

/**
 * Example: Integration with error boundary
 * This could be used in ErrorBoundary component
 */
export class ValidationErrorHandler {
  /**
   * Handle validation errors in a user-friendly way
   * @param {Object} validationResult - Validation result
   * @param {string} context - Context where validation failed
   * @returns {Object} Error handling result
   */
  static handleValidationError(validationResult, context) {
    const { errors, warnings } = validationResult
    
    // Log errors for debugging
    console.error(`Validation failed in ${context}:`, errors)
    
    if (warnings.length > 0) {
      console.warn(`Validation warnings in ${context}:`, warnings)
    }

    // Return user-friendly error message
    return {
      title: `Validation Error in ${context}`,
      message: errors.length > 0 
        ? `Please fix the following issues:\n${errors.join('\n')}`
        : 'Unknown validation error',
      details: errors,
      warnings: warnings,
      canRecover: warnings.length > 0 && errors.length === 0
    }
  }

  /**
   * Create recovery suggestions for validation errors
   * @param {Array<string>} errors - Validation errors
   * @returns {Array<string>} Recovery suggestions
   */
  static getRecoverySuggestions(errors) {
    const suggestions = []
    
    errors.forEach(error => {
      if (error.includes('Missing required field')) {
        suggestions.push('Add the missing required field to your data')
      } else if (error.includes('should be number')) {
        suggestions.push('Ensure numeric fields contain valid numbers')
      } else if (error.includes('should be string')) {
        suggestions.push('Ensure text fields contain valid strings')
      } else if (error.includes('invalid value')) {
        suggestions.push('Check that enum values match the expected options')
      } else if (error.includes('non-existent')) {
        suggestions.push('Verify that all referenced IDs exist in your data')
      } else {
        suggestions.push('Review the data structure and ensure it matches the expected format')
      }
    })

    return suggestions
  }
}

/**
 * Example: Integration with file export functionality
 * This could be used when exporting diagrams or assignments
 */
export class ExportValidator {
  /**
   * Validate data before export
   * @param {Object} data - Data to export
   * @param {string} format - Export format (.cld, .cldq, etc.)
   * @returns {Object} Export validation result
   */
  static validateForExport(data, format) {
    const validation = validateFileFormat(data, format)
    
    return {
      canExport: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      exportQuality: validation.isValid 
        ? (validation.warnings.length === 0 ? 'high' : 'medium')
        : 'low'
    }
  }

  /**
   * Prepare data for export with validation
   * @param {Object} data - Raw data
   * @param {string} format - Export format
   * @returns {Object} Prepared export data
   */
  static prepareForExport(data, format) {
    const validation = validateFileFormat(data, format)
    
    if (!validation.isValid) {
      throw new Error(`Cannot export invalid data: ${validation.errors.join(', ')}`)
    }

    // For CLD files, sanitize before export
    if (format === '.cld') {
      return sanitizeCLDData(data)
    }

    return data
  }
}

// Export all validator classes
export default {
  FileImportValidator,
  AssignmentValidator,
  AssessmentValidator,
  DiagramValidator,
  ValidationErrorHandler,
  ExportValidator
} 
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple validation function for CLDQ files
function validateCLDQFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(content)
    
    const errors = []
    const warnings = []
    
    // Check required top-level fields
    if (!data.id) errors.push('Missing required field: id')
    if (!data.title) errors.push('Missing required field: title')
    if (!data.questions) errors.push('Missing required field: questions')
    if (!Array.isArray(data.questions)) errors.push('Questions must be an array')
    
    // Check assignment metadata
    if (data.deadline) {
      const deadlineDate = new Date(data.deadline)
      if (isNaN(deadlineDate.getTime())) {
        errors.push('Invalid deadline format, expected ISO 8601 date string')
      }
    }
    
    // Validate each question
    if (Array.isArray(data.questions)) {
      data.questions.forEach((question, index) => {
        const questionContext = `Question ${index + 1}`
        
        // Required question fields
        if (!question.id) errors.push(`${questionContext}: Missing required field: id`)
        if (!question.questionType) errors.push(`${questionContext}: Missing required field: questionType`)
        if (!question.question) errors.push(`${questionContext}: Missing required field: question`)
        if (typeof question.maxScore !== 'number') errors.push(`${questionContext}: Missing or invalid maxScore`)
        
        // Validate question type
        const validQuestionTypes = ['mcq', 'nat', 'text', 'edit-cld', 'select-nodes', 'select-connections']
        if (!validQuestionTypes.includes(question.questionType)) {
          errors.push(`${questionContext}: Invalid questionType: ${question.questionType}`)
        }
        
        // Check for correctAnswer (required for grading)
        if (!question.correctAnswer) {
          warnings.push(`${questionContext}: Missing correctAnswer (required for grading)`)
        }
        
        // Check for cldContext (new field for CLD association)
        if (!question.cldContext) {
          warnings.push(`${questionContext}: Missing cldContext (CLD will be randomly selected)`)
        }
        
        // Question-specific validation
        if (question.questionType === 'mcq') {
          if (!Array.isArray(question.options) || question.options.length < 2) {
            errors.push(`${questionContext}: MCQ must have at least 2 options`)
          }
        }
        
        if (question.questionType === 'nat') {
          if (typeof question.tolerance !== 'number') {
            errors.push(`${questionContext}: NAT questions must have tolerance field`)
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
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      questionCount: data.questions?.length || 0,
      totalScore: data.maxScore || 0
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`JSON parsing error: ${error.message}`],
      warnings: [],
      questionCount: 0,
      totalScore: 0
    }
  }
}

// Main validation function
function validateAllCLDQFiles() {
  const assignmentsDir = path.join(__dirname, '..', 'public', 'assignments')
  const files = fs.readdirSync(assignmentsDir).filter(file => file.endsWith('.cldq'))
  
  console.log('🔍 Validating CLDQ files...\n')
  
  let totalFiles = 0
  let validFiles = 0
  let totalQuestions = 0
  let totalScore = 0
  
  files.forEach(file => {
    const filePath = path.join(assignmentsDir, file)
    const result = validateCLDQFile(filePath)
    
    totalFiles++
    if (result.isValid) validFiles++
    totalQuestions += result.questionCount
    totalScore += result.totalScore
    
    console.log(`📄 ${file}:`)
    console.log(`   Questions: ${result.questionCount}`)
    console.log(`   Total Score: ${result.totalScore}`)
    console.log(`   Status: ${result.isValid ? '✅ Valid' : '❌ Invalid'}`)
    
    if (result.errors.length > 0) {
      console.log('   Errors:')
      result.errors.forEach(error => console.log(`     ❌ ${error}`))
    }
    
    if (result.warnings.length > 0) {
      console.log('   Warnings:')
      result.warnings.forEach(warning => console.log(`     ⚠️  ${warning}`))
    }
    
    console.log('')
  })
  
  console.log('📊 Summary:')
  console.log(`   Total files: ${totalFiles}`)
  console.log(`   Valid files: ${validFiles}`)
  console.log(`   Invalid files: ${totalFiles - validFiles}`)
  console.log(`   Total questions: ${totalQuestions}`)
  console.log(`   Total possible score: ${totalScore}`)
  
  if (validFiles === totalFiles) {
    console.log('\n🎉 All CLDQ files are valid!')
  } else {
    console.log('\n⚠️  Some files have validation issues. Please fix the errors above.')
  }
}

// Run validation
validateAllCLDQFiles() 
# Validation Utilities for CLD Studio

This module provides comprehensive validation utilities for CLD Studio file formats, including `.cld`, `.cldq`, assignment responses, and submission data.

## Overview

The validation utilities ensure that all file formats used in CLD Studio conform to their expected schemas and contain valid data. This helps prevent errors during file import, assignment submission, and data processing.

## File Formats Supported

### 1. CLD Files (.cld)
Causal Loop Diagram files containing:
- Diagram metadata (name, description, category)
- Nodes with positions, types, and styling
- Edges with polarity and connections
- View settings and global styles
- Analysis and simulation data

### 2. CLDQ Files (.cldq)
Assignment files containing:
- Assignment metadata (id, title, description)
- Questions array with various types (text, number, mcq, diagram, edit diagram)
- Scoring and timing information
- Evaluation criteria for diagram questions

### 3. Assignment Responses
Individual question responses with:
- Question ID and response content
- Timestamp and attempt count
- Type-specific validation

### 4. Assignment Submissions
Complete assignment submissions with:
- Assignment and user identification
- All responses and scoring
- Submission status and metadata

## Usage

### Basic Validation

```javascript
import { validateCLDFormat, validateCLDQFormat } from './validation.js'

// Validate a CLD file
const cldData = { /* your CLD data */ }
const cldResult = validateCLDFormat(cldData)

if (cldResult.isValid) {
  console.log('CLD file is valid!')
} else {
  console.log('Validation errors:', cldResult.errors)
  console.log('Warnings:', cldResult.warnings)
}

// Validate a CLDQ file
const cldqData = { /* your CLDQ data */ }
const cldqResult = validateCLDQFormat(cldqData)
```

### File Format Detection

```javascript
import { validateFileFormat } from './validation.js'

// Automatically detect format based on file extension
const result = validateFileFormat(data, '.cld')
const result2 = validateFileFormat(data, '.cldq')

// For JSON files, format is detected by content
const jsonResult = validateFileFormat(data, '.json')
```

### Assignment Response Validation

```javascript
import { validateAssignmentResponse, validateAssignmentSubmission } from './validation.js'

// Validate individual response
const response = {
  questionId: 'q1',
  response: 'Answer text',
  timestamp: '2024-01-01T12:00:00Z',
  attempts: 1
}

const responseResult = validateAssignmentResponse(response, assignmentData)

// Validate complete submission
const submission = {
  assignmentId: 'assignment-001',
  userId: 'user123',
  timestamp: '2024-01-01T12:00:00Z',
  responses: { /* all responses */ },
  totalScore: 85,
  maxTotalScore: 100,
  assignmentStatus: 'submitted'
}

const submissionResult = validateAssignmentSubmission(submission, assignmentData)
```

### File Validation from URL or File Input

```javascript
import { validateFile } from './validation.test.js'

// Validate from URL
const urlResult = await validateFile('/assignments/sample-assignment.cldq', '.cldq')

// Validate from File object (from file input)
const fileInput = document.getElementById('fileInput')
const file = fileInput.files[0]
const fileResult = await validateFile(file, '.cld')
```

### Data Sanitization

```javascript
import { sanitizeCLDData } from './validation.js'

// Sanitize CLD data with default values
try {
  const sanitized = sanitizeCLDData(rawCLDData)
  console.log('Sanitized data:', sanitized)
} catch (error) {
  console.error('Sanitization failed:', error.message)
}
```

### Validation Summary

```javascript
import { getValidationSummary } from './validation.js'

const result = validateCLDFormat(data)
const summary = getValidationSummary(result)
console.log(summary)
```

## Validation Rules

### CLD Files

**Required Fields:**
- `version` (string)
- `diagramName` (string)
- `nodes` (array)
- `edges` (array)

**Node Validation:**
- Each node must have `id`, `label`, and `position`
- `position` must have `x` and `y` as numbers
- `type` must be one of: `variable`, `constant`, `parameter`
- `color` should be valid hex or named color

**Edge Validation:**
- Each edge must have `id`, `source`, and `target`
- `source` and `target` must reference existing node IDs
- `polarity` must be `positive` or `negative`
- `type` should be `causal`

### CLDQ Files

**Required Fields:**
- `id` (string)
- `title` (string)
- `questions` (array)

**Question Validation:**
- Each question must have `id`, `questionType`, `question`, and `maxScore`
- `questionType` must be: `text`, `number`, `mcq`, `diagram`, or `edit diagram`
- MCQ questions must have at least 2 options
- Diagram questions must have valid CLD format in `correctAnswer`
- `deadline` must be valid ISO 8601 date string

### Assignment Responses

**Required Fields:**
- `questionId` (string)
- `response` (string)
- `timestamp` (string)
- `attempts` (number)

**Type-Specific Validation:**
- Text responses: must be string
- Number responses: must be valid number
- MCQ responses: must be string matching one of the options
- Diagram responses: must be valid CLD JSON

### Assignment Submissions

**Required Fields:**
- `assignmentId` (string)
- `userId` (string)
- `timestamp` (string)
- `responses` (object)
- `totalScore` (number)
- `maxTotalScore` (number)
- `assignmentStatus` (string)

**Validation Rules:**
- `totalScore` cannot exceed `maxTotalScore`
- `totalScore` cannot be negative
- `assignmentStatus` must be: `submitted`, `in-progress`, `completed`, or `graded`
- All responses must be valid according to assignment structure

## Error Handling

All validation functions return a `ValidationResult` object:

```javascript
{
  isValid: boolean,
  errors: string[],
  warnings: string[]
}
```

- `isValid`: Whether the data passes all validation rules
- `errors`: Array of error messages that prevent the data from being valid
- `warnings`: Array of warning messages for potential issues

## Testing

Run the validation tests to see examples:

```javascript
import { runValidationTests } from './validation.test.js'

runValidationTests()
```

This will output validation results for various test cases including valid and invalid data.

## Integration Examples

### In Assignment Interface

```javascript
import { validateAssignmentResponses } from './validation.test.js'

const handleSubmit = () => {
  const validation = validateAssignmentResponses(userResponses, currentAssignment)
  
  if (!validation.isValid) {
    setErrors(validation.errors)
    return
  }
  
  if (validation.warnings.length > 0) {
    setWarnings(validation.warnings)
  }
  
  // Proceed with submission
  submitAssignment()
}
```

### In File Import

```javascript
import { validateFileFormat, sanitizeCLDData } from './validation.js'

const handleFileImport = async (file) => {
  const validation = await validateFile(file, '.cld')
  
  if (!validation.isValid) {
    showError(`Invalid file format: ${validation.errors.join(', ')}`)
    return
  }
  
  try {
    const sanitized = sanitizeCLDData(fileData)
    loadDiagram(sanitized)
  } catch (error) {
    showError(`Failed to load diagram: ${error.message}`)
  }
}
```

### In Assessment Service

```javascript
import { validateAssignmentSubmission } from './validation.js'

const submitAssignment = async (submission, assignment) => {
  const validation = validateAssignmentSubmission(submission, assignment)
  
  if (!validation.isValid) {
    throw new Error(`Invalid submission: ${validation.errors.join(', ')}`)
  }
  
  // Process submission
  return await processSubmission(submission)
}
```

## Best Practices

1. **Always validate before processing**: Validate all incoming data before using it
2. **Handle warnings appropriately**: Warnings don't prevent processing but should be logged
3. **Use sanitization for imports**: Use `sanitizeCLDData` when importing user files
4. **Provide user feedback**: Show validation errors to users in a user-friendly format
5. **Log validation issues**: Log validation errors and warnings for debugging

## Extending Validation

To add new validation rules:

1. Add new validation functions to `validation.js`
2. Update the appropriate validation function to include your rules
3. Add test cases to `validation.test.js`
4. Update this documentation

## Performance Considerations

- Validation is synchronous and should be fast for typical file sizes
- For large files, consider validating in chunks or asynchronously
- Cache validation results when possible to avoid re-validation
- Use validation early in the data pipeline to fail fast 
# Grading Highlighting Feature

## Overview

The grading highlighting feature provides visual feedback for assignment grading by highlighting question number buttons in the assignment sidebar with different colors based on their correctness.

## Features Implemented

### 1. Question Status Detection

The `getQuestionStatus` function in `AssignmentPanel.jsx` now checks grading results to determine the appropriate status for each question:

- **Correct Questions**: Green color (answered)
- **Incorrect Questions**: Red color (incorrect) 
- **Unanswered Questions**: Gray color (unanswered)

### 2. Grading Result Support

The system supports both grading result formats:
- Individual question properties: `assignmentProgress[q1]`, `assignmentProgress[q2]`, etc.
- Question results array: `assignmentProgress.questionResults[]`

### 3. Visual Styling

Added CSS styles for incorrect questions:

```css
.question-indicator.incorrect {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
}

.question-indicator.incorrect.current {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #ffffff;
}

.question-indicator.incorrect:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}
```

## Implementation Details

### Modified Files

1. **`src/components/AssignmentPanel.jsx`**
   - Updated `getQuestionStatus` function to check grading results
   - Added support for both grading result formats
   - Enhanced logic to detect correct vs incorrect answers

2. **`src/components/AssignmentPanel.css`**
   - Added `.question-indicator.incorrect` styles
   - Added hover states for incorrect questions
   - Maintained consistency with existing color scheme

3. **`scripts/test-grading-highlighting.js`**
   - Comprehensive test script to verify the feature
   - Mock grading results testing
   - Validation of CSS styles

### Logic Flow

1. **Before Grading**: Questions show as answered/unanswered based on user responses
2. **After Grading**: Questions show as correct/incorrect/unanswered based on grading results
3. **Status Priority**: Grading results take precedence over response status

### Question Status Logic

```javascript
const getQuestionStatus = (questionId) => {
  if (!currentAssignment) return 'unanswered'
  
  // Check if grading has been completed
  if (isGraded && assignmentProgress) {
    let questionResult = assignmentProgress[questionId]
    
    // Support both grading result formats
    if (!questionResult && assignmentProgress.questionResults) {
      const questionIndex = assignmentQuestions.findIndex(q => q.id === questionId)
      if (questionIndex !== -1) {
        questionResult = assignmentProgress.questionResults[questionIndex]
      }
    }
    
    if (questionResult) {
      if (questionResult.status === 'submitted' && !questionResult.isCorrect) {
        return 'incorrect'  // Red highlighting
      }
      if (questionResult.status === 'submitted' && questionResult.isCorrect) {
        return 'answered'   // Green highlighting
      }
      if (questionResult.status === 'not-attempted') {
        return 'unanswered' // Gray highlighting
      }
    }
  }
  
  // Fallback to response-based status
  const response = userResponses[`${currentAssignment.id}-${questionId}`]?.response
  return response && response.trim() !== '' ? 'answered' : 'unanswered'
}
```

## Color Scheme

| Status | Color | Hex Code | Description |
|--------|-------|----------|-------------|
| Correct | Green | `#10b981` | Questions answered correctly |
| Incorrect | Red | `#dc2626` | Questions answered incorrectly |
| Unanswered | Gray | `#6b7280` | Questions not attempted |
| Current | Blue | `#3b82f6` | Currently selected question |

## User Experience

### Before Grading
- Question buttons show green (answered) or gray (unanswered)
- Users can see which questions they've attempted

### After Grading
- Question buttons show green (correct), red (incorrect), or gray (unanswered)
- Immediate visual feedback on performance
- Easy identification of areas needing improvement

### Interactive Elements
- Hover effects for all question states
- Current question highlighted with border
- Click to navigate between questions

## Testing

### Manual Testing Steps
1. Load an assignment
2. Answer some questions correctly and some incorrectly
3. Click the "GRADE" button
4. Verify question number buttons show appropriate colors:
   - Green for correct answers
   - Red for incorrect answers
   - Gray for unanswered questions

### Automated Testing
Run the test script to verify implementation:
```bash
node scripts/test-grading-highlighting.js
```

## Expected Behavior

### Visual Feedback
- **Correct Questions**: Green background with white text
- **Incorrect Questions**: Red background with white text
- **Unanswered Questions**: Gray background with white text
- **Current Question**: Blue border around the button
- **Hover Effects**: Darker shades of the respective colors

### State Management
- Grading results override response-based status
- Fallback to response status when grading not completed
- Support for both grading result formats
- Proper state updates when switching assignments

## Benefits

1. **Immediate Feedback**: Users can quickly see their performance
2. **Visual Clarity**: Color-coded system makes it easy to identify issues
3. **Navigation Aid**: Helps users focus on areas needing improvement
4. **Consistent UX**: Maintains existing design patterns
5. **Accessibility**: High contrast colors for better visibility

## Future Enhancements

1. **Score Display**: Show individual question scores on hover
2. **Detailed Feedback**: Display specific feedback messages
3. **Progress Tracking**: Show improvement over multiple attempts
4. **Customization**: Allow users to customize color schemes
5. **Analytics**: Track user performance patterns 
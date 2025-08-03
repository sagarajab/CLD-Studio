# Grading Functionality Development Testing Guide

This guide provides step-by-step instructions for testing the grading functionality in development mode.

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```

### 2. Open Application
Navigate to `http://localhost:3002` in your browser (note: port may vary based on availability)

## 📋 Pre-Testing Checklist

The grading functionality has been verified with the following components:

✅ **GRADE Button Implementation**
- Button is present in AssignmentPanel header
- Proper state management (isGraded, isGrading)
- Disabled states when appropriate

✅ **Response Locking**
- Input fields are disabled after grading
- Text, number, and MCQ responses are locked
- Diagram editing is restricted

✅ **Grading Results Display**
- Results area shows after grading
- Score calculation and display
- Question-by-question feedback

✅ **AssessmentService Integration**
- Proper integration with grading service
- Assignment progress tracking
- Response evaluation logic

✅ **CSS Styling**
- Grade button styles
- Grading results area styles
- Disabled input styles

## 🧪 Manual Testing Steps

### Step 1: Load an Assignment

1. **Access Assignment Interface**
   - Look for the assignment button (📚) in the header
   - Click to open the assignment panel

2. **Select an Assignment**
   - Choose "Sample Assignment" or any other available assignment
   - Verify the assignment loads with questions

3. **Verify Assignment Structure**
   - Check that questions are displayed in the sidebar
   - Confirm different question types are present
   - Verify timer starts (if applicable)

### Step 2: Answer Questions

#### Text Questions
1. Find a text question (e.g., "What is a feedback loop?")
2. Type a response: "A feedback loop is a system where the output influences the input"
3. Verify the response is saved
4. Navigate to other questions and back to confirm persistence

#### Number Questions
1. Find a number question (e.g., "How many nodes are in your diagram?")
2. Enter a number: `3`
3. Verify the response is saved
4. Test with decimal values if applicable

#### MCQ Questions
1. Find a multiple choice question
2. Select an option using radio buttons
3. Verify the selection is saved
4. Test that only one option can be selected

#### Diagram Questions
1. Find a diagram question
2. Use the canvas to create a causal loop diagram
3. Add nodes and connections with proper polarity
4. Verify the diagram is auto-saved
5. Test diagram reset functionality

### Step 3: Test Grading Functionality

#### Before Grading
1. **Verify GRADE Button State**
   - Button should be enabled if there are responses
   - Button should show "GRADE" text
   - Button should not be disabled

2. **Check Response Persistence**
   - Navigate between questions
   - Verify responses are maintained
   - Check that auto-save is working

#### During Grading
1. **Click GRADE Button**
   - Button should show "Grading..." text
   - Button should be disabled during grading
   - No other actions should be possible

2. **Monitor Console**
   - Check browser console for grading logs
   - Verify AssessmentService is called
   - Check for any errors

#### After Grading
1. **Verify Response Locking**
   - All input fields should be disabled
   - Text areas should be read-only
   - MCQ options should be disabled
   - Diagram editing should be restricted

2. **Check Grading Results**
   - Results area should appear
   - Total score should be displayed
   - Question-by-question feedback should be shown
   - Correct/incorrect indicators should be present

3. **Test Navigation**
   - Should be able to navigate between questions
   - Responses should remain locked
   - Grading results should persist

### Step 4: Verify Grading Accuracy

#### Text Questions
- Test exact text matching
- Test case-insensitive matching
- Test partial credit scenarios

#### Number Questions
- Test exact number matching
- Test tolerance-based matching
- Test decimal precision

#### MCQ Questions
- Test correct answer selection
- Test incorrect answer selection
- Verify only one option is allowed

#### Diagram Questions
- Test node label matching
- Test connection accuracy
- Test polarity matching
- Test loop detection

## 🔍 Debugging Tips

### Console Logs
Monitor the browser console for:
- Grading process logs
- AssessmentService calls
- Error messages
- Response data

### Network Tab
Check the Network tab for:
- Assignment file loading
- AssessmentService API calls
- Any failed requests

### React DevTools
Use React DevTools to:
- Monitor component state
- Check prop changes
- Debug state management

## 🐛 Common Issues and Solutions

### Issue: GRADE Button Not Working
**Symptoms**: Button doesn't respond or shows errors
**Solutions**:
- Check browser console for errors
- Verify AssessmentService is properly imported
- Check that responses exist before grading
- **NEW**: Development mode now bypasses database requirements

### Issue: Responses Not Locking
**Symptoms**: Can still edit after grading
**Solutions**:
- Verify `isGraded` state is properly set
- Check disabled prop on input fields
- Ensure CSS styles are applied

### Issue: Grading Results Not Displaying
**Symptoms**: No results shown after grading
**Solutions**:
- Check `assignmentProgress` state
- Verify grading results structure
- Check CSS for results area visibility

### Issue: Score Calculation Errors
**Symptoms**: Incorrect scores displayed
**Solutions**:
- Check AssessmentService evaluation logic
- Verify correct answer format in assignment files
- Test individual question evaluation

## 📊 Expected Test Results

### Sample Assignment Expected Scores
Based on the sample assignment structure:
- **Text Question**: 100% for exact match, 0% for no match
- **Number Question**: 100% for correct number, 0% for incorrect
- **MCQ Question**: 100% for correct option, 0% for incorrect
- **Diagram Question**: Partial credit based on accuracy

### Grading Workflow
1. **Pre-grading**: All inputs enabled, responses editable
2. **During grading**: Button disabled, "Grading..." text
3. **Post-grading**: All inputs disabled, results displayed

## 🎯 Success Criteria

A successful grading test should demonstrate:

✅ **Functional Requirements**
- GRADE button works correctly
- Responses are properly locked after grading
- Grading results are displayed accurately
- Score calculation is correct

✅ **User Experience**
- Clear visual feedback during grading
- Intuitive response locking
- Easy-to-understand results display
- Smooth navigation after grading

✅ **Technical Requirements**
- No console errors
- Proper state management
- Correct API integration
- Responsive UI behavior

## 📝 Test Report Template

After completing the tests, document your findings:

```markdown
## Test Report - Grading Functionality

**Date**: [Date]
**Tester**: [Name]
**Environment**: Development Mode

### Test Results
- [ ] Assignment loading
- [ ] Question answering
- [ ] Response persistence
- [ ] GRADE button functionality
- [ ] Response locking
- [ ] Grading results display
- [ ] Score calculation accuracy
- [ ] Navigation after grading

### Issues Found
[List any issues encountered]

### Recommendations
[Suggestions for improvements]

### Overall Assessment
[Pass/Fail with comments]
```

## 🚀 Next Steps

After successful testing:
1. Document any issues found
2. Create bug reports if needed
3. Plan improvements based on feedback
4. Prepare for production testing
5. Update documentation as needed

## 🔧 Recent Fixes Applied

### Development Mode Database Issue (FIXED)
- **Problem**: Grading was failing with "Could not get or create user assessment record" error
- **Root Cause**: AssessmentService was trying to access database in development mode
- **Solution**: Added development mode detection to bypass database calls
- **Files Modified**: 
  - `src/services/assessmentService.js`
  - `src/stores/assignmentStore.js`
- **Result**: Grading now works in development mode without database setup

### JSON Parsing Error Issue (FIXED)
- **Problem**: Grading was failing with "JSON.parse: unexpected character at line 1 column 1" error
- **Root Cause**: Mismatch between assignment ID and filename when fetching assignment files
- **Solution**: Added filename parameter to AssessmentService and proper file path resolution
- **Files Modified**:
  - `src/services/assessmentService.js` (added filename parameter and enhanced debugging)
  - `src/stores/assignmentStore.js` (passes filename to AssessmentService)
- **Result**: Assignment files now load correctly and grading completes successfully 
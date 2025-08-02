# Browser Testing Guide for Assignment Evaluation

This guide provides step-by-step instructions for manually testing the assignment evaluation functionality in your browser.

## Quick Start

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open the Application
Navigate to `http://localhost:5173` (or the URL shown in your terminal)

## Manual Testing Steps

### Test 1: Load Sample Assignment

1. **Access Assignment Interface**
   - Look for assignment-related navigation or buttons
   - Or directly navigate to `/assignment` if the route exists

2. **Load Sample Assignment**
   - The application should have sample assignments available
   - Look for "Sample Assignment" or "Basic Feedback Loop Analysis"
   - Click to load the assignment

3. **Verify Assignment Loads**
   - Check that questions are displayed
   - Verify timer starts (if applicable)
   - Confirm all question types are present

### Test 2: Answer Questions

#### Text Question
1. Find the text question: "What is a feedback loop? Explain in your own words."
2. Type a good answer: "A feedback loop is a system where the output influences the input, creating a circular relationship that can amplify or dampen changes."
3. Verify the answer is saved

#### Number Question
1. Find the number question: "How many nodes are in your diagram?"
2. Enter: `3`
3. Verify the answer is saved

#### Multiple Choice Question
1. Find the MCQ: "What type of feedback loop did you create?"
2. Select: "Both"
3. Verify the selection is saved

#### Diagram Question
1. Find the diagram question: "Create a causal loop diagram..."
2. Use the canvas to create a diagram with:
   - At least 3 nodes (e.g., "Population", "Birth Rate", "Resources")
   - At least 2 edges with polarity (+ or -)
   - Create a loop structure
3. Verify the diagram is saved

### Test 3: Submit Assignment

1. **Review Answers**
   - Navigate through all questions
   - Verify all answers are present
   - Check that the interface shows answered/unanswered status

2. **Submit Assignment**
   - Click "Submit Assignment" button
   - Confirm submission if prompted
   - Wait for evaluation to complete

### Test 4: Review Results

1. **Check Progress Modal**
   - Verify the results modal appears
   - Check overall score display
   - Review individual question scores

2. **Analyze Feedback**
   - Read feedback for each question
   - Verify scores match expectations:
     - Text question: Should get high score for good answer
     - Number question: Should get full points for correct answer
     - MCQ: Should get full points for correct selection
     - Diagram: Should get partial/full points based on structure

3. **Check Performance Level**
   - Look for performance indicators (Excellent, Good, etc.)
   - Verify percentage calculations

## Test Scenarios

### Scenario A: Perfect Answers
- Give excellent answers to all questions
- Expected: High score (80%+), "Excellent" performance level

### Scenario B: Partial Answers
- Give mediocre answers
- Expected: Medium score (40-60%), "Good" or "Satisfactory" level

### Scenario C: Wrong Answers
- Give incorrect answers
- Expected: Low score (0-20%), "Poor" or "Needs Improvement" level

### Scenario D: Missing Answers
- Leave some questions unanswered
- Expected: Partial score, "Not attempted" status for missing questions

## Troubleshooting

### Common Issues

1. **Assignment Not Loading**
   - Check browser console for errors
   - Verify assignment files exist in `/public/assignments/`
   - Check network tab for failed requests

2. **Answers Not Saving**
   - Check if there are save buttons for each question
   - Verify local storage is working
   - Check for JavaScript errors

3. **Submission Fails**
   - Check browser console for error messages
   - Verify all required questions are answered
   - Check network connectivity

4. **Results Not Showing**
   - Check if evaluation service is working
   - Verify progress modal is triggered
   - Check for JavaScript errors in console

### Debug Information

To get more detailed information:

1. **Open Browser Developer Tools**
   - Press F12 or right-click → Inspect
   - Go to Console tab

2. **Check for Errors**
   - Look for red error messages
   - Check for failed network requests

3. **Test Evaluation Service**
   - Run the automated test script: `npm run test:evaluation`
   - Check if evaluation functions are working

## Expected Behavior

### Successful Test Results
- ✅ Assignment loads without errors
- ✅ All question types are functional
- ✅ Answers save properly
- ✅ Submission completes successfully
- ✅ Results modal shows with scores
- ✅ Feedback is meaningful and accurate
- ✅ Performance levels are appropriate

### Performance Indicators
- **Excellent (90%+)**: Perfect or near-perfect answers
- **Very Good (80-89%)**: Good answers with minor issues
- **Good (70-79%)**: Satisfactory answers
- **Satisfactory (60-69%)**: Adequate answers
- **Needs Improvement (50-59%)**: Below average answers
- **Poor (<50%)**: Poor or missing answers

## Next Steps

After completing manual testing:

1. **Run Automated Tests**
   ```bash
   npm run test:evaluation
   ```

2. **Check Test Coverage**
   - Verify all question types are tested
   - Confirm edge cases are handled

3. **Report Issues**
   - Document any bugs or unexpected behavior
   - Note areas for improvement

This manual testing approach ensures the assignment evaluation functionality works correctly from a user perspective and complements the automated testing suite. 
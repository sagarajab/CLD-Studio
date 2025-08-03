# Assignment Functionality for CLD Studio

This document describes the new assignment functionality that has been added to CLD Studio, providing a restricted mode for educational assessments with various question types and automated grading.

## Overview

The assignment functionality provides:
- **Restricted Mode**: Analysis features are disabled during assignments
- **Multiple Question Types**: Diagram, text, number, and MCQ questions
- **Automated Grading**: Compares user responses with correct answers
- **Progress Tracking**: Tracks completion status and scores
- **Timer Support**: Optional time limits for questions
- **S3 Integration**: Loads assignments from S3 bucket
- **CSV-Based Authentication**: Simple email-based access control

## Features

### 1. Assignment Types

#### Diagram Questions
- Users create causal loop diagrams on the canvas
- Grading compares adjacency matrices with correct answers
- Supports partial credit based on connection accuracy
- Auto-saves diagram changes

#### Text Questions
- Free-form text responses
- Exact text matching for grading
- Case-insensitive comparison

#### Number Questions
- Numeric input with tolerance support
- Configurable tolerance for floating-point answers

#### MCQ Questions
- Multiple choice with radio button selection
- Single correct answer validation

### 2. Assignment Mode

When in assignment mode:
- Analysis features (node analysis, connection analysis, adjacency matrix) are disabled
- Canvas is restricted to diagram creation only
- Timer displays countdown for timed questions
- Auto-save functionality preserves progress

### 3. Progress Tracking

- Real-time progress updates
- Question navigation with completion indicators
- Overall score calculation
- Assignment status tracking (not started, in progress, completed)

### 4. Authentication

- Simple CSV-based email authentication
- Approved emails stored in `public/tbt-approved-emails.csv`
- No complex database setup required
- Easy to manage access control

## File Format

Assignments are stored as `.cldq` files in the S3 bucket under `public/assignments/`. The format is JSON with the following structure:

```json
{
  "version": "1.0",
  "id": "unique-assignment-id",
  "title": "Assignment Title",
  "description": "Assignment description",
  "difficulty": "beginner|intermediate|advanced",
  "maxScore": 100,
  "deadline": "2024-12-31T23:59:59Z",
  "instructions": "General instructions for the assignment",
  "questions": [
    {
      "id": "q1",
      "questionNumber": 1,
      "questionType": "diagram|text|number|mcq",
      "questionText": "Question text",
      "problemStatement": "Optional problem statement",
      "maxScore": 25,
      "timeLimit": 10,
      "hints": ["Hint 1", "Hint 2"],
      "correctAnswer": {
        // Format depends on question type
      },
      "options": ["Option A", "Option B", "Option C", "Option D"], // For MCQ
      "diagramTemplate": "JSON string for initial diagram state" // For diagram questions
    }
  ],
  "metadata": {
    "createdBy": "instructor",
    "createdAt": "2024-01-01T00:00:00Z",
    "tags": ["beginner", "feedback-loops"],
    "estimatedTime": 30
  }
}
```

### Question Type Specific Formats

#### Diagram Questions
```json
{
  "questionType": "diagram",
  "correctAnswer": {
    "nodes": [
      {
        "id": "node1",
        "label": "Variable Name",
        "type": "variable",
        "position": { "x": 200, "y": 150 },
        "color": "#3B82F6",
        "size": 60
      }
    ],
    "edges": [
      {
        "id": "edge1",
        "source": "node1",
        "target": "node2",
        "polarity": "positive|negative",
        "type": "causal",
        "label": "Connection description"
      }
    ]
  }
}
```

#### Text Questions
```json
{
  "questionType": "text",
  "correctAnswer": {
    "text": "Expected answer text"
  }
}
```

#### Number Questions
```json
{
  "questionType": "number",
  "correctAnswer": {
    "number": 42.5,
    "tolerance": 0.01
  }
}
```

#### MCQ Questions
```json
{
  "questionType": "mcq",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": {
    "option": "Option B"
  }
}
```

## Authentication Setup

### CSV File Format

The authentication system uses a simple CSV file located at `public/tbt-approved-emails.csv`:

```csv
email,status,approved_date
instructor@tbt.edu,approved,2024-01-15
student1@tbt.edu,approved,2024-01-15
student2@tbt.edu,approved,2024-01-15
```

### Adding New Users

To add new users:
1. Edit the `public/tbt-approved-emails.csv` file
2. Add a new line with the email, status, and approval date
3. Deploy the updated file to your hosting environment

## Usage

### For Students

1. **Access Assignments**: Click the assignment button (📚) in the header menu
2. **Complete Questions**: Navigate through questions using the sidebar interface
3. **Submit**: Submit the assignment when complete

### For Instructors

1. **Create Assignment File**: Create a `.cldq` file following the format above
2. **Upload to S3**: Place the file in `public/assignments/` folder
3. **Test Assignment**: Verify the assignment loads and functions correctly
4. **Manage Access**: Update the CSV file to control user access

## Technical Implementation

### Components

- **AssignmentPanel**: Main assignment interface with question handling and navigation
- **AssignmentProgressModal**: Shows progress and scores
- **AssignmentStore**: Manages assignment state and logic
- **TBTAuthService**: Handles CSV-based authentication

### Key Features

#### Restricted Mode
- Analysis features are disabled when `mode === 'assignment'`
- Canvas remains functional for diagram creation
- Auto-save preserves user progress

#### Grading System
- **Diagram Questions**: Compares adjacency matrices for connection accuracy
- **Text Questions**: Exact string matching (case-insensitive)
- **Number Questions**: Tolerance-based comparison
- **MCQ Questions**: Option matching

#### Timer Functionality
- Optional time limits per question
- Visual countdown display
- Auto-submission when time expires

#### Progress Persistence
- Responses saved to local storage
- Progress restored when resuming assignments
- Real-time auto-save for diagram questions

#### Authentication
- CSV-based email validation
- Simple approval status tracking
- No database dependencies

## Configuration

### S3 Setup
- Assignments are loaded from `public/assignments/` folder
- Files must have `.cldq` extension
- Public read access required

### Authentication Setup
- No database setup required
- Simply update the CSV file to manage access
- File must be accessible via HTTP GET request

## Sample Assignment

A sample assignment file `sample-assignment.cldq` is included in `public/assignments/` demonstrating:
- Multiple question types
- Diagram templates
- Hints and problem statements
- Timer limits
- Various difficulty levels

## Future Enhancements

Potential improvements include:
- **Advanced Grading**: Fuzzy matching for text responses
- **Peer Review**: Student-to-student assessment
- **Analytics**: Detailed performance analytics
- **Bulk Import**: CSV/Excel import for assignments
- **Rubric System**: Detailed grading rubrics
- **Collaborative Assignments**: Group work support

## Troubleshooting

### Common Issues

1. **Assignments Not Loading**: Check S3 permissions and file format
2. **Grading Errors**: Verify correct answer format in assignment file
3. **Progress Not Saving**: Check local storage permissions
4. **Timer Issues**: Ensure timeLimit is specified in minutes
5. **Authentication Issues**: Verify email is in the CSV file and file is accessible

### Debug Mode

Enable debug mode to see detailed logging:
- Assignment loading process
- Grading calculations
- Authentication checks
- Timer functionality

## Support

For issues or questions about the assignment functionality:
1. Check the console for error messages
2. Verify assignment file format
3. Test with the sample assignment
4. Review CSV file format and accessibility 
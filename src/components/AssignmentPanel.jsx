import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Clock, Save, CheckCircle, AlertCircle, X, BookOpen, FileText, CheckSquare, Square } from 'lucide-react'
import { useCLDStore } from '../stores/cldStore'
import useAssignmentStore from '../stores/assignmentStore'
import DebugResponsesModal from './DebugResponsesModal'
import './AssignmentPanel.css'

function AssignmentPanel() {
  const { nodes, edges } = useCLDStore()
  const { 
    assignments,
    currentAssignment, 
    currentQuestion, 
    assignmentQuestions, 
    userResponses, 
    timeRemaining,
    isAssignmentMode,
    sidebarWidth,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    exitAssignment,
    switchAssignment,
    setSidebarWidth,
    loadOriginalDiagram,
    saveUserResponse,
    submitAssignment,
    assignmentProgress,
    isLoading,
    getAssignmentState,
    updateAssignmentState,
    getAssignmentProgress
  } = useAssignmentStore()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [saveStatus, setSaveStatus] = useState('') // 'saving', 'saved', 'error'

  const [isGrading, setIsGrading] = useState(false)

  const [showDebugModal, setShowDebugModal] = useState(false)
  const sidebarRef = useRef(null)

  // Helper function to get assignment display name
  const getAssignmentDisplayName = (assignment, index) => {
    return `Assignment ${index + 1}`
  }

  // Update current question index when current question changes
  useEffect(() => {
    if (currentQuestion && assignmentQuestions.length > 0) {
      const index = assignmentQuestions.findIndex(q => q.id === currentQuestion.id)
      if (index !== -1) {
        setCurrentQuestionIndex(index)
      }
    }
  }, [currentQuestion, assignmentQuestions])

  // CLD loading is now handled in the assignment store when questions are selected
  useEffect(() => {
    if (currentAssignment) {
      // CLD will be loaded when the first question is selected
    }
  }, [currentAssignment])

  const handleNext = () => {
    const nextQ = nextQuestion()
    if (nextQ) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    const prevQ = previousQuestion()
    if (prevQ) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleQuestionSelect = async (index) => {
    try {
      const question = await goToQuestion(index)
      if (question) {
        setCurrentQuestionIndex(index)
        // CLD loading is now handled in the assignment store
      }
    } catch (error) {
      console.error('Error selecting question:', error)
    }
  }



  const handleSaveResponse = async () => {
    if (currentQuestion && currentAssignment) {
      setSaveStatus('saving')
      try {
        // Get the current response
        const response = getCurrentResponse()
        
        // Save the response using the store function
        saveUserResponse(currentAssignment.id, currentQuestion.id, response)
        
        console.log('✅ Saved response for question', currentQuestion.id, ':', response)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus(''), 2000) // Clear status after 2 seconds
      } catch (error) {
        console.error('❌ Error saving response:', error)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus(''), 3000) // Clear error after 3 seconds
      }
    }
  }

  const getCurrentResponse = () => {
    if (!currentQuestion || !currentAssignment) return ''
    
    // Create the assignment-specific ID that matches how responses are stored
    const assignmentSpecificId = `${currentAssignment.id}-${currentQuestion.id}`
    
    // Get response from userResponses (global store)
    switch (currentQuestion.questionType) {
      case 'text':
        return userResponses[assignmentSpecificId]?.response || ''
      case 'nat':
        return userResponses[assignmentSpecificId]?.response || ''
      case 'mcq':
        return userResponses[assignmentSpecificId]?.response || ''
      case 'edit-cld':
        return JSON.stringify({ nodes, edges })
      case 'select-nodes':
        return userResponses[assignmentSpecificId]?.response || ''
      case 'select-connections':
        return userResponses[assignmentSpecificId]?.response || ''
      default:
        return ''
    }
  }

  const handleResetDiagram = async () => {
    // Reset the diagram to its original state
    if (currentQuestion?.originalDiagram) {
      try {
        // Load the original diagram from the assignment store
        await loadOriginalDiagram(currentQuestion.originalDiagram)
      } catch (error) {
        console.error('Error resetting diagram:', error)
      }
    }
  }

  const handleSubmit = () => {
    setShowSubmitConfirm(true)
  }

  const handleGrade = async () => {
    try {
      setIsGrading(true)
      console.log('Grading assignment with responses:', userResponses)
      
      // Submit assignment and get grading results
      const gradingResults = await submitAssignment()
      
      console.log('Grading results:', gradingResults)
    } catch (error) {
      console.error('Error during grading:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsGrading(false)
    }
  }

  const handleAssignmentSelect = async (assignment) => {
    try {
      await switchAssignment(assignment)
    } catch (error) {
      console.error('Error switching assignment:', error)
    }
  }

  const confirmSubmit = async () => {
    try {
      setIsGrading(true)
      console.log('Submitting assignment from sidebar with responses:', userResponses)
      
      // Submit assignment and get grading results
      const gradingResults = await submitAssignment()
      
      console.log('Grading results:', gradingResults)
      setShowSubmitConfirm(false)
    } catch (error) {
      console.error('Error during grading:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsGrading(false)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Helper function to count responses for current assignment only
  const getCurrentAssignmentResponseCount = () => {
    if (!currentAssignment) return 0
    
    const matchingKeys = Object.keys(userResponses).filter(key => key.startsWith(`${currentAssignment.id}-`))
    const answeredKeys = matchingKeys.filter(key => {
      const response = userResponses[key]?.response
      return response && response.trim() !== ''
    })
    

    
    return answeredKeys.length
  }

  const getQuestionStatus = (questionId) => {
    if (!currentAssignment) return 'unanswered'
    
    // Check if grading has been completed and assignment has been submitted
    if (assignmentProgress && assignmentProgress.assignmentStatus === 'submitted') {
      // Try to get question result from individual question properties
      let questionResult = assignmentProgress[questionId]
      
      // If not found, try to get from questionResults array
      if (!questionResult && assignmentProgress.questionResults) {
        const questionIndex = assignmentQuestions.findIndex(q => q.id === questionId)
        if (questionIndex !== -1) {
          questionResult = assignmentProgress.questionResults[questionIndex]
        }
      }
      
      if (questionResult) {
        // If question was answered but incorrect, show as incorrect
        if (questionResult.status === 'submitted' && !questionResult.isCorrect) {
          return 'incorrect'
        }
        // If question was answered and correct, show as answered
        if (questionResult.status === 'submitted' && questionResult.isCorrect) {
          return 'answered'
        }
        // If question was not attempted
        if (questionResult.status === 'not-attempted') {
          return 'unanswered'
        }
      }
    }
    
    // Check if question has a response (saved locally)
    const assignmentSpecificId = `${currentAssignment.id}-${questionId}`
    const response = userResponses[assignmentSpecificId]?.response
    if (response && response.trim() !== '') {
      return 'saved'
    }
    
    return 'unanswered'
  }

  // Resize handlers
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const handleMouseMove = (e) => {
    if (!isResizing) return
    
    const newWidth = window.innerWidth - e.clientX
    const minWidth = 400
    const maxWidth = 800
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  // Add and remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  if (!isAssignmentMode || !currentAssignment) {
    return null
  }

  return (
    <div 
      className={`assignment-sidebar ${isResizing ? 'resizing' : ''}`}
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Assignment List - Left Side */}
      <div className="assignment-list-panel">
        <div className="assignment-list-header">
          <div className="assignment-list-header-content">
            <h3>Assignments</h3>
            <button 
              className="control-btn close-btn assignment-list-close-btn"
              onClick={exitAssignment}
              title="Exit Assignment"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="assignment-list-content">
          {assignments.map((assignment, index) => {
            const assignmentState = getAssignmentState(assignment.id)
            const assignmentProgress = getAssignmentProgress(assignment.id)
            return (
              <button
                key={assignment.id}
                className={`assignment-list-item ${currentAssignment?.id === assignment.id ? 'active' : ''} ${!assignmentState.enabled ? 'disabled' : ''} ${assignmentState.submitted ? 'submitted' : ''}`}
                onClick={() => handleAssignmentSelect(assignment)}
                disabled={!assignmentState.enabled}
                title={`${assignment.title} - ${assignment.description}`}
              >
                <div className="assignment-list-item-content">
                  <div className="assignment-list-item-title">
                    {getAssignmentDisplayName(assignment, index)}
                  </div>
                  <div className="assignment-list-item-meta">
                    <span className="assignment-state">
                      {assignmentState.submitted ? 'Submitted' : 'Not Submitted'}
                    </span>
                    {assignmentState.graded && (
                      <span className="assignment-graded">✓ Graded</span>
                    )}
                    {assignmentState.graded && assignmentProgress && (
                      <span className="assignment-score">
                        {assignmentProgress.totalScore || 0}/{assignmentProgress.maxTotalScore || 0}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content - Right Side */}
      <div className="assignment-content-panel">
        {/* Header - Centered Layout with Question Info */}
        <div className="assignment-sidebar-header">
          <div className="header-content">
            <h3>Assignment {currentAssignment ? assignments.findIndex(a => a.id === currentAssignment.id) + 1 : ''}</h3>
            {currentQuestion && (
              <div className="question-info">
                <span className="question-number">Question {currentQuestionIndex + 1} of {assignmentQuestions.length}</span>
                <span className="question-score">{currentQuestion.maxScore} points</span>
              </div>
            )}
          </div>
          {currentQuestion && (
            <div className="question-type-badge">
              {currentQuestion.questionType.toUpperCase()}
            </div>
          )}
        </div>

        {/* Question Navigation - Moved below header */}
        <div className="question-navigation-section">
          <div className="nav-controls">
            <button 
              className="nav-btn"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              title="Previous Question"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="question-indicators">
              {assignmentQuestions.map((question, index) => (
                <button
                  key={question.id}
                  className={`question-indicator ${getQuestionStatus(question.id)} ${index === currentQuestionIndex ? 'current' : ''}`}
                  onClick={() => handleQuestionSelect(index)}
                  title={`Question ${index + 1}: ${question.questionType}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              className="nav-btn"
              onClick={handleNext}
              disabled={currentQuestionIndex === assignmentQuestions.length - 1}
              title="Next Question"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      {/* Current Question Info */}
      {currentQuestion && (
        <div className="current-question-section">
          <div className="question-content">
             <div className="problem-area">
               <h4>Problem</h4>
               <p>{currentQuestion.question}</p>
             </div>
             
             <div className="response-area">
               <h4>Response</h4>
               {renderQuestionResponse()}
             </div>
             
             {/* Assessment and Correct Answer Blocks - Only show after submission */}
             {assignmentProgress && assignmentProgress.assignmentStatus === 'submitted' && (
               <>
                 {/* Assessment Block */}
                 <div className="assessment-area">
                   <h4>Assessment</h4>
                   {(() => {
                     const questionResult = assignmentProgress[currentQuestion.id] || 
                       (assignmentProgress.questionResults && assignmentProgress.questionResults[currentQuestionIndex])
                     
                     if (questionResult) {
                       return (
                         <div className="assessment-content">
                           <div className="assessment-score">
                             <span className="score-label">Score:</span>
                             <span className="score-value">
                               {questionResult.score || 0} / {questionResult.maxScore || currentQuestion.maxScore}
                             </span>
                           </div>
                           <div className="assessment-status">
                             <span className={`status ${questionResult.isCorrect ? 'correct' : 'incorrect'}`}>
                               {questionResult.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                             </span>
                           </div>
                           {questionResult.feedback && (
                             <div className="assessment-feedback">
                               <span className="feedback-label">Feedback:</span>
                               <p>{questionResult.feedback}</p>
                             </div>
                           )}
                         </div>
                       )
                     }
                     return <p>No assessment available</p>
                   })()}
                 </div>
                 
                 {/* Correct Answer Block */}
                 <div className="correct-answer-area">
                   <h4>Correct Answer</h4>
                   <div className="correct-answer-content">
                     {currentQuestion.correctAnswer ? (
                       <p>{currentQuestion.correctAnswer}</p>
                     ) : (
                       <p>No correct answer provided</p>
                     )}
                   </div>
                 </div>
               </>
             )}
           </div>
        </div>
      )}

      {/* Bottom Controls - Control Groups Only */}
      <div className="assignment-bottom-controls">
        {/* Compact Control Group */}
        <div className="compact-control-group">
          <button 
            className="control-btn save-btn"
            onClick={handleSaveResponse}
            disabled={saveStatus === 'saving'}
            title={saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save current question response'}
          >
            <Save size={14} />
            {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved' : 'Save'}
          </button>
          
          <button 
            className="control-btn submit-btn"
            onClick={handleSubmit}
            disabled={getCurrentAssignmentResponseCount() === 0 || (assignmentProgress && assignmentProgress.assignmentStatus === 'submitted')}
            title="Submit assignment"
          >
            <CheckCircle size={14} />
            Submit
          </button>
          
          <button 
            className="control-btn grade-btn"
            onClick={handleGrade}
            disabled={getCurrentAssignmentResponseCount() === 0 || isGrading || (assignmentProgress && assignmentProgress.assignmentStatus === 'submitted')}
            title="Grade assignment (Development)"
          >
            <CheckSquare size={14} />
            {isGrading ? 'Grading' : 'Grade'}
          </button>
          
          <button 
            className="control-btn review-btn"
            onClick={() => setShowDebugModal(true)}
            title="Review: Show all responses"
          >
            <BookOpen size={14} />
            Review
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      <div 
        className="assignment-sidebar-resize-handle"
        onMouseDown={handleMouseDown}
        title="Drag to resize sidebar"
      />
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="submit-confirm-overlay">
          <div className="submit-confirm-modal">
            <div className="confirm-header">
              <AlertCircle size={24} />
              <h3>Submit Assignment?</h3>
            </div>
            <p>Are you sure you want to submit your assignment? You won't be able to make changes after submission.</p>
            <div className="confirm-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowSubmitConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={confirmSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Modal */}
      <DebugResponsesModal
        isOpen={showDebugModal}
        onClose={() => setShowDebugModal(false)}
        userResponses={userResponses}
        assignments={assignments}
      />
    </div>
  )

  function renderQuestionResponse() {
    if (!currentQuestion || !currentAssignment) return null

    // Use assignment-specific ID to match how responses are stored
    const assignmentSpecificId = `${currentAssignment.id}-${currentQuestion.id}`
    const response = userResponses[assignmentSpecificId]?.response || ''

    switch (currentQuestion.questionType) {
      case 'text':
        return (
          <textarea
            value={response}
            onChange={(e) => {
              saveUserResponse(currentAssignment.id, currentQuestion.id, e.target.value)
            }}
            placeholder="Type your answer here..."
            className="text-response"
            rows={4}
            maxLength={currentQuestion.maxLength || 1000}
            disabled={assignmentProgress && assignmentProgress.assignmentStatus === 'submitted'}
          />
        )
      
      case 'nat':
        return (
          <input
            type="number"
            value={response}
            onChange={(e) => {
              saveUserResponse(currentAssignment.id, currentQuestion.id, e.target.value)
            }}
            placeholder="Enter your answer"
            className="nat-response"
            step="any"
            disabled={assignmentProgress && assignmentProgress.assignmentStatus === 'submitted'}
          />
        )
      
      case 'mcq':
        return (
          <div className="mcq-options">
            {currentQuestion.options?.map((option, index) => (
              <label key={index} className="mcq-option">
                <input
                  type="radio"
                  name={`mcq-${currentQuestion.id}`}
                  value={option}
                  checked={response === option}
                  onChange={(e) => {
                    saveUserResponse(currentAssignment.id, currentQuestion.id, e.target.value)
                  }}
                  disabled={assignmentProgress && assignmentProgress.assignmentStatus === 'submitted'}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )
      
      case 'edit-cld':
        return (
          <div className="edit-cld-info">
            <div className="diagram-instructions">
              <p><strong>Instructions:</strong> Edit the diagram on the canvas according to the question requirements.</p>
              <p>Your changes will be automatically saved when you click "Save".</p>
            </div>
            <div className="diagram-actions">
              <button 
                className="action-btn reset-diagram-btn"
                onClick={handleResetDiagram}
                title="Reset diagram to original state"
                disabled={assignmentProgress && assignmentProgress.assignmentStatus === 'submitted'}
              >
                <FileText size={14} />
                Reset Diagram
              </button>
            </div>
          </div>
        )
      
      case 'select-nodes':
        return (
          <div className="select-nodes-info">
            <div className="diagram-instructions">
              <p><strong>Instructions:</strong> Click on the nodes in the diagram that match the question requirements.</p>
              <p>Selected nodes: {response ? JSON.parse(response).length : 0}</p>
            </div>
            {response && JSON.parse(response).length > 0 && (
              <div className="selected-items-list">
                <h5>Selected Nodes:</h5>
                <div className="selected-items">
                  {JSON.parse(response).map((nodeId, index) => (
                    <div key={index} className="selected-item-tag">
                      Node {nodeId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      
      case 'select-connections':
        return (
          <div className="select-connections-info">
            <div className="diagram-instructions">
              <p><strong>Instructions:</strong> Click on the connections in the diagram that match the question requirements.</p>
              <p>Selected connections: {response ? JSON.parse(response).length : 0}</p>
            </div>
            {response && JSON.parse(response).length > 0 && (
              <div className="selected-items-list">
                <h5>Selected Connections:</h5>
                <div className="selected-items">
                  {JSON.parse(response).map((connectionId, index) => (
                    <div key={index} className="selected-item-tag">
                      Connection {connectionId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <div>
            <p>Question type not supported: {currentQuestion.questionType}</p>
            <p>Available question types: mcq, nat, text, edit-cld, select-nodes, select-connections</p>
          </div>
        )
    }
  }
}

export default AssignmentPanel 
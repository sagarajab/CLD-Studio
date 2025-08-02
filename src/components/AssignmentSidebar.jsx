import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Clock, Save, CheckCircle, AlertCircle, X, BookOpen, FileText, CheckSquare, Square } from 'lucide-react'
import { useCLDStore } from '../stores/cldStore'
import useAssignmentStore from '../stores/assignmentStore'
import DebugResponsesModal from './DebugResponsesModal'
import './AssignmentSidebar.css'

function AssignmentSidebar() {
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
    saveUserResponse
  } = useAssignmentStore()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [saveStatus, setSaveStatus] = useState('') // 'saving', 'saved', 'error'

  const [showDebugModal, setShowDebugModal] = useState(false)
  const sidebarRef = useRef(null)

  // Update current question index when current question changes
  useEffect(() => {
    if (currentQuestion && assignmentQuestions.length > 0) {
      const index = assignmentQuestions.findIndex(q => q.id === currentQuestion.id)
      if (index !== -1) {
        setCurrentQuestionIndex(index)
      }
    }
  }, [currentQuestion, assignmentQuestions])

  // Load CLD when assignment loads
  useEffect(() => {
    if (currentAssignment) {
      // Load a random CLD for the first question
      loadRandomCLD(0)
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
        // Load a random CLD for this question
        await loadRandomCLD(index)
      }
    } catch (error) {
      console.error('Error selecting question:', error)
    }
  }

  // Load the specified CLD for every question
  const loadRandomCLD = async (questionIndex) => {
    try {
      const question = currentAssignment?.questions?.[questionIndex]
      if (!question) return
      
      // Use the specified CLD context from the question, or fall back to random
      let cldToLoad = question.cldContext
      
      if (!cldToLoad) {
        // Fallback to random selection if no cldContext specified
        const response = await fetch('/examples/index.json')
        if (response.ok) {
          const examplesData = await response.json()
          const examples = examplesData.examples
          const randomIndex = Math.floor(Math.random() * examples.length)
          cldToLoad = examples[randomIndex].id
        }
      }
      
      if (cldToLoad) {
        // Load the specified CLD from assignments directory
        const diagramResponse = await fetch(`/assignments/${cldToLoad}.cld`)
        if (diagramResponse.ok) {
          const responseText = await diagramResponse.text()
          try {
            const diagramData = JSON.parse(responseText)
            if (diagramData && typeof diagramData === 'object') {
              const cldStore = useCLDStore.getState()
              cldStore.loadDiagramData(diagramData)
            } else {
              console.error('Invalid diagram data:', cldToLoad)
            }
          } catch (parseError) {
            console.error('Error parsing JSON:', parseError)
            console.error('Response text:', responseText)
          }
        } else {
          console.error('Failed to load diagram:', cldToLoad)
        }
      } else {
        console.error('No CLD context specified and failed to load examples index')
      }
    } catch (error) {
      console.error('Error loading CLD:', error)
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

  const handleAssignmentSelect = async (assignment) => {
    try {
      await switchAssignment(assignment)
    } catch (error) {
      console.error('Error switching assignment:', error)
    }
  }

  const confirmSubmit = async () => {
    // For now, just log the submission without saving
    console.log('Submitting assignment from sidebar with responses:', userResponses)
    setShowSubmitConfirm(false)
    
    // TODO: Implement grading/assessment here
    console.log('TODO: Implement grading/assessment for responses:', userResponses)
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
    const assignmentSpecificId = `${currentAssignment.id}-${questionId}`
    const response = userResponses[assignmentSpecificId]?.response
    return response && response.trim() !== '' ? 'answered' : 'unanswered'
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
          <h3>Assignments</h3>
        </div>
        <div className="assignment-list-content">
          {assignments.map((assignment) => (
            <button
              key={assignment.id}
              className={`assignment-list-item ${currentAssignment?.id === assignment.id ? 'active' : ''}`}
              onClick={() => handleAssignmentSelect(assignment)}
              title={assignment.description}
            >
              <div className="assignment-list-item-content">
                <div className="assignment-list-item-title">{assignment.title}</div>
                <div className="assignment-list-item-meta">
                  <span>{assignment.questions?.length || 0} Q</span>
                  <span>{assignment.maxScore || 0} pts</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Right Side */}
      <div className="assignment-content-panel">
      {/* Header */}
      <div className="assignment-sidebar-header">
        <div className="assignment-title">
          <BookOpen size={16} />
          <span>{currentAssignment.title}</span>
        </div>
                 <div className="header-controls">
           <button 
             className="submit-btn-header"
             onClick={handleSubmit}
             disabled={getCurrentAssignmentResponseCount() === 0}
             title="Submit assignment"
           >
             <CheckCircle size={16} />
             Submit Assignment
           </button>
           <button 
             className="close-assignment-btn"
             onClick={exitAssignment}
             title="Exit Assignment"
           >
             <X size={16} />
           </button>
         </div>
      </div>



                           {/* Assignment Info */}
        <div className="assignment-info-section">
          <div className="info-item">
            <span className="info-label">Deadline</span>
            <span className="info-value">
              {currentAssignment.deadline ? 
                new Date(currentAssignment.deadline).toLocaleDateString() : 
                'No deadline'
              }
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Questions</span>
            <span className="info-value">{assignmentQuestions.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Progress</span>
            <span className="info-value">
              {getCurrentAssignmentResponseCount()}/{assignmentQuestions.length}
            </span>
          </div>
          {timeRemaining && (
            <div className="info-item">
              <span className="info-label">Time Left</span>
              <div className="timer-display">
                <Clock size={14} />
                <span className="timer-text">{formatTime(timeRemaining)}</span>
              </div>
              {timeRemaining < 300 && ( // Warning when less than 5 minutes
                <div className="timer-warning">
                  <AlertCircle size={12} />
                  <span>Time running out!</span>
                </div>
              )}
            </div>
          )}
        </div>

      {/* Question Navigation */}
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
          <div className="question-header">
            <h3>Question {currentQuestionIndex + 1} of {assignmentQuestions.length}</h3>
            <div className="question-meta">
              <span className="question-type">{currentQuestion.questionType.toUpperCase()}</span>
              <span className="question-score">{currentQuestion.maxScore} points</span>
            </div>
          </div>
          
                     <div className="question-content">
             <div className="problem-area">
               <h4>Problem</h4>
               <p>{currentQuestion.question}</p>
             </div>
             
             <div className="response-area">
               <h4>Response</h4>
               {renderQuestionResponse()}
             </div>
           </div>
        </div>
      )}

             {/* Action Buttons */}
       <div className="action-buttons-section">
                   <button 
            className={`action-btn save-response-btn ${saveStatus}`}
            onClick={handleSaveResponse}
            disabled={saveStatus === 'saving'}
            title={saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save current question response'}
          >
            <Save size={16} />
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
          </button>
          
          {/* Debug Button */}
          <button 
            className="action-btn debug-btn"
            onClick={() => {
              console.log('Debug button clicked!')
              console.log('userResponses object:', userResponses)
              console.log('userResponses keys:', Object.keys(userResponses))
              console.log('userResponses values:', Object.values(userResponses))
              console.log('Current assignment:', currentAssignment?.id)
              console.log('Current question:', currentQuestion?.id)
              setShowDebugModal(true)
            }}
            title="Debug: Show all responses"
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              marginLeft: '8px'
            }}
          >
            🔍 DEBUG
          </button>

         
         <div className="progress-indicator">
           <span className="progress-text">
             {getCurrentAssignmentResponseCount()} of {assignmentQuestions.length} questions answered
           </span>
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

export default AssignmentSidebar 
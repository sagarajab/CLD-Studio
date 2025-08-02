import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useCLDStore } from '../stores/cldStore'
import useAssignmentStore from '../stores/assignmentStore'
import AssignmentProgressModal from './AssignmentProgressModal'

import './AssignmentInterface.css'

function AssignmentInterface() {
  const {
    nodes,
    edges,
    setMode,
    saveDiagram
  } = useCLDStore()

  const {
    currentAssignment,
    assignmentProgress,
    isLoading,
    showProgressModal,
    setShowProgressModal,
    saveUserResponse,
    userResponses,
    assignments
  } = useAssignmentStore()

  // Local state for current question and responses
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(currentAssignment?.timeLimit || 1800)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)


  const currentQuestion = currentAssignment?.questions?.[currentQuestionIndex]
  
  // Debug logging for currentQuestion
  useEffect(() => {
    if (currentQuestion) {
      console.log('Current question updated:', {
        questionType: currentQuestion.questionType,
        questionId: currentQuestion.id,
        questionIndex: currentQuestionIndex,
        assignmentId: currentAssignment?.id,
        totalQuestions: currentAssignment?.questions?.length
      })
    }
  }, [currentQuestion, currentQuestionIndex, currentAssignment])

  // Initialize assignment when it loads
  useEffect(() => {
    if (currentAssignment) {
      setTimeRemaining(currentAssignment.timeLimit || 1800)
      setIsSubmitted(false) // Reset submission status
      setCurrentQuestionIndex(0) // Reset question index to 0 for new assignment
      loadQuestionDiagram(0) // Load diagram for the first question
    }
  }, [currentAssignment])

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted && currentAssignment) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining, isSubmitted, currentAssignment])

  // Load the specified CLD for every question
  const loadQuestionDiagram = async (questionIndex) => {
    const question = currentAssignment?.questions?.[questionIndex]
    if (!question) return

    const cldStore = useCLDStore.getState()
    
    try {
      // Load CLD for all question types - use originalDiagram if available, otherwise use cldContext
      let cldToLoad = question.originalDiagram || question.cldContext
      
      if (!cldToLoad) {
        // Fallback to a default CLD if no context specified
        cldToLoad = 'basic-feedback-loop'
        console.log('No CLD context specified, using default:', cldToLoad)
      }
      
      if (cldToLoad) {
        console.log(`Loading CLD for question ${questionIndex + 1}:`, cldToLoad)
        const filename = cldToLoad.endsWith('.cld') ? cldToLoad : `${cldToLoad}.cld`
        console.log(`Attempting to fetch: /assignments/${filename}`)
        
        // Load the specified CLD from assignments directory
        try {
          // First try to load from assignments directory
          console.log(`Attempting to fetch: /assignments/${filename}`)
          
          // Use a simple fetch configuration
          const fetchOptions = {
            method: 'GET'
          }
          
          // Add .cld extension if not present
          const filename = cldToLoad.endsWith('.cld') ? cldToLoad : `${cldToLoad}.cld`
          let diagramResponse = await fetch(`/assignments/${filename}`, fetchOptions)
          
          if (!diagramResponse.ok) {
            console.log(`Failed to load from assignments (${diagramResponse.status}), trying examples: ${filename}`)
            // Try to load from examples directory as fallback
            diagramResponse = await fetch(`/examples/${filename}`, fetchOptions)
          }
          
          if (diagramResponse.ok) {
            const responseText = await diagramResponse.text()
            console.log(`Response text preview: ${responseText.substring(0, 100)}...`)
            console.log(`Response length: ${responseText.length}`)
            console.log(`First 10 characters: "${responseText.substring(0, 10)}"`)
            
            try {
              const diagramData = JSON.parse(responseText)
              if (diagramData && typeof diagramData === 'object') {
                cldStore.loadDiagramData(diagramData)
                console.log(`Successfully loaded CLD: ${cldToLoad}`)
              } else {
                console.error('Invalid diagram data:', cldToLoad)
                cldStore.clearDiagram()
              }
            } catch (parseError) {
              console.error('Error parsing JSON:', parseError)
              console.error('Response text:', responseText)
              cldStore.clearDiagram()
            }
          } else {
            console.error(`Failed to load diagram: ${cldToLoad}. Status: ${diagramResponse.status}`)
            cldStore.clearDiagram()
          }
        } catch (fetchError) {
          console.error('Error fetching CLD file:', fetchError)
          console.error('Fetch error details:', fetchError.message)
          cldStore.clearDiagram()
        }
      } else {
        console.error('No CLD context specified and failed to load examples index')
        cldStore.clearDiagram()
      }
    } catch (error) {
      console.error('Error loading CLD:', error)
      cldStore.clearDiagram()
    }
  }

  // Set assignment mode
  useEffect(() => {
    setMode('assignment')
    return () => setMode('sandbox')
  }, [setMode])

  const handleAutoSubmit = async () => {
    // Convert assignment-specific IDs back to regular question IDs for submission
    const submissionResponses = {}
    Object.keys(userResponses).forEach(assignmentSpecificId => {
      if (assignmentSpecificId.startsWith(`${currentAssignment.id}-`)) {
        const questionId = assignmentSpecificId.replace(`${currentAssignment.id}-`, '')
        submissionResponses[questionId] = userResponses[assignmentSpecificId]?.response || ''
      }
    })
    
    console.log('Auto-submitting assignment with responses:', submissionResponses)
    setIsSubmitted(true)
    
    // TODO: Implement grading/assessment here
    console.log('TODO: Implement grading/assessment for responses:', submissionResponses)
  }

  // Navigation handlers
  const handleNext = () => {
    if (currentQuestionIndex < (currentAssignment?.questions?.length || 0) - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      loadQuestionDiagram(nextIndex)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(prevIndex)
      loadQuestionDiagram(prevIndex)
    }
  }

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index)
    loadQuestionDiagram(index)
  }

  const handleSubmit = () => {
    setShowSubmitConfirm(true)
  }

  const confirmSubmit = async () => {
    // Convert assignment-specific IDs back to regular question IDs for submission
    const submissionResponses = {}
    Object.keys(userResponses).forEach(assignmentSpecificId => {
      if (assignmentSpecificId.startsWith(`${currentAssignment.id}-`)) {
        const questionId = assignmentSpecificId.replace(`${currentAssignment.id}-`, '')
        submissionResponses[questionId] = userResponses[assignmentSpecificId]?.response || ''
      }
    })
    
    console.log('Submitting assignment with responses:', submissionResponses)
    setIsSubmitted(true)
    setShowSubmitConfirm(false)
    
    // TODO: Implement grading/assessment here
    console.log('TODO: Implement grading/assessment for responses:', submissionResponses)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionStatus = (questionId) => {
    const assignmentSpecificId = `${currentAssignment.id}-${questionId}`
    return userResponses[assignmentSpecificId]?.response && userResponses[assignmentSpecificId].response.trim() !== '' ? 'answered' : 'unanswered'
  }

  // Helper functions for CLD selection questions
  const handleDeselectNode = (nodeId) => {
    const assignmentSpecificId = `${currentAssignment.id}-${currentQuestion.id}`
    const currentResponse = userResponses[assignmentSpecificId]?.response || '[]'
    const selectedNodes = JSON.parse(currentResponse)
    const updatedNodes = selectedNodes.filter(id => id !== nodeId)
    saveUserResponse(currentAssignment.id, currentQuestion.id, JSON.stringify(updatedNodes))
  }

  const handleDeselectConnection = (connectionId) => {
    const assignmentSpecificId = `${currentAssignment.id}-${currentQuestion.id}`
    const currentResponse = userResponses[assignmentSpecificId]?.response || '[]'
    const selectedConnections = JSON.parse(currentResponse)
    const updatedConnections = selectedConnections.filter(id => id !== connectionId)
    saveUserResponse(currentAssignment.id, currentQuestion.id, JSON.stringify(updatedConnections))
  }

  // Render different question types
  const renderQuestion = () => {
    console.log('=== renderQuestion function called ===')
    if (!currentQuestion) {
      console.log('No currentQuestion available')
      return <p>No question available</p>
    }
    
    // Debug logging
    console.log('renderQuestion called with:', {
      questionType: currentQuestion.questionType,
      questionId: currentQuestion.id,
      currentQuestionIndex,
      assignmentId: currentAssignment?.id
    })
    
    // Use assignment-specific question ID to avoid conflicts between assignments
    const assignmentSpecificId = `${currentAssignment.id}-${currentQuestion.id}`
    const response = userResponses[assignmentSpecificId]?.response || ''

    switch (currentQuestion.questionType) {
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
      
      case 'nat':
        return (
          <div className="nat-response">
            <input
              type="number"
              value={response}
              onChange={(e) => {
                saveUserResponse(currentAssignment.id, currentQuestion.id, e.target.value)
              }}
              placeholder="Enter your answer"
              step="any"
            />
            {currentQuestion.tolerance && (
              <div className="nat-tolerance-info">
                Tolerance: ±{currentQuestion.tolerance}
              </div>
            )}
          </div>
        )
      
      case 'text':
        return (
          <div className="text-response">
            <textarea
              value={response}
              onChange={(e) => {
                saveUserResponse(currentAssignment.id, currentQuestion.id, e.target.value)
              }}
              placeholder="Type your answer here..."
              rows={6}
              maxLength={currentQuestion.maxLength || 1000}
            />
            {currentQuestion.maxLength && (
              <div className="character-count">
                {response.length}/{currentQuestion.maxLength} characters
              </div>
            )}
          </div>
        )
      
      case 'edit-cld':
        return (
          <div className="edit-cld-response">
            <div className="edit-cld-instructions">
              <h4>Instructions</h4>
              <p>Modify the diagram below according to the question requirements.</p>
              <ul>
                <li>Click and drag to move nodes</li>
                <li>Double-click nodes to edit labels</li>
                <li>Click connections to change polarity (+/-)</li>
                <li>Use toolbar to add/remove nodes and connections</li>
              </ul>
            </div>
            
            <div className="cld-canvas-container">
              {/* Canvas will be rendered by parent component */}
            </div>
            
            <div className="edit-cld-status">
              <p>Nodes: {nodes.length} | Connections: {edges.length}</p>
              <p>Status: {nodes.length > 0 || edges.length > 0 ? 'Diagram loaded' : 'No diagram loaded'}</p>
            </div>
          </div>
        )
      
      case 'select-nodes':
        return (
          <div className="select-nodes-response">
            <div className="select-nodes-instructions">
              <h4>Instructions</h4>
              <p>Click on the nodes that match the question requirements.</p>
              <p>Selected nodes: {response ? JSON.parse(response).length : 0}</p>
            </div>
            
            <div className="cld-canvas-container">
              {/* Canvas will be rendered by parent component */}
            </div>
            
            <div className="selected-nodes-display">
              <h5>Selected Nodes:</h5>
              {response ? (
                <div className="selected-nodes-list">
                  {JSON.parse(response).map((nodeId, index) => (
                    <div key={index} className="selected-node-tag">
                      Node {nodeId}
                      <button onClick={() => handleDeselectNode(nodeId)}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-nodes-selected">No nodes selected</p>
              )}
            </div>
          </div>
        )
      
      case 'select-connections':
        return (
          <div className="select-connections-response">
            <div className="select-connections-instructions">
              <h4>Instructions</h4>
              <p>Click on the connections that match the question requirements.</p>
              <p>Selected connections: {response ? JSON.parse(response).length : 0}</p>
            </div>
            
            <div className="cld-canvas-container">
              {/* Canvas will be rendered by parent component */}
            </div>
            
            <div className="selected-connections-display">
              <h5>Selected Connections:</h5>
              {response ? (
                <div className="selected-connections-list">
                  {JSON.parse(response).map((connectionId, index) => (
                    <div key={index} className="selected-connection-tag">
                      Connection {connectionId}
                      <button onClick={() => handleDeselectConnection(connectionId)}>×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-connections-selected">No connections selected</p>
              )}
            </div>
          </div>
        )
      
      default:
        return (
          <div>
            <p>Question type not supported: {currentQuestion.questionType}</p>
            <p>Debug info: Question ID: {currentQuestion.id}, Index: {currentQuestionIndex}</p>
            <p>Available question types: mcq, nat, text, edit-cld, select-nodes, select-connections</p>
          </div>
        )
    }
  }

  if (!currentAssignment) {
    return (
      <div className="assignment-interface">
        <div className="loading-message">
          <p>Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted && assignmentProgress) {
    return (
      <div className="assignment-completed">
        <div className="completion-content">
          <CheckCircle size={48} className="completion-icon" />
          <h2>Assignment Submitted!</h2>
          <p>Thank you for completing the assignment.</p>
          <div className="completion-stats">
            <p>Questions answered: {Object.keys(userResponses).filter(id => id.startsWith(`${currentAssignment.id}-`) && userResponses[id]?.response && userResponses[id].response.trim() !== '').length}/{currentAssignment.questions.length}</p>
            <p>Total score: {assignmentProgress.totalScore || 0}/{assignmentProgress.maxTotalScore || 0}</p>
          </div>
          <button 
            className="view-results-button"
            onClick={() => setShowProgressModal(true)}
          >
            View Detailed Results
          </button>
        </div>
      </div>
    )
  }

  console.log('AssignmentInterface render - currentAssignment:', currentAssignment)
  console.log('AssignmentInterface render - currentQuestion:', currentQuestion)
  
  return (
    <div className="assignment-interface" key={currentAssignment?.id || 'no-assignment'}>
      {/* Header */}
      <div className="assignment-header">
        <div className="assignment-info">
          <h1>{currentAssignment.title}</h1>
          <p>{currentAssignment.description}</p>
        </div>
        
        <div className="assignment-timer">
          <Clock size={20} />
          <span className={timeRemaining < 300 ? 'time-warning' : ''}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / currentAssignment.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Navigation */}
      <div className="question-nav">
        <button 
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        
        <div className="question-indicators">
          {currentAssignment.questions.map((q, index) => (
            <button
              key={q.id}
              className={`question-indicator ${getQuestionStatus(q.id)} ${index === currentQuestionIndex ? 'current' : ''}`}
              onClick={() => handleQuestionClick(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button 
          className="nav-button"
          onClick={handleNext}
          disabled={currentQuestionIndex === currentAssignment.questions.length - 1}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Question Content */}
      <div className="question-content">
        <div className="question-header">
          <h2>Question {currentQuestionIndex + 1} of {currentAssignment.questions.length}</h2>
          <span className="question-type">{currentQuestion?.questionType?.toUpperCase()}</span>
          <span className="question-score">{currentQuestion?.maxScore} points</span>
        </div>
        
        <div className="question-text">
          <p>{currentQuestion?.question}</p>
        </div>

        <div className="question-response" key={`${currentAssignment?.id}-${currentQuestion?.id}`}>
          {console.log('About to call renderQuestion, currentQuestion:', currentQuestion)}
          {renderQuestion()}
        </div>
      </div>

      

                                                                                                                                                                                                                               {/* Submit Button */}
           <div className="submit-section">
             <button 
               className="submit-button"
               onClick={handleSubmit}
               disabled={isLoading}
             >
               {isLoading ? 'Submitting...' : 'Submit Assignment'}
             </button>
           </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="submit-confirmation-overlay">
          <div className="submit-confirmation">
            <div className="confirmation-header">
              <AlertCircle size={20} />
              <h3>Submit Assignment?</h3>
            </div>
            <p>Are you sure you want to submit your assignment? You won't be able to make changes after submission.</p>
            <div className="confirmation-actions">
              <button 
                onClick={() => setShowSubmitConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm"
                onClick={confirmSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

             {/* Progress Modal */}
       <AssignmentProgressModal
         isOpen={showProgressModal}
         onClose={() => setShowProgressModal(false)}
         assignmentProgress={assignmentProgress}
         assignment={currentAssignment}
       />

       
     </div>
   )
 }

export default AssignmentInterface 
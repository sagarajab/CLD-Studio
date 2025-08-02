import React from 'react'
import { X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import './DebugResponsesModal.css'

function DebugResponsesModal({ isOpen, onClose, userResponses, assignments }) {
  if (!isOpen) return null



  // Organize responses by assignment
  const responsesByAssignment = {}
  
  Object.keys(userResponses).forEach(key => {
    // Split by last occurrence of '-' to handle assignment IDs with hyphens
    const lastDashIndex = key.lastIndexOf('-')
    if (lastDashIndex !== -1) {
      const assignmentId = key.substring(0, lastDashIndex)
      const questionId = key.substring(lastDashIndex + 1)
      if (!responsesByAssignment[assignmentId]) {
        responsesByAssignment[assignmentId] = {}
      }
      responsesByAssignment[assignmentId][questionId] = userResponses[key]
    }
  })

  const getAssignmentTitle = (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    return assignment ? assignment.title : assignmentId
  }

  const getQuestionText = (assignmentId, questionId) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    if (!assignment) return questionId
    
    const question = assignment.questions.find(q => q.id === questionId)
    return question ? question.question.substring(0, 100) + (question.question.length > 100 ? '...' : '') : questionId
  }

  return (
    <div className="debug-modal-overlay">
      <div className="debug-modal">
        <div className="debug-modal-header">
          <div className="debug-modal-title">
            <FileText size={20} />
            <h3>Debug: All Assignment Responses</h3>
          </div>
          <button className="debug-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="debug-modal-content">
          {Object.keys(responsesByAssignment).length === 0 ? (
            <div className="no-responses">
              <AlertCircle size={48} />
              <p>No responses found</p>
            </div>
          ) : (
            Object.keys(responsesByAssignment).map(assignmentId => {
              const assignmentResponses = responsesByAssignment[assignmentId]
              const assignmentTitle = getAssignmentTitle(assignmentId)
              const responseCount = Object.keys(assignmentResponses).length
              const answeredCount = Object.values(assignmentResponses).filter(r => r?.response && r.response.trim() !== '').length

              return (
                <div key={assignmentId} className="assignment-section">
                  <div className="assignment-header">
                    <h4>{assignmentTitle}</h4>
                    <div className="assignment-stats">
                      <span className="stat">
                        <CheckCircle size={14} />
                        {answeredCount} answered
                      </span>
                      <span className="stat">
                        <FileText size={14} />
                        {responseCount} total
                      </span>
                    </div>
                  </div>

                  <div className="questions-list">
                    {Object.keys(assignmentResponses).map(questionId => {
                      const responseObj = assignmentResponses[questionId]
                      const responseText = responseObj?.response || ''
                      const hasResponse = responseText && responseText.trim() !== ''
                      const questionText = getQuestionText(assignmentId, questionId)

                      return (
                        <div key={questionId} className={`question-item ${hasResponse ? 'answered' : 'unanswered'}`}>
                          <div className="question-header">
                            <span className="question-id">{questionId}</span>
                            <span className="response-status">
                              {hasResponse ? (
                                <CheckCircle size={14} className="answered-icon" />
                              ) : (
                                <AlertCircle size={14} className="unanswered-icon" />
                              )}
                            </span>
                          </div>
                          <div className="question-text">{questionText}</div>
                          <div className="response-text">
                            {hasResponse ? (
                              <span className="response-content">{responseText}</span>
                            ) : (
                              <span className="no-response">No response</span>
                            )}
                          </div>
                          {responseObj?.timestamp && (
                            <div className="response-timestamp">
                              Saved: {new Date(responseObj.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="debug-modal-footer">
          <button className="debug-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DebugResponsesModal 
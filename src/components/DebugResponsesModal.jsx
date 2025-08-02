import React, { useState } from 'react'
import { X, FileText, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import './DebugResponsesModal.css'

function DebugResponsesModal({ isOpen, onClose, userResponses, assignments }) {
  const [collapsedAssignments, setCollapsedAssignments] = useState(new Set())
  
  if (!isOpen) return null

  // Organize responses by assignment and include all questions
  const responsesByAssignment = {}
  
  // First, initialize all assignments with their questions
  assignments.forEach(assignment => {
    responsesByAssignment[assignment.id] = {}
    assignment.questions.forEach(question => {
      responsesByAssignment[assignment.id][question.id] = null
    })
  })
  
  // Then, populate with actual responses
  Object.keys(userResponses).forEach(key => {
    const lastDashIndex = key.lastIndexOf('-')
    if (lastDashIndex !== -1) {
      const assignmentId = key.substring(0, lastDashIndex)
      const questionId = key.substring(lastDashIndex + 1)
      if (responsesByAssignment[assignmentId]) {
        responsesByAssignment[assignmentId][questionId] = userResponses[key]
      }
    }
  })

  const getAssignmentNumber = (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    if (!assignment) return assignmentId
    
    const match = assignmentId.match(/assignment-(\d+)/)
    return match ? parseInt(match[1], 10).toString() : assignmentId
  }

  const getAssignmentTitle = (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    return assignment ? assignment.title : assignmentId
  }

  const toggleAssignment = (assignmentId) => {
    setCollapsedAssignments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId)
      } else {
        newSet.add(assignmentId)
      }
      return newSet
    })
  }

  const isAssignmentCollapsed = (assignmentId) => {
    return collapsedAssignments.has(assignmentId)
  }

  // Calculate summary statistics
  const summary = {
    totalAssignments: Object.keys(responsesByAssignment).length,
    totalQuestions: 0,
    answeredQuestions: 0,
    unansweredQuestions: 0
  }

  Object.keys(responsesByAssignment).forEach(assignmentId => {
    const questions = Object.keys(responsesByAssignment[assignmentId])
    summary.totalQuestions += questions.length
    
    questions.forEach(questionId => {
      const response = responsesByAssignment[assignmentId][questionId]
      const hasResponse = response?.response && response.response.trim() !== ''
      if (hasResponse) {
        summary.answeredQuestions++
      } else {
        summary.unansweredQuestions++
      }
    })
  })

  return (
    <div className="debug-modal-overlay">
      <div className="debug-modal compact">
        <div className="debug-modal-header">
          <div className="debug-modal-title">
            <FileText size={20} />
            <h3>Responses</h3>
          </div>
          <button className="debug-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="debug-modal-content">
          {/* Summary Section */}
          <div className="summary-section">
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-label">Assignments:</span>
                <span className="stat-value">{summary.totalAssignments}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Total Questions:</span>
                <span className="stat-value">{summary.totalQuestions}</span>
              </div>
              <div className="summary-stat answered">
                <span className="stat-label">Answered:</span>
                <span className="stat-value">
                  <CheckCircle size={14} />
                  {summary.answeredQuestions}
                </span>
              </div>
              <div className="summary-stat unanswered">
                <span className="stat-label">Unanswered:</span>
                <span className="stat-value">
                  <AlertCircle size={14} />
                  {summary.unansweredQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* Responses by Assignment */}
          {Object.keys(responsesByAssignment).length === 0 ? (
            <div className="no-responses">
              <p>No responses found</p>
            </div>
          ) : (
            <div className="assignments-list">
              {Object.keys(responsesByAssignment).map(assignmentId => {
                const assignmentResponses = responsesByAssignment[assignmentId]
                const assignmentNumber = getAssignmentNumber(assignmentId)
                const assignmentTitle = getAssignmentTitle(assignmentId)
                
                // Calculate assignment-specific stats
                const assignmentQuestions = Object.keys(assignmentResponses)
                const answeredCount = assignmentQuestions.filter(qId => {
                  const response = assignmentResponses[qId]
                  return response?.response && response.response.trim() !== ''
                }).length

                                 return (
                   <div key={assignmentId} className="assignment-group">
                     <div className="assignment-header" onClick={() => toggleAssignment(assignmentId)}>
                       <div className="assignment-info">
                         <span className="assignment-number">A{assignmentNumber}</span>
                         <span className="assignment-title">{assignmentTitle}</span>
                       </div>
                       <div className="assignment-stats">
                         <span className="answered-count">
                           <CheckCircle size={12} />
                           {answeredCount}/{assignmentQuestions.length}
                         </span>
                         <button className="collapse-toggle">
                           {isAssignmentCollapsed(assignmentId) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                         </button>
                       </div>
                     </div>
                     
                     {!isAssignmentCollapsed(assignmentId) && (
                       <div className="questions-list">
                         {assignmentQuestions.map(questionId => {
                           const responseObj = assignmentResponses[questionId]
                           const responseText = responseObj?.response || ''
                           const hasResponse = responseText && responseText.trim() !== ''

                           return (
                             <div key={questionId} className={`compact-response-item ${hasResponse ? 'answered' : 'unanswered'}`}>
                               <span className="question-label">Q{questionId.replace('q', '')}:</span>
                               <span className="response-text">
                                 {hasResponse ? responseText : 'No response'}
                               </span>
                             </div>
                           )
                         })}
                       </div>
                     )}
                   </div>
                 )
              })}
            </div>
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
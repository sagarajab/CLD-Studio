import React, { useState } from 'react';
import './AssignmentProgressModal.css';

const AssignmentProgressModal = ({ isOpen, onClose, assignmentProgress, assignment }) => {
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  if (!isOpen || !assignmentProgress) return null;

  const getQuestionStatus = (questionId) => {
    const questionProgress = assignmentProgress[questionId];
    if (!questionProgress) return 'not-attempted';
    return questionProgress.status;
  };

  const getQuestionScore = (questionId) => {
    const questionProgress = assignmentProgress[questionId];
    if (!questionProgress) return { score: 0, maxScore: 0 };
    return {
      score: questionProgress.score || 0,
      maxScore: questionProgress.maxScore || 0
    };
  };

  const getQuestionFeedback = (questionId) => {
    const questionProgress = assignmentProgress[questionId];
    return questionProgress?.feedback || 'No feedback available.';
  };

  const getQuestionDetails = (questionId) => {
    const questionProgress = assignmentProgress[questionId];
    return questionProgress?.details || {};
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'green';
      case 'not-attempted':
        return 'gray';
      default:
        return 'orange';
    }
  };

  const getScorePercentage = (score, maxScore) => {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 100);
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { level: 'Excellent', color: '#10b981', icon: '🏆' };
    if (percentage >= 80) return { level: 'Very Good', color: '#059669', icon: '🎉' };
    if (percentage >= 70) return { level: 'Good', color: '#0d9488', icon: '👍' };
    if (percentage >= 60) return { level: 'Satisfactory', color: '#f59e0b', icon: '✅' };
    if (percentage >= 50) return { level: 'Needs Improvement', color: '#f97316', icon: '⚠️' };
    return { level: 'Poor', color: '#ef4444', icon: '❌' };
  };

  const toggleQuestionExpansion = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const totalScore = assignmentProgress.totalScore || 0;
  const maxTotalScore = assignmentProgress.maxTotalScore || 0;
  const totalPercentage = getScorePercentage(totalScore, maxTotalScore);
  const performance = getPerformanceLevel(totalPercentage);

  return (
    <div className="assignment-progress-modal-overlay">
      <div className="assignment-progress-modal">
        <div className="modal-header">
          <h2>Assignment Results</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Overall Score */}
          <div className="overall-score-section">
            <h3>Overall Performance</h3>
            <div className="score-display">
              <div className="score-circle" style={{ borderColor: performance.color }}>
                <span className="score-number">{totalScore}</span>
                <span className="score-max">/ {maxTotalScore}</span>
              </div>
              <div className="score-details">
                <div className="score-percentage" style={{ color: performance.color }}>
                  {totalPercentage}%
                </div>
                <div className="performance-level">
                  <span className="performance-icon">{performance.icon}</span>
                  <span className="performance-text">{performance.level}</span>
                </div>
              </div>
            </div>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ 
                  width: `${totalPercentage}%`,
                  backgroundColor: performance.color
                }}
              ></div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="questions-breakdown">
            <h3>Question Breakdown</h3>
            <div className="questions-list">
              {assignment?.questions?.map((question, index) => {
                const status = getQuestionStatus(question.id);
                const { score, maxScore } = getQuestionScore(question.id);
                const percentage = getScorePercentage(score, maxScore);
                const feedback = getQuestionFeedback(question.id);
                const details = getQuestionDetails(question.id);
                const isExpanded = expandedQuestions.has(question.id);
                const questionPerformance = getPerformanceLevel(percentage);
                
                return (
                  <div key={question.id} className="question-result">
                    <div 
                      className="question-header"
                      onClick={() => toggleQuestionExpansion(question.id)}
                    >
                      <div className="question-basic-info">
                        <span className="question-number">Q{index + 1}</span>
                        <span className="question-type">{question.questionType}</span>
                        <span className={`question-status ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      
                      <div className="question-score-summary">
                        <div className="score-info">
                          <span className="score-text">{score} / {maxScore}</span>
                          <span className="score-percentage">({percentage}%)</span>
                        </div>
                        <div className="mini-score-bar">
                          <div 
                            className="mini-score-fill" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: questionPerformance.color
                            }}
                          ></div>
                        </div>
                        <button className="expand-button">
                          {isExpanded ? '−' : '+'}
                        </button>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="question-details">
                        <div className="question-content">
                          <p className="question-text">{question.question}</p>
                          
                          <div className="feedback-section">
                            <h4>Feedback</h4>
                            <p className="feedback-text">{feedback}</p>
                          </div>

                          {Object.keys(details).length > 0 && (
                            <div className="details-section">
                              <h4>Details</h4>
                              <div className="details-grid">
                                {Object.entries(details).map(([key, value]) => (
                                  <div key={key} className="detail-item">
                                    <span className="detail-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                                    <span className="detail-value">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Feedback */}
          <div className="feedback-section">
            <h3>Overall Feedback</h3>
            <div className="feedback-content">
              {totalPercentage >= 90 ? (
                <div className="feedback-excellent">
                  <span className="feedback-icon">🏆</span>
                  <div className="feedback-text">
                    <h4>Outstanding Performance!</h4>
                    <p>You've demonstrated exceptional understanding of the concepts. Your work shows mastery of the material covered in this assignment.</p>
                  </div>
                </div>
              ) : totalPercentage >= 80 ? (
                <div className="feedback-very-good">
                  <span className="feedback-icon">🎉</span>
                  <div className="feedback-text">
                    <h4>Very Good Work!</h4>
                    <p>You've shown a strong grasp of the concepts. Review any areas where you lost points to further improve your understanding.</p>
                  </div>
                </div>
              ) : totalPercentage >= 70 ? (
                <div className="feedback-good">
                  <span className="feedback-icon">👍</span>
                  <div className="feedback-text">
                    <h4>Good Effort!</h4>
                    <p>You've demonstrated solid understanding in most areas. Focus on the questions you missed to strengthen your knowledge.</p>
                  </div>
                </div>
              ) : totalPercentage >= 60 ? (
                <div className="feedback-satisfactory">
                  <span className="feedback-icon">✅</span>
                  <div className="feedback-text">
                    <h4>Satisfactory Performance</h4>
                    <p>You've shown basic understanding but there's room for improvement. Review the material and consider retaking the assignment.</p>
                  </div>
                </div>
              ) : totalPercentage >= 50 ? (
                <div className="feedback-needs-improvement">
                  <span className="feedback-icon">⚠️</span>
                  <div className="feedback-text">
                    <h4>Needs Improvement</h4>
                    <p>You need to review the material more thoroughly. Consider seeking additional help or clarification on the concepts.</p>
                  </div>
                </div>
              ) : (
                <div className="feedback-poor">
                  <span className="feedback-icon">❌</span>
                  <div className="feedback-text">
                    <h4>Requires Significant Improvement</h4>
                    <p>You need to spend more time studying the material. Consider reviewing the basics before attempting the assignment again.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="primary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentProgressModal; 
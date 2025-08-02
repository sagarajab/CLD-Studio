import React, { useState, useEffect } from 'react';
import { AssessmentService } from '../services/assessmentService';
import './UserProgressDashboard.css';

const UserProgressDashboard = ({ userEmail }) => {
  const [assessmentData, setAssessmentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAssessmentData();
  }, [userEmail]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);
      const data = await AssessmentService.getAllAssessmentData(userEmail);
      setAssessmentData(data);
    } catch (err) {
      setError('Failed to load assessment data');
      console.error('Error loading assessment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignmentId) => {
    const assignment = assessmentData[assignmentId];
    if (!assignment) return 'not-attempted';
    return assignment.assignmentStatus || 'not-attempted';
  };

  const getAssignmentScore = (assignmentId) => {
    const assignment = assessmentData[assignmentId];
    if (!assignment) return { score: 0, maxScore: 0 };
    return {
      score: assignment.totalScore || 0,
      maxScore: assignment.maxTotalScore || 0
    };
  };

  const getQuestionStatus = (assignmentId, questionId) => {
    const assignment = assessmentData[assignmentId];
    if (!assignment || !assignment[questionId]) return 'not-attempted';
    return assignment[questionId].status;
  };

  const getQuestionScore = (assignmentId, questionId) => {
    const assignment = assessmentData[assignmentId];
    if (!assignment || !assignment[questionId]) return { score: 0, maxScore: 0 };
    return {
      score: assignment[questionId].score || 0,
      maxScore: assignment[questionId].maxScore || 0
    };
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

  if (loading) {
    return (
      <div className="user-progress-dashboard">
        <div className="loading">Loading assessment data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-progress-dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  const assignmentIds = Object.keys(assessmentData);

  return (
    <div className="user-progress-dashboard">
      <h2>Assessment Progress</h2>
      
      {assignmentIds.length === 0 ? (
        <div className="no-assignments">
          <p>No assignments attempted yet.</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignmentIds.map(assignmentId => {
            const status = getAssignmentStatus(assignmentId);
            const { score, maxScore } = getAssignmentScore(assignmentId);
            const percentage = getScorePercentage(score, maxScore);
            
            return (
              <div key={assignmentId} className="assignment-card">
                <div className="assignment-header">
                  <h3>{assignmentId}</h3>
                  <span className={`status ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>
                
                <div className="assignment-score">
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="score-text">
                    {score} / {maxScore} ({percentage}%)
                  </div>
                </div>
                
                <div className="questions-summary">
                  {Object.keys(assessmentData[assignmentId]).map(questionId => {
                    if (questionId === 'totalScore' || questionId === 'maxTotalScore' || questionId === 'assignmentStatus') {
                      return null;
                    }
                    
                    const questionStatus = getQuestionStatus(assignmentId, questionId);
                    const questionScore = getQuestionScore(assignmentId, questionId);
                    
                    return (
                      <div key={questionId} className="question-item">
                        <span className="question-id">{questionId}</span>
                        <span className={`question-status ${getStatusColor(questionStatus)}`}>
                          {questionStatus}
                        </span>
                        <span className="question-score">
                          {questionScore.score}/{questionScore.maxScore}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserProgressDashboard; 
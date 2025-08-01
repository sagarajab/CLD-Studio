import { useState, useEffect } from 'react';
import { useTBTAuthStore } from '../stores/tbtAuthStore';
import { useUserProgressStore } from '../stores/userProgressStore';
import { getDataClient } from '../config/dataClientConfig';

export default function UserProgressDashboard() {
  const { user } = useTBTAuthStore();
  const { currentSession } = useUserProgressStore();
  const [userStats, setUserStats] = useState(null);
  const [userAssignments, setUserAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    setLoading(true);
    try {
      const dataClient = getDataClient();
      
      // Load user stats
      const { data: userData } = await dataClient.models.TBTUser.list({
        filter: { id: { eq: user.id } }
      });

      const users = userData || [];
      if (users.length > 0) {
        setUserStats(users[0]);
      }

      // Load user assignments
      const { data: assignmentData } = await dataClient.models.UserAssignment.list({
        filter: { userId: { eq: user.id } }
      });
      
      const assignments = assignmentData || [];
      setUserAssignments(assignments);
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div>Loading progress...</div>;
  }

  if (!userStats) {
    return <div>No progress data available</div>;
  }

  return (
    <div className="user-progress-dashboard">
      <h2>Your Progress</h2>
      
      {/* Authentication Status */}
      <div className="progress-section">
        <h3>Authentication Status</h3>
        <div className="auth-status-grid">
          <div className="status-item">
            <span className="label">amplify_Auth:</span>
            <span className={`value ${userStats.amplifyAuthVerified ? 'success' : 'error'}`}>
              {userStats.amplifyAuthVerified ? '✅ Verified' : '❌ Failed'}
            </span>
          </div>
          <div className="status-item">
            <span className="label">tbt_auth:</span>
            <span className={`value ${userStats.tbtAuthStatus}`}>
              {userStats.tbtAuthStatus}
            </span>
          </div>
          <div className="status-item">
            <span className="label">Access Level:</span>
            <span className="value">{userStats.accessLevel}</span>
          </div>
        </div>
      </div>

      {/* Login Statistics */}
      <div className="progress-section">
        <h3>Login Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{userStats.totalLogins || 0}</span>
            <span className="stat-label">Total Logins</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userStats.consecutiveLogins || 0}</span>
            <span className="stat-label">Consecutive Days</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatTime(userStats.totalActiveTime || 0)}</span>
            <span className="stat-label">Total Active Time</span>
          </div>
        </div>
      </div>

      {/* Current Session */}
      <div className="progress-section">
        <h3>Current Session</h3>
        <div className="session-info">
          <p>Session Start: {userStats.currentSessionStart ? new Date(userStats.currentSessionStart).toLocaleString() : 'N/A'}</p>
          <p>Active Time: {formatTime(currentSession?.activeTime || 0)}</p>
          <p>Actions: {currentSession?.actions?.length || 0}</p>
        </div>
      </div>

      {/* Assignment Progress */}
      <div className="progress-section">
        <h3>Assignment Progress</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{userStats.assignmentsCompleted || 0}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userStats.assignmentsInProgress || 0}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{(userStats.averageAssignmentScore || 0).toFixed(1)}</span>
            <span className="stat-label">Avg Score</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userStats.highestAssignmentScore || 0}</span>
            <span className="stat-label">Best Score</span>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="progress-section">
        <h3>Learning Progress</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{userStats.diagramsCreated || 0}</span>
            <span className="stat-label">Diagrams Created</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userStats.simulationsRun || 0}</span>
            <span className="stat-label">Simulations Run</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userStats.loopsIdentified || 0}</span>
            <span className="stat-label">Loops Identified</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userStats.learningLevel || 'beginner'}</span>
            <span className="stat-label">Learning Level</span>
          </div>
        </div>
      </div>

      {/* Recent Assignments */}
      {userAssignments.length > 0 && (
        <div className="progress-section">
          <h3>Recent Assignments</h3>
          <div className="assignments-list">
            {userAssignments.slice(0, 5).map(assignment => (
              <div key={assignment.id} className="assignment-item">
                <span className="assignment-title">Assignment {assignment.assignmentId}</span>
                <span className={`assignment-status ${assignment.status}`}>
                  {assignment.status}
                </span>
                {assignment.score > 0 && (
                  <span className="assignment-score">{assignment.score}/{assignment.maxScore}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
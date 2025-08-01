import React, { memo } from 'react'
import { MailCheck, TreeDeciduous } from 'lucide-react'

const StatusBar = memo(({ 
  nodes, 
  edges, 
  loops, 
  eventsLog, 
  user, 
  amplifyAuthVerified, 
  tbtAuthStatus
}) => {
  return (
    <div className="status-bar">
      <div className="status-left">
        {/* Events Log - Message console at extreme left */}
        <div className="status-item events">
          <div className="events-log">
            {eventsLog.length > 0 ? (
              <span className="event-item" title={eventsLog[0].timestamp}>
                {eventsLog[0].message}
              </span>
            ) : (
              <span className="status-text">No recent events</span>
            )}
          </div>
        </div>
        
        {/* Normal text labels for stats */}
        <div className="status-stats-container">
          <span>
            <span className="status-stat-label">Variables</span> 
            <span className="status-stat-value">{nodes.length}</span>
          </span>
          <div className="status-separator"></div>
          <span>
            <span className="status-stat-label">Connections</span> 
            <span className="status-stat-value">{edges.length}</span>
          </span>
          <div className="status-separator"></div>
          <span>
            <span className="status-stat-label">Loops</span> 
            <span className="status-stat-value">{loops.length}</span>
          </span>
        </div>
      </div>
      <div className="status-right">
        <div className="status-user-session-auth">
          <span>User: <b>{user?.signInDetails?.loginId || user?.attributes?.email || 'Guest'}</b></span>
          <div className="status-separator"></div>
          <div className="auth-status-indicators">
            <div className={`auth-icon amplify ${amplifyAuthVerified ? 'authenticated' : 'not-authenticated'}`}>
              <MailCheck size={16} />
            </div>
            <div className={`auth-icon tbt ${tbtAuthStatus === 'tbt' ? 'authenticated' : 'not-authenticated'}`}>
              <TreeDeciduous size={16} />
            </div>
          </div>
          <div className="status-separator"></div>
          <span className="access-level-text">
            {amplifyAuthVerified && tbtAuthStatus === 'tbt' ? 'TBTuser' : 'Guest'}
          </span>
        </div>
        

      </div>
    </div>
  )
})

StatusBar.displayName = 'StatusBar'

export default StatusBar 
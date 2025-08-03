import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import './TBTAuthLoadingScreen.css';
import appIcon from '../assets/app_n_tbt_icon.png';

const TBTAuthLoadingScreen = ({ userEmail, tbtAuthStatus, isLoading, onContinue }) => {
  // Show loading screen if we have a user email
  if (!userEmail) {
    return null;
  }

  // Determine the current state
  const isInitialLoading = isLoading;

  const getStatusMessage = () => {
    if (isInitialLoading) {
      return {
        title: 'Authenticating...',
        type: 'loading'
      };
    } else if (tbtAuthStatus === 'tbt') {
      return {
        icon: CheckCircle,
        type: 'success',
        userType: 'TBT User'
      };
    } else {
      return {
        icon: AlertCircle,
        type: 'info',
        userType: 'Guest'
      };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="tbt-auth-loading-screen">
      <div className="auth-container">
        {/* Logo/Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <img src={appIcon} alt="CLD Studio" className="logo-icon" />
          </div>
        </div>

        {/* Simple Status Message */}
        <div className="status-section">
          {!isInitialLoading && (
            <div className={`status-icon ${statusInfo.type}`}>
              <statusInfo.icon className="status-icon-inner" />
            </div>
          )}
          
          <div className="status-content">
            {isInitialLoading && (
              <h2 className="status-title">{statusInfo.title}</h2>
            )}
            
            {!isInitialLoading && (
              <div className="user-identification">
                <p className="identification-label">You are identified as:</p>
                <div className={`user-type-badge ${statusInfo.type}`}>
                  {statusInfo.userType}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TBTAuthLoadingScreen; 
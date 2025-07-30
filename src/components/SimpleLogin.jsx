import { useState } from 'react';
import { signIn, signUp, getCurrentUser, fetchAuthSession, signInWithRedirect } from 'aws-amplify/auth';
import appIcon from '../assets/app_icon.png';

const SimpleLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

    const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError('');

    // For development purposes, bypass authentication and create a mock user
    try {
      // Simulate a brief loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock user object
      const mockUser = {
        username: email,
        email: email,
        userId: `user-${Date.now()}`,
        signInDetails: {
          loginId: email,
          authFlowType: 'USER_SRP_AUTH'
        }
      };
      
      console.log('Development mode: Created mock user:', mockUser);
      onLogin(mockUser);
      
    } catch (error) {
      console.error('Login error:', error);
      setError(`Login failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // For development, create a mock Google user
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockGoogleUser = {
        username: `google-${Date.now()}`,
        email: 'user@gmail.com',
        userId: `google-user-${Date.now()}`,
        signInDetails: {
          loginId: 'user@gmail.com',
          authFlowType: 'USER_SRP_AUTH'
        },
        provider: 'Google'
      };
      
      console.log('Development mode: Created mock Google user:', mockGoogleUser);
      onLogin(mockGoogleUser);
      
    } catch (error) {
      console.error('Google login error:', error);
      setError(`Google login failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-login-container">
      <div className="simple-login-card">
        <div className="app-header">
          <img src={appIcon} alt="CLDStudio" className="app-icon" />
        </div>
        <p>Visualize the interconnected patterns that shape our world</p>
        
        <form onSubmit={handleEmailLogin} className="simple-login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            disabled={isLoading || !email.trim()}
            className="login-button"
          >
            {isLoading ? 'Signing in...' : 'Continue with Email'}
          </button>
        </form>
        
        <div className="login-divider">
          <span>or</span>
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="google-login-button"
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
        
        <div className="login-footer">
          <small>This will create or sign into your account automatically</small>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin; 
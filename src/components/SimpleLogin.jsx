import { useState } from 'react';
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
        
        <div className="login-footer">
          <small>This will create or sign into your account automatically</small>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin; 
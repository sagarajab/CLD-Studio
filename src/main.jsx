import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import './index.css'
import App from './App.jsx'
import { initializeAmplify } from './config/amplifyConfig.js'

function AppWrapper() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeAmplify();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Amplify:', err);
        setError(err.message);
      }
    };
    
    init();
  }, []);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2>Failed to initialize app</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="loading-spinner"></div>
        <p>Initializing app...</p>
      </div>
    );
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <App user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)


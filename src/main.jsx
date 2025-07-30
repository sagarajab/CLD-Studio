import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import './index.css'
import App from './App.jsx'
import SimpleLogin from './components/SimpleLogin.jsx'
import './components/SimpleLogin.css'

// Configure Amplify with the deployed backend values
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_nlqe8BeEH',
      userPoolClientId: '1ndq7r327tgjg2br4uj5ql16hr',
      identityPoolId: 'us-east-1:61171153-c771-4738-a12d-1383896c97a5',
      loginWith: {
        email: true,
      },
    },
  },
  // Add Storage configuration
  Storage: {
    S3: {
      bucket: 'amplify-cldstudio-kritika-cldstudiostoragebucketb4-td29m2clj3vg',
      region: 'us-east-1',
    },
  },
};

// Configure Amplify
Amplify.configure(amplifyConfig)

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <SimpleLogin onLogin={handleLogin} />;
  }

  return <App user={user} signOut={handleSignOut} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)

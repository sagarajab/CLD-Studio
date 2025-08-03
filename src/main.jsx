import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Authenticator, useTheme, View, Text, Heading, Button, Image, useAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import './index.css'
import './components/AuthCustomization.css'
import App from './App.jsx'
import { initializeAmplify } from './config/amplifyConfig.js'
import appIcon from './assets/app_n_tbt_icon.png'

// Custom components for the Authenticator
const components = {
  
  Header() {
    return (
      <View textAlign="center" padding="2rem 2rem 2rem">
        <Image
          alt="CLD Studio"
          src={appIcon}
          style={{ width: '420px', height: '80px', margin: '0 auto 0px' }}
        />

        <Text fontSize="sm" color="white" fontWeight="semibold" lineHeight="1.2">
          A canvas for systems thinking — draw, analyze, and simulate causal loops
        </Text>
      </View>
    );
  },

  Footer() {
    return (
      <View textAlign="center" padding="1.5rem 2rem">
        <Text fontSize="0.75rem" color="gray">
          © 2025 CLD Studio. All Rights Reserved.
        </Text>
      </View>
    );
  },

  SignIn: {
    Header() {
      return (
        <View textAlign="center" padding="2rem 2rem 1rem">
          <Heading level={3}>
            Welcome back
          </Heading>
        </View>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();

      return (
        <View textAlign="center">
          <Button
            onClick={toForgotPassword}
            variation="link"
          >
            Forgot your password?
          </Button>
        </View>
      );
    },
  },

  SignUp: {
    Header() {
      return (
        <View textAlign="center">
        <Heading level={3}>
          Create your account
        </Heading>
        </View>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
        <View textAlign="center">
          <Text fontSize="0.875rem">
            Already have an account?{' '}
          </Text>
          <Button
            onClick={toSignIn}
            variation="link"
          >
            Sign in here
          </Button>
        </View>
      );
    },
  },

  ConfirmSignUp: {
    Header() {
      return (
        <Heading level={3}>
          Verify your email
        </Heading>
      );
    },
    Footer() {
      return (
        <Text fontSize="0.875rem">
          Check your email for the verification code
        </Text>
      );
    },
  },

  ForgotPassword: {
    Header() {
      return (
        <Heading level={3}>
          Reset your password
        </Heading>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View textAlign="center">
          <Button
            onClick={toSignIn}
            variation="link"
          >
            Back to Sign In
          </Button>
        </View>
      );
    },
  },

  ConfirmResetPassword: {
    Header() {
      return (
        <Heading level={3}>
          Enter new password
        </Heading>
      );
    },
    Footer() {
      return (
        <Text fontSize="0.875rem">
          Enter the code from your email and your new password
        </Text>
      );
    },
  },
};

// Custom form fields
const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email address',
      label: 'Email',
      isRequired: true,
    },
    password: {
      placeholder: 'Enter your password',
      label: 'Password',
      isRequired: true,
    },
  },
  signUp: {
    email: {
      placeholder: 'Enter your email address',
      label: 'Email',
      isRequired: true,
    },
    password: {
      placeholder: 'Create a password (min. 8 characters)',
      label: 'Password',
      isRequired: true,
    },
    confirm_password: {
      placeholder: 'Confirm your password',
      label: 'Confirm Password',
      isRequired: true,
    },
  },
  confirmSignUp: {
    confirmation_code: {
      placeholder: 'Enter verification code',
      label: 'Verification Code',
    },
  },
  forgotPassword: {
    username: {
      placeholder: 'Enter your email address',
      label: 'Email',
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: 'Enter verification code',
      label: 'Verification Code',
    },
    password: {
      placeholder: 'Enter new password',
      label: 'New Password',
    },
    confirm_password: {
      placeholder: 'Confirm new password',
      label: 'Confirm New Password',
    },
  },
};

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
        gap: '1rem',
        background: '#ffffff'
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
        gap: '1rem',
        background: '#ffffff'
      }}>
        <div className="loading-spinner"></div>
        <p>Initializing CLD Studio...</p>
      </div>
    );
  }

  return (
    <Authenticator 
      formFields={formFields} 
      components={components}
      variation="modal"
      theme={{
        name: 'CLDStudioTheme',
        tokens: {
          colors: {
            primary: {
              10: '#fff7ed',
              20: '#ffedd5',
              30: '#fed7aa',
              40: '#fdba74',
              50: '#fb923c',
              60: '#f97316',
              70: '#ea580c',
              80: '#c2410c',
              90: '#9a3412',
              100: '#7c2d12',
            },
            brand: {
              primary: {
                10: '#fff7ed',
                20: '#ffedd5',
                30: '#fed7aa',
                40: '#fdba74',
                50: '#fb923c',
                60: '#f97316',
                70: '#ea580c',
                80: '#c2410c',
                90: '#9a3412',
                100: '#7c2d12',
              },
            },
            neutral: {
              10: '#f9fafb',
              20: '#f3f4f6',
              30: '#e5e7eb',
              40: '#d1d5db',
              50: '#9ca3af',
              60: '#6b7280',
              70: '#4b5563',
              80: '#374151',
              90: '#1f2937',
              100: '#111827',
            },
            // Override any teal colors with orange
            teal: {
              10: '#fff7ed',
              20: '#ffedd5',
              30: '#fed7aa',
              40: '#fdba74',
              50: '#fb923c',
              60: '#f97316',
              70: '#ea580c',
              80: '#c2410c',
              90: '#9a3412',
              100: '#7c2d12',
            },
            // Override accent colors
            accent: {
              primary: '#f97316',
              secondary: '#ea580c',
            },
          },
          components: {
            authenticator: {
              router: {
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              },
              header: {
                backgroundColor: 'var(--amplify-colors-neutral-90)',
              },
              footer: {
                backgroundColor: 'var(--amplify-colors-neutral-90)',
              },
              // Override button colors
              button: {
                primary: {
                  backgroundColor: '#f97316',
                  color: 'white',
                  _hover: {
                    backgroundColor: '#ea580c',
                  },
                },
              },
            },
            // Override any button components
            button: {
              primary: {
                backgroundColor: '#f97316',
                color: 'white',
                _hover: {
                  backgroundColor: '#ea580c',
                },
              },
            },
          },
        },
      }}
    >
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


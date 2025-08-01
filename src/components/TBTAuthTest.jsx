import { useTBTAuthStore } from '../stores/tbtAuthStore';
import { useUserProgressStore } from '../stores/userProgressStore';

export default function TBTAuthTest() {
  const { 
    amplifyAuthVerified, 
    tbtAuthStatus, 
    accessLevel, 
    user, 
    isNewUser,
    isLoading,
    error,
    performTBTAuth,
    upgradeAccess
  } = useTBTAuthStore();

  const { 
    currentSession, 
    trackDiagramCreation, 
    trackSimulationRun, 
    trackLoopIdentification 
  } = useUserProgressStore();

  const handleUpgradeToTBT = async () => {
    try {
      await upgradeAccess('tbt');
      alert('Successfully upgraded to TBT access!');
    } catch (error) {
      alert('Failed to upgrade: ' + error.message);
    }
  };

  const handleUpgradeToAdmin = async () => {
    try {
      await upgradeAccess('admin');
      alert('Successfully upgraded to admin access!');
    } catch (error) {
      alert('Failed to upgrade: ' + error.message);
    }
  };

  const handleTestTracking = () => {
    trackDiagramCreation();
    trackSimulationRun();
    trackLoopIdentification(3);
    alert('Test tracking completed! Check the console for details.');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>TBT Authentication Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Authentication Status</h3>
        <p><strong>amplify_Auth:</strong> {amplifyAuthVerified ? '✅ Verified' : '❌ Failed'}</p>
        <p><strong>tbt_auth:</strong> {tbtAuthStatus}</p>
        <p><strong>Access Level:</strong> {accessLevel}</p>
        <p><strong>Is New User:</strong> {isNewUser ? 'Yes' : 'No'}</p>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        {error && <p><strong>Error:</strong> {error}</p>}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>User Info</h3>
        {user ? (
          <div>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            <p><strong>Total Logins:</strong> {user.totalLogins}</p>
            <p><strong>Diagrams Created:</strong> {user.diagramsCreated}</p>
            <p><strong>Simulations Run:</strong> {user.simulationsRun}</p>
            <p><strong>Loops Identified:</strong> {user.loopsIdentified}</p>
          </div>
        ) : (
          <p>No user data available</p>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Current Session</h3>
        <p><strong>Start Time:</strong> {currentSession.startTime ? new Date(currentSession.startTime).toLocaleString() : 'Not started'}</p>
        <p><strong>Active Time:</strong> {currentSession.activeTime} seconds</p>
        <p><strong>Idle Time:</strong> {currentSession.idleTime} seconds</p>
        <p><strong>Actions:</strong> {currentSession.actions.length}</p>
        {currentSession.actions.length > 0 && (
          <ul>
            {currentSession.actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Test Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={performTBTAuth}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Re-run TBT Auth
          </button>
          
          <button 
            onClick={handleUpgradeToTBT}
            style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Upgrade to TBT
          </button>
          
          <button 
            onClick={handleUpgradeToAdmin}
            style={{ padding: '8px 16px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Upgrade to Admin
          </button>
          
          <button 
            onClick={handleTestTracking}
            style={{ padding: '8px 16px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Test Progress Tracking
          </button>
        </div>
      </div>

      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3>Instructions</h3>
        <ol>
          <li>First, make sure you're logged in through Amplify Auth</li>
          <li>The system should automatically perform tbt_auth verification</li>
          <li>Check the authentication status above</li>
          <li>Try the test actions to verify functionality</li>
          <li>Check the browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
} 
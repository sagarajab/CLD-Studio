// databaseDiagnostics.js - Utility for diagnosing database and authentication issues
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

export class DatabaseDiagnostics {
  /**
   * Run comprehensive diagnostics to identify the root cause of database issues
   */
  static async runDiagnostics() {
    const results = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      tests: {}
    };

    console.log('🔍 Starting database diagnostics...');

    // Test 1: Check if client is available
    try {
      results.tests.clientAvailable = {
        success: true,
        message: 'Data client is available',
        models: Object.keys(client.models || {})
      };
      console.log('✅ Data client available');
    } catch (error) {
      results.tests.clientAvailable = {
        success: false,
        message: error.message,
        error: error
      };
      console.error('❌ Data client not available:', error);
    }

    // Test 2: Check if UserAssessment model is available
    try {
      if (client.models?.UserAssessment) {
        results.tests.userAssessmentModel = {
          success: true,
          message: 'UserAssessment model is available'
        };
        console.log('✅ UserAssessment model available');
      } else {
        results.tests.userAssessmentModel = {
          success: false,
          message: 'UserAssessment model not found in client.models'
        };
        console.error('❌ UserAssessment model not available');
      }
    } catch (error) {
      results.tests.userAssessmentModel = {
        success: false,
        message: error.message,
        error: error
      };
      console.error('❌ Error checking UserAssessment model:', error);
    }

         // Test 3: Test basic database connectivity
     try {
       if (client.models?.UserAssessment) {
         const { data } = await client.models.UserAssessment.list({ limit: 1 });
         results.tests.databaseConnectivity = {
           success: true,
           message: `Database connection successful. Found ${data.length} records.`
         };
         console.log('✅ Database connectivity test passed');
       } else {
         results.tests.databaseConnectivity = {
           success: false,
           message: 'Cannot test connectivity - UserAssessment model not available'
         };
         console.error('❌ Cannot test database connectivity');
       }
     } catch (error) {
       results.tests.databaseConnectivity = {
         success: false,
         message: error.message,
         error: error
       };
       console.error('❌ Database connectivity test failed:', error);
     }

     // Test 3.5: Test user creation capability
     try {
       if (client.models?.UserAssessment) {
         console.log('Testing user creation capability...');
         const testUserInput = {
           email: 'test-diagnostic@example.com',
           cognitoUserId: 'test-diagnostic-id',
           tbtAuthStatus: 'guest',
           accessLevel: 'guest',
           createdAt: new Date().toISOString(),
           lastLoginAt: new Date().toISOString(),
           assessmentData: JSON.stringify({})
         };
         
         const createResponse = await client.models.UserAssessment.create({
           input: testUserInput
         });
         
         if (createResponse && createResponse.data && createResponse.data.id) {
           results.tests.userCreation = {
             success: true,
             message: 'User creation test successful'
           };
           console.log('✅ User creation test passed');
           
           // Clean up test user
           try {
             await client.models.UserAssessment.delete({ id: createResponse.data.id });
             console.log('✅ Test user cleaned up');
           } catch (cleanupError) {
             console.warn('⚠️ Could not cleanup test user:', cleanupError);
           }
         } else {
           results.tests.userCreation = {
             success: false,
             message: 'User creation returned null/undefined response'
           };
           console.error('❌ User creation test failed - null response');
         }
       } else {
         results.tests.userCreation = {
           success: false,
           message: 'Cannot test user creation - UserAssessment model not available'
         };
         console.error('❌ Cannot test user creation');
       }
     } catch (error) {
       results.tests.userCreation = {
         success: false,
         message: error.message,
         error: error
       };
       console.error('❌ User creation test failed:', error);
     }

    // Test 4: Check authentication status
    try {
      const storedEmail = localStorage.getItem('currentUserEmail');
      const storedCognitoId = localStorage.getItem('currentUserCognitoId');
      
      results.tests.authentication = {
        success: !!storedEmail && storedEmail !== 'current-user@example.com',
        message: storedEmail ? `User email: ${storedEmail}` : 'No user email found',
        cognitoId: storedCognitoId || 'Not found',
        details: {
          hasEmail: !!storedEmail,
          hasValidEmail: storedEmail && storedEmail !== 'current-user@example.com',
          hasCognitoId: !!storedCognitoId
        }
      };
      
      if (results.tests.authentication.success) {
        console.log('✅ Authentication appears valid');
      } else {
        console.warn('⚠️ Authentication issues detected');
      }
    } catch (error) {
      results.tests.authentication = {
        success: false,
        message: error.message,
        error: error
      };
      console.error('❌ Error checking authentication:', error);
    }

    // Test 5: Check TBT auth status
    try {
      const tbtAuthStore = await import('../stores/tbtAuthStore.js');
      const tbtAuthState = tbtAuthStore.default.getState();
      
      results.tests.tbtAuth = {
        success: true,
        message: `TBT Auth Status: ${tbtAuthState.tbtAuthStatus}, Access Level: ${tbtAuthState.accessLevel}`,
        details: {
          tbtAuthStatus: tbtAuthState.tbtAuthStatus,
          accessLevel: tbtAuthState.accessLevel,
          isApproved: tbtAuthState.isApproved
        }
      };
      console.log('✅ TBT auth status retrieved');
    } catch (error) {
      results.tests.tbtAuth = {
        success: false,
        message: error.message,
        error: error
      };
      console.error('❌ Error checking TBT auth:', error);
    }

    console.log('🔍 Database diagnostics completed');
    console.log('📊 Results:', results);

    return results;
  }

  /**
   * Get a summary of the diagnostics for display
   */
  static getDiagnosticSummary(results) {
    const passedTests = Object.values(results.tests).filter(test => test.success).length;
    const totalTests = Object.keys(results.tests).length;
    
    return {
      overall: passedTests === totalTests ? 'PASS' : 'FAIL',
      passedTests,
      totalTests,
      environment: results.environment,
      timestamp: results.timestamp,
      details: results.tests
    };
  }

  /**
   * Generate recommendations based on diagnostic results
   */
  static getRecommendations(results) {
    const recommendations = [];

    if (!results.tests.clientAvailable?.success) {
      recommendations.push('Amplify configuration issue - check amplify_outputs.json and initialization');
    }

    if (!results.tests.userAssessmentModel?.success) {
      recommendations.push('Database schema not deployed - run amplify push to deploy backend');
    }

         if (!results.tests.databaseConnectivity?.success) {
       recommendations.push('Network or authentication issue - check internet connection and AWS credentials');
     }

     if (!results.tests.userCreation?.success) {
       recommendations.push('User creation failed - check database permissions and schema validation');
     }

    if (!results.tests.authentication?.success) {
      recommendations.push('User not properly authenticated - log out and log back in');
    }

    if (!results.tests.tbtAuth?.success) {
      recommendations.push('TBT authentication issue - check TBT auth service');
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests passed - issue may be intermittent or related to specific data');
    }

    return recommendations;
  }
} 
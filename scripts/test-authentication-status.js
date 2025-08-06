#!/usr/bin/env node

/**
 * Test Authentication Status Script
 * 
 * This script helps diagnose authentication issues that prevent user creation
 * 
 * Usage: node scripts/test-authentication-status.js
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

async function testAuthenticationStatus() {
  console.log('🔍 Testing Authentication Status...\n');

  try {
    // Step 1: Load Amplify configuration
    console.log('1. Loading Amplify configuration...');
    const { default: outputs } = await import('../amplify_outputs.json');
    Amplify.configure(outputs);
    console.log('✅ Amplify configuration loaded successfully\n');

    // Step 2: Generate data client
    console.log('2. Generating data client...');
    const client = generateClient();
    console.log('✅ Data client generated successfully\n');

    // Step 3: Check UserAssessment model
    console.log('3. Checking UserAssessment model...');
    if (!client.models?.UserAssessment) {
      console.error('❌ UserAssessment model not available');
      console.log('💡 This indicates the backend schema is not properly deployed.');
      console.log('   - Run "amplify push" to deploy the backend');
      return;
    }
    console.log('✅ UserAssessment model available\n');

    // Step 4: Check localStorage authentication data
    console.log('4. Checking localStorage authentication data...');
    const storedEmail = localStorage.getItem('currentUserEmail');
    const storedCognitoId = localStorage.getItem('currentUserCognitoId');
    const storedTbtAuthStatus = localStorage.getItem('tbtAuthStatus');
    const storedAccessLevel = localStorage.getItem('accessLevel');
    
    console.log('📊 Authentication Data:');
    console.log('  - Email:', storedEmail || '❌ Not found');
    console.log('  - Cognito ID:', storedCognitoId || '❌ Not found');
    console.log('  - TBT Auth Status:', storedTbtAuthStatus || '❌ Not found');
    console.log('  - Access Level:', storedAccessLevel || '❌ Not found');
    
    const hasRequiredAuth = storedEmail && storedCognitoId;
    
    if (!hasRequiredAuth) {
      console.log('\n❌ Authentication incomplete');
      console.log('💡 To fix this:');
      console.log('   1. Open the application in your browser');
      console.log('   2. Log in with your credentials');
      console.log('   3. Check that localStorage contains:');
      console.log('      - currentUserEmail');
      console.log('      - currentUserCognitoId');
      console.log('   4. Run this test again');
      return;
    }
    
    console.log('\n✅ Required authentication data found\n');

    // Step 5: Test database connectivity
    console.log('5. Testing database connectivity...');
    try {
      const { data } = await client.models.UserAssessment.list({ limit: 1 });
      console.log('✅ Database connectivity successful');
      console.log(`   Found ${data.length} existing records`);
    } catch (error) {
      console.error('❌ Database connectivity failed:', error.message);
      console.log('💡 This might indicate:');
      console.log('   - Network connectivity issues');
      console.log('   - AWS credentials problems');
      console.log('   - Backend deployment issues');
      return;
    }

    // Step 6: Test user creation capability
    console.log('\n6. Testing user creation capability...');
         // For creation, only use required fields
         const testUserInput = {
           email: 'test-auth-check@example.com',
           cognitoUserId: 'test-auth-check-id'
         };
    
    try {
      const createResponse = await client.models.UserAssessment.create({
        input: testUserInput
      });
      
      if (createResponse && createResponse.data && createResponse.data.id) {
        console.log('✅ User creation successful');
        console.log('   Created user ID:', createResponse.data.id);
        
        // Clean up test user
        try {
          await client.models.UserAssessment.delete({ id: createResponse.data.id });
          console.log('✅ Test user cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Could not cleanup test user:', cleanupError);
        }
        
        console.log('\n🎉 All tests passed! User creation is working properly.');
      } else {
        console.error('❌ User creation returned invalid response');
        console.log('   Response:', createResponse);
      }
    } catch (error) {
      console.error('❌ User creation failed:', error.message);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        console.log('💡 This is an authentication error. Possible causes:');
        console.log('   - User not properly authenticated with AWS Cognito');
        console.log('   - JWT token expired');
        console.log('   - Insufficient permissions');
        console.log('   - Try logging out and logging back in');
      } else if (error.message.includes('Validation')) {
        console.log('💡 This is a validation error. Check the input data format.');
      } else {
        console.log('💡 Unknown error. Check the error details above.');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }

  console.log('\n🔍 Authentication status test completed.');
}

// Run the test
testAuthenticationStatus().catch(console.error); 
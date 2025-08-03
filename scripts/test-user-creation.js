#!/usr/bin/env node

/**
 * Test User Creation Script
 * 
 * This script specifically tests the user creation functionality that's failing
 * with "Cannot read properties of null (reading 'id')"
 * 
 * Usage: node scripts/test-user-creation.js
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

async function testUserCreation() {
  console.log('🔍 Testing User Creation...\n');

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

    // Step 4: Test user creation with different inputs
    console.log('4. Testing user creation...');
    
    const testCases = [
      {
        name: 'Basic user creation',
        input: {
          email: 'test-user-1@example.com',
          cognitoUserId: 'test-user-1-id',
          tbtAuthStatus: 'guest',
          accessLevel: 'guest',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          assessmentData: JSON.stringify({})
        }
      },
      {
        name: 'TBT user creation',
        input: {
          email: 'test-tbt-user@example.com',
          cognitoUserId: 'test-tbt-user-id',
          tbtAuthStatus: 'tbt',
          accessLevel: 'tbt',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          assessmentData: JSON.stringify({})
        }
      },
      {
        name: 'Admin user creation',
        input: {
          email: 'test-admin@example.com',
          cognitoUserId: 'test-admin-id',
          tbtAuthStatus: 'tbt',
          accessLevel: 'admin',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          assessmentData: JSON.stringify({})
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      console.log('Input:', testCase.input);
      
      try {
        const createResponse = await client.models.UserAssessment.create({
          input: testCase.input
        });
        
        console.log('Raw response:', createResponse);
        
        if (!createResponse) {
          console.error('❌ Create operation returned null response');
          continue;
        }
        
        if (!createResponse.data) {
          console.error('❌ Create response has no data property');
          continue;
        }
        
        const newUser = createResponse.data;
        
        if (!newUser) {
          console.error('❌ Create response data is null');
          continue;
        }
        
        if (!newUser.id) {
          console.error('❌ Created user has no id');
          console.log('User object:', newUser);
          continue;
        }
        
        console.log('✅ User created successfully');
        console.log('User ID:', newUser.id);
        console.log('User data:', newUser);
        
        // Clean up
        try {
          await client.models.UserAssessment.delete({ id: newUser.id });
          console.log('✅ Test user cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Could not cleanup test user:', cleanupError);
        }
        
      } catch (error) {
        console.error('❌ User creation failed:', error.message);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        if (error.message.includes('Validation')) {
          console.log('💡 This appears to be a validation error');
          console.log('   - Check if the input data matches the schema requirements');
        } else if (error.message.includes('Unauthorized')) {
          console.log('💡 This appears to be an authentication error');
          console.log('   - Check if you have permission to create users');
        } else if (error.message.includes('duplicate')) {
          console.log('💡 This appears to be a duplicate key error');
          console.log('   - The email might already exist in the database');
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }

  console.log('\n🔍 User creation test completed.');
}

// Run the test
testUserCreation().catch(console.error); 
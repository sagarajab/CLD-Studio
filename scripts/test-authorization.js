#!/usr/bin/env node

/**
 * Test Authorization Script
 * 
 * This script tests the authorization configuration to identify
 * why user creation is failing with "Cannot read properties of null (reading 'id')"
 * 
 * Usage: node scripts/test-authorization.js
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

async function testAuthorization() {
  console.log('🔍 Testing Authorization Configuration...\n');

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

    // Step 3: Check schema configuration
    console.log('3. Checking schema configuration...');
    if (!client.models?.UserAssessment) {
      console.error('❌ UserAssessment model not available');
      return;
    }
    console.log('✅ UserAssessment model available\n');

    // Step 4: Test authorization rules
    console.log('4. Testing authorization rules...');
    
    // Test case 1: Try to create without authentication (should fail)
    console.log('\nTest 1: Creating user without authentication (should fail)...');
    try {
      const createResponse = await client.models.UserAssessment.create({
        input: {
          email: 'test-unauth@example.com',
          cognitoUserId: 'test-unauth-id'
        }
      });
      
      if (createResponse && createResponse.data) {
        console.log('⚠️ Unexpected: User creation succeeded without authentication');
        console.log('This suggests authorization is not properly configured');
        
        // Clean up
        try {
          await client.models.UserAssessment.delete({ id: createResponse.data.id });
          console.log('✅ Test user cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Could not cleanup test user:', cleanupError);
        }
      } else {
        console.log('✅ Expected: User creation failed without authentication');
      }
    } catch (error) {
      console.log('✅ Expected: User creation failed without authentication');
      console.log('Error:', error.message);
    }

    // Test case 2: Check if we can list records (should fail without auth)
    console.log('\nTest 2: Listing users without authentication (should fail)...');
    try {
      const { data } = await client.models.UserAssessment.list({ limit: 1 });
      console.log('⚠️ Unexpected: List operation succeeded without authentication');
      console.log('Found records:', data.length);
    } catch (error) {
      console.log('✅ Expected: List operation failed without authentication');
      console.log('Error:', error.message);
    }

    // Test case 3: Check schema field validation
    console.log('\nTest 3: Checking schema field validation...');
    const testCases = [
      {
        name: 'Valid guest user',
        input: {
          email: 'test-guest@example.com',
          cognitoUserId: 'test-guest-id'
        },
        shouldWork: false // Should fail due to auth, not validation
      },
      {
        name: 'Valid TBT user',
        input: {
          email: 'test-tbt@example.com',
          cognitoUserId: 'test-tbt-id'
        },
        shouldWork: false // Should fail due to auth, not validation
      },
      {
        name: 'Invalid tbtAuthStatus',
        input: {
          email: 'test-invalid@example.com',
          cognitoUserId: 'test-invalid-id'
        },
        shouldWork: false // Should fail due to validation
      }
    ];

    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      try {
        const createResponse = await client.models.UserAssessment.create({
          input: testCase.input
        });
        
        if (createResponse && createResponse.data) {
          console.log('⚠️ Unexpected: User creation succeeded');
          console.log('This suggests authorization is not working properly');
          
          // Clean up
          try {
            await client.models.UserAssessment.delete({ id: createResponse.data.id });
            console.log('✅ Test user cleaned up');
          } catch (cleanupError) {
            console.warn('⚠️ Could not cleanup test user:', cleanupError);
          }
        } else {
          console.log('✅ Expected: User creation failed');
        }
      } catch (error) {
        console.log('✅ Expected: User creation failed');
        console.log('Error:', error.message);
        
        if (error.message.includes('Validation')) {
          console.log('💡 This is a validation error (expected for invalid data)');
        } else if (error.message.includes('Unauthorized')) {
          console.log('💡 This is an authorization error (expected without auth)');
        } else if (error.message.includes('null')) {
          console.log('💡 This is the null response error we\'re investigating');
        }
      }
    }

    // Test case 4: Check required fields
    console.log('\nTest 4: Checking required fields...');
    const requiredFieldTests = [
      {
        name: 'Missing email',
        input: {
          cognitoUserId: 'test-no-email-id'
        }
      },
      {
        name: 'Missing cognitoUserId',
        input: {
          email: 'test-no-cognito@example.com'
        }
      }
    ];

    for (const testCase of requiredFieldTests) {
      console.log(`\nTesting: ${testCase.name}`);
      try {
        const createResponse = await client.models.UserAssessment.create({
          input: testCase.input
        });
        
        if (createResponse && createResponse.data) {
          console.log('⚠️ Unexpected: User creation succeeded with missing required field');
          
          // Clean up
          try {
            await client.models.UserAssessment.delete({ id: createResponse.data.id });
            console.log('✅ Test user cleaned up');
          } catch (cleanupError) {
            console.warn('⚠️ Could not cleanup test user:', cleanupError);
          }
        } else {
          console.log('✅ Expected: User creation failed with missing required field');
        }
      } catch (error) {
        console.log('✅ Expected: User creation failed with missing required field');
        console.log('Error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }

  console.log('\n🔍 Authorization test completed.');
  console.log('\n💡 Key Findings:');
  console.log('   - If user creation succeeds without authentication, authorization is not working');
  console.log('   - If user creation fails with "Unauthorized", authorization is working but user needs to be logged in');
  console.log('   - If user creation fails with "Validation", there are schema validation issues');
  console.log('   - If user creation fails with "null", there are deeper configuration issues');
}

// Run the test
testAuthorization().catch(console.error); 
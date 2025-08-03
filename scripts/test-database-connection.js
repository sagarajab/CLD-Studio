#!/usr/bin/env node

/**
 * Test Database Connection Script
 * 
 * This script helps diagnose database connectivity issues by testing:
 * 1. Amplify configuration
 * 2. AWS authentication
 * 3. Database connectivity
 * 4. UserAssessment model availability
 * 
 * Usage: node scripts/test-database-connection.js
 */

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

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

    // Step 3: Check available models
    console.log('3. Checking available models...');
    const availableModels = Object.keys(client.models || {});
    console.log(`Available models: ${availableModels.join(', ')}`);
    
    if (availableModels.length === 0) {
      console.log('⚠️ No models found - this indicates a schema loading issue');
    } else {
      console.log('✅ Models loaded successfully\n');
    }

    // Step 4: Check UserAssessment model specifically
    console.log('4. Checking UserAssessment model...');
    if (client.models?.UserAssessment) {
      console.log('✅ UserAssessment model is available');
      
      // Step 5: Test database connectivity
      console.log('\n5. Testing database connectivity...');
      try {
        const { data } = await client.models.UserAssessment.list({ limit: 1 });
        console.log(`✅ Database connection successful. Found ${data.length} records.`);
      } catch (dbError) {
        console.error('❌ Database connection failed:', dbError.message);
        
        if (dbError.message.includes('Unauthorized')) {
          console.log('💡 This appears to be an authentication issue.');
          console.log('   - Check if you are properly logged in');
          console.log('   - Verify your AWS credentials are valid');
          console.log('   - Ensure your user has the necessary permissions');
        } else if (dbError.message.includes('Network')) {
          console.log('💡 This appears to be a network connectivity issue.');
          console.log('   - Check your internet connection');
          console.log('   - Verify the AppSync endpoint is accessible');
        } else {
          console.log('💡 This appears to be a configuration or permission issue.');
        }
      }
    } else {
      console.log('❌ UserAssessment model not found');
      console.log('💡 This indicates the backend schema is not properly deployed.');
      console.log('   - Run "amplify push" to deploy the backend');
      console.log('   - Check if the schema.graphql file is correct');
    }

    // Step 6: Test authentication context
    console.log('\n6. Checking authentication context...');
    try {
      // This would normally check the current user's authentication status
      console.log('ℹ️ Authentication context check skipped (requires user session)');
      console.log('💡 To test with authentication, run this from the browser console');
    } catch (authError) {
      console.error('❌ Authentication check failed:', authError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.message.includes('Cannot find module')) {
      console.log('\n💡 Configuration file not found.');
      console.log('   - Ensure amplify_outputs.json exists in the project root');
      console.log('   - Run "amplify pull" to download the latest configuration');
    } else if (error.message.includes('Amplify')) {
      console.log('\n💡 Amplify configuration issue.');
      console.log('   - Check amplify_outputs.json format');
      console.log('   - Verify AWS region and endpoint URLs');
    }
  }

  console.log('\n🔍 Database connection test completed.');
  console.log('💡 If tests failed, check the recommendations above.');
}

// Run the test
testDatabaseConnection().catch(console.error); 
#!/usr/bin/env node

/**
 * Test script to verify Amplify configuration and database operations
 * This script tests the fixes for the "Create operation returned null data" error
 */

import { initializeAmplify } from '../src/config/amplifyConfig.js';
import { AssessmentService, resetAssessmentServiceClient } from '../src/services/assessmentService.js';

const testUserEmail = 'test-amplify-fix@example.com';
const testCognitoUserId = 'test-cognito-user-id-123';

async function testAmplifyFix() {
  console.log('🧪 Testing Amplify Configuration and Database Operations Fix');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Initialize Amplify
    console.log('\n1️⃣ Initializing Amplify...');
    await initializeAmplify();
    console.log('✅ Amplify initialized successfully');
    
    // Step 2: Reset AssessmentService client to ensure fresh state
    console.log('\n2️⃣ Resetting AssessmentService client...');
    resetAssessmentServiceClient();
    console.log('✅ AssessmentService client reset');
    
    // Step 3: Test database connectivity
    console.log('\n3️⃣ Testing database connectivity...');
    const dbTest = await AssessmentService.testDatabaseConnection();
    console.log('Database test result:', dbTest);
    
    if (!dbTest.success) {
      console.log('❌ Database connectivity test failed');
      return;
    }
    
    console.log('✅ Database connectivity test passed');
    
    // Step 4: Test user assessment creation
    console.log('\n4️⃣ Testing user assessment creation...');
    console.log('Test user email:', testUserEmail);
    console.log('Test cognito user ID:', testCognitoUserId);
    
    const userAssessment = await AssessmentService.ensureUserAssessment(
      testUserEmail,
      testCognitoUserId,
      'tbt',
      'tbt'
    );
    
    if (userAssessment) {
      console.log('✅ User assessment created/retrieved successfully');
      console.log('User assessment ID:', userAssessment.id);
      console.log('User assessment data:', {
        email: userAssessment.email,
        cognitoUserId: userAssessment.cognitoUserId,
        tbtAuthStatus: userAssessment.tbtAuthStatus,
        accessLevel: userAssessment.accessLevel
      });
    } else {
      console.log('❌ User assessment creation failed');
      return;
    }
    
    // Step 5: Test getting assignment progress
    console.log('\n5️⃣ Testing assignment progress retrieval...');
    const progress = await AssessmentService.getAssignmentProgress(testUserEmail, 'sample-assignment');
    
    if (progress !== null) {
      console.log('✅ Assignment progress retrieved successfully');
      console.log('Progress data:', progress);
    } else {
      console.log('ℹ️ No assignment progress found (expected for new user)');
    }
    
    // Step 6: Test getting all assessment data
    console.log('\n6️⃣ Testing all assessment data retrieval...');
    const allData = await AssessmentService.getAllAssessmentData(testUserEmail);
    
    console.log('✅ All assessment data retrieved successfully');
    console.log('Assessment data keys:', Object.keys(allData));
    
    console.log('\n🎉 All tests passed! Amplify configuration and database operations are working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Provide helpful debugging information
    console.log('\n🔍 Debugging information:');
    console.log('- Check that Amplify backend is deployed and accessible');
    console.log('- Verify that the amplify_outputs.json file is up to date');
    console.log('- Ensure that the UserAssessment model is properly configured');
    console.log('- Check network connectivity to AWS services');
  }
}

// Run the test
testAmplifyFix().catch(console.error); 
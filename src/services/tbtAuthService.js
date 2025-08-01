import { getCurrentUser } from 'aws-amplify/auth';
import { getDataClient, resetDataClient } from '../config/dataClientConfig';

export class TBTAuthService {
  /**
   * Step 1: Verify amplify_Auth passed
   * Step 2: Check if user is registered in TBTRegisteredStudents
   * Step 3: Check/create user in TBTUser table for progress tracking
   * Step 4: Grant appropriate access level
   */
  static async performTBTAuth() {
    try {
      console.log('🔄 ===== STARTING TBT AUTHENTICATION PROCESS =====');
      
      // Step 1: Verify amplify_Auth
      console.log('📋 STEP 1: Verifying Amplify Authentication...');
      const amplifyUser = await getCurrentUser();
      const userEmail = amplifyUser.signInDetails?.loginId;
      
      if (!userEmail) {
        console.error('❌ STEP 1 FAILED: amplify_Auth verification failed - no user email');
        throw new Error('amplify_Auth verification failed - no user email');
      }

      // Only log once per auth attempt
      if (!this._authAttempted) {
        console.log('✅ STEP 1 PASSED: amplify_Auth verified for:', userEmail);
        this._authAttempted = true;
      }

      // Wait a moment to ensure Amplify is fully configured
      console.log('⏳ Waiting for Amplify configuration...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force reset Data client to ensure fresh connection
      console.log('🔄 Resetting Data client for fresh connection...');
      resetDataClient();

      // Get Data client (lazy initialization)
      console.log('📋 STEP 2: Initializing Data Client...');
      let dataClient;
      try {
        dataClient = getDataClient();
        console.log('✅ STEP 2 PASSED: Data client retrieved successfully');
      } catch (clientError) {
        console.error('❌ STEP 2 FAILED: Failed to get Data client:', clientError);
        // Try resetting and getting again
        console.log('🔄 Retrying Data client initialization...');
        resetDataClient();
        await new Promise(resolve => setTimeout(resolve, 2000));
        dataClient = getDataClient();
      }
      
      // Debug: Check if client and models are available
      if (!dataClient) {
        console.error('❌ STEP 2 FAILED: Data client is not available');
        throw new Error('Data client is not available');
      }
      
      console.log('🔍 Data client object:', dataClient);
      console.log('🔍 Available models:', Object.keys(dataClient.models || {}));
      console.log('🔍 Models object:', dataClient.models);

      // Check if models are available
      if (!dataClient.models || Object.keys(dataClient.models).length === 0) {
        console.error('❌ STEP 2 WARNING: No models available in Data client');
        console.log('🔍 Trying to access models directly...');
        
        // Try a different approach - test with a simple query
        try {
          console.log('🔍 Testing direct GraphQL query...');
          const testResult = await dataClient.graphql({
            query: `query ListTBTRegisteredStudents {
            listTBTRegisteredStudents {
              items {
                id
                email
              }
            }
          }`
          });
          console.log('✅ Direct GraphQL query successful:', testResult);
          
          // If direct query works, use that approach
          console.log('🔄 Switching to GraphQL fallback approach...');
          return await this.performTBTAuthWithGraphQL(dataClient, userEmail, amplifyUser);
        } catch (graphqlError) {
          console.error('❌ Direct GraphQL query failed:', graphqlError);
          throw new Error('Data client models not available and direct GraphQL failed');
        }
      }

      // Check if TBTRegisteredStudents model exists
      if (!dataClient.models.TBTRegisteredStudents) {
        console.error('❌ STEP 2 FAILED: TBTRegisteredStudents model not found in available models');
        console.log('🔍 All available models:', Object.keys(dataClient.models));
        throw new Error('TBTRegisteredStudents model not available. Schema may not be deployed correctly.');
      }

      // Step 2: Check if user is registered in TBTRegisteredStudents
      console.log('📋 STEP 3: Checking TBT Registration Status...');
      try {
        console.log('🔍 Checking TBTRegisteredStudents for:', userEmail);
        const { data: registeredStudents } = await dataClient.models.TBTRegisteredStudents.list({
          filter: { email: { eq: userEmail } }
        });

        const isRegistered = registeredStudents.length > 0;
        console.log('📋 TBT registration check:', { userEmail, isRegistered, count: registeredStudents.length });
        
        if (isRegistered) {
          console.log('✅ STEP 3 PASSED: User is registered for TBT');
        } else {
          console.log('⚠️ STEP 3 RESULT: User is NOT registered for TBT (will be guest)');
        }

        // Step 3: Check existing TBTUser record
        console.log('📋 STEP 4: Checking User Record in TBTUser Table...');
        console.log('🔍 Checking TBTUser for:', userEmail);
        const { data: tbtUsers } = await dataClient.models.TBTUser.list({
          filter: { email: { eq: userEmail } }
        });

        const existingTBTUser = tbtUsers[0];
        console.log('👤 TBT user check:', { userEmail, exists: !!existingTBTUser });
        
        if (existingTBTUser) {
          console.log('✅ STEP 4 PASSED: Existing user record found');
        } else {
          console.log('⚠️ STEP 4 RESULT: No existing user record (will create new)');
        }

        // Step 5: Determine access level and create/update user
        console.log('📋 STEP 5: Determining Access Level and Managing User Record...');
        
        if (!isRegistered) {
          // User not in registered students list - create or update to guest user
          if (!existingTBTUser) {
            if (!this._userCreated) {
              console.log('🆕 Creating new TBT user with guest access (not registered)');
              this._userCreated = true;
            }
            const guestUser = await this.createGuestTBTUser(amplifyUser);
            console.log('✅ STEP 5 COMPLETE: New guest user created');
            console.log('🎉 ===== TBT AUTHENTICATION PROCESS COMPLETED SUCCESSFULLY =====');
            console.log('📊 FINAL RESULT: Guest User (Amplify: ✅, TBT: ❌)');
            return { 
              tbtAuthStatus: 'guest', 
              accessLevel: 'guest', 
              user: guestUser,
              isNewUser: true,
              amplifyAuthVerified: true
            };
          } else {
            // User exists but not registered - ensure guest status
            if (!this._authCompleted) {
              console.log('👤 User exists but not registered - guest access');
              this._authCompleted = true;
            }
            console.log('✅ STEP 5 COMPLETE: Existing user confirmed as guest');
            console.log('🎉 ===== TBT AUTHENTICATION PROCESS COMPLETED SUCCESSFULLY =====');
            console.log('📊 FINAL RESULT: Guest User (Amplify: ✅, TBT: ❌)');
            return { 
              tbtAuthStatus: 'guest', 
              accessLevel: 'guest', 
              user: existingTBTUser,
              isNewUser: false,
              amplifyAuthVerified: true
            };
          }
        }

        // User is registered for TBT
        if (!existingTBTUser) {
          // Create new TBT user with full access
          if (!this._userCreated) {
            console.log('🆕 Creating new TBT user with full access (registered)');
            this._userCreated = true;
          }
          const tbtUser = await this.createTBTUser(amplifyUser);
          console.log('✅ STEP 5 COMPLETE: New TBT user created with full access');
          console.log('🎉 ===== TBT AUTHENTICATION PROCESS COMPLETED SUCCESSFULLY =====');
          console.log('📊 FINAL RESULT: TBT User (Amplify: ✅, TBT: ✅)');
          return { 
            tbtAuthStatus: 'tbt', 
            accessLevel: 'tbt', 
            user: tbtUser,
            isNewUser: true,
            amplifyAuthVerified: true
          };
        } else {
          // Update existing user to TBT status and update login stats
          const updatedUser = await this.updateUserLoginStats(existingTBTUser);
          
          if (!this._authCompleted) {
            console.log('✅ STEP 5 COMPLETE: Existing TBT user updated');
            this._authCompleted = true;
          }

          console.log('✅ STEP 5 COMPLETE: Existing TBT user login stats updated');
          console.log('🎉 ===== TBT AUTHENTICATION PROCESS COMPLETED SUCCESSFULLY =====');
          console.log('📊 FINAL RESULT: TBT User (Amplify: ✅, TBT: ✅)');
          return { 
            tbtAuthStatus: 'tbt', 
            accessLevel: updatedUser.accessLevel, 
            user: updatedUser,
            isNewUser: false,
            amplifyAuthVerified: true
          };
        }
      } catch (dataError) {
        console.error('❌ STEP 3-5 FAILED: Data client error:', dataError);
        console.error('❌ Error details:', {
          message: dataError.message,
          stack: dataError.stack,
          name: dataError.name
        });
        throw new Error(`Data client error: ${dataError.message}`);
      }
    } catch (error) {
      if (!this._authErrorLogged) {
        console.error('❌ TBT AUTHENTICATION FAILED:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        this._authErrorLogged = true;
      }
      console.log('🔄 ===== TBT AUTHENTICATION PROCESS ENDED WITH ERROR =====');
      return { 
        tbtAuthStatus: 'guest', 
        accessLevel: 'guest', 
        user: null,
        isNewUser: false,
        amplifyAuthVerified: false
      };
    }
  }

  // Fallback method using direct GraphQL queries
  static async performTBTAuthWithGraphQL(dataClient, userEmail, amplifyUser) {
    try {
      console.log('🔄 ===== USING GRAPHQL FALLBACK APPROACH =====');
      console.log('🔍 Using direct GraphQL queries for TBT auth...');
      
      // Check TBTRegisteredStudents
      console.log('📋 STEP 3 (GraphQL): Checking TBT Registration Status...');
      const { data: registeredStudentsResult } = await dataClient.graphql({
        query: `query ListTBTRegisteredStudents($email: String) {
          listTBTRegisteredStudents(filter: { email: { eq: $email } }) {
            items {
              id
              email
            }
          }
        }`,
        variables: { email: userEmail }
      });

      const isRegistered = registeredStudentsResult.listTBTRegisteredStudents.items.length > 0;
      console.log('📋 TBT registration check (GraphQL):', { userEmail, isRegistered, count: registeredStudentsResult.listTBTRegisteredStudents.items.length });
      
      if (isRegistered) {
        console.log('✅ STEP 3 PASSED (GraphQL): User is registered for TBT');
      } else {
        console.log('⚠️ STEP 3 RESULT (GraphQL): User is NOT registered for TBT (will be guest)');
      }

      // Check TBTUser
      console.log('📋 STEP 4 (GraphQL): Checking User Record in TBTUser Table...');
      const { data: tbtUsersResult } = await dataClient.graphql({
        query: `query ListTBTUsers($email: String) {
          listTBTUsers(filter: { email: { eq: $email } }) {
            items {
              id
              email
              tbtAuthStatus
              accessLevel
              totalLogins
              lastLoginAt
            }
          }
        }`,
        variables: { email: userEmail }
      });

      const existingTBTUser = tbtUsersResult.listTBTUsers.items[0];
      console.log('👤 TBT user check (GraphQL):', { userEmail, exists: !!existingTBTUser });
      
      if (existingTBTUser) {
        console.log('✅ STEP 4 PASSED (GraphQL): Existing user record found');
      } else {
        console.log('⚠️ STEP 4 RESULT (GraphQL): No existing user record (will create new)');
      }

      // Step 5: Determine access level and create/update user
      console.log('📋 STEP 5 (GraphQL): Determining Access Level and Managing User Record...');

      if (!isRegistered) {
        // User not in registered students list - create or update to guest user
        if (!existingTBTUser) {
          if (!this._userCreated) {
            console.log('🆕 Creating new TBT user with guest access (not registered) - GraphQL');
            this._userCreated = true;
          }
          const guestUser = await this.createGuestTBTUserWithGraphQL(dataClient, amplifyUser);
          console.log('✅ STEP 5 COMPLETE (GraphQL): New guest user created');
          console.log('🎉 ===== TBT AUTHENTICATION PROCESS COMPLETED SUCCESSFULLY (GraphQL) =====');
          console.log('📊 FINAL RESULT: Guest User (Amplify: ✅, TBT: ❌)');
          return { 
            tbtAuthStatus: 'guest', 
            accessLevel: 'guest', 
            user: guestUser,
            isNewUser: true,
            amplifyAuthVerified: true
          };
        } else {
          // User exists but not registered - ensure guest status
          if (!this._authCompleted) {
            console.log('👤 User exists but not registered - guest access');
            this._authCompleted = true;
          }
          console.log('✅ STEP 5 COMPLETE (GraphQL): Existing user confirmed as guest');
          console.log('🎉 ===== TBT AUTHENTICATION PROCESS COMPLETED SUCCESSFULLY (GraphQL) =====');
          console.log('📊 FINAL RESULT: Guest User (Amplify: ✅, TBT: ❌)');
          return { 
            tbtAuthStatus: 'guest', 
            accessLevel: 'guest', 
            user: existingTBTUser,
            isNewUser: false,
            amplifyAuthVerified: true
          };
        }
      }

      // User is registered for TBT
      if (!existingTBTUser) {
        // Create new TBT user with full access
        if (!this._userCreated) {
          console.log('🆕 Creating new TBT user with full access (registered) - GraphQL');
          this._userCreated = true;
        }
        const tbtUser = await this.createTBTUserWithGraphQL(dataClient, amplifyUser);
        console.log('✅ STEP 5 COMPLETE (GraphQL): New TBT user created with full access');
        console.log('🎉 ===== TBT AUTHENTICATION PROCESS COMPLETED SUCCESSFULLY (GraphQL) =====');
        console.log('📊 FINAL RESULT: TBT User (Amplify: ✅, TBT: ✅)');
        return { 
          tbtAuthStatus: 'tbt', 
          accessLevel: 'tbt', 
          user: tbtUser,
          isNewUser: true,
          amplifyAuthVerified: true
        };
      } else {
        // Update existing user to TBT status and update login stats
        const updatedUser = await this.updateUserLoginStatsWithGraphQL(dataClient, existingTBTUser);
        
        if (!this._authCompleted) {
          console.log('✅ STEP 5 COMPLETE (GraphQL): Existing TBT user updated');
          this._authCompleted = true;
        }

        console.log('✅ STEP 5 COMPLETE (GraphQL): Existing TBT user login stats updated');
        console.log('🎉 ===== TBT AUTHENTICATION PROCESS COMPLETED SUCCESSFULLY (GraphQL) =====');
        console.log('📊 FINAL RESULT: TBT User (Amplify: ✅, TBT: ✅)');
        return { 
          tbtAuthStatus: 'tbt', 
          accessLevel: updatedUser.accessLevel, 
          user: updatedUser,
          isNewUser: false,
          amplifyAuthVerified: true
        };
      }
    } catch (error) {
      console.error('❌ GRAPHQL AUTH ERROR:', error);
      throw error;
    }
  }

  static async createGuestTBTUser(amplifyUser) {
    try {
      const now = new Date().toISOString();
      const dataClient = getDataClient();
      console.log('🆕 Creating guest TBT user for:', amplifyUser.signInDetails?.loginId);
      
      const { data } = await dataClient.models.TBTUser.create({
        input: {
          email: amplifyUser.signInDetails?.loginId,
          cognitoUserId: amplifyUser.userId,
          tbtAuthStatus: 'guest',
          accessLevel: 'guest',
          amplifyAuthVerified: true,
          createdAt: now,
          lastLoginAt: now,
          lastActiveAt: now,
          currentSessionStart: now,
          totalLogins: 1,
          consecutiveLogins: 1,
          lastLoginStreak: 0,
          totalActiveTime: 0,
          totalIdleTime: 0,
          currentSessionActiveTime: 0,
          assignmentsCompleted: 0,
          assignmentsInProgress: 0,
          totalAssignmentScore: 0.0,
          averageAssignmentScore: 0.0,
          highestAssignmentScore: 0.0,
          diagramsCreated: 0,
          diagramsShared: 0,
          simulationsRun: 0,
          loopsIdentified: 0,
          learningLevel: 'beginner',
          skillsUnlocked: JSON.stringify([]),
          achievements: JSON.stringify([]),
          preferences: JSON.stringify({
            theme: 'light',
            autoSave: true,
            showGrid: true
          }),
          metadata: JSON.stringify({
            authFlow: 'amplify_auth -> tbt_auth_guest',
            createdAsGuest: true,
            source: 'amplify_auth'
          })
        }
      });
      console.log('✅ Guest TBT user created successfully');
      return data;
    } catch (error) {
      console.error('Error creating guest TBT user:', error);
      throw error;
    }
  }

  static async createGuestTBTUserWithGraphQL(dataClient, amplifyUser) {
    try {
      const now = new Date().toISOString();
      console.log('🆕 Creating guest TBT user with GraphQL for:', amplifyUser.signInDetails?.loginId);
      
      const { data } = await dataClient.graphql({
        query: `mutation CreateTBTUser($input: CreateTBTUserInput!) {
          createTBTUser(input: $input) {
            id
            email
            tbtAuthStatus
            accessLevel
            createdAt
            lastLoginAt
          }
        }`,
        variables: {
          input: {
            email: amplifyUser.signInDetails?.loginId,
            cognitoUserId: amplifyUser.userId,
            tbtAuthStatus: 'guest',
            accessLevel: 'guest',
            amplifyAuthVerified: true,
            createdAt: now,
            lastLoginAt: now,
            lastActiveAt: now,
            currentSessionStart: now,
            totalLogins: 1,
            consecutiveLogins: 1,
            lastLoginStreak: 0,
            totalActiveTime: 0,
            totalIdleTime: 0,
            currentSessionActiveTime: 0,
            assignmentsCompleted: 0,
            assignmentsInProgress: 0,
            totalAssignmentScore: 0.0,
            averageAssignmentScore: 0.0,
            highestAssignmentScore: 0.0,
            diagramsCreated: 0,
            diagramsShared: 0,
            simulationsRun: 0,
            loopsIdentified: 0,
            learningLevel: 'beginner',
            skillsUnlocked: JSON.stringify([]),
            achievements: JSON.stringify([]),
            preferences: JSON.stringify({
              theme: 'light',
              autoSave: true,
              showGrid: true
            }),
            metadata: JSON.stringify({
              authFlow: 'amplify_auth -> tbt_auth_guest',
              createdAsGuest: true,
              source: 'amplify_auth'
            })
          }
        }
      });
      console.log('✅ Guest TBT user created successfully with GraphQL');
      return data.createTBTUser;
    } catch (error) {
      console.error('Error creating guest TBT user with GraphQL:', error);
      throw error;
    }
  }

  static async createTBTUser(amplifyUser) {
    try {
      const now = new Date().toISOString();
      const dataClient = getDataClient();
      console.log('🆕 Creating TBT user for:', amplifyUser.signInDetails?.loginId);
      
      const { data } = await dataClient.models.TBTUser.create({
        input: {
          email: amplifyUser.signInDetails?.loginId,
          cognitoUserId: amplifyUser.userId,
          tbtAuthStatus: 'tbt',
          accessLevel: 'tbt',
          amplifyAuthVerified: true,
          createdAt: now,
          lastLoginAt: now,
          lastActiveAt: now,
          currentSessionStart: now,
          totalLogins: 1,
          consecutiveLogins: 1,
          lastLoginStreak: 0,
          totalActiveTime: 0,
          totalIdleTime: 0,
          currentSessionActiveTime: 0,
          assignmentsCompleted: 0,
          assignmentsInProgress: 0,
          totalAssignmentScore: 0.0,
          averageAssignmentScore: 0.0,
          highestAssignmentScore: 0.0,
          diagramsCreated: 0,
          diagramsShared: 0,
          simulationsRun: 0,
          loopsIdentified: 0,
          learningLevel: 'beginner',
          skillsUnlocked: JSON.stringify([]),
          achievements: JSON.stringify([]),
          preferences: JSON.stringify({
            theme: 'light',
            autoSave: true,
            showGrid: true
          }),
          metadata: JSON.stringify({
            authFlow: 'amplify_auth -> tbt_auth_registered',
            createdAsTBT: true,
            source: 'amplify_auth'
          })
        }
      });
      console.log('✅ TBT user created successfully');
      return data;
    } catch (error) {
      console.error('Error creating TBT user:', error);
      throw error;
    }
  }

  static async createTBTUserWithGraphQL(dataClient, amplifyUser) {
    try {
      const now = new Date().toISOString();
      console.log('🆕 Creating TBT user with GraphQL for:', amplifyUser.signInDetails?.loginId);
      
      const { data } = await dataClient.graphql({
        query: `mutation CreateTBTUser($input: CreateTBTUserInput!) {
          createTBTUser(input: $input) {
            id
            email
            tbtAuthStatus
            accessLevel
            createdAt
            lastLoginAt
          }
        }`,
        variables: {
          input: {
            email: amplifyUser.signInDetails?.loginId,
            cognitoUserId: amplifyUser.userId,
            tbtAuthStatus: 'tbt',
            accessLevel: 'tbt',
            amplifyAuthVerified: true,
            createdAt: now,
            lastLoginAt: now,
            lastActiveAt: now,
            currentSessionStart: now,
            totalLogins: 1,
            consecutiveLogins: 1,
            lastLoginStreak: 0,
            totalActiveTime: 0,
            totalIdleTime: 0,
            currentSessionActiveTime: 0,
            assignmentsCompleted: 0,
            assignmentsInProgress: 0,
            totalAssignmentScore: 0.0,
            averageAssignmentScore: 0.0,
            highestAssignmentScore: 0.0,
            diagramsCreated: 0,
            diagramsShared: 0,
            simulationsRun: 0,
            loopsIdentified: 0,
            learningLevel: 'beginner',
            skillsUnlocked: JSON.stringify([]),
            achievements: JSON.stringify([]),
            preferences: JSON.stringify({
              theme: 'light',
              autoSave: true,
              showGrid: true
            }),
            metadata: JSON.stringify({
              authFlow: 'amplify_auth -> tbt_auth_registered',
              createdAsTBT: true,
              source: 'amplify_auth'
            })
          }
        }
      });
      console.log('✅ TBT user created successfully with GraphQL');
      return data.createTBTUser;
    } catch (error) {
      console.error('Error creating TBT user with GraphQL:', error);
      throw error;
    }
  }

  static async updateUserLoginStats(tbtUser) {
    try {
      const now = new Date().toISOString();
      const lastLogin = new Date(tbtUser.lastLoginAt);
      const today = new Date();
      const daysSinceLastLogin = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
      
      // Calculate consecutive logins
      let consecutiveLogins = tbtUser.consecutiveLogins || 0;
      if (daysSinceLastLogin === 1) {
        consecutiveLogins += 1;
      } else if (daysSinceLastLogin > 1) {
        consecutiveLogins = 1;
      }

      const dataClient = getDataClient();
      const { data } = await dataClient.models.TBTUser.update({
        input: {
          id: tbtUser.id,
          lastLoginAt: now,
          lastActiveAt: now,
          currentSessionStart: now,
          totalLogins: (tbtUser.totalLogins || 0) + 1,
          consecutiveLogins: consecutiveLogins,
          currentSessionActiveTime: 0
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error updating user login stats:', error);
      throw error;
    }
  }

  static async updateUserLoginStatsWithGraphQL(dataClient, tbtUser) {
    try {
      const now = new Date().toISOString();
      const lastLogin = new Date(tbtUser.lastLoginAt);
      const today = new Date();
      const daysSinceLastLogin = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
      
      // Calculate consecutive logins
      let consecutiveLogins = tbtUser.consecutiveLogins || 0;
      if (daysSinceLastLogin === 1) {
        consecutiveLogins += 1;
      } else if (daysSinceLastLogin > 1) {
        consecutiveLogins = 1;
      }

      const { data } = await dataClient.graphql({
        query: `mutation UpdateTBTUser($input: UpdateTBTUserInput!) {
          updateTBTUser(input: $input) {
            id
            email
            tbtAuthStatus
            accessLevel
            lastLoginAt
            totalLogins
            consecutiveLogins
          }
        }`,
        variables: {
          input: {
            id: tbtUser.id,
            lastLoginAt: now,
            lastActiveAt: now,
            currentSessionStart: now,
            totalLogins: (tbtUser.totalLogins || 0) + 1,
            consecutiveLogins: consecutiveLogins,
            currentSessionActiveTime: 0
          }
        }
      });
      
      return data.updateTBTUser;
    } catch (error) {
      console.error('Error updating user login stats with GraphQL:', error);
      throw error;
    }
  }

  // Activity tracking methods
  static async updateUserActivity(userId, isActive = true, actionType = null) {
    try {
      const dataClient = getDataClient();
      
      // Check if models are available, if not, skip activity tracking
      if (!dataClient.models || Object.keys(dataClient.models).length === 0) {
        console.log('⚠️ Skipping activity tracking - models not available');
        return;
      }
      
      const now = new Date().toISOString();
      
      // Use GraphQL approach since models are not available
      const { data: userData } = await dataClient.graphql({
        query: `query GetTBTUser($id: ID!) {
          getTBTUser(id: $id) {
            id
            email
            currentSessionStart
            currentSessionActiveTime
            totalIdleTime
            lastActiveAt
          }
        }`,
        variables: { id: userId }
      });
      
      const user = userData.getTBTUser;
      if (!user) return;

      const sessionStart = new Date(user.currentSessionStart);
      const currentTime = new Date();
      const sessionDuration = Math.floor((currentTime - sessionStart) / 1000);

      let updates = {
        id: userId,
        lastActiveAt: now
      };

      if (isActive) {
        updates.currentSessionActiveTime = (user.currentSessionActiveTime || 0) + 1;
      } else {
        updates.totalIdleTime = (user.totalIdleTime || 0) + 1;
      }

      await dataClient.graphql({
        query: `mutation UpdateTBTUser($input: UpdateTBTUserInput!) {
          updateTBTUser(input: $input) {
            id
            lastActiveAt
            currentSessionActiveTime
            totalIdleTime
          }
        }`,
        variables: { input: updates }
      });

      // Log activity to session
      await this.logActivityToSession(userId, actionType, isActive);
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  }

  static async logActivityToSession(userId, actionType, isActive) {
    try {
      const now = new Date().toISOString();
      const sessionId = `session_${userId}_${new Date().toISOString().split('T')[0]}`;
      
      // For now, let's skip session logging to focus on the core auth functionality
      // This can be implemented later with the proper Data client operations
      // console.log('Activity logged:', { userId, actionType, isActive, sessionId });
    } catch (error) {
      console.error('Error logging activity to session:', error);
    }
  }

  // Assignment tracking methods - simplified for now
  static async startAssignment(userId, assignmentId) {
    try {
      // console.log('Starting assignment:', { userId, assignmentId });
      // TODO: Implement with Data client operations
      return { id: 'temp-assignment-id', status: 'in_progress' };
    } catch (error) {
      console.error('Error starting assignment:', error);
      throw error;
    }
  }

  static async completeAssignment(userAssignmentId, score, diagramData) {
    try {
      // console.log('Completing assignment:', { userAssignmentId, score });
      // TODO: Implement with Data client operations
      return { id: userAssignmentId, status: 'completed', score };
    } catch (error) {
      console.error('Error completing assignment:', error);
      throw error;
    }
  }

  static async updateUserAssignmentStats(userId, newScore) {
    try {
      // console.log('Updating assignment stats:', { userId, newScore });
      // TODO: Implement with Data client operations
    } catch (error) {
      console.error('Error updating user assignment stats:', error);
    }
  }

  // Progress tracking methods - simplified for now
  static async trackDiagramCreation(userId) {
    try {
      // console.log('Tracking diagram creation:', { userId });
      // TODO: Implement with Data client operations
    } catch (error) {
      console.error('Error tracking diagram creation:', error);
    }
  }

  static async trackSimulationRun(userId) {
    try {
      // console.log('Tracking simulation run:', { userId });
      // TODO: Implement with Data client operations
    } catch (error) {
      console.error('Error tracking simulation run:', error);
    }
  }

  static async trackLoopIdentification(userId, loopCount = 1) {
    try {
      // console.log('Tracking loop identification:', { userId, loopCount });
      // TODO: Implement with Data client operations
    } catch (error) {
      console.error('Error tracking loop identification:', error);
    }
  }

  // Reset logging flags for debugging
  static resetLoggingFlags() {
    this._authAttempted = false;
    this._userCreated = false;
    this._authCompleted = false;
    this._authErrorLogged = false;
  }
} 
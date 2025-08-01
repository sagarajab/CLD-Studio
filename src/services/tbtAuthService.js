import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';

export class TBTAuthService {
  /**
   * Step 1: Verify amplify_Auth passed
   * Step 2: Check if user is registered in TBTRegisteredStudents
   * Step 3: Check/create user in TBTUser table for progress tracking
   * Step 4: Grant appropriate access level
   */
  static async performTBTAuth() {
    try {
      // Step 1: Verify amplify_Auth
      const amplifyUser = await getCurrentUser();
      const userEmail = amplifyUser.signInDetails?.loginId;
      
      if (!userEmail) {
        throw new Error('amplify_Auth verification failed - no user email');
      }

      // Only log once per auth attempt
      if (!this._authAttempted) {
        console.log('✅ amplify_Auth passed for:', userEmail);
        this._authAttempted = true;
      }

      const client = generateClient();

      // Step 2: Check if user is registered in TBTRegisteredStudents
      const { data: registeredStudents } = await client.models.TBTRegisteredStudents.list({
        filter: { email: { eq: userEmail } }
      });

      const isRegistered = registeredStudents.length > 0;

      // Step 3: Check existing TBTUser record
      const { data: tbtUsers } = await client.models.TBTUser.list({
        filter: { email: { eq: userEmail } }
      });

      const existingTBTUser = tbtUsers[0];

      if (!isRegistered) {
        // User not in registered students list - create or update to guest user
        if (!existingTBTUser) {
          if (!this._userCreated) {
            console.log('🆕 Creating new TBT user with guest access (not registered)');
            this._userCreated = true;
          }
          const guestUser = await this.createGuestTBTUser(amplifyUser);
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
          console.log('✅ tbt_auth completed - Status: tbt, Level:', updatedUser.accessLevel);
          this._authCompleted = true;
        }

        return { 
          tbtAuthStatus: 'tbt', 
          accessLevel: updatedUser.accessLevel, 
          user: updatedUser,
          isNewUser: false,
          amplifyAuthVerified: true
        };
      }
    } catch (error) {
      if (!this._authErrorLogged) {
        console.error('❌ tbt_auth failed:', error);
        this._authErrorLogged = true;
      }
      return { 
        tbtAuthStatus: 'guest', 
        accessLevel: 'guest', 
        user: null,
        isNewUser: false,
        amplifyAuthVerified: false
      };
    }
  }

  static async createGuestTBTUser(amplifyUser) {
    try {
      const now = new Date().toISOString();
      const client = generateClient();
      const { data } = await client.models.TBTUser.create({
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
      return data;
    } catch (error) {
      console.error('Error creating guest TBT user:', error);
      throw error;
    }
  }

  static async createTBTUser(amplifyUser) {
    try {
      const now = new Date().toISOString();
      const client = generateClient();
      const { data } = await client.models.TBTUser.create({
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
      return data;
    } catch (error) {
      console.error('Error creating TBT user:', error);
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

      const client = generateClient();
      const { data } = await client.models.TBTUser.update({
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

  // Activity tracking methods
  static async updateUserActivity(userId, isActive = true, actionType = null) {
    try {
      const now = new Date().toISOString();
      const client = generateClient();
      
      // Get user by ID
      const { data: userData } = await client.models.TBTUser.list({
        filter: { id: { eq: userId } }
      });
      
      const users = userData || [];
      if (users.length === 0) return;

      const user = users[0];
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

      await client.models.TBTUser.update({
        input: updates
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
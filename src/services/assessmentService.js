import { generateClient } from 'aws-amplify/api';
import { validateAssignmentResponse, validateAssignmentSubmission } from '../utils/validation.js';

// Lazy initialization of client to avoid calling generateClient before Amplify is configured
let _client = null;

const getClient = () => {
  if (!_client) {
    try {
      _client = generateClient();
      console.log('✅ AssessmentService: Data client created successfully');
    } catch (error) {
      console.error('❌ AssessmentService: Failed to create Data client:', error);
      // Check if it's an Amplify configuration error
      if (error.message.includes('Amplify has not been configured')) {
        throw new Error('Amplify has not been configured yet. Please ensure Amplify.configure() has been called before using AssessmentService.');
      }
      throw error;
    }
  }
  return _client;
};

// Reset function to clear client cache (useful for testing or re-initialization)
export const resetAssessmentServiceClient = () => {
  _client = null;
  console.log('🔄 AssessmentService: Client cache cleared');
};

export class AssessmentService {
  /**
   * Get or create user assessment record
   */
  static async getUserAssessment(email, cognitoUserId = null) {
    try {
      console.log('getUserAssessment called with:', { email, cognitoUserId });
      
      // Check if new schema is available
      if (!getClient().models.UserAssessment) {
        console.log('UserAssessment model not available yet, returning null');
        return null;
      }

      // Try to get existing user assessment
      console.log('Searching for existing user with email:', email);
      const { data: existingUsers } = await getClient().models.UserAssessment.list({
        filter: { email: { eq: email } }
      });

      console.log('Existing users found:', existingUsers.length);

      if (existingUsers.length > 0) {
        console.log('Returning existing user:', existingUsers[0].id);
        return existingUsers[0];
      }

      // Create new user assessment if doesn't exist
      console.log('No existing user found, creating new user assessment...');
      const now = new Date().toISOString();
      
      // Get TBT auth status and access level from the auth store
      let finalTbtAuthStatus = 'guest';
      let finalAccessLevel = 'guest';
      
      try {
        const tbtAuthStore = await import('../stores/tbtAuthStore.js');
        const tbtAuthState = tbtAuthStore.default.getState();
        finalTbtAuthStatus = tbtAuthState.tbtAuthStatus || 'guest';
        finalAccessLevel = tbtAuthState.accessLevel || 'guest';
      } catch (importError) {
        console.warn('Could not import tbtAuthStore, using defaults:', importError);
      }
      
      const userInput = {
        email,
        cognitoUserId: cognitoUserId || 'unknown', // Use 'unknown' as fallback
        tbtAuthStatus: finalTbtAuthStatus,
        accessLevel: finalAccessLevel,
        createdAt: now,
        lastLoginAt: now,
        assessmentData: JSON.stringify({})
      };
      
      console.log('Creating user with input:', userInput);
      
      try {
        const { data: newUser } = await getClient().models.UserAssessment.create({
          input: userInput
        });
        
        console.log('Successfully created new user:', newUser.id);
        return newUser;
      } catch (createError) {
        console.error('Error creating new user assessment:', createError);
        console.error('Create error details:', {
          message: createError.message,
          name: createError.name,
          stack: createError.stack
        });
        throw createError;
      }
    } catch (error) {
      console.error('Error getting user assessment:', error);
      throw error;
    }
  }

  /**
   * Ensure user assessment record exists, create if it doesn't
   */
  static async ensureUserAssessment(email, cognitoUserId = null, tbtAuthStatus = null, accessLevel = null) {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`ensureUserAssessment called with:`, { email, cognitoUserId, tbtAuthStatus, accessLevel });
        console.log(`Attempt ${retryCount + 1} of ${maxRetries}`);
        
        // Check if new schema is available
        console.log('Checking if UserAssessment model is available...');
        const client = getClient();
        console.log('client.models:', client.models);
        console.log('client.models.UserAssessment:', client.models.UserAssessment);
        
        if (!client.models.UserAssessment) {
          console.log('UserAssessment model not available yet, returning null');
          return null;
        }
        
        // Development mode fallback - if we're in development and having issues, return a mock user
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Checking if we should use fallback...');
          try {
            // Test if we can actually create a user
            const testResponse = await client.models.UserAssessment.create({
              input: {
                email: 'test@example.com',
                cognitoUserId: 'test-user-id',
                tbtAuthStatus: 'guest',
                accessLevel: 'guest',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                assessmentData: JSON.stringify({})
              }
            });
            
            if (!testResponse || !testResponse.data) {
              console.log('Development mode: Database create test failed, using fallback');
              return {
                id: 'dev-fallback-id',
                email: email,
                cognitoUserId: cognitoUserId || 'dev-user-id',
                tbtAuthStatus: 'guest',
                accessLevel: 'guest',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                assessmentData: JSON.stringify({})
              };
            }
            
            // Clean up test user
            if (testResponse.data.id) {
              try {
                await client.models.UserAssessment.delete({ id: testResponse.data.id });
              } catch (cleanupError) {
                console.warn('Could not cleanup test user:', cleanupError);
              }
            }
          } catch (testError) {
            console.log('Development mode: Database test failed, using fallback:', testError.message);
            return {
              id: 'dev-fallback-id',
              email: email,
              cognitoUserId: cognitoUserId || 'dev-user-id',
              tbtAuthStatus: 'guest',
              accessLevel: 'guest',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              assessmentData: JSON.stringify({})
            };
          }
        }

        // Test database connectivity first
        try {
          console.log('Testing database connectivity...');
          await client.models.UserAssessment.list({ limit: 1 });
          console.log('Database connectivity test successful');
        } catch (connectivityError) {
          console.error('Database connectivity test failed:', connectivityError);
          throw new Error(`Database connectivity issue: ${connectivityError.message}`);
        }

        // Try to get existing user assessment
        try {
          const { data: existingUsers } = await client.models.UserAssessment.list({
            filter: { email: { eq: email } }
          });

          if (existingUsers.length > 0) {
            console.log('User assessment already exists:', existingUsers[0].id);
            return existingUsers[0];
          }
        } catch (listError) {
          console.error('Error listing existing users:', listError);
          throw new Error(`Failed to check existing user: ${listError.message}`);
        }

        // Create new user assessment
        console.log('Creating new user assessment for:', email);
        const now = new Date().toISOString();
        
        // Get TBT auth status and access level from the auth store if not provided
        let finalTbtAuthStatus = tbtAuthStatus;
        let finalAccessLevel = accessLevel;
        
        if (!finalTbtAuthStatus || !finalAccessLevel) {
          try {
            const tbtAuthStore = await import('../stores/tbtAuthStore.js');
            const tbtAuthState = tbtAuthStore.default.getState();
            finalTbtAuthStatus = finalTbtAuthStatus || tbtAuthState.tbtAuthStatus || 'guest';
            finalAccessLevel = finalAccessLevel || tbtAuthState.accessLevel || 'guest';
          } catch (importError) {
            console.warn('Could not import tbtAuthStore, using defaults:', importError);
            finalTbtAuthStatus = finalTbtAuthStatus || 'guest';
            finalAccessLevel = finalAccessLevel || 'guest';
          }
        }
        
        // Additional debugging for TBT auth status
        console.log('TBT Auth Status Debug:', {
          email,
          finalTbtAuthStatus,
          finalAccessLevel,
          providedTbtAuthStatus: tbtAuthStatus,
          providedAccessLevel: accessLevel
        });
        
        // Validate enum values against schema
        const validTbtAuthStatuses = ['guest', 'tbt'];
        const validAccessLevels = ['guest', 'tbt', 'admin'];
        
        if (!validTbtAuthStatuses.includes(finalTbtAuthStatus)) {
          console.warn(`Invalid tbtAuthStatus: ${finalTbtAuthStatus}, defaulting to 'guest'`);
          finalTbtAuthStatus = 'guest';
        }
        
        if (!validAccessLevels.includes(finalAccessLevel)) {
          console.warn(`Invalid accessLevel: ${finalAccessLevel}, defaulting to 'guest'`);
          finalAccessLevel = 'guest';
        }
        
        // Get the actual cognitoUserId from localStorage if not provided
        let finalCognitoUserId = cognitoUserId;
        if (!finalCognitoUserId || finalCognitoUserId === 'unknown') {
          const storedCognitoId = localStorage.getItem('currentUserCognitoId');
          if (storedCognitoId) {
            finalCognitoUserId = storedCognitoId;
            console.log('Using stored cognitoUserId:', finalCognitoUserId);
          } else {
            // Generate a fallback ID for the current session
            finalCognitoUserId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log('Generated fallback cognitoUserId:', finalCognitoUserId);
          }
        }
        
        const userInput = {
          email,
          cognitoUserId: finalCognitoUserId,
          tbtAuthStatus: finalTbtAuthStatus,
          accessLevel: finalAccessLevel,
          createdAt: now,
          lastLoginAt: now,
          assessmentData: JSON.stringify({})
        };
        
        console.log('Creating user assessment with input:', userInput);
        
        try {
          console.log('About to call client.models.UserAssessment.create...');
          console.log('User input for creation:', userInput);
          
          const createResponse = await client.models.UserAssessment.create({
            input: userInput
          });
          
          console.log('Raw create response:', createResponse);
          
          // Check if the response is null or undefined
          if (!createResponse) {
            throw new Error('Create operation returned null response');
          }
          
          // Check if there are errors in the response
          if (createResponse.errors && createResponse.errors.length > 0) {
            console.error('Create operation returned errors:', createResponse.errors);
            const errorMessage = createResponse.errors.map(err => err.message).join(', ');
            throw new Error(`Create operation failed: ${errorMessage}`);
          }
          
          // Check if data is null or undefined
          if (!createResponse.data) {
            console.error('Create response has no data property:', createResponse);
            throw new Error('Create operation returned null data');
          }
          
          const newUser = createResponse.data;
          
          // Check if newUser is null or undefined
          if (!newUser) {
            console.error('Create response data is null:', createResponse);
            throw new Error('Create operation returned null user data');
          }
          
          // Check if newUser has an id
          if (!newUser.id) {
            console.error('Created user has no id:', newUser);
            throw new Error('Created user assessment has no ID');
          }
          
          console.log('Successfully created user assessment:', newUser.id);
          console.log('Created user data:', newUser);
          return newUser;
        } catch (createError) {
          console.error('Error during UserAssessment.create:', createError);
          console.error('Create error details:', {
            message: createError.message,
            name: createError.name,
            stack: createError.stack
          });
          
          // Check if it's an authentication error
          if (createError.message.includes('Unauthorized') || createError.message.includes('Forbidden')) {
            throw new Error('Authentication failed. Please ensure you are properly logged in.');
          }
          
          // Check if it's a validation error
          if (createError.message.includes('Validation') || createError.message.includes('invalid')) {
            throw new Error(`Data validation failed: ${createError.message}`);
          }
          
          // Check if it's a constraint violation (like duplicate email)
          if (createError.message.includes('duplicate') || createError.message.includes('already exists')) {
            console.log('User already exists, trying to fetch existing user...');
            // Try to get the existing user
            try {
              const { data: existingUsers } = await client.models.UserAssessment.list({
                filter: { email: { eq: email } }
              });
              if (existingUsers.length > 0) {
                console.log('Found existing user:', existingUsers[0].id);
                return existingUsers[0];
              }
            } catch (fetchError) {
              console.error('Error fetching existing user:', fetchError);
            }
          }
          
          // If it's a network error or temporary issue, retry
          if (createError.message.includes('Network') || createError.message.includes('timeout') || createError.message.includes('temporary')) {
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`Retrying in ${retryCount * 1000}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
              continue;
            }
          }
          
          // Generic error
          throw new Error(`Failed to create user assessment: ${createError.message}`);
        }
      } catch (error) {
        console.error(`Error ensuring user assessment (attempt ${retryCount + 1}):`, error);
        
        // If it's a network error or temporary issue, retry
        if (error.message.includes('Network') || error.message.includes('timeout') || error.message.includes('temporary') || error.message.includes('connectivity')) {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`Retrying in ${retryCount * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            continue;
          }
        }
        
        throw error;
      }
    }
    
    throw new Error(`Failed to create user assessment after ${maxRetries} attempts`);
  }

  /**
   * Test database connectivity
   */
  static async testDatabaseConnection() {
    try {
      console.log('Testing database connection...');
      
      if (!getClient().models.UserAssessment) {
        console.log('UserAssessment model not available');
        return { success: false, error: 'Model not available' };
      }
      
      // Try to list users
      const { data: users } = await getClient().models.UserAssessment.list();
      console.log('Database connection test successful, found users:', users.length);
      
      return { success: true, userCount: users.length };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user's TBT auth status and access level
   */
  static async updateUserAuthStatus(email, tbtAuthStatus, accessLevel) {
    try {
      if (!getClient().models.UserAssessment) {
        console.log('UserAssessment model not available, skipping auth status update');
        return;
      }

      // Find user by email
      const { data: existingUsers } = await getClient().models.UserAssessment.list({
        filter: { email: { eq: email } }
      });

      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        await getClient().models.UserAssessment.update({
          id: user.id,
          tbtAuthStatus,
          accessLevel,
          lastLoginAt: new Date().toISOString()
        });
        console.log('Updated user auth status:', { email, tbtAuthStatus, accessLevel });
      }
    } catch (error) {
      console.error('Error updating user auth status:', error);
    }
  }

  /**
   * Update user login time
   */
  static async updateLastLogin(userId) {
    try {
      if (!getClient().models.UserAssessment) {
        console.log('UserAssessment model not available, skipping login update');
        return;
      }

      await getClient().models.UserAssessment.update({
        id: userId,
        lastLoginAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Evaluate user responses against assignment answers
   */
  static evaluateResponses(userResponses, assignment) {
    const evaluated = {};
    let totalScore = 0;
    let maxTotalScore = 0;

    assignment.questions.forEach(question => {
      // Try to find the response in different formats
      let userResponse = userResponses[question.id];
      
      // If not found with simple question ID, try assignment-specific format
      if (!userResponse) {
        const assignmentSpecificId = `${assignment.id}-${question.id}`;
        const assignmentResponse = userResponses[assignmentSpecificId];
        if (assignmentResponse) {
          // Extract the actual response from the stored object
          userResponse = assignmentResponse.response || assignmentResponse;
        }
      }
      
      const maxScore = question.maxScore;
      maxTotalScore += maxScore;

      if (!userResponse) {
        // Not attempted
        evaluated[question.id] = {
          response: null,
          status: 'not-attempted',
          score: 0,
          maxScore,
          isCorrect: false,
          attempts: 0,
          feedback: 'Question not attempted.',
          details: {}
        };
      } else {
        // Evaluate the response
        const evaluation = this.evaluateQuestion(question, userResponse);
        totalScore += evaluation.score;

        evaluated[question.id] = {
          response: userResponse,
          status: 'submitted',
          score: evaluation.score,
          maxScore,
          isCorrect: evaluation.isCorrect,
          attempts: 1,
          feedback: evaluation.feedback || 'No specific feedback available.',
          details: evaluation.details || {}
        };
      }
    });

    return {
      ...evaluated,
      totalScore,
      maxTotalScore,
      assignmentStatus: 'submitted'
    };
  }

  /**
   * Evaluate individual question response
   */
  static evaluateQuestion(question, userResponse) {
    switch (question.questionType) {
      case 'mcq':
        return this.evaluateMCQQuestion(question, userResponse);
      case 'nat':
        return this.evaluateNATQuestion(question, userResponse);
      case 'text':
        return this.evaluateTextQuestion(question, userResponse);
      case 'edit-cld':
        return this.evaluateEditCLDQuestion(question, userResponse);
      case 'select-nodes':
        return this.evaluateSelectNodesQuestion(question, userResponse);
      case 'select-connections':
        return this.evaluateSelectConnectionsQuestion(question, userResponse);
      default:
        return { score: 0, isCorrect: false };
    }
  }

  /**
   * Evaluate text question
   */
  static evaluateTextQuestion(question, userResponse) {
    const expectedAnswer = question.correctAnswer || '';
    const userAnswer = userResponse || '';
    
    // Enhanced text evaluation with multiple scoring criteria
    let score = 0;
    let feedback = [];
    let isCorrect = false;
    let expectedKeywords = [];
    let matchedKeywords = [];
    
    // Exact match check
    const exactMatch = userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();
    if (exactMatch) {
      score = question.maxScore;
      isCorrect = true;
      feedback.push('Perfect answer!');
    } else {
      // Partial scoring based on keyword matching
      expectedKeywords = expectedAnswer.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      const userKeywords = userAnswer.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      
      matchedKeywords = expectedKeywords.filter(keyword => 
        userKeywords.some(userKeyword => userKeyword.includes(keyword) || keyword.includes(userKeyword))
      );
      
      const keywordScore = (matchedKeywords.length / Math.max(expectedKeywords.length, 1)) * question.maxScore * 0.7;
      score = Math.round(keywordScore);
      
      if (score > 0) {
        feedback.push(`Good effort! You mentioned ${matchedKeywords.length} key concepts.`);
      } else {
        feedback.push('Consider reviewing the key concepts for this topic.');
      }
    }
    
    // Length bonus (encourage detailed answers)
    const minExpectedLength = expectedAnswer.length * 0.5;
    if (userAnswer.length >= minExpectedLength && score > 0) {
      const lengthBonus = Math.min(question.maxScore * 0.1, 2);
      score = Math.min(question.maxScore, score + lengthBonus);
      feedback.push('Good detail in your response.');
    }
    
    return { 
      score: Math.round(score), 
      isCorrect: score >= question.maxScore * 0.8,
      feedback: feedback.join(' '),
      details: {
        exactMatch,
        keywordMatches: expectedKeywords.length,
        matchedKeywords: matchedKeywords.length,
        userAnswerLength: userAnswer.length,
        expectedLength: expectedAnswer.length
      }
    };
  }

  /**
   * Evaluate NAT question
   */
  static evaluateNATQuestion(question, userResponse) {
    const expectedNumber = parseFloat(question.correctAnswer) || 0;
    const userNumber = parseFloat(userResponse) || 0;
    const tolerance = question.tolerance || 0;

    const difference = Math.abs(userNumber - expectedNumber);
    const isCorrect = difference <= tolerance;
    let score = 0;
    let feedback = '';
    
    if (isCorrect) {
      score = question.maxScore;
      feedback = 'Correct answer!';
    } else {
      // Partial credit for close answers
      const percentageOff = difference / Math.max(expectedNumber, 1);
      if (percentageOff <= 0.1) { // Within 10%
        score = Math.round(question.maxScore * 0.8);
        feedback = 'Very close! Check your calculation.';
      } else if (percentageOff <= 0.25) { // Within 25%
        score = Math.round(question.maxScore * 0.5);
        feedback = 'Close, but not quite right. Review the problem.';
      } else {
        score = 0;
        feedback = 'Incorrect answer. Review the problem carefully.';
      }
    }
    
    return { 
      score, 
      isCorrect: isCorrect,
      feedback,
      details: {
        expectedValue: expectedNumber,
        userValue: userNumber,
        difference,
        tolerance,
        percentageOff: difference / Math.max(expectedNumber, 1)
      }
    };
  }

  /**
   * Evaluate MCQ question
   */
  static evaluateMCQQuestion(question, userResponse) {
    const correctOption = question.correctAnswer || '';
    const userOption = userResponse || '';

    const isCorrect = userOption === correctOption;
    const score = isCorrect ? question.maxScore : 0;
    
    const feedback = isCorrect 
      ? 'Correct! Well done.' 
      : `Incorrect. The correct answer was: ${correctOption}`;
    
    return { 
      score, 
      isCorrect,
      feedback,
      details: {
        selectedOption: userOption,
        correctOption,
        isCorrect
      }
    };
  }

  /**
   * Evaluate Edit CLD question using adjacency matrix comparison
   */
  static evaluateEditCLDQuestion(question, userResponse) {
    try {
      const userDiagram = typeof userResponse === 'string' ? JSON.parse(userResponse) : userResponse;
      const expectedAdjacencyMatrix = typeof question.correctAnswer === 'string' 
        ? JSON.parse(question.correctAnswer) 
        : question.correctAnswer;

      if (!userDiagram || !expectedAdjacencyMatrix) {
        return {
          score: 0,
          isCorrect: false,
          feedback: 'Invalid diagram or answer format.',
          details: { error: 'Missing diagram or adjacency matrix' }
        };
      }

      // Generate adjacency matrix from user diagram
      const userAdjacencyMatrix = this.generateAdjacencyMatrix(userDiagram);
      
      // Compare adjacency matrices
      const similarity = this.compareAdjacencyMatrices(userAdjacencyMatrix, expectedAdjacencyMatrix);
      const score = Math.round(similarity * question.maxScore);
      const isCorrect = similarity >= 0.8; // 80% similarity threshold

      const feedback = isCorrect 
        ? 'Excellent! Your diagram matches the expected structure.' 
        : 'Your diagram structure needs some adjustments.';

      return {
        score,
        isCorrect,
        feedback,
        details: {
          similarity,
          userMatrix: userAdjacencyMatrix,
          expectedMatrix: expectedAdjacencyMatrix
        }
      };
    } catch (error) {
      console.error('Error evaluating edit CLD question:', error);
      return {
        score: 0,
        isCorrect: false,
        feedback: 'Error evaluating diagram. Please ensure your diagram is properly formatted.',
        details: { error: error.message }
      };
    }
  }

  /**
   * Evaluate Select Nodes question
   */
  static evaluateSelectNodesQuestion(question, userResponse) {
    try {
      const selectedNodeIds = typeof userResponse === 'string' ? JSON.parse(userResponse) : userResponse;
      const expectedNodeIds = question.correctAnswer || [];

      if (!Array.isArray(selectedNodeIds) || !Array.isArray(expectedNodeIds)) {
        return {
          score: 0,
          isCorrect: false,
          feedback: 'Invalid selection format.',
          details: { error: 'Invalid arrays' }
        };
      }

      // Calculate similarity based on selected nodes
      const correctSelections = selectedNodeIds.filter(id => expectedNodeIds.includes(id)).length;
      const incorrectSelections = selectedNodeIds.filter(id => !expectedNodeIds.includes(id)).length;
      const missedSelections = expectedNodeIds.filter(id => !selectedNodeIds.includes(id)).length;

      const totalExpected = expectedNodeIds.length;
      const totalSelected = selectedNodeIds.length;

      // Penalize for incorrect and missed selections
      const accuracy = totalExpected > 0 ? correctSelections / totalExpected : 0;
      const precision = totalSelected > 0 ? correctSelections / totalSelected : 0;
      
      // F1 score for balanced evaluation
      const f1Score = (precision + accuracy) > 0 ? (2 * precision * accuracy) / (precision + accuracy) : 0;
      const score = Math.round(f1Score * question.maxScore);
      const isCorrect = f1Score >= 0.8; // 80% F1 score threshold

      const feedback = isCorrect 
        ? 'Perfect! You selected the correct nodes.' 
        : `You selected ${correctSelections} out of ${totalExpected} correct nodes.`;

      return {
        score,
        isCorrect,
        feedback,
        details: {
          correctSelections,
          incorrectSelections,
          missedSelections,
          accuracy,
          precision,
          f1Score
        }
      };
    } catch (error) {
      console.error('Error evaluating select nodes question:', error);
      return {
        score: 0,
        isCorrect: false,
        feedback: 'Error evaluating selection. Please try again.',
        details: { error: error.message }
      };
    }
  }

  /**
   * Evaluate Select Connections question
   */
  static evaluateSelectConnectionsQuestion(question, userResponse) {
    try {
      const selectedConnectionIds = typeof userResponse === 'string' ? JSON.parse(userResponse) : userResponse;
      const expectedConnectionIds = question.correctAnswer || [];

      if (!Array.isArray(selectedConnectionIds) || !Array.isArray(expectedConnectionIds)) {
        return {
          score: 0,
          isCorrect: false,
          feedback: 'Invalid selection format.',
          details: { error: 'Invalid arrays' }
        };
      }

      // Calculate similarity based on selected connections
      const correctSelections = selectedConnectionIds.filter(id => expectedConnectionIds.includes(id)).length;
      const incorrectSelections = selectedConnectionIds.filter(id => !expectedConnectionIds.includes(id)).length;
      const missedSelections = expectedConnectionIds.filter(id => !selectedConnectionIds.includes(id)).length;

      const totalExpected = expectedConnectionIds.length;
      const totalSelected = selectedConnectionIds.length;

      // Penalize for incorrect and missed selections
      const accuracy = totalExpected > 0 ? correctSelections / totalExpected : 0;
      const precision = totalSelected > 0 ? correctSelections / totalSelected : 0;
      
      // F1 score for balanced evaluation
      const f1Score = (precision + accuracy) > 0 ? (2 * precision * accuracy) / (precision + accuracy) : 0;
      const score = Math.round(f1Score * question.maxScore);
      const isCorrect = f1Score >= 0.8; // 80% F1 score threshold

      const feedback = isCorrect 
        ? 'Perfect! You selected the correct connections.' 
        : `You selected ${correctSelections} out of ${totalExpected} correct connections.`;

      return {
        score,
        isCorrect,
        feedback,
        details: {
          correctSelections,
          incorrectSelections,
          missedSelections,
          accuracy,
          precision,
          f1Score
        }
      };
    } catch (error) {
      console.error('Error evaluating select connections question:', error);
      return {
        score: 0,
        isCorrect: false,
        feedback: 'Error evaluating selection. Please try again.',
        details: { error: error.message }
      };
    }
  }

  /**
   * Evaluate diagram question
   */
  static evaluateDiagramQuestion(question, userResponse) {
    try {
      const userDiagram = typeof userResponse === 'string' ? JSON.parse(userResponse) : userResponse;
      const expectedDiagram = typeof question.correctAnswer === 'string' ? JSON.parse(question.correctAnswer) : question.correctAnswer;
      const criteria = question.evaluationCriteria || {};

      let score = 0;
      let feedback = [];
      let details = {};

      // Basic structure evaluation
      const userNodeCount = userDiagram?.nodes?.length || 0;
      const expectedNodeCount = expectedDiagram?.nodes?.length || 0;
      const userEdgeCount = userDiagram?.edges?.length || 0;
      const expectedEdgeCount = expectedDiagram?.edges?.length || 0;

      // Node count scoring
      const minNodes = criteria.minNodes || 3;
      if (userNodeCount >= minNodes) {
        score += question.maxScore * 0.3;
        feedback.push(`Good! You have ${userNodeCount} nodes (minimum required: ${minNodes}).`);
      } else {
        score += (userNodeCount / minNodes) * question.maxScore * 0.3;
        feedback.push(`You need at least ${minNodes} nodes. You have ${userNodeCount}.`);
      }

      // Edge count scoring
      const minEdges = criteria.minEdges || 2;
      if (userEdgeCount >= minEdges) {
        score += question.maxScore * 0.3;
        feedback.push(`Good! You have ${userEdgeCount} connections (minimum required: ${minEdges}).`);
      } else {
        score += (userEdgeCount / minEdges) * question.maxScore * 0.3;
        feedback.push(`You need at least ${minEdges} connections. You have ${userEdgeCount}.`);
      }

      // Loop detection
      const hasLoops = this.detectLoops(userDiagram);
      if (hasLoops) {
        score += question.maxScore * 0.2;
        feedback.push('Excellent! You included feedback loops.');
      } else if (criteria.requireLoops) {
        feedback.push('Your diagram should include feedback loops.');
      }

      // Polarity evaluation
      const polarityScore = this.evaluatePolarity(userDiagram, expectedDiagram);
      score += polarityScore;
      if (polarityScore > 0) {
        feedback.push('Good use of positive and negative connections.');
      } else if (criteria.requirePolarity) {
        feedback.push('Consider using both positive (+) and negative (-) connections.');
      }

      // Node label quality
      const labelScore = this.evaluateNodeLabels(userDiagram);
      score += labelScore;
      if (labelScore > 0) {
        feedback.push('Good descriptive node labels.');
      }

      // Check for specific required elements
      if (criteria.requiredNodes) {
        const missingNodes = criteria.requiredNodes.filter(requiredNode => 
          !userDiagram.nodes.some(node => 
            node.label.toLowerCase().includes(requiredNode.toLowerCase())
          )
        );
        if (missingNodes.length === 0) {
          score += question.maxScore * 0.1;
          feedback.push('All required nodes are present.');
        } else {
          feedback.push(`Missing required nodes: ${missingNodes.join(', ')}`);
        }
      }

      score = Math.round(Math.min(question.maxScore, score));
      const isCorrect = score >= question.maxScore * 0.7;

      details = {
        userNodeCount,
        expectedNodeCount: minNodes,
        userEdgeCount,
        expectedEdgeCount: minEdges,
        hasLoops,
        polarityScore,
        labelScore,
        meetsMinRequirements: userNodeCount >= minNodes && userEdgeCount >= minEdges
      };

      return { 
        score, 
        isCorrect,
        feedback: feedback.join(' '),
        details
      };
    } catch (error) {
      console.error('Error evaluating diagram question:', error);
      return { 
        score: 0, 
        isCorrect: false,
        feedback: 'Error evaluating diagram. Please ensure your diagram is properly formatted.',
        details: { error: error.message }
      };
    }
  }

  /**
   * Detect loops in diagram
   */
  static detectLoops(userDiagram) {
    if (!userDiagram?.edges || userDiagram.edges.length < 3) return false;
    
    // Simple loop detection - check if there are enough edges to form a loop
    const nodeIds = new Set(userDiagram.nodes.map(node => node.id));
    const connectedNodes = new Set();
    
    userDiagram.edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    // If we have at least 3 connected nodes and enough edges, likely has loops
    return connectedNodes.size >= 3 && userDiagram.edges.length >= 3;
  }

  /**
   * Evaluate polarity usage
   */
  static evaluatePolarity(userDiagram, expectedDiagram) {
    if (!userDiagram?.edges) return 0;
    
    const positiveEdges = userDiagram.edges.filter(edge => edge.polarity === 'positive').length;
    const negativeEdges = userDiagram.edges.filter(edge => edge.polarity === 'negative').length;
    const totalEdges = userDiagram.edges.length;
    
    // Bonus for using both polarities
    if (positiveEdges > 0 && negativeEdges > 0) {
      return Math.min(5, (positiveEdges + negativeEdges) / totalEdges * 10);
    }
    
    return 0;
  }

  /**
   * Evaluate node label quality
   */
  static evaluateNodeLabels(userDiagram) {
    if (!userDiagram?.nodes) return 0;
    
    let score = 0;
    userDiagram.nodes.forEach(node => {
      const label = node.label || '';
      if (label.length > 3) score += 1;
      if (label.length > 10) score += 1;
    });
    
    return Math.min(5, score);
  }

  /**
   * Evaluate edit diagram question
   */
  static evaluateEditDiagramQuestion(question, userResponse) {
    try {
      const userDiagram = typeof userResponse === 'string' ? JSON.parse(userResponse) : userResponse;
      const requiredElements = question.requiredElements || {};
      
      let score = 0;
      let feedback = [];
      let details = {};

      // Check for required node
      const requiredNodeName = requiredElements.requiredNode || 'Environmental Carrying Capacity';
      const hasRequiredNode = this.checkForRequiredNode(question, userDiagram);
      if (hasRequiredNode) {
        score += question.maxScore * 0.4;
        feedback.push(`Good! You added the required node: "${requiredNodeName}".`);
      } else {
        feedback.push(`You need to add a node called "${requiredNodeName}".`);
      }

      // Check for balancing loop
      const hasBalancingLoop = this.checkForBalancingLoop(userDiagram);
      if (hasBalancingLoop) {
        score += question.maxScore * 0.4;
        feedback.push('Excellent! You created a balancing feedback loop.');
      } else {
        feedback.push('You need to create a balancing feedback loop with negative connections.');
      }

      // Check for minimum connections
      const minConnections = requiredElements.requiredConnections || 2;
      const userConnections = userDiagram?.edges?.length || 0;
      if (userConnections >= minConnections) {
        score += question.maxScore * 0.2;
        feedback.push(`Good! You have ${userConnections} connections.`);
      } else {
        feedback.push(`You need at least ${minConnections} connections. You have ${userConnections}.`);
      }

      const isCorrect = score >= question.maxScore * 0.7;

      details = {
        hasRequiredNode,
        hasBalancingLoop,
        userConnections,
        requiredConnections: minConnections,
        requiredNode: requiredNodeName
      };

      return { 
        score: Math.round(score), 
        isCorrect,
        feedback: feedback.join(' '),
        details
      };
    } catch (error) {
      console.error('Error evaluating edit diagram question:', error);
      return { 
        score: 0, 
        isCorrect: false,
        feedback: 'Error evaluating diagram. Please ensure your diagram is properly formatted.',
        details: { error: error.message }
      };
    }
  }

  /**
   * Check for required node in edit diagram
   */
  static checkForRequiredNode(question, userDiagram) {
    const requiredNodeName = 'Environmental Carrying Capacity';
    return userDiagram?.nodes?.some(node => 
      node.label?.toLowerCase().includes(requiredNodeName.toLowerCase())
    ) || false;
  }

  /**
   * Check for balancing loop in diagram
   */
  static checkForBalancingLoop(userDiagram) {
    // Simple check for negative connections
    return userDiagram?.edges?.some(edge => 
      edge.polarity === 'negative'
    ) || false;
  }

  /**
   * Submit assignment responses
   */
  static async submitAssignment(email, assignmentId, userResponses, assignmentFilename = null, cognitoUserId = null) {
    try {
      console.log('submitAssignment called with:', { email, assignmentId, assignmentFilename });
      console.log('Environment:', process.env.NODE_ENV);
      console.log('UserAssessment model available:', !!getClient().models.UserAssessment);
      
      // Check if new schema is available or if we're in development mode
      const isDevelopmentMode = process.env.NODE_ENV === 'development';
      const hasUserAssessmentModel = !!getClient().models.UserAssessment;
      
      console.log('Development mode check:', { isDevelopmentMode, hasUserAssessmentModel });
      console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
      console.log('client.models available:', !!getClient().models);
      console.log('client.models.UserAssessment available:', !!getClient().models.UserAssessment);
      
      if (!hasUserAssessmentModel || isDevelopmentMode) {
        console.log('UserAssessment model not available or in development mode, using evaluation only');
        // Load assignment for evaluation
        const filename = assignmentFilename || `${assignmentId}.cldq`;
        const assignmentUrl = `/assignments/${filename}`;
        console.log('Fetching assignment from:', assignmentUrl);
        
        const assignmentResponse = await fetch(assignmentUrl);
        console.log('Assignment response status:', assignmentResponse.status);
        console.log('Assignment response headers:', assignmentResponse.headers);
        
        if (!assignmentResponse.ok) {
          const errorText = await assignmentResponse.text();
          console.error('Assignment fetch failed:', errorText);
          throw new Error(`Failed to load assignment: ${assignmentId} (${assignmentResponse.status})`);
        }
        
        const responseText = await assignmentResponse.text();
        console.log('Assignment response text (first 200 chars):', responseText.substring(0, 200));
        
        let assignment;
        try {
          assignment = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text:', responseText);
          throw new Error(`Invalid JSON in assignment file: ${parseError.message}`);
        }
        
        // Validate assignment submission
        const submissionValidation = validateAssignmentSubmission(userResponses, assignment);
        if (!submissionValidation.isValid) {
          console.error('Assignment submission validation failed:', submissionValidation.errors);
          throw new Error(`Submission validation failed: ${submissionValidation.errors.join(', ')}`);
        }
        
        // Just evaluate responses without saving to database
        const evaluatedResponses = this.evaluateResponses(userResponses, assignment);
        console.log('Development mode: Grading completed successfully', evaluatedResponses);
        return evaluatedResponses;
      }

      // Production mode with database access
      console.log('Attempting database submission with email:', email);
      
      // Test database connection first
      const dbTest = await this.testDatabaseConnection();
      console.log('Database connection test result:', dbTest);
      
      // Validate email
      console.log('Email validation - email:', email);
      console.log('Email validation - email type:', typeof email);
      console.log('Email validation - email === current-user@example.com:', email === 'current-user@example.com');
      
      // Temporary: Allow placeholder email for testing
      if (!email) {
        console.error('No email provided');
        throw new Error('No user email provided. Please ensure you are properly authenticated.');
      }
      
      // Use a test email if placeholder is provided
      const finalEmail = email === 'current-user@example.com' ? 'test-user@example.com' : email;
      console.log('Using email for database operations:', finalEmail);
      
      // Get TBT auth status and access level from the auth store
      let tbtAuthStatus = 'guest';
      let accessLevel = 'guest';
      
      try {
        const tbtAuthStore = await import('../stores/tbtAuthStore.js');
        const tbtAuthState = tbtAuthStore.default.getState();
        tbtAuthStatus = tbtAuthState.tbtAuthStatus || 'guest';
        accessLevel = tbtAuthState.accessLevel || 'guest';
      } catch (importError) {
        console.warn('Could not import tbtAuthStore, using defaults:', importError);
      }
      
      // Ensure user assessment record exists (create if it doesn't)
      console.log('About to call ensureUserAssessment with:', { email: finalEmail, cognitoUserId, tbtAuthStatus, accessLevel });
      
      let userAssessment;
      try {
        userAssessment = await this.ensureUserAssessment(finalEmail, cognitoUserId, tbtAuthStatus, accessLevel);
        console.log('ensureUserAssessment result:', userAssessment);
      } catch (ensureError) {
        console.error('ensureUserAssessment failed:', ensureError);
        
        // If we're in development mode, fall back to evaluation-only mode
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Falling back to evaluation-only mode due to database error');
          return this.submitAssignment(email, assignmentId, userResponses, assignmentFilename, cognitoUserId);
        }
        
        // In production, re-throw the error with more context
        throw new Error(`Database operation failed: ${ensureError.message}. Please try again or contact support if the issue persists.`);
      }
      
      if (!userAssessment) {
        console.error('ensureUserAssessment returned null/undefined');
        
        // If we're in development mode, fall back to evaluation-only mode
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: Falling back to evaluation-only mode due to null user assessment');
          return this.submitAssignment(email, assignmentId, userResponses, assignmentFilename, cognitoUserId);
        }
        
        throw new Error('Could not get or create user assessment record. Please ensure you are properly authenticated.');
      }

      const assessmentData = JSON.parse(userAssessment.assessmentData || '{}');

      // Load assignment
      const filename = assignmentFilename || `${assignmentId}.cldq`;
      const assignmentUrl = `/assignments/${filename}`;
      console.log('Fetching assignment from:', assignmentUrl);
      
      const assignmentResponse = await fetch(assignmentUrl);
      console.log('Assignment response status:', assignmentResponse.status);
      
      if (!assignmentResponse.ok) {
        const errorText = await assignmentResponse.text();
        console.error('Assignment fetch failed:', errorText);
        throw new Error(`Failed to load assignment: ${assignmentId} (${assignmentResponse.status})`);
      }
      
      const responseText = await assignmentResponse.text();
      console.log('Assignment response text (first 200 chars):', responseText.substring(0, 200));
      
      let assignment;
      try {
        assignment = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText);
        throw new Error(`Invalid JSON in assignment file: ${parseError.message}`);
      }

      // Validate assignment submission
      const submissionValidation = validateAssignmentSubmission(userResponses, assignment);
      if (!submissionValidation.isValid) {
        console.error('Assignment submission validation failed:', submissionValidation.errors);
        throw new Error(`Submission validation failed: ${submissionValidation.errors.join(', ')}`);
      }

      // Evaluate responses
      const evaluatedResponses = this.evaluateResponses(userResponses, assignment);

      // Update assessment data
      assessmentData[assignmentId] = evaluatedResponses;

      // Save to database
      await getClient().models.UserAssessment.update({
        id: userAssessment.id,
        assessmentData: JSON.stringify(assessmentData)
      });

      return evaluatedResponses;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  /**
   * Get user's assignment progress
   */
  static async getAssignmentProgress(email, assignmentId) {
    try {
      // Check if new schema is available or if we're in development mode
      if (!getClient().models.UserAssessment || process.env.NODE_ENV === 'development') {
        console.log('UserAssessment model not available or in development mode, returning null');
        return null;
      }

      const userAssessment = await this.ensureUserAssessment(email);
      if (!userAssessment) {
        return null;
      }

      const assessmentData = JSON.parse(userAssessment.assessmentData || '{}');
      
      return assessmentData[assignmentId] || null;
    } catch (error) {
      console.error('Error getting assignment progress:', error);
      throw error;
    }
  }

  /**
   * Get all user assessment data
   */
  static async getAllAssessmentData(email) {
    try {
      // Check if new schema is available
      if (!getClient().models.UserAssessment) {
        console.log('UserAssessment model not available, returning empty object');
        return {};
      }

      const userAssessment = await this.ensureUserAssessment(email);
      if (!userAssessment) {
        return {};
      }

      return JSON.parse(userAssessment.assessmentData || '{}');
    } catch (error) {
      console.error('Error getting all assessment data:', error);
      throw error;
    }
  }

  /**
   * Generate adjacency matrix from diagram
   */
  static generateAdjacencyMatrix(diagram) {
    if (!diagram?.nodes || !diagram?.edges) {
      return [];
    }

    const nodeCount = diagram.nodes.length;
    const matrix = Array(nodeCount).fill().map(() => Array(nodeCount).fill(0));

    // Create node ID to index mapping
    const nodeIdToIndex = {};
    diagram.nodes.forEach((node, index) => {
      nodeIdToIndex[node.id] = index;
    });

    // Fill matrix based on edges
    diagram.edges.forEach(edge => {
      const sourceIndex = nodeIdToIndex[edge.source];
      const targetIndex = nodeIdToIndex[edge.target];
      
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        // Use polarity: 1 for positive, -1 for negative
        const value = edge.polarity === 'negative' ? -1 : 1;
        matrix[sourceIndex][targetIndex] = value;
      }
    });

    return matrix;
  }

  /**
   * Compare two adjacency matrices and return similarity score
   */
  static compareAdjacencyMatrices(matrix1, matrix2) {
    if (!matrix1 || !matrix2 || matrix1.length !== matrix2.length) {
      return 0;
    }

    const size = matrix1.length;
    let matchingElements = 0;
    let totalElements = size * size;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (matrix1[i][j] === matrix2[i][j]) {
          matchingElements++;
        }
      }
    }

    return matchingElements / totalElements;
  }

} 
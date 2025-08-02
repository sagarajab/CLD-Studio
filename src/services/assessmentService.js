import { generateClient } from 'aws-amplify/api';
import { validateAssignmentResponse, validateAssignmentSubmission } from '../utils/validation.js';

const client = generateClient();

export class AssessmentService {
  /**
   * Get or create user assessment record
   */
  static async getUserAssessment(email, cognitoUserId) {
    try {
      // Check if new schema is available
      if (!client.models.UserAssessment) {
        console.log('UserAssessment model not available yet, returning null');
        return null;
      }

      // Try to get existing user assessment
      const { data: existingUsers } = await client.models.UserAssessment.list({
        filter: { email: { eq: email } }
      });

      if (existingUsers.length > 0) {
        return existingUsers[0];
      }

      // Create new user assessment if doesn't exist
      const now = new Date().toISOString();
      const { data: newUser } = await client.models.UserAssessment.create({
        input: {
          email,
          cognitoUserId,
          accessLevel: 'guest',
          createdAt: now,
          lastLoginAt: now,
          assessmentData: JSON.stringify({})
        }
      });

      return newUser;
    } catch (error) {
      console.error('Error getting user assessment:', error);
      throw error;
    }
  }

  /**
   * Update user login time
   */
  static async updateLastLogin(userId) {
    try {
      if (!client.models.UserAssessment) {
        console.log('UserAssessment model not available, skipping login update');
        return;
      }

      await client.models.UserAssessment.update({
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
      const userResponse = userResponses[question.id];
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
    
    // Exact match check
    const exactMatch = userAnswer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();
    if (exactMatch) {
      score = question.maxScore;
      isCorrect = true;
      feedback.push('Perfect answer!');
    } else {
      // Partial scoring based on keyword matching
      const expectedKeywords = expectedAnswer.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      const userKeywords = userAnswer.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      
      const matchedKeywords = expectedKeywords.filter(keyword => 
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
        keywordMatches: expectedKeywords ? expectedKeywords.length : 0,
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
  static async submitAssignment(email, assignmentId, userResponses) {
    try {
      // Check if new schema is available
      if (!client.models.UserAssessment) {
        console.log('UserAssessment model not available, using evaluation only');
        // Load assignment for evaluation
        const assignmentResponse = await fetch(`/assignments/${assignmentId}.cldq`);
        if (!assignmentResponse.ok) {
          throw new Error(`Failed to load assignment: ${assignmentId}`);
        }
        const assignment = await assignmentResponse.json();
        
        // Validate assignment submission
        const submissionValidation = validateAssignmentSubmission(userResponses, assignment);
        if (!submissionValidation.isValid) {
          console.error('Assignment submission validation failed:', submissionValidation.errors);
          throw new Error(`Submission validation failed: ${submissionValidation.errors.join(', ')}`);
        }
        
        // Just evaluate responses without saving to database
        return this.evaluateResponses(userResponses, assignment);
      }

      // Get user assessment record
      const userAssessment = await this.getUserAssessment(email);
      if (!userAssessment) {
        throw new Error('Could not get or create user assessment record');
      }

      const assessmentData = JSON.parse(userAssessment.assessmentData || '{}');

      // Load assignment
      const assignmentResponse = await fetch(`/assignments/${assignmentId}.cldq`);
      if (!assignmentResponse.ok) {
        throw new Error(`Failed to load assignment: ${assignmentId}`);
      }
      const assignment = await assignmentResponse.json();

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
      await client.models.UserAssessment.update({
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
      // Check if new schema is available
      if (!client.models.UserAssessment) {
        console.log('UserAssessment model not available, returning null');
        return null;
      }

      const userAssessment = await this.getUserAssessment(email);
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
      if (!client.models.UserAssessment) {
        console.log('UserAssessment model not available, returning empty object');
        return {};
      }

      const userAssessment = await this.getUserAssessment(email);
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
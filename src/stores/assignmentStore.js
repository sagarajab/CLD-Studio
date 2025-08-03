import { create } from 'zustand'
import { generateClient } from 'aws-amplify/api'
import { useCLDStore } from './cldStore'
import { AssessmentService } from '../services/assessmentService'
import { validateCLDQFormat } from '../utils/validation.js'
import useTBTAuthStore from './tbtAuthStore'

const client = generateClient()

const useAssignmentStore = create((set, get) => ({
  // Assignment state
  assignments: [],
  currentAssignment: null,
  currentQuestion: null,
  assignmentQuestions: [],
  userResponses: {},
  assignmentProgress: null,
  isAssignmentMode: false,
  isLoading: false,
  error: null,
  
  // Assignment states for each assignment
  assignmentStates: {}, // { assignmentId: { enabled: boolean, submitted: boolean, graded: boolean } }
  
  // Timer state
  timeRemaining: null,
  timerInterval: null,
  
  // UI state
  showProgressModal: false,
  sidebarWidth: 650,
  
  // Helper function to get current user email
  getCurrentUserEmail: () => {
    // Try to get user email from localStorage first
    const storedEmail = localStorage.getItem('currentUserEmail')
    console.log('getCurrentUserEmail - stored email:', storedEmail);
    
    if (storedEmail && storedEmail !== 'current-user@example.com') {
      console.log('getCurrentUserEmail - returning stored email:', storedEmail);
      return storedEmail
    }
    
    // Fallback to placeholder
    console.log('getCurrentUserEmail - returning placeholder email');
    return 'current-user@example.com' // TODO: Replace with actual user email from auth
  },

  // Set current user email (called from App.jsx when user logs in)
  setCurrentUserEmail: (email) => {
    console.log('setCurrentUserEmail called with:', email);
    
    // Store the email in a way that can be accessed by getCurrentUserEmail
    // For now, we'll use a simple approach
    if (email && email !== 'current-user@example.com') {
      // Store in localStorage as a temporary solution
      localStorage.setItem('currentUserEmail', email)
      console.log('setCurrentUserEmail - stored email in localStorage:', email);
    } else {
      console.warn('setCurrentUserEmail - invalid email provided:', email);
    }
  },

  // Helper function to get current user cognito ID
  getCurrentUserCognitoId: () => {
    const storedCognitoId = localStorage.getItem('currentUserCognitoId')
    console.log('getCurrentUserCognitoId - stored cognitoId:', storedCognitoId);
    return storedCognitoId || null;
  },

  // Load all user progress for all assignments
  loadAllUserProgress: async () => {
    // Check TBT access
    const tbtAuthStore = useTBTAuthStore.getState()
    if (!tbtAuthStore.hasTBTAccess()) {
      console.log('Assignment access is restricted to TBT users only, skipping progress load')
      return
    }

    try {
      const userEmail = get().getCurrentUserEmail()
      
      if (!userEmail || userEmail === 'current-user@example.com') {
        console.log('No valid user email available, skipping progress load')
        return
      }

      // Check if new schema is available
      if (!client.models.UserAssessment) {
        console.log('UserAssessment model not available, skipping progress load')
        return
      }

      const allProgress = await AssessmentService.getAllAssessmentData(userEmail)
      
      if (allProgress && Object.keys(allProgress).length > 0) {
        // Update assignment states based on loaded progress
        const assignmentStates = {}
        const userResponses = {}
        
        Object.keys(allProgress).forEach(assignmentId => {
          const progress = allProgress[assignmentId]
          
          if (progress && progress.assignmentStatus === 'submitted') {
            assignmentStates[assignmentId] = {
              enabled: true,
              submitted: true,
              graded: true,
              totalScore: progress.totalScore || 0,
              maxTotalScore: progress.maxTotalScore || 0
            }
            
            // Load user responses for this assignment
            Object.keys(progress).forEach(questionId => {
              if (questionId !== 'totalScore' && questionId !== 'maxTotalScore' && questionId !== 'assignmentStatus') {
                const questionProgress = progress[questionId]
                if (questionProgress && questionProgress.status === 'submitted') {
                  const assignmentSpecificId = `${assignmentId}-${questionId}`
                  userResponses[assignmentSpecificId] = questionProgress.response
                }
              }
            })
          }
        })
        
        set({ assignmentStates, userResponses })
        console.log('Loaded all user progress:', { assignmentStates, userResponses })
      }
    } catch (error) {
      console.error('Error loading all user progress:', error)
    }
  },
  
  // Set assignment mode
  setAssignmentMode: (isAssignmentMode) => {
    set({ isAssignmentMode })
  },
  
  // Get assignment state
  getAssignmentState: (assignmentId) => {
    const { assignmentStates, assignmentProgress, currentAssignment } = get()
    const state = assignmentStates[assignmentId] || { enabled: true, submitted: false, graded: false }
    
    // Update state based on assignment progress (only for current assignment)
    if (currentAssignment && currentAssignment.id === assignmentId && assignmentProgress && assignmentProgress.assignmentStatus === 'submitted') {
      state.submitted = true
      state.graded = true
    }
    
    return state
  },
  
  // Update assignment state
  updateAssignmentState: (assignmentId, updates) => {
    const { assignmentStates } = get()
    const currentState = assignmentStates[assignmentId] || { enabled: true, submitted: false, graded: false }
    
    set({
      assignmentStates: {
        ...assignmentStates,
        [assignmentId]: { ...currentState, ...updates }
      }
    })
  },
  
  // Get assignment progress for a specific assignment
  getAssignmentProgress: (assignmentId) => {
    const { assignmentStates } = get()
    const state = assignmentStates[assignmentId]
    if (state && state.graded) {
      // For now, we'll return a mock progress object
      // In a real implementation, this would fetch from the database
      return {
        totalScore: state.totalScore || 0,
        maxTotalScore: state.maxTotalScore || 0
      }
    }
    return null
  },
  
  // Load assignments from public/assignments folder
  loadAssignments: async () => {
    // Check TBT access
    const tbtAuthStore = useTBTAuthStore.getState()
    if (!tbtAuthStore.hasTBTAccess()) {
      throw new Error('Assignment access is restricted to TBT users only.')
    }

    set({ isLoading: true, error: null })
    try {
      // List of assignment files to load
      const assignmentFiles = [
        'sample-assignment.cldq',
        'change-management.cldq',
        'ecosystem-sustainability.cldq',
        'innovation-diffusion.cldq',
        'population-dynamics.cldq',
        'quality-management.cldq',
        'new-question-types-sample.cldq'
      ]
      
      // Note: There are 7 .cldq assignment files total
      // The 8th file 'sample-diagram.cld' is a diagram file, not an assignment
      
      const assignments = []
      
      for (const filename of assignmentFiles) {
        try {
          const response = await fetch(`/assignments/${filename}`)
          if (response.ok) {
            const assignmentData = await response.json()
            
            // Validate assignment data
            const validationResult = validateCLDQFormat(assignmentData)
            
            if (!validationResult.isValid) {
              console.error(`Assignment validation failed for ${filename}:`, validationResult.errors)
              // Continue loading other assignments even if one fails
              continue
            }
            
            // Log warnings if any
            if (validationResult.warnings && validationResult.warnings.length > 0) {
              console.warn(`Assignment ${filename} loaded with warnings:`, validationResult.warnings)
            }
            
            assignments.push({
              ...assignmentData,
              filename: filename
            })
          } else {
            console.warn(`Failed to load assignment file: ${filename}`)
          }
        } catch (error) {
          console.error(`Error loading assignment ${filename}:`, error)
        }
      }
      
      if (assignments.length === 0) {
        throw new Error('No assignments could be loaded')
      }
      
      set({ assignments, isLoading: false })
      return assignments
    } catch (error) {
      console.error('Error loading assignments:', error)
      set({ isLoading: false, error: 'Failed to load assignments' })
      throw error
    }
  },
  
  // Start assignment
  startAssignment: async (assignment) => {
    // Check TBT access
    const tbtAuthStore = useTBTAuthStore.getState()
    if (!tbtAuthStore.hasTBTAccess()) {
      throw new Error('Assignment access is restricted to TBT users only.')
    }

    set({ 
      currentAssignment: assignment,
      currentQuestion: assignment.questions[0] || null,
      assignmentQuestions: assignment.questions || [],
      userResponses: {},
      assignmentProgress: null, // Clear assignment progress when starting
      isAssignmentMode: true,
      isLoading: false
    })
    
    // Load user progress if exists
    await get().loadUserProgress(assignment.id)
  },

  // Switch to a different assignment
  switchAssignment: async (assignment) => {
    // Check TBT access
    const tbtAuthStore = useTBTAuthStore.getState()
    if (!tbtAuthStore.hasTBTAccess()) {
      throw new Error('Assignment access is restricted to TBT users only.')
    }

    // Clear canvas before switching assignments
    const cldStore = useCLDStore.getState()
    cldStore.clearDiagram()
    
    // Preserve existing user responses when switching assignments
    const { userResponses } = get()
    
    set({ 
      currentAssignment: assignment,
      currentQuestion: assignment.questions[0] || null,
      assignmentQuestions: assignment.questions || [],
      userResponses: userResponses, // Preserve existing responses
      assignmentProgress: null, // Clear assignment progress when switching
      isAssignmentMode: true,
      isLoading: false
    })
    
    // Load user progress if exists
    await get().loadUserProgress(assignment.id)
  },

  // Load user progress
  loadUserProgress: async (assignmentId) => {
    // Check TBT access
    const tbtAuthStore = useTBTAuthStore.getState()
    if (!tbtAuthStore.hasTBTAccess()) {
      throw new Error('Assignment access is restricted to TBT users only.')
    }

    try {
      // Get current user email from auth store
      const userEmail = get().getCurrentUserEmail()
      
      // Check if new schema is available
      if (client.models.UserAssessment) {
        const progress = await AssessmentService.getAssignmentProgress(userEmail, assignmentId)
        
        if (progress) {
          set({ assignmentProgress: progress })
          
          // Load existing responses
          const userResponses = {}
          Object.keys(progress).forEach(questionId => {
            if (questionId !== 'totalScore' && questionId !== 'maxTotalScore' && questionId !== 'assignmentStatus') {
              const questionProgress = progress[questionId]
              if (questionProgress.status === 'submitted') {
                // Use assignment-specific format to match storage format
                const assignmentSpecificId = `${assignmentId}-${questionId}`
                userResponses[assignmentSpecificId] = questionProgress.response
              }
            }
          })
          
          set({ userResponses })
        } else {
          // No progress exists for this assignment, ensure assignmentProgress is null
          set({ assignmentProgress: null })
        }
      } else {
        console.log('New schema not available yet, skipping progress load')
        // Ensure assignmentProgress is null when schema not available
        set({ assignmentProgress: null })
      }
    } catch (error) {
      console.error('Error loading user progress:', error)
      // Ensure assignmentProgress is null on error
      set({ assignmentProgress: null })
    }
  },

  // Go to specific question
  goToQuestion: async (questionIndex) => {
    const { assignmentQuestions } = get()
    
    if (questionIndex >= 0 && questionIndex < assignmentQuestions.length) {
      const question = assignmentQuestions[questionIndex]
      set({ currentQuestion: question })
      
      // Get CLD store to manage canvas
      const cldStore = useCLDStore.getState()
      
      // Load CLD context if specified for this question
      if (question.cldContext) {
        try {
          await get().loadCLDContext(question.cldContext)
        } catch (error) {
          console.error('Error loading CLD context:', error)
          // Fallback to clearing canvas if loading fails
          cldStore.clearDiagram()
        }
      } else {
        // Clear canvas if no CLD context is specified
        console.log('Clearing canvas - no CLD context for this question')
        cldStore.clearDiagram()
      }
      
      return question
    }
    return null
  },

  // Go to next question
  nextQuestion: () => {
    const { currentQuestion, assignmentQuestions } = get()
    
    if (!currentQuestion || assignmentQuestions.length === 0) return null
    
    const currentIndex = assignmentQuestions.findIndex(q => q.id === currentQuestion.id)
    if (currentIndex === -1 || currentIndex >= assignmentQuestions.length - 1) return null
    
    const nextIndex = currentIndex + 1
    return get().goToQuestion(nextIndex)
  },

  // Go to previous question
  previousQuestion: () => {
    const { currentQuestion, assignmentQuestions } = get()
    
    if (!currentQuestion || assignmentQuestions.length === 0) return null
    
    const currentIndex = assignmentQuestions.findIndex(q => q.id === currentQuestion.id)
    if (currentIndex <= 0) return null
    
    const prevIndex = currentIndex - 1
    return get().goToQuestion(prevIndex)
  },

  // Load CLD context for questions
  loadCLDContext: async (cldContext) => {
    try {
      // Add .cld extension if not present
      const filename = cldContext.endsWith('.cld') ? cldContext : `${cldContext}.cld`
      const response = await fetch(`/assignments/${filename}`)
      if (response.ok) {
        const responseText = await response.text()
        console.log(`Loading CLD context: ${filename}`)
        
        try {
          const diagramData = JSON.parse(responseText)
          if (diagramData && typeof diagramData === 'object') {
            const cldStore = useCLDStore.getState()
            cldStore.loadDiagramData(diagramData)
            console.log(`Successfully loaded CLD context: ${filename}`)
          } else {
            throw new Error(`Invalid diagram data for: ${filename}`)
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError)
          console.error('Response text:', responseText)
          throw new Error(`Failed to parse diagram JSON: ${filename}`)
        }
      } else {
        throw new Error(`Failed to load diagram: ${filename} (Status: ${response.status})`)
      }
    } catch (error) {
      console.error('Error loading CLD context:', error)
      throw error
    }
  },

  // Load original diagram for edit diagram questions
  loadOriginalDiagram: async (diagramFile) => {
    try {
      // Add .cld extension if not present
      const filename = diagramFile.endsWith('.cld') ? diagramFile : `${diagramFile}.cld`
      const response = await fetch(`/assignments/${filename}`)
      if (response.ok) {
        const responseText = await response.text()
        console.log(`Loading original diagram: ${filename}`)
        console.log(`Response preview: ${responseText.substring(0, 100)}...`)
        
        try {
          const diagramData = JSON.parse(responseText)
          if (diagramData && typeof diagramData === 'object') {
            const cldStore = useCLDStore.getState()
            cldStore.loadDiagramData(diagramData)
            console.log(`Successfully loaded original diagram: ${filename}`)
          } else {
            throw new Error(`Invalid diagram data for: ${filename}`)
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError)
          console.error('Response text:', responseText)
          throw new Error(`Failed to parse diagram JSON: ${filename}`)
        }
      } else {
        throw new Error(`Failed to load diagram: ${filename} (Status: ${response.status})`)
      }
    } catch (error) {
      console.error('Error loading original diagram:', error)
      throw error
    }
  },

  // Save response (temporary storage only - no database save)
  saveResponse: async (questionId, response, responseType) => {
    console.log('saveResponse called with:', questionId, response, responseType)
    const { currentAssignment, userResponses } = get()

    if (!currentAssignment) {
      console.log('No current assignment, returning early')
      return
    }

    // Update local state
    const updatedResponses = {
      ...userResponses,
      [questionId]: response
    }

    console.log('Updated responses:', updatedResponses)
    set({ userResponses: updatedResponses })
  },
  
  // Submit assignment
  submitAssignment: async () => {
    const { currentAssignment, userResponses } = get()
    
    if (!currentAssignment) {
      throw new Error('No current assignment')
    }
    
    console.log('Submitting assignment with ID:', currentAssignment.id)
    console.log('Current assignment:', currentAssignment)
    console.log('User responses:', userResponses)
    
    set({ isLoading: true })
    
    try {
      // Check if new schema is available and not in development mode
      if (client.models.UserAssessment && process.env.NODE_ENV !== 'development') {
        // Get current user email and cognito ID from auth store
        const userEmail = get().getCurrentUserEmail()
        const cognitoUserId = get().getCurrentUserCognitoId()
        
        console.log('Submitting assignment with:', { userEmail, cognitoUserId, assignmentId: currentAssignment.id });
        
        // Submit to database using AssessmentService
        const evaluatedResponses = await AssessmentService.submitAssignment(
          userEmail,
          currentAssignment.id,
          userResponses,
          currentAssignment.filename,
          cognitoUserId
        )
        
        // Stop timer
        get().stopTimer()
        
        // Update assignment state with score
        get().updateAssignmentState(currentAssignment.id, { 
          submitted: true, 
          graded: true,
          totalScore: evaluatedResponses.totalScore || 0,
          maxTotalScore: evaluatedResponses.maxTotalScore || 0
        })
        
        set({ 
          isLoading: false,
          showProgressModal: true,
          assignmentProgress: evaluatedResponses
        })
        
        return evaluatedResponses
      } else {
        // Development mode or fallback for when new schema isn't deployed yet
        console.log('Development mode or new schema not available, using AssessmentService evaluation')
        
        // Get current user email from auth store
        const userEmail = get().getCurrentUserEmail()
        
        console.log('Development mode: Submitting assignment with:', { userEmail, assignmentId: currentAssignment.id });
        
        // Use AssessmentService for evaluation without database
        const evaluatedResponses = await AssessmentService.submitAssignment(
          userEmail,
          currentAssignment.id,
          userResponses,
          currentAssignment.filename
        )
        
        // Stop timer
        get().stopTimer()
        
        // Update assignment state with score
        get().updateAssignmentState(currentAssignment.id, { 
          submitted: true, 
          graded: true,
          totalScore: evaluatedResponses.totalScore || 0,
          maxTotalScore: evaluatedResponses.maxTotalScore || 0
        })
        
        set({ 
          isLoading: false,
          showProgressModal: true,
          assignmentProgress: evaluatedResponses
        })
        
        return evaluatedResponses
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
      set({ isLoading: false, error: 'Failed to submit assignment' })
      throw error
    }
  },

  // Timer functions
  startTimer: (durationInSeconds) => {
    const { timerInterval } = get()
    if (timerInterval) {
      clearInterval(timerInterval)
    }

    set({ timeRemaining: durationInSeconds })

    const interval = setInterval(() => {
      const { timeRemaining } = get()
      if (timeRemaining > 0) {
        set({ timeRemaining: timeRemaining - 1 })
      } else {
        get().stopTimer()
        // Auto-submit when time runs out
        get().submitAssignment()
      }
    }, 1000)

    set({ timerInterval: interval })
  },

  stopTimer: () => {
    const { timerInterval } = get()
    if (timerInterval) {
      clearInterval(timerInterval)
      set({ timerInterval: null })
    }
  },

  // UI functions
  setShowProgressModal: (show) => {
    set({ showProgressModal: show })
  },

  setSidebarWidth: (width) => {
    set({ sidebarWidth: width })
  },

  // Save user response for a specific question
  saveUserResponse: (assignmentId, questionId, response) => {
    const assignmentSpecificId = `${assignmentId}-${questionId}`
    set(state => {
      const newUserResponses = {
        ...state.userResponses,
        [assignmentSpecificId]: {
          response: response,
          timestamp: new Date().toISOString(),
          questionId: questionId,
          assignmentId: assignmentId
        }
      }
      return {
        userResponses: newUserResponses
      }
    })
  },

  // Reset assignment state
  resetAssignment: () => {
    get().stopTimer()
    set({
      currentAssignment: null,
      currentQuestion: null,
      assignmentQuestions: [],
      userResponses: {},
      assignmentProgress: null,
      isAssignmentMode: false,
      timeRemaining: null,
      timerInterval: null,
      showProgressModal: false,
      error: null
    })
  },

  // Exit assignment (alias for resetAssignment)
  exitAssignment: () => {
    get().resetAssignment()
  }
}))

export default useAssignmentStore 
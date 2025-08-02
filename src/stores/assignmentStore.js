import { create } from 'zustand'
import { generateClient } from 'aws-amplify/api'
import { useCLDStore } from './cldStore'
import { AssessmentService } from '../services/assessmentService'
import { validateCLDQFormat } from '../utils/validation.js'

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
  
  // Timer state
  timeRemaining: null,
  timerInterval: null,
  
  // UI state
  showProgressModal: false,
  sidebarWidth: 650,
  
  // Set assignment mode
  setAssignmentMode: (isAssignmentMode) => {
    set({ isAssignmentMode })
  },
  
  // Load assignments from public/assignments folder
  loadAssignments: async () => {
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
    set({ 
      currentAssignment: assignment,
      currentQuestion: assignment.questions[0] || null,
      assignmentQuestions: assignment.questions || [],
      userResponses: {},
      isAssignmentMode: true,
      isLoading: false
    })
    
    // Load user progress if exists
    await get().loadUserProgress(assignment.id)
  },

  // Switch to a different assignment
  switchAssignment: async (assignment) => {
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
      isAssignmentMode: true,
      isLoading: false
    })
    
    // Load user progress if exists
    await get().loadUserProgress(assignment.id)
  },

  // Load user progress
  loadUserProgress: async (assignmentId) => {
    try {
      // Get current user email from auth store
      const userEmail = 'current-user@example.com' // This should come from auth store
      
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
                userResponses[questionId] = questionProgress.response
              }
            }
          })
          
          set({ userResponses })
        }
      } else {
        console.log('New schema not available yet, skipping progress load')
      }
    } catch (error) {
      console.error('Error loading user progress:', error)
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
      
      // Load original diagram if this is an edit diagram question with a reference diagram
      if (question.questionType === 'edit diagram' && question.originalDiagram) {
        try {
          await get().loadOriginalDiagram(question.originalDiagram)
        } catch (error) {
          console.error('Error loading original diagram:', error)
        }
      } else {
        // Clear canvas if no reference diagram is attached
        console.log('Clearing canvas - no reference diagram for this question')
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
    
    set({ isLoading: true })
    
    try {
      // Check if new schema is available
      if (client.models.UserAssessment) {
        // Get current user email from auth store
        const userEmail = 'current-user@example.com' // This should come from auth store
        
        // Submit to database using AssessmentService
        const evaluatedResponses = await AssessmentService.submitAssignment(
          userEmail,
          currentAssignment.id,
          userResponses
        )
        
        // Stop timer
        get().stopTimer()
        
        set({ 
          isLoading: false,
          showProgressModal: true,
          assignmentProgress: evaluatedResponses
        })
        
        return evaluatedResponses
      } else {
        // Fallback for when new schema isn't deployed yet
        console.log('New schema not available, using fallback submission')
        
        // Calculate basic scores
        let totalScore = 0
        let maxScore = 0
        
        Object.keys(userResponses).forEach(questionId => {
          const question = currentAssignment.questions.find(q => q.id === questionId)
          if (question) {
            maxScore += question.maxScore
            // Simple scoring - give full points for any response
            totalScore += question.maxScore
          }
        })
        
        const fallbackResult = {
          totalScore,
          maxTotalScore: maxScore,
          assignmentStatus: 'submitted'
        }
        
        // Stop timer
        get().stopTimer()
        
        set({ 
          isLoading: false,
          showProgressModal: true,
          assignmentProgress: fallbackResult
        })
        
        return fallbackResult
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
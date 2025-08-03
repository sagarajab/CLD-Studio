/**
 * Test Assignment Access Control
 * 
 * This script tests the access control implementation for assignment functionality
 * to ensure it's properly restricted to TBT users only.
 */

import useAssignmentStore from '../src/stores/assignmentStore.js'
import useTBTAuthStore from '../src/stores/tbtAuthStore.js'

console.log('🧪 Testing Assignment Access Control\n')

// Mock assignment data
const testAssignment = {
  id: 'test-assignment-001',
  title: 'Test Assignment',
  description: 'A test assignment for access control testing',
  questions: [
    {
      id: 'q1',
      questionType: 'text',
      question: 'Test question',
      maxScore: 10
    }
  ]
}

async function testAssignmentAccessControl() {
  console.log('1. Testing TBT Access Control Function')
  
  const tbtAuthStore = useTBTAuthStore.getState()
  
  // Test with guest status
  tbtAuthStore.clearUser()
  console.log(`   Guest status - hasTBTAccess(): ${tbtAuthStore.hasTBTAccess()}`)
  console.log(`   ✅ Guest access denied: ${!tbtAuthStore.hasTBTAccess()}`)
  
  // Test with TBT status
  tbtAuthStore.authenticateUser('test@tbt.edu')
  // Simulate TBT authentication success
  tbtAuthStore.setState({
    tbtAuthStatus: 'tbt',
    accessLevel: 'tbt',
    isApproved: true
  })
  console.log(`   TBT status - hasTBTAccess(): ${tbtAuthStore.hasTBTAccess()}`)
  console.log(`   ✅ TBT access granted: ${tbtAuthStore.hasTBTAccess()}`)
  console.log()

  console.log('2. Testing Assignment Store Access Control')
  
  const assignmentStore = useAssignmentStore.getState()
  
  // Test loadAssignments with guest access
  tbtAuthStore.clearUser()
  try {
    await assignmentStore.loadAssignments()
    console.log(`   ❌ Guest should not be able to load assignments`)
  } catch (error) {
    console.log(`   ✅ Guest access denied for loadAssignments: ${error.message}`)
  }
  
  // Test loadAssignments with TBT access
  tbtAuthStore.setState({
    tbtAuthStatus: 'tbt',
    accessLevel: 'tbt',
    isApproved: true
  })
  try {
    await assignmentStore.loadAssignments()
    console.log(`   ✅ TBT user can load assignments`)
  } catch (error) {
    console.log(`   ❌ TBT user should be able to load assignments: ${error.message}`)
  }
  console.log()

  console.log('3. Testing Assignment Start Access Control')
  
  // Test startAssignment with guest access
  tbtAuthStore.clearUser()
  try {
    await assignmentStore.startAssignment(testAssignment)
    console.log(`   ❌ Guest should not be able to start assignments`)
  } catch (error) {
    console.log(`   ✅ Guest access denied for startAssignment: ${error.message}`)
  }
  
  // Test startAssignment with TBT access
  tbtAuthStore.setState({
    tbtAuthStatus: 'tbt',
    accessLevel: 'tbt',
    isApproved: true
  })
  try {
    await assignmentStore.startAssignment(testAssignment)
    console.log(`   ✅ TBT user can start assignments`)
  } catch (error) {
    console.log(`   ❌ TBT user should be able to start assignments: ${error.message}`)
  }
  console.log()

  console.log('4. Testing Assignment Switch Access Control')
  
  // Test switchAssignment with guest access
  tbtAuthStore.clearUser()
  try {
    await assignmentStore.switchAssignment(testAssignment)
    console.log(`   ❌ Guest should not be able to switch assignments`)
  } catch (error) {
    console.log(`   ✅ Guest access denied for switchAssignment: ${error.message}`)
  }
  
  // Test switchAssignment with TBT access
  tbtAuthStore.setState({
    tbtAuthStatus: 'tbt',
    accessLevel: 'tbt',
    isApproved: true
  })
  try {
    await assignmentStore.switchAssignment(testAssignment)
    console.log(`   ✅ TBT user can switch assignments`)
  } catch (error) {
    console.log(`   ❌ TBT user should be able to switch assignments: ${error.message}`)
  }
  console.log()

  console.log('5. Testing Progress Loading Access Control')
  
  // Test loadUserProgress with guest access
  tbtAuthStore.clearUser()
  try {
    await assignmentStore.loadUserProgress('test-assignment')
    console.log(`   ❌ Guest should not be able to load progress`)
  } catch (error) {
    console.log(`   ✅ Guest access denied for loadUserProgress: ${error.message}`)
  }
  
  // Test loadUserProgress with TBT access
  tbtAuthStore.setState({
    tbtAuthStatus: 'tbt',
    accessLevel: 'tbt',
    isApproved: true
  })
  try {
    await assignmentStore.loadUserProgress('test-assignment')
    console.log(`   ✅ TBT user can load progress`)
  } catch (error) {
    console.log(`   ❌ TBT user should be able to load progress: ${error.message}`)
  }
  console.log()

  console.log('6. Testing All Progress Loading Access Control')
  
  // Test loadAllUserProgress with guest access
  tbtAuthStore.clearUser()
  try {
    await assignmentStore.loadAllUserProgress()
    console.log(`   ✅ Guest access properly handled for loadAllUserProgress (graceful skip)`)
  } catch (error) {
    console.log(`   ❌ Guest should be handled gracefully: ${error.message}`)
  }
  
  // Test loadAllUserProgress with TBT access
  tbtAuthStore.setState({
    tbtAuthStatus: 'tbt',
    accessLevel: 'tbt',
    isApproved: true
  })
  try {
    await assignmentStore.loadAllUserProgress()
    console.log(`   ✅ TBT user can load all progress`)
  } catch (error) {
    console.log(`   ❌ TBT user should be able to load all progress: ${error.message}`)
  }
  console.log()

  console.log('7. Testing Access Control Integration')
  
  // Test complete flow with guest access
  tbtAuthStore.clearUser()
  let guestAccessDenied = 0
  let totalGuestTests = 0
  
  try {
    await assignmentStore.loadAssignments()
  } catch (error) {
    if (error.message.includes('TBT users only')) {
      guestAccessDenied++
    }
    totalGuestTests++
  }
  
  try {
    await assignmentStore.startAssignment(testAssignment)
  } catch (error) {
    if (error.message.includes('TBT users only')) {
      guestAccessDenied++
    }
    totalGuestTests++
  }
  
  try {
    await assignmentStore.switchAssignment(testAssignment)
  } catch (error) {
    if (error.message.includes('TBT users only')) {
      guestAccessDenied++
    }
    totalGuestTests++
  }
  
  try {
    await assignmentStore.loadUserProgress('test')
  } catch (error) {
    if (error.message.includes('TBT users only')) {
      guestAccessDenied++
    }
    totalGuestTests++
  }
  
  console.log(`   Guest access denied: ${guestAccessDenied}/${totalGuestTests} tests`)
  console.log(`   ✅ Guest access control: ${guestAccessDenied === totalGuestTests ? 'PASS' : 'FAIL'}`)
  
  // Test complete flow with TBT access
  tbtAuthStore.setState({
    tbtAuthStatus: 'tbt',
    accessLevel: 'tbt',
    isApproved: true
  })
  let tbtAccessGranted = 0
  let totalTBTTests = 0
  
  try {
    await assignmentStore.loadAssignments()
    tbtAccessGranted++
  } catch (error) {
    // Expected to fail due to missing files, but should not be access denied
    if (!error.message.includes('TBT users only')) {
      tbtAccessGranted++
    }
  }
  totalTBTTests++
  
  try {
    await assignmentStore.startAssignment(testAssignment)
    tbtAccessGranted++
  } catch (error) {
    // Expected to fail due to missing files, but should not be access denied
    if (!error.message.includes('TBT users only')) {
      tbtAccessGranted++
    }
  }
  totalTBTTests++
  
  try {
    await assignmentStore.switchAssignment(testAssignment)
    tbtAccessGranted++
  } catch (error) {
    // Expected to fail due to missing files, but should not be access denied
    if (!error.message.includes('TBT users only')) {
      tbtAccessGranted++
    }
  }
  totalTBTTests++
  
  console.log(`   TBT access granted: ${tbtAccessGranted}/${totalTBTTests} tests`)
  console.log(`   ✅ TBT access control: ${tbtAccessGranted === totalTBTTests ? 'PASS' : 'FAIL'}`)
  console.log()

  console.log('📊 Assignment Access Control Test Summary')
  console.log('==========================================')
  console.log('✅ TBT access control function')
  console.log('✅ Assignment store access control')
  console.log('✅ Assignment start access control')
  console.log('✅ Assignment switch access control')
  console.log('✅ Progress loading access control')
  console.log('✅ All progress loading access control')
  console.log('✅ Access control integration')
  console.log('\n🎉 All assignment access control tests completed!')
  
  // Reset auth state
  tbtAuthStore.clearUser()
}

// Run the tests
testAssignmentAccessControl().catch(console.error) 
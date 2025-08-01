/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createAssignment = /* GraphQL */ `mutation CreateAssignment(
  $condition: ModelAssignmentConditionInput
  $input: CreateAssignmentInput!
) {
  createAssignment(condition: $condition, input: $input) {
    createdAt
    description
    diagramTemplate
    difficulty
    id
    instructions
    isActive
    maxScore
    owner
    title
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAssignmentMutationVariables,
  APITypes.CreateAssignmentMutation
>;
export const createTBTUser = /* GraphQL */ `mutation CreateTBTUser(
  $condition: ModelTBTUserConditionInput
  $input: CreateTBTUserInput!
) {
  createTBTUser(condition: $condition, input: $input) {
    accessLevel
    achievements
    amplifyAuthVerified
    assignmentsCompleted
    assignmentsInProgress
    averageAssignmentScore
    cognitoUserId
    consecutiveLogins
    createdAt
    currentSessionActiveTime
    currentSessionStart
    diagramsCreated
    diagramsShared
    email
    highestAssignmentScore
    id
    lastActiveAt
    lastLoginAt
    lastLoginStreak
    learningLevel
    loopsIdentified
    metadata
    owner
    preferences
    simulationsRun
    skillsUnlocked
    tbtAuthStatus
    totalActiveTime
    totalAssignmentScore
    totalIdleTime
    totalLogins
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTBTUserMutationVariables,
  APITypes.CreateTBTUserMutation
>;
export const createTodo = /* GraphQL */ `mutation CreateTodo(
  $condition: ModelTodoConditionInput
  $input: CreateTodoInput!
) {
  createTodo(condition: $condition, input: $input) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTodoMutationVariables,
  APITypes.CreateTodoMutation
>;
export const createUserActivitySession = /* GraphQL */ `mutation CreateUserActivitySession(
  $condition: ModelUserActivitySessionConditionInput
  $input: CreateUserActivitySessionInput!
) {
  createUserActivitySession(condition: $condition, input: $input) {
    actions
    createdAt
    diagramsWorkedOn
    endTime
    id
    loopsIdentified
    owner
    sessionId
    simulationsRun
    startTime
    totalActiveTime
    totalIdleTime
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserActivitySessionMutationVariables,
  APITypes.CreateUserActivitySessionMutation
>;
export const createUserAssignment = /* GraphQL */ `mutation CreateUserAssignment(
  $condition: ModelUserAssignmentConditionInput
  $input: CreateUserAssignmentInput!
) {
  createUserAssignment(condition: $condition, input: $input) {
    assignmentId
    attempts
    completedAt
    createdAt
    diagramData
    feedback
    id
    maxScore
    owner
    score
    startedAt
    status
    timeSpent
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserAssignmentMutationVariables,
  APITypes.CreateUserAssignmentMutation
>;
export const deleteAssignment = /* GraphQL */ `mutation DeleteAssignment(
  $condition: ModelAssignmentConditionInput
  $input: DeleteAssignmentInput!
) {
  deleteAssignment(condition: $condition, input: $input) {
    createdAt
    description
    diagramTemplate
    difficulty
    id
    instructions
    isActive
    maxScore
    owner
    title
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAssignmentMutationVariables,
  APITypes.DeleteAssignmentMutation
>;
export const deleteTBTUser = /* GraphQL */ `mutation DeleteTBTUser(
  $condition: ModelTBTUserConditionInput
  $input: DeleteTBTUserInput!
) {
  deleteTBTUser(condition: $condition, input: $input) {
    accessLevel
    achievements
    amplifyAuthVerified
    assignmentsCompleted
    assignmentsInProgress
    averageAssignmentScore
    cognitoUserId
    consecutiveLogins
    createdAt
    currentSessionActiveTime
    currentSessionStart
    diagramsCreated
    diagramsShared
    email
    highestAssignmentScore
    id
    lastActiveAt
    lastLoginAt
    lastLoginStreak
    learningLevel
    loopsIdentified
    metadata
    owner
    preferences
    simulationsRun
    skillsUnlocked
    tbtAuthStatus
    totalActiveTime
    totalAssignmentScore
    totalIdleTime
    totalLogins
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteTBTUserMutationVariables,
  APITypes.DeleteTBTUserMutation
>;
export const deleteTodo = /* GraphQL */ `mutation DeleteTodo(
  $condition: ModelTodoConditionInput
  $input: DeleteTodoInput!
) {
  deleteTodo(condition: $condition, input: $input) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteTodoMutationVariables,
  APITypes.DeleteTodoMutation
>;
export const deleteUserActivitySession = /* GraphQL */ `mutation DeleteUserActivitySession(
  $condition: ModelUserActivitySessionConditionInput
  $input: DeleteUserActivitySessionInput!
) {
  deleteUserActivitySession(condition: $condition, input: $input) {
    actions
    createdAt
    diagramsWorkedOn
    endTime
    id
    loopsIdentified
    owner
    sessionId
    simulationsRun
    startTime
    totalActiveTime
    totalIdleTime
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserActivitySessionMutationVariables,
  APITypes.DeleteUserActivitySessionMutation
>;
export const deleteUserAssignment = /* GraphQL */ `mutation DeleteUserAssignment(
  $condition: ModelUserAssignmentConditionInput
  $input: DeleteUserAssignmentInput!
) {
  deleteUserAssignment(condition: $condition, input: $input) {
    assignmentId
    attempts
    completedAt
    createdAt
    diagramData
    feedback
    id
    maxScore
    owner
    score
    startedAt
    status
    timeSpent
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserAssignmentMutationVariables,
  APITypes.DeleteUserAssignmentMutation
>;
export const updateAssignment = /* GraphQL */ `mutation UpdateAssignment(
  $condition: ModelAssignmentConditionInput
  $input: UpdateAssignmentInput!
) {
  updateAssignment(condition: $condition, input: $input) {
    createdAt
    description
    diagramTemplate
    difficulty
    id
    instructions
    isActive
    maxScore
    owner
    title
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAssignmentMutationVariables,
  APITypes.UpdateAssignmentMutation
>;
export const updateTBTUser = /* GraphQL */ `mutation UpdateTBTUser(
  $condition: ModelTBTUserConditionInput
  $input: UpdateTBTUserInput!
) {
  updateTBTUser(condition: $condition, input: $input) {
    accessLevel
    achievements
    amplifyAuthVerified
    assignmentsCompleted
    assignmentsInProgress
    averageAssignmentScore
    cognitoUserId
    consecutiveLogins
    createdAt
    currentSessionActiveTime
    currentSessionStart
    diagramsCreated
    diagramsShared
    email
    highestAssignmentScore
    id
    lastActiveAt
    lastLoginAt
    lastLoginStreak
    learningLevel
    loopsIdentified
    metadata
    owner
    preferences
    simulationsRun
    skillsUnlocked
    tbtAuthStatus
    totalActiveTime
    totalAssignmentScore
    totalIdleTime
    totalLogins
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTBTUserMutationVariables,
  APITypes.UpdateTBTUserMutation
>;
export const updateTodo = /* GraphQL */ `mutation UpdateTodo(
  $condition: ModelTodoConditionInput
  $input: UpdateTodoInput!
) {
  updateTodo(condition: $condition, input: $input) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTodoMutationVariables,
  APITypes.UpdateTodoMutation
>;
export const updateUserActivitySession = /* GraphQL */ `mutation UpdateUserActivitySession(
  $condition: ModelUserActivitySessionConditionInput
  $input: UpdateUserActivitySessionInput!
) {
  updateUserActivitySession(condition: $condition, input: $input) {
    actions
    createdAt
    diagramsWorkedOn
    endTime
    id
    loopsIdentified
    owner
    sessionId
    simulationsRun
    startTime
    totalActiveTime
    totalIdleTime
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserActivitySessionMutationVariables,
  APITypes.UpdateUserActivitySessionMutation
>;
export const updateUserAssignment = /* GraphQL */ `mutation UpdateUserAssignment(
  $condition: ModelUserAssignmentConditionInput
  $input: UpdateUserAssignmentInput!
) {
  updateUserAssignment(condition: $condition, input: $input) {
    assignmentId
    attempts
    completedAt
    createdAt
    diagramData
    feedback
    id
    maxScore
    owner
    score
    startedAt
    status
    timeSpent
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserAssignmentMutationVariables,
  APITypes.UpdateUserAssignmentMutation
>;

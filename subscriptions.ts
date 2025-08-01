/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateAssignment = /* GraphQL */ `subscription OnCreateAssignment(
  $filter: ModelSubscriptionAssignmentFilterInput
  $owner: String
) {
  onCreateAssignment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateAssignmentSubscriptionVariables,
  APITypes.OnCreateAssignmentSubscription
>;
export const onCreateTBTUser = /* GraphQL */ `subscription OnCreateTBTUser(
  $filter: ModelSubscriptionTBTUserFilterInput
  $owner: String
) {
  onCreateTBTUser(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTBTUserSubscriptionVariables,
  APITypes.OnCreateTBTUserSubscription
>;
export const onCreateTodo = /* GraphQL */ `subscription OnCreateTodo($filter: ModelSubscriptionTodoFilterInput) {
  onCreateTodo(filter: $filter) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateTodoSubscriptionVariables,
  APITypes.OnCreateTodoSubscription
>;
export const onCreateUserActivitySession = /* GraphQL */ `subscription OnCreateUserActivitySession(
  $filter: ModelSubscriptionUserActivitySessionFilterInput
  $owner: String
) {
  onCreateUserActivitySession(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserActivitySessionSubscriptionVariables,
  APITypes.OnCreateUserActivitySessionSubscription
>;
export const onCreateUserAssignment = /* GraphQL */ `subscription OnCreateUserAssignment(
  $filter: ModelSubscriptionUserAssignmentFilterInput
  $owner: String
) {
  onCreateUserAssignment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserAssignmentSubscriptionVariables,
  APITypes.OnCreateUserAssignmentSubscription
>;
export const onDeleteAssignment = /* GraphQL */ `subscription OnDeleteAssignment(
  $filter: ModelSubscriptionAssignmentFilterInput
  $owner: String
) {
  onDeleteAssignment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAssignmentSubscriptionVariables,
  APITypes.OnDeleteAssignmentSubscription
>;
export const onDeleteTBTUser = /* GraphQL */ `subscription OnDeleteTBTUser(
  $filter: ModelSubscriptionTBTUserFilterInput
  $owner: String
) {
  onDeleteTBTUser(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTBTUserSubscriptionVariables,
  APITypes.OnDeleteTBTUserSubscription
>;
export const onDeleteTodo = /* GraphQL */ `subscription OnDeleteTodo($filter: ModelSubscriptionTodoFilterInput) {
  onDeleteTodo(filter: $filter) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteTodoSubscriptionVariables,
  APITypes.OnDeleteTodoSubscription
>;
export const onDeleteUserActivitySession = /* GraphQL */ `subscription OnDeleteUserActivitySession(
  $filter: ModelSubscriptionUserActivitySessionFilterInput
  $owner: String
) {
  onDeleteUserActivitySession(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserActivitySessionSubscriptionVariables,
  APITypes.OnDeleteUserActivitySessionSubscription
>;
export const onDeleteUserAssignment = /* GraphQL */ `subscription OnDeleteUserAssignment(
  $filter: ModelSubscriptionUserAssignmentFilterInput
  $owner: String
) {
  onDeleteUserAssignment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserAssignmentSubscriptionVariables,
  APITypes.OnDeleteUserAssignmentSubscription
>;
export const onUpdateAssignment = /* GraphQL */ `subscription OnUpdateAssignment(
  $filter: ModelSubscriptionAssignmentFilterInput
  $owner: String
) {
  onUpdateAssignment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateAssignmentSubscriptionVariables,
  APITypes.OnUpdateAssignmentSubscription
>;
export const onUpdateTBTUser = /* GraphQL */ `subscription OnUpdateTBTUser(
  $filter: ModelSubscriptionTBTUserFilterInput
  $owner: String
) {
  onUpdateTBTUser(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTBTUserSubscriptionVariables,
  APITypes.OnUpdateTBTUserSubscription
>;
export const onUpdateTodo = /* GraphQL */ `subscription OnUpdateTodo($filter: ModelSubscriptionTodoFilterInput) {
  onUpdateTodo(filter: $filter) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateTodoSubscriptionVariables,
  APITypes.OnUpdateTodoSubscription
>;
export const onUpdateUserActivitySession = /* GraphQL */ `subscription OnUpdateUserActivitySession(
  $filter: ModelSubscriptionUserActivitySessionFilterInput
  $owner: String
) {
  onUpdateUserActivitySession(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserActivitySessionSubscriptionVariables,
  APITypes.OnUpdateUserActivitySessionSubscription
>;
export const onUpdateUserAssignment = /* GraphQL */ `subscription OnUpdateUserAssignment(
  $filter: ModelSubscriptionUserAssignmentFilterInput
  $owner: String
) {
  onUpdateUserAssignment(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserAssignmentSubscriptionVariables,
  APITypes.OnUpdateUserAssignmentSubscription
>;

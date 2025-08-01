/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getAssignment = /* GraphQL */ `query GetAssignment($id: ID!) {
  getAssignment(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetAssignmentQueryVariables,
  APITypes.GetAssignmentQuery
>;
export const getTBTUser = /* GraphQL */ `query GetTBTUser($id: ID!) {
  getTBTUser(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetTBTUserQueryVariables,
  APITypes.GetTBTUserQuery
>;
export const getTodo = /* GraphQL */ `query GetTodo($id: ID!) {
  getTodo(id: $id) {
    content
    createdAt
    id
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTodoQueryVariables, APITypes.GetTodoQuery>;
export const getUserActivitySession = /* GraphQL */ `query GetUserActivitySession($id: ID!) {
  getUserActivitySession(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetUserActivitySessionQueryVariables,
  APITypes.GetUserActivitySessionQuery
>;
export const getUserAssignment = /* GraphQL */ `query GetUserAssignment($id: ID!) {
  getUserAssignment(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetUserAssignmentQueryVariables,
  APITypes.GetUserAssignmentQuery
>;
export const listAssignments = /* GraphQL */ `query ListAssignments(
  $filter: ModelAssignmentFilterInput
  $limit: Int
  $nextToken: String
) {
  listAssignments(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssignmentsQueryVariables,
  APITypes.ListAssignmentsQuery
>;
export const listTBTUsers = /* GraphQL */ `query ListTBTUsers(
  $filter: ModelTBTUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listTBTUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTBTUsersQueryVariables,
  APITypes.ListTBTUsersQuery
>;
export const listTodos = /* GraphQL */ `query ListTodos(
  $filter: ModelTodoFilterInput
  $limit: Int
  $nextToken: String
) {
  listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      content
      createdAt
      id
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTodosQueryVariables, APITypes.ListTodosQuery>;
export const listUserActivitySessions = /* GraphQL */ `query ListUserActivitySessions(
  $filter: ModelUserActivitySessionFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserActivitySessions(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserActivitySessionsQueryVariables,
  APITypes.ListUserActivitySessionsQuery
>;
export const listUserAssignments = /* GraphQL */ `query ListUserAssignments(
  $filter: ModelUserAssignmentFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserAssignments(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserAssignmentsQueryVariables,
  APITypes.ListUserAssignmentsQuery
>;

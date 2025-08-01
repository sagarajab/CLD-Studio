/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Assignment = {
  __typename: "Assignment",
  createdAt?: string | null,
  description?: string | null,
  diagramTemplate?: string | null,
  difficulty?: AssignmentDifficulty | null,
  id: string,
  instructions?: string | null,
  isActive?: boolean | null,
  maxScore: number,
  owner?: string | null,
  title: string,
  updatedAt: string,
};

export enum AssignmentDifficulty {
  advanced = "advanced",
  beginner = "beginner",
  intermediate = "intermediate",
}


export type TBTUser = {
  __typename: "TBTUser",
  accessLevel?: TBTUserAccessLevel | null,
  achievements?: string | null,
  amplifyAuthVerified?: boolean | null,
  assignmentsCompleted?: number | null,
  assignmentsInProgress?: number | null,
  averageAssignmentScore?: number | null,
  cognitoUserId: string,
  consecutiveLogins?: number | null,
  createdAt?: string | null,
  currentSessionActiveTime?: number | null,
  currentSessionStart?: string | null,
  diagramsCreated?: number | null,
  diagramsShared?: number | null,
  email: string,
  highestAssignmentScore?: number | null,
  id: string,
  lastActiveAt?: string | null,
  lastLoginAt?: string | null,
  lastLoginStreak?: number | null,
  learningLevel?: TBTUserLearningLevel | null,
  loopsIdentified?: number | null,
  metadata?: string | null,
  owner?: string | null,
  preferences?: string | null,
  simulationsRun?: number | null,
  skillsUnlocked?: string | null,
  tbtAuthStatus?: TBTUserTbtAuthStatus | null,
  totalActiveTime?: number | null,
  totalAssignmentScore?: number | null,
  totalIdleTime?: number | null,
  totalLogins?: number | null,
  updatedAt: string,
};

export enum TBTUserAccessLevel {
  admin = "admin",
  guest = "guest",
  tbt = "tbt",
}


export enum TBTUserLearningLevel {
  advanced = "advanced",
  beginner = "beginner",
  expert = "expert",
  intermediate = "intermediate",
}


export enum TBTUserTbtAuthStatus {
  guest = "guest",
  pending = "pending",
  tbt = "tbt",
}


export type Todo = {
  __typename: "Todo",
  content?: string | null,
  createdAt: string,
  id: string,
  updatedAt: string,
};

export type UserActivitySession = {
  __typename: "UserActivitySession",
  actions?: string | null,
  createdAt: string,
  diagramsWorkedOn?: string | null,
  endTime?: string | null,
  id: string,
  loopsIdentified?: number | null,
  owner?: string | null,
  sessionId: string,
  simulationsRun?: number | null,
  startTime: string,
  totalActiveTime?: number | null,
  totalIdleTime?: number | null,
  updatedAt: string,
  userId: string,
};

export type UserAssignment = {
  __typename: "UserAssignment",
  assignmentId: string,
  attempts?: number | null,
  completedAt?: string | null,
  createdAt: string,
  diagramData?: string | null,
  feedback?: string | null,
  id: string,
  maxScore: number,
  owner?: string | null,
  score?: number | null,
  startedAt?: string | null,
  status?: UserAssignmentStatus | null,
  timeSpent?: number | null,
  updatedAt: string,
  userId: string,
};

export enum UserAssignmentStatus {
  completed = "completed",
  in_progress = "in_progress",
  not_started = "not_started",
  submitted = "submitted",
}


export type ModelAssignmentFilterInput = {
  and?: Array< ModelAssignmentFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  description?: ModelStringInput | null,
  diagramTemplate?: ModelStringInput | null,
  difficulty?: ModelAssignmentDifficultyInput | null,
  id?: ModelIDInput | null,
  instructions?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  maxScore?: ModelIntInput | null,
  not?: ModelAssignmentFilterInput | null,
  or?: Array< ModelAssignmentFilterInput | null > | null,
  owner?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelAssignmentDifficultyInput = {
  eq?: AssignmentDifficulty | null,
  ne?: AssignmentDifficulty | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelBooleanInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelIntInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelAssignmentConnection = {
  __typename: "ModelAssignmentConnection",
  items:  Array<Assignment | null >,
  nextToken?: string | null,
};

export type ModelTBTUserFilterInput = {
  accessLevel?: ModelTBTUserAccessLevelInput | null,
  achievements?: ModelStringInput | null,
  amplifyAuthVerified?: ModelBooleanInput | null,
  and?: Array< ModelTBTUserFilterInput | null > | null,
  assignmentsCompleted?: ModelIntInput | null,
  assignmentsInProgress?: ModelIntInput | null,
  averageAssignmentScore?: ModelFloatInput | null,
  cognitoUserId?: ModelStringInput | null,
  consecutiveLogins?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  currentSessionActiveTime?: ModelIntInput | null,
  currentSessionStart?: ModelStringInput | null,
  diagramsCreated?: ModelIntInput | null,
  diagramsShared?: ModelIntInput | null,
  email?: ModelStringInput | null,
  highestAssignmentScore?: ModelFloatInput | null,
  id?: ModelIDInput | null,
  lastActiveAt?: ModelStringInput | null,
  lastLoginAt?: ModelStringInput | null,
  lastLoginStreak?: ModelIntInput | null,
  learningLevel?: ModelTBTUserLearningLevelInput | null,
  loopsIdentified?: ModelIntInput | null,
  metadata?: ModelStringInput | null,
  not?: ModelTBTUserFilterInput | null,
  or?: Array< ModelTBTUserFilterInput | null > | null,
  owner?: ModelStringInput | null,
  preferences?: ModelStringInput | null,
  simulationsRun?: ModelIntInput | null,
  skillsUnlocked?: ModelStringInput | null,
  tbtAuthStatus?: ModelTBTUserTbtAuthStatusInput | null,
  totalActiveTime?: ModelIntInput | null,
  totalAssignmentScore?: ModelFloatInput | null,
  totalIdleTime?: ModelIntInput | null,
  totalLogins?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelTBTUserAccessLevelInput = {
  eq?: TBTUserAccessLevel | null,
  ne?: TBTUserAccessLevel | null,
};

export type ModelFloatInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelTBTUserLearningLevelInput = {
  eq?: TBTUserLearningLevel | null,
  ne?: TBTUserLearningLevel | null,
};

export type ModelTBTUserTbtAuthStatusInput = {
  eq?: TBTUserTbtAuthStatus | null,
  ne?: TBTUserTbtAuthStatus | null,
};

export type ModelTBTUserConnection = {
  __typename: "ModelTBTUserConnection",
  items:  Array<TBTUser | null >,
  nextToken?: string | null,
};

export type ModelTodoFilterInput = {
  and?: Array< ModelTodoFilterInput | null > | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelTodoFilterInput | null,
  or?: Array< ModelTodoFilterInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelTodoConnection = {
  __typename: "ModelTodoConnection",
  items:  Array<Todo | null >,
  nextToken?: string | null,
};

export type ModelUserActivitySessionFilterInput = {
  actions?: ModelStringInput | null,
  and?: Array< ModelUserActivitySessionFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  diagramsWorkedOn?: ModelStringInput | null,
  endTime?: ModelStringInput | null,
  id?: ModelIDInput | null,
  loopsIdentified?: ModelIntInput | null,
  not?: ModelUserActivitySessionFilterInput | null,
  or?: Array< ModelUserActivitySessionFilterInput | null > | null,
  owner?: ModelStringInput | null,
  sessionId?: ModelStringInput | null,
  simulationsRun?: ModelIntInput | null,
  startTime?: ModelStringInput | null,
  totalActiveTime?: ModelIntInput | null,
  totalIdleTime?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type ModelUserActivitySessionConnection = {
  __typename: "ModelUserActivitySessionConnection",
  items:  Array<UserActivitySession | null >,
  nextToken?: string | null,
};

export type ModelUserAssignmentFilterInput = {
  and?: Array< ModelUserAssignmentFilterInput | null > | null,
  assignmentId?: ModelStringInput | null,
  attempts?: ModelIntInput | null,
  completedAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  diagramData?: ModelStringInput | null,
  feedback?: ModelStringInput | null,
  id?: ModelIDInput | null,
  maxScore?: ModelIntInput | null,
  not?: ModelUserAssignmentFilterInput | null,
  or?: Array< ModelUserAssignmentFilterInput | null > | null,
  owner?: ModelStringInput | null,
  score?: ModelFloatInput | null,
  startedAt?: ModelStringInput | null,
  status?: ModelUserAssignmentStatusInput | null,
  timeSpent?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type ModelUserAssignmentStatusInput = {
  eq?: UserAssignmentStatus | null,
  ne?: UserAssignmentStatus | null,
};

export type ModelUserAssignmentConnection = {
  __typename: "ModelUserAssignmentConnection",
  items:  Array<UserAssignment | null >,
  nextToken?: string | null,
};

export type ModelAssignmentConditionInput = {
  and?: Array< ModelAssignmentConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  description?: ModelStringInput | null,
  diagramTemplate?: ModelStringInput | null,
  difficulty?: ModelAssignmentDifficultyInput | null,
  instructions?: ModelStringInput | null,
  isActive?: ModelBooleanInput | null,
  maxScore?: ModelIntInput | null,
  not?: ModelAssignmentConditionInput | null,
  or?: Array< ModelAssignmentConditionInput | null > | null,
  owner?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateAssignmentInput = {
  createdAt?: string | null,
  description?: string | null,
  diagramTemplate?: string | null,
  difficulty?: AssignmentDifficulty | null,
  id?: string | null,
  instructions?: string | null,
  isActive?: boolean | null,
  maxScore: number,
  title: string,
};

export type ModelTBTUserConditionInput = {
  accessLevel?: ModelTBTUserAccessLevelInput | null,
  achievements?: ModelStringInput | null,
  amplifyAuthVerified?: ModelBooleanInput | null,
  and?: Array< ModelTBTUserConditionInput | null > | null,
  assignmentsCompleted?: ModelIntInput | null,
  assignmentsInProgress?: ModelIntInput | null,
  averageAssignmentScore?: ModelFloatInput | null,
  cognitoUserId?: ModelStringInput | null,
  consecutiveLogins?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  currentSessionActiveTime?: ModelIntInput | null,
  currentSessionStart?: ModelStringInput | null,
  diagramsCreated?: ModelIntInput | null,
  diagramsShared?: ModelIntInput | null,
  email?: ModelStringInput | null,
  highestAssignmentScore?: ModelFloatInput | null,
  lastActiveAt?: ModelStringInput | null,
  lastLoginAt?: ModelStringInput | null,
  lastLoginStreak?: ModelIntInput | null,
  learningLevel?: ModelTBTUserLearningLevelInput | null,
  loopsIdentified?: ModelIntInput | null,
  metadata?: ModelStringInput | null,
  not?: ModelTBTUserConditionInput | null,
  or?: Array< ModelTBTUserConditionInput | null > | null,
  owner?: ModelStringInput | null,
  preferences?: ModelStringInput | null,
  simulationsRun?: ModelIntInput | null,
  skillsUnlocked?: ModelStringInput | null,
  tbtAuthStatus?: ModelTBTUserTbtAuthStatusInput | null,
  totalActiveTime?: ModelIntInput | null,
  totalAssignmentScore?: ModelFloatInput | null,
  totalIdleTime?: ModelIntInput | null,
  totalLogins?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateTBTUserInput = {
  accessLevel?: TBTUserAccessLevel | null,
  achievements?: string | null,
  amplifyAuthVerified?: boolean | null,
  assignmentsCompleted?: number | null,
  assignmentsInProgress?: number | null,
  averageAssignmentScore?: number | null,
  cognitoUserId: string,
  consecutiveLogins?: number | null,
  createdAt?: string | null,
  currentSessionActiveTime?: number | null,
  currentSessionStart?: string | null,
  diagramsCreated?: number | null,
  diagramsShared?: number | null,
  email: string,
  highestAssignmentScore?: number | null,
  id?: string | null,
  lastActiveAt?: string | null,
  lastLoginAt?: string | null,
  lastLoginStreak?: number | null,
  learningLevel?: TBTUserLearningLevel | null,
  loopsIdentified?: number | null,
  metadata?: string | null,
  preferences?: string | null,
  simulationsRun?: number | null,
  skillsUnlocked?: string | null,
  tbtAuthStatus?: TBTUserTbtAuthStatus | null,
  totalActiveTime?: number | null,
  totalAssignmentScore?: number | null,
  totalIdleTime?: number | null,
  totalLogins?: number | null,
};

export type ModelTodoConditionInput = {
  and?: Array< ModelTodoConditionInput | null > | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  not?: ModelTodoConditionInput | null,
  or?: Array< ModelTodoConditionInput | null > | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateTodoInput = {
  content?: string | null,
  id?: string | null,
};

export type ModelUserActivitySessionConditionInput = {
  actions?: ModelStringInput | null,
  and?: Array< ModelUserActivitySessionConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  diagramsWorkedOn?: ModelStringInput | null,
  endTime?: ModelStringInput | null,
  loopsIdentified?: ModelIntInput | null,
  not?: ModelUserActivitySessionConditionInput | null,
  or?: Array< ModelUserActivitySessionConditionInput | null > | null,
  owner?: ModelStringInput | null,
  sessionId?: ModelStringInput | null,
  simulationsRun?: ModelIntInput | null,
  startTime?: ModelStringInput | null,
  totalActiveTime?: ModelIntInput | null,
  totalIdleTime?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type CreateUserActivitySessionInput = {
  actions?: string | null,
  diagramsWorkedOn?: string | null,
  endTime?: string | null,
  id?: string | null,
  loopsIdentified?: number | null,
  sessionId: string,
  simulationsRun?: number | null,
  startTime: string,
  totalActiveTime?: number | null,
  totalIdleTime?: number | null,
  userId: string,
};

export type ModelUserAssignmentConditionInput = {
  and?: Array< ModelUserAssignmentConditionInput | null > | null,
  assignmentId?: ModelStringInput | null,
  attempts?: ModelIntInput | null,
  completedAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  diagramData?: ModelStringInput | null,
  feedback?: ModelStringInput | null,
  maxScore?: ModelIntInput | null,
  not?: ModelUserAssignmentConditionInput | null,
  or?: Array< ModelUserAssignmentConditionInput | null > | null,
  owner?: ModelStringInput | null,
  score?: ModelFloatInput | null,
  startedAt?: ModelStringInput | null,
  status?: ModelUserAssignmentStatusInput | null,
  timeSpent?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type CreateUserAssignmentInput = {
  assignmentId: string,
  attempts?: number | null,
  completedAt?: string | null,
  diagramData?: string | null,
  feedback?: string | null,
  id?: string | null,
  maxScore: number,
  score?: number | null,
  startedAt?: string | null,
  status?: UserAssignmentStatus | null,
  timeSpent?: number | null,
  userId: string,
};

export type DeleteAssignmentInput = {
  id: string,
};

export type DeleteTBTUserInput = {
  id: string,
};

export type DeleteTodoInput = {
  id: string,
};

export type DeleteUserActivitySessionInput = {
  id: string,
};

export type DeleteUserAssignmentInput = {
  id: string,
};

export type UpdateAssignmentInput = {
  createdAt?: string | null,
  description?: string | null,
  diagramTemplate?: string | null,
  difficulty?: AssignmentDifficulty | null,
  id: string,
  instructions?: string | null,
  isActive?: boolean | null,
  maxScore?: number | null,
  title?: string | null,
};

export type UpdateTBTUserInput = {
  accessLevel?: TBTUserAccessLevel | null,
  achievements?: string | null,
  amplifyAuthVerified?: boolean | null,
  assignmentsCompleted?: number | null,
  assignmentsInProgress?: number | null,
  averageAssignmentScore?: number | null,
  cognitoUserId?: string | null,
  consecutiveLogins?: number | null,
  createdAt?: string | null,
  currentSessionActiveTime?: number | null,
  currentSessionStart?: string | null,
  diagramsCreated?: number | null,
  diagramsShared?: number | null,
  email?: string | null,
  highestAssignmentScore?: number | null,
  id: string,
  lastActiveAt?: string | null,
  lastLoginAt?: string | null,
  lastLoginStreak?: number | null,
  learningLevel?: TBTUserLearningLevel | null,
  loopsIdentified?: number | null,
  metadata?: string | null,
  preferences?: string | null,
  simulationsRun?: number | null,
  skillsUnlocked?: string | null,
  tbtAuthStatus?: TBTUserTbtAuthStatus | null,
  totalActiveTime?: number | null,
  totalAssignmentScore?: number | null,
  totalIdleTime?: number | null,
  totalLogins?: number | null,
};

export type UpdateTodoInput = {
  content?: string | null,
  id: string,
};

export type UpdateUserActivitySessionInput = {
  actions?: string | null,
  diagramsWorkedOn?: string | null,
  endTime?: string | null,
  id: string,
  loopsIdentified?: number | null,
  sessionId?: string | null,
  simulationsRun?: number | null,
  startTime?: string | null,
  totalActiveTime?: number | null,
  totalIdleTime?: number | null,
  userId?: string | null,
};

export type UpdateUserAssignmentInput = {
  assignmentId?: string | null,
  attempts?: number | null,
  completedAt?: string | null,
  diagramData?: string | null,
  feedback?: string | null,
  id: string,
  maxScore?: number | null,
  score?: number | null,
  startedAt?: string | null,
  status?: UserAssignmentStatus | null,
  timeSpent?: number | null,
  userId?: string | null,
};

export type ModelSubscriptionAssignmentFilterInput = {
  and?: Array< ModelSubscriptionAssignmentFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  diagramTemplate?: ModelSubscriptionStringInput | null,
  difficulty?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  instructions?: ModelSubscriptionStringInput | null,
  isActive?: ModelSubscriptionBooleanInput | null,
  maxScore?: ModelSubscriptionIntInput | null,
  or?: Array< ModelSubscriptionAssignmentFilterInput | null > | null,
  owner?: ModelStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelSubscriptionIntInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionTBTUserFilterInput = {
  accessLevel?: ModelSubscriptionStringInput | null,
  achievements?: ModelSubscriptionStringInput | null,
  amplifyAuthVerified?: ModelSubscriptionBooleanInput | null,
  and?: Array< ModelSubscriptionTBTUserFilterInput | null > | null,
  assignmentsCompleted?: ModelSubscriptionIntInput | null,
  assignmentsInProgress?: ModelSubscriptionIntInput | null,
  averageAssignmentScore?: ModelSubscriptionFloatInput | null,
  cognitoUserId?: ModelSubscriptionStringInput | null,
  consecutiveLogins?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  currentSessionActiveTime?: ModelSubscriptionIntInput | null,
  currentSessionStart?: ModelSubscriptionStringInput | null,
  diagramsCreated?: ModelSubscriptionIntInput | null,
  diagramsShared?: ModelSubscriptionIntInput | null,
  email?: ModelSubscriptionStringInput | null,
  highestAssignmentScore?: ModelSubscriptionFloatInput | null,
  id?: ModelSubscriptionIDInput | null,
  lastActiveAt?: ModelSubscriptionStringInput | null,
  lastLoginAt?: ModelSubscriptionStringInput | null,
  lastLoginStreak?: ModelSubscriptionIntInput | null,
  learningLevel?: ModelSubscriptionStringInput | null,
  loopsIdentified?: ModelSubscriptionIntInput | null,
  metadata?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionTBTUserFilterInput | null > | null,
  owner?: ModelStringInput | null,
  preferences?: ModelSubscriptionStringInput | null,
  simulationsRun?: ModelSubscriptionIntInput | null,
  skillsUnlocked?: ModelSubscriptionStringInput | null,
  tbtAuthStatus?: ModelSubscriptionStringInput | null,
  totalActiveTime?: ModelSubscriptionIntInput | null,
  totalAssignmentScore?: ModelSubscriptionFloatInput | null,
  totalIdleTime?: ModelSubscriptionIntInput | null,
  totalLogins?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionFloatInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionTodoFilterInput = {
  and?: Array< ModelSubscriptionTodoFilterInput | null > | null,
  content?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionTodoFilterInput | null > | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionUserActivitySessionFilterInput = {
  actions?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserActivitySessionFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  diagramsWorkedOn?: ModelSubscriptionStringInput | null,
  endTime?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  loopsIdentified?: ModelSubscriptionIntInput | null,
  or?: Array< ModelSubscriptionUserActivitySessionFilterInput | null > | null,
  owner?: ModelStringInput | null,
  sessionId?: ModelSubscriptionStringInput | null,
  simulationsRun?: ModelSubscriptionIntInput | null,
  startTime?: ModelSubscriptionStringInput | null,
  totalActiveTime?: ModelSubscriptionIntInput | null,
  totalIdleTime?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userId?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionUserAssignmentFilterInput = {
  and?: Array< ModelSubscriptionUserAssignmentFilterInput | null > | null,
  assignmentId?: ModelSubscriptionStringInput | null,
  attempts?: ModelSubscriptionIntInput | null,
  completedAt?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  diagramData?: ModelSubscriptionStringInput | null,
  feedback?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  maxScore?: ModelSubscriptionIntInput | null,
  or?: Array< ModelSubscriptionUserAssignmentFilterInput | null > | null,
  owner?: ModelStringInput | null,
  score?: ModelSubscriptionFloatInput | null,
  startedAt?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  timeSpent?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userId?: ModelSubscriptionStringInput | null,
};

export type GetAssignmentQueryVariables = {
  id: string,
};

export type GetAssignmentQuery = {
  getAssignment?:  {
    __typename: "Assignment",
    createdAt?: string | null,
    description?: string | null,
    diagramTemplate?: string | null,
    difficulty?: AssignmentDifficulty | null,
    id: string,
    instructions?: string | null,
    isActive?: boolean | null,
    maxScore: number,
    owner?: string | null,
    title: string,
    updatedAt: string,
  } | null,
};

export type GetTBTUserQueryVariables = {
  id: string,
};

export type GetTBTUserQuery = {
  getTBTUser?:  {
    __typename: "TBTUser",
    accessLevel?: TBTUserAccessLevel | null,
    achievements?: string | null,
    amplifyAuthVerified?: boolean | null,
    assignmentsCompleted?: number | null,
    assignmentsInProgress?: number | null,
    averageAssignmentScore?: number | null,
    cognitoUserId: string,
    consecutiveLogins?: number | null,
    createdAt?: string | null,
    currentSessionActiveTime?: number | null,
    currentSessionStart?: string | null,
    diagramsCreated?: number | null,
    diagramsShared?: number | null,
    email: string,
    highestAssignmentScore?: number | null,
    id: string,
    lastActiveAt?: string | null,
    lastLoginAt?: string | null,
    lastLoginStreak?: number | null,
    learningLevel?: TBTUserLearningLevel | null,
    loopsIdentified?: number | null,
    metadata?: string | null,
    owner?: string | null,
    preferences?: string | null,
    simulationsRun?: number | null,
    skillsUnlocked?: string | null,
    tbtAuthStatus?: TBTUserTbtAuthStatus | null,
    totalActiveTime?: number | null,
    totalAssignmentScore?: number | null,
    totalIdleTime?: number | null,
    totalLogins?: number | null,
    updatedAt: string,
  } | null,
};

export type GetTodoQueryVariables = {
  id: string,
};

export type GetTodoQuery = {
  getTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type GetUserActivitySessionQueryVariables = {
  id: string,
};

export type GetUserActivitySessionQuery = {
  getUserActivitySession?:  {
    __typename: "UserActivitySession",
    actions?: string | null,
    createdAt: string,
    diagramsWorkedOn?: string | null,
    endTime?: string | null,
    id: string,
    loopsIdentified?: number | null,
    owner?: string | null,
    sessionId: string,
    simulationsRun?: number | null,
    startTime: string,
    totalActiveTime?: number | null,
    totalIdleTime?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type GetUserAssignmentQueryVariables = {
  id: string,
};

export type GetUserAssignmentQuery = {
  getUserAssignment?:  {
    __typename: "UserAssignment",
    assignmentId: string,
    attempts?: number | null,
    completedAt?: string | null,
    createdAt: string,
    diagramData?: string | null,
    feedback?: string | null,
    id: string,
    maxScore: number,
    owner?: string | null,
    score?: number | null,
    startedAt?: string | null,
    status?: UserAssignmentStatus | null,
    timeSpent?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type ListAssignmentsQueryVariables = {
  filter?: ModelAssignmentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListAssignmentsQuery = {
  listAssignments?:  {
    __typename: "ModelAssignmentConnection",
    items:  Array< {
      __typename: "Assignment",
      createdAt?: string | null,
      description?: string | null,
      diagramTemplate?: string | null,
      difficulty?: AssignmentDifficulty | null,
      id: string,
      instructions?: string | null,
      isActive?: boolean | null,
      maxScore: number,
      owner?: string | null,
      title: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListTBTUsersQueryVariables = {
  filter?: ModelTBTUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTBTUsersQuery = {
  listTBTUsers?:  {
    __typename: "ModelTBTUserConnection",
    items:  Array< {
      __typename: "TBTUser",
      accessLevel?: TBTUserAccessLevel | null,
      achievements?: string | null,
      amplifyAuthVerified?: boolean | null,
      assignmentsCompleted?: number | null,
      assignmentsInProgress?: number | null,
      averageAssignmentScore?: number | null,
      cognitoUserId: string,
      consecutiveLogins?: number | null,
      createdAt?: string | null,
      currentSessionActiveTime?: number | null,
      currentSessionStart?: string | null,
      diagramsCreated?: number | null,
      diagramsShared?: number | null,
      email: string,
      highestAssignmentScore?: number | null,
      id: string,
      lastActiveAt?: string | null,
      lastLoginAt?: string | null,
      lastLoginStreak?: number | null,
      learningLevel?: TBTUserLearningLevel | null,
      loopsIdentified?: number | null,
      metadata?: string | null,
      owner?: string | null,
      preferences?: string | null,
      simulationsRun?: number | null,
      skillsUnlocked?: string | null,
      tbtAuthStatus?: TBTUserTbtAuthStatus | null,
      totalActiveTime?: number | null,
      totalAssignmentScore?: number | null,
      totalIdleTime?: number | null,
      totalLogins?: number | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListTodosQueryVariables = {
  filter?: ModelTodoFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTodosQuery = {
  listTodos?:  {
    __typename: "ModelTodoConnection",
    items:  Array< {
      __typename: "Todo",
      content?: string | null,
      createdAt: string,
      id: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListUserActivitySessionsQueryVariables = {
  filter?: ModelUserActivitySessionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserActivitySessionsQuery = {
  listUserActivitySessions?:  {
    __typename: "ModelUserActivitySessionConnection",
    items:  Array< {
      __typename: "UserActivitySession",
      actions?: string | null,
      createdAt: string,
      diagramsWorkedOn?: string | null,
      endTime?: string | null,
      id: string,
      loopsIdentified?: number | null,
      owner?: string | null,
      sessionId: string,
      simulationsRun?: number | null,
      startTime: string,
      totalActiveTime?: number | null,
      totalIdleTime?: number | null,
      updatedAt: string,
      userId: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListUserAssignmentsQueryVariables = {
  filter?: ModelUserAssignmentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserAssignmentsQuery = {
  listUserAssignments?:  {
    __typename: "ModelUserAssignmentConnection",
    items:  Array< {
      __typename: "UserAssignment",
      assignmentId: string,
      attempts?: number | null,
      completedAt?: string | null,
      createdAt: string,
      diagramData?: string | null,
      feedback?: string | null,
      id: string,
      maxScore: number,
      owner?: string | null,
      score?: number | null,
      startedAt?: string | null,
      status?: UserAssignmentStatus | null,
      timeSpent?: number | null,
      updatedAt: string,
      userId: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateAssignmentMutationVariables = {
  condition?: ModelAssignmentConditionInput | null,
  input: CreateAssignmentInput,
};

export type CreateAssignmentMutation = {
  createAssignment?:  {
    __typename: "Assignment",
    createdAt?: string | null,
    description?: string | null,
    diagramTemplate?: string | null,
    difficulty?: AssignmentDifficulty | null,
    id: string,
    instructions?: string | null,
    isActive?: boolean | null,
    maxScore: number,
    owner?: string | null,
    title: string,
    updatedAt: string,
  } | null,
};

export type CreateTBTUserMutationVariables = {
  condition?: ModelTBTUserConditionInput | null,
  input: CreateTBTUserInput,
};

export type CreateTBTUserMutation = {
  createTBTUser?:  {
    __typename: "TBTUser",
    accessLevel?: TBTUserAccessLevel | null,
    achievements?: string | null,
    amplifyAuthVerified?: boolean | null,
    assignmentsCompleted?: number | null,
    assignmentsInProgress?: number | null,
    averageAssignmentScore?: number | null,
    cognitoUserId: string,
    consecutiveLogins?: number | null,
    createdAt?: string | null,
    currentSessionActiveTime?: number | null,
    currentSessionStart?: string | null,
    diagramsCreated?: number | null,
    diagramsShared?: number | null,
    email: string,
    highestAssignmentScore?: number | null,
    id: string,
    lastActiveAt?: string | null,
    lastLoginAt?: string | null,
    lastLoginStreak?: number | null,
    learningLevel?: TBTUserLearningLevel | null,
    loopsIdentified?: number | null,
    metadata?: string | null,
    owner?: string | null,
    preferences?: string | null,
    simulationsRun?: number | null,
    skillsUnlocked?: string | null,
    tbtAuthStatus?: TBTUserTbtAuthStatus | null,
    totalActiveTime?: number | null,
    totalAssignmentScore?: number | null,
    totalIdleTime?: number | null,
    totalLogins?: number | null,
    updatedAt: string,
  } | null,
};

export type CreateTodoMutationVariables = {
  condition?: ModelTodoConditionInput | null,
  input: CreateTodoInput,
};

export type CreateTodoMutation = {
  createTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type CreateUserActivitySessionMutationVariables = {
  condition?: ModelUserActivitySessionConditionInput | null,
  input: CreateUserActivitySessionInput,
};

export type CreateUserActivitySessionMutation = {
  createUserActivitySession?:  {
    __typename: "UserActivitySession",
    actions?: string | null,
    createdAt: string,
    diagramsWorkedOn?: string | null,
    endTime?: string | null,
    id: string,
    loopsIdentified?: number | null,
    owner?: string | null,
    sessionId: string,
    simulationsRun?: number | null,
    startTime: string,
    totalActiveTime?: number | null,
    totalIdleTime?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type CreateUserAssignmentMutationVariables = {
  condition?: ModelUserAssignmentConditionInput | null,
  input: CreateUserAssignmentInput,
};

export type CreateUserAssignmentMutation = {
  createUserAssignment?:  {
    __typename: "UserAssignment",
    assignmentId: string,
    attempts?: number | null,
    completedAt?: string | null,
    createdAt: string,
    diagramData?: string | null,
    feedback?: string | null,
    id: string,
    maxScore: number,
    owner?: string | null,
    score?: number | null,
    startedAt?: string | null,
    status?: UserAssignmentStatus | null,
    timeSpent?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type DeleteAssignmentMutationVariables = {
  condition?: ModelAssignmentConditionInput | null,
  input: DeleteAssignmentInput,
};

export type DeleteAssignmentMutation = {
  deleteAssignment?:  {
    __typename: "Assignment",
    createdAt?: string | null,
    description?: string | null,
    diagramTemplate?: string | null,
    difficulty?: AssignmentDifficulty | null,
    id: string,
    instructions?: string | null,
    isActive?: boolean | null,
    maxScore: number,
    owner?: string | null,
    title: string,
    updatedAt: string,
  } | null,
};

export type DeleteTBTUserMutationVariables = {
  condition?: ModelTBTUserConditionInput | null,
  input: DeleteTBTUserInput,
};

export type DeleteTBTUserMutation = {
  deleteTBTUser?:  {
    __typename: "TBTUser",
    accessLevel?: TBTUserAccessLevel | null,
    achievements?: string | null,
    amplifyAuthVerified?: boolean | null,
    assignmentsCompleted?: number | null,
    assignmentsInProgress?: number | null,
    averageAssignmentScore?: number | null,
    cognitoUserId: string,
    consecutiveLogins?: number | null,
    createdAt?: string | null,
    currentSessionActiveTime?: number | null,
    currentSessionStart?: string | null,
    diagramsCreated?: number | null,
    diagramsShared?: number | null,
    email: string,
    highestAssignmentScore?: number | null,
    id: string,
    lastActiveAt?: string | null,
    lastLoginAt?: string | null,
    lastLoginStreak?: number | null,
    learningLevel?: TBTUserLearningLevel | null,
    loopsIdentified?: number | null,
    metadata?: string | null,
    owner?: string | null,
    preferences?: string | null,
    simulationsRun?: number | null,
    skillsUnlocked?: string | null,
    tbtAuthStatus?: TBTUserTbtAuthStatus | null,
    totalActiveTime?: number | null,
    totalAssignmentScore?: number | null,
    totalIdleTime?: number | null,
    totalLogins?: number | null,
    updatedAt: string,
  } | null,
};

export type DeleteTodoMutationVariables = {
  condition?: ModelTodoConditionInput | null,
  input: DeleteTodoInput,
};

export type DeleteTodoMutation = {
  deleteTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type DeleteUserActivitySessionMutationVariables = {
  condition?: ModelUserActivitySessionConditionInput | null,
  input: DeleteUserActivitySessionInput,
};

export type DeleteUserActivitySessionMutation = {
  deleteUserActivitySession?:  {
    __typename: "UserActivitySession",
    actions?: string | null,
    createdAt: string,
    diagramsWorkedOn?: string | null,
    endTime?: string | null,
    id: string,
    loopsIdentified?: number | null,
    owner?: string | null,
    sessionId: string,
    simulationsRun?: number | null,
    startTime: string,
    totalActiveTime?: number | null,
    totalIdleTime?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type DeleteUserAssignmentMutationVariables = {
  condition?: ModelUserAssignmentConditionInput | null,
  input: DeleteUserAssignmentInput,
};

export type DeleteUserAssignmentMutation = {
  deleteUserAssignment?:  {
    __typename: "UserAssignment",
    assignmentId: string,
    attempts?: number | null,
    completedAt?: string | null,
    createdAt: string,
    diagramData?: string | null,
    feedback?: string | null,
    id: string,
    maxScore: number,
    owner?: string | null,
    score?: number | null,
    startedAt?: string | null,
    status?: UserAssignmentStatus | null,
    timeSpent?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type UpdateAssignmentMutationVariables = {
  condition?: ModelAssignmentConditionInput | null,
  input: UpdateAssignmentInput,
};

export type UpdateAssignmentMutation = {
  updateAssignment?:  {
    __typename: "Assignment",
    createdAt?: string | null,
    description?: string | null,
    diagramTemplate?: string | null,
    difficulty?: AssignmentDifficulty | null,
    id: string,
    instructions?: string | null,
    isActive?: boolean | null,
    maxScore: number,
    owner?: string | null,
    title: string,
    updatedAt: string,
  } | null,
};

export type UpdateTBTUserMutationVariables = {
  condition?: ModelTBTUserConditionInput | null,
  input: UpdateTBTUserInput,
};

export type UpdateTBTUserMutation = {
  updateTBTUser?:  {
    __typename: "TBTUser",
    accessLevel?: TBTUserAccessLevel | null,
    achievements?: string | null,
    amplifyAuthVerified?: boolean | null,
    assignmentsCompleted?: number | null,
    assignmentsInProgress?: number | null,
    averageAssignmentScore?: number | null,
    cognitoUserId: string,
    consecutiveLogins?: number | null,
    createdAt?: string | null,
    currentSessionActiveTime?: number | null,
    currentSessionStart?: string | null,
    diagramsCreated?: number | null,
    diagramsShared?: number | null,
    email: string,
    highestAssignmentScore?: number | null,
    id: string,
    lastActiveAt?: string | null,
    lastLoginAt?: string | null,
    lastLoginStreak?: number | null,
    learningLevel?: TBTUserLearningLevel | null,
    loopsIdentified?: number | null,
    metadata?: string | null,
    owner?: string | null,
    preferences?: string | null,
    simulationsRun?: number | null,
    skillsUnlocked?: string | null,
    tbtAuthStatus?: TBTUserTbtAuthStatus | null,
    totalActiveTime?: number | null,
    totalAssignmentScore?: number | null,
    totalIdleTime?: number | null,
    totalLogins?: number | null,
    updatedAt: string,
  } | null,
};

export type UpdateTodoMutationVariables = {
  condition?: ModelTodoConditionInput | null,
  input: UpdateTodoInput,
};

export type UpdateTodoMutation = {
  updateTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type UpdateUserActivitySessionMutationVariables = {
  condition?: ModelUserActivitySessionConditionInput | null,
  input: UpdateUserActivitySessionInput,
};

export type UpdateUserActivitySessionMutation = {
  updateUserActivitySession?:  {
    __typename: "UserActivitySession",
    actions?: string | null,
    createdAt: string,
    diagramsWorkedOn?: string | null,
    endTime?: string | null,
    id: string,
    loopsIdentified?: number | null,
    owner?: string | null,
    sessionId: string,
    simulationsRun?: number | null,
    startTime: string,
    totalActiveTime?: number | null,
    totalIdleTime?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type UpdateUserAssignmentMutationVariables = {
  condition?: ModelUserAssignmentConditionInput | null,
  input: UpdateUserAssignmentInput,
};

export type UpdateUserAssignmentMutation = {
  updateUserAssignment?:  {
    __typename: "UserAssignment",
    assignmentId: string,
    attempts?: number | null,
    completedAt?: string | null,
    createdAt: string,
    diagramData?: string | null,
    feedback?: string | null,
    id: string,
    maxScore: number,
    owner?: string | null,
    score?: number | null,
    startedAt?: string | null,
    status?: UserAssignmentStatus | null,
    timeSpent?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnCreateAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnCreateAssignmentSubscription = {
  onCreateAssignment?:  {
    __typename: "Assignment",
    createdAt?: string | null,
    description?: string | null,
    diagramTemplate?: string | null,
    difficulty?: AssignmentDifficulty | null,
    id: string,
    instructions?: string | null,
    isActive?: boolean | null,
    maxScore: number,
    owner?: string | null,
    title: string,
    updatedAt: string,
  } | null,
};

export type OnCreateTBTUserSubscriptionVariables = {
  filter?: ModelSubscriptionTBTUserFilterInput | null,
  owner?: string | null,
};

export type OnCreateTBTUserSubscription = {
  onCreateTBTUser?:  {
    __typename: "TBTUser",
    accessLevel?: TBTUserAccessLevel | null,
    achievements?: string | null,
    amplifyAuthVerified?: boolean | null,
    assignmentsCompleted?: number | null,
    assignmentsInProgress?: number | null,
    averageAssignmentScore?: number | null,
    cognitoUserId: string,
    consecutiveLogins?: number | null,
    createdAt?: string | null,
    currentSessionActiveTime?: number | null,
    currentSessionStart?: string | null,
    diagramsCreated?: number | null,
    diagramsShared?: number | null,
    email: string,
    highestAssignmentScore?: number | null,
    id: string,
    lastActiveAt?: string | null,
    lastLoginAt?: string | null,
    lastLoginStreak?: number | null,
    learningLevel?: TBTUserLearningLevel | null,
    loopsIdentified?: number | null,
    metadata?: string | null,
    owner?: string | null,
    preferences?: string | null,
    simulationsRun?: number | null,
    skillsUnlocked?: string | null,
    tbtAuthStatus?: TBTUserTbtAuthStatus | null,
    totalActiveTime?: number | null,
    totalAssignmentScore?: number | null,
    totalIdleTime?: number | null,
    totalLogins?: number | null,
    updatedAt: string,
  } | null,
};

export type OnCreateTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnCreateTodoSubscription = {
  onCreateTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnCreateUserActivitySessionSubscriptionVariables = {
  filter?: ModelSubscriptionUserActivitySessionFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserActivitySessionSubscription = {
  onCreateUserActivitySession?:  {
    __typename: "UserActivitySession",
    actions?: string | null,
    createdAt: string,
    diagramsWorkedOn?: string | null,
    endTime?: string | null,
    id: string,
    loopsIdentified?: number | null,
    owner?: string | null,
    sessionId: string,
    simulationsRun?: number | null,
    startTime: string,
    totalActiveTime?: number | null,
    totalIdleTime?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnCreateUserAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionUserAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserAssignmentSubscription = {
  onCreateUserAssignment?:  {
    __typename: "UserAssignment",
    assignmentId: string,
    attempts?: number | null,
    completedAt?: string | null,
    createdAt: string,
    diagramData?: string | null,
    feedback?: string | null,
    id: string,
    maxScore: number,
    owner?: string | null,
    score?: number | null,
    startedAt?: string | null,
    status?: UserAssignmentStatus | null,
    timeSpent?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnDeleteAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnDeleteAssignmentSubscription = {
  onDeleteAssignment?:  {
    __typename: "Assignment",
    createdAt?: string | null,
    description?: string | null,
    diagramTemplate?: string | null,
    difficulty?: AssignmentDifficulty | null,
    id: string,
    instructions?: string | null,
    isActive?: boolean | null,
    maxScore: number,
    owner?: string | null,
    title: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteTBTUserSubscriptionVariables = {
  filter?: ModelSubscriptionTBTUserFilterInput | null,
  owner?: string | null,
};

export type OnDeleteTBTUserSubscription = {
  onDeleteTBTUser?:  {
    __typename: "TBTUser",
    accessLevel?: TBTUserAccessLevel | null,
    achievements?: string | null,
    amplifyAuthVerified?: boolean | null,
    assignmentsCompleted?: number | null,
    assignmentsInProgress?: number | null,
    averageAssignmentScore?: number | null,
    cognitoUserId: string,
    consecutiveLogins?: number | null,
    createdAt?: string | null,
    currentSessionActiveTime?: number | null,
    currentSessionStart?: string | null,
    diagramsCreated?: number | null,
    diagramsShared?: number | null,
    email: string,
    highestAssignmentScore?: number | null,
    id: string,
    lastActiveAt?: string | null,
    lastLoginAt?: string | null,
    lastLoginStreak?: number | null,
    learningLevel?: TBTUserLearningLevel | null,
    loopsIdentified?: number | null,
    metadata?: string | null,
    owner?: string | null,
    preferences?: string | null,
    simulationsRun?: number | null,
    skillsUnlocked?: string | null,
    tbtAuthStatus?: TBTUserTbtAuthStatus | null,
    totalActiveTime?: number | null,
    totalAssignmentScore?: number | null,
    totalIdleTime?: number | null,
    totalLogins?: number | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnDeleteTodoSubscription = {
  onDeleteTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserActivitySessionSubscriptionVariables = {
  filter?: ModelSubscriptionUserActivitySessionFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserActivitySessionSubscription = {
  onDeleteUserActivitySession?:  {
    __typename: "UserActivitySession",
    actions?: string | null,
    createdAt: string,
    diagramsWorkedOn?: string | null,
    endTime?: string | null,
    id: string,
    loopsIdentified?: number | null,
    owner?: string | null,
    sessionId: string,
    simulationsRun?: number | null,
    startTime: string,
    totalActiveTime?: number | null,
    totalIdleTime?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnDeleteUserAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionUserAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserAssignmentSubscription = {
  onDeleteUserAssignment?:  {
    __typename: "UserAssignment",
    assignmentId: string,
    attempts?: number | null,
    completedAt?: string | null,
    createdAt: string,
    diagramData?: string | null,
    feedback?: string | null,
    id: string,
    maxScore: number,
    owner?: string | null,
    score?: number | null,
    startedAt?: string | null,
    status?: UserAssignmentStatus | null,
    timeSpent?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnUpdateAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnUpdateAssignmentSubscription = {
  onUpdateAssignment?:  {
    __typename: "Assignment",
    createdAt?: string | null,
    description?: string | null,
    diagramTemplate?: string | null,
    difficulty?: AssignmentDifficulty | null,
    id: string,
    instructions?: string | null,
    isActive?: boolean | null,
    maxScore: number,
    owner?: string | null,
    title: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateTBTUserSubscriptionVariables = {
  filter?: ModelSubscriptionTBTUserFilterInput | null,
  owner?: string | null,
};

export type OnUpdateTBTUserSubscription = {
  onUpdateTBTUser?:  {
    __typename: "TBTUser",
    accessLevel?: TBTUserAccessLevel | null,
    achievements?: string | null,
    amplifyAuthVerified?: boolean | null,
    assignmentsCompleted?: number | null,
    assignmentsInProgress?: number | null,
    averageAssignmentScore?: number | null,
    cognitoUserId: string,
    consecutiveLogins?: number | null,
    createdAt?: string | null,
    currentSessionActiveTime?: number | null,
    currentSessionStart?: string | null,
    diagramsCreated?: number | null,
    diagramsShared?: number | null,
    email: string,
    highestAssignmentScore?: number | null,
    id: string,
    lastActiveAt?: string | null,
    lastLoginAt?: string | null,
    lastLoginStreak?: number | null,
    learningLevel?: TBTUserLearningLevel | null,
    loopsIdentified?: number | null,
    metadata?: string | null,
    owner?: string | null,
    preferences?: string | null,
    simulationsRun?: number | null,
    skillsUnlocked?: string | null,
    tbtAuthStatus?: TBTUserTbtAuthStatus | null,
    totalActiveTime?: number | null,
    totalAssignmentScore?: number | null,
    totalIdleTime?: number | null,
    totalLogins?: number | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateTodoSubscriptionVariables = {
  filter?: ModelSubscriptionTodoFilterInput | null,
};

export type OnUpdateTodoSubscription = {
  onUpdateTodo?:  {
    __typename: "Todo",
    content?: string | null,
    createdAt: string,
    id: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserActivitySessionSubscriptionVariables = {
  filter?: ModelSubscriptionUserActivitySessionFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserActivitySessionSubscription = {
  onUpdateUserActivitySession?:  {
    __typename: "UserActivitySession",
    actions?: string | null,
    createdAt: string,
    diagramsWorkedOn?: string | null,
    endTime?: string | null,
    id: string,
    loopsIdentified?: number | null,
    owner?: string | null,
    sessionId: string,
    simulationsRun?: number | null,
    startTime: string,
    totalActiveTime?: number | null,
    totalIdleTime?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

export type OnUpdateUserAssignmentSubscriptionVariables = {
  filter?: ModelSubscriptionUserAssignmentFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserAssignmentSubscription = {
  onUpdateUserAssignment?:  {
    __typename: "UserAssignment",
    assignmentId: string,
    attempts?: number | null,
    completedAt?: string | null,
    createdAt: string,
    diagramData?: string | null,
    feedback?: string | null,
    id: string,
    maxScore: number,
    owner?: string | null,
    score?: number | null,
    startedAt?: string | null,
    status?: UserAssignmentStatus | null,
    timeSpent?: number | null,
    updatedAt: string,
    userId: string,
  } | null,
};

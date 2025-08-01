import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
    ]),
  
  // TBT Registered Students - Simple table for authentication
  TBTRegisteredStudents: a
    .model({
      email: a.string().required(),
    })
    .authorization(allow => [
      allow.authenticated().to(['read'])
    ]),
  
  // Enhanced TBT User model with progress tracking
  TBTUser: a
    .model({
      // Authentication fields
      email: a.string().required(),
      cognitoUserId: a.string().required(),
      tbtAuthStatus: a.enum(['guest', 'tbt', 'pending']),
      accessLevel: a.enum(['guest', 'tbt', 'admin']),
      amplifyAuthVerified: a.boolean(),
      
      // Timestamps
      createdAt: a.datetime(),
      lastLoginAt: a.datetime(),
      lastActiveAt: a.datetime(),
      
      // Login tracking
      totalLogins: a.integer(),
      consecutiveLogins: a.integer(),
      lastLoginStreak: a.integer(),
      
      // Activity tracking
      totalActiveTime: a.integer(), // in seconds
      totalIdleTime: a.integer(), // in seconds
      currentSessionStart: a.datetime(),
      currentSessionActiveTime: a.integer(),
      
      // Assignment tracking
      assignmentsCompleted: a.integer(),
      assignmentsInProgress: a.integer(),
      totalAssignmentScore: a.float(),
      averageAssignmentScore: a.float(),
      highestAssignmentScore: a.float(),
      
      // Progress tracking
      diagramsCreated: a.integer(),
      diagramsShared: a.integer(),
      simulationsRun: a.integer(),
      loopsIdentified: a.integer(),
      
      // Learning milestones
      learningLevel: a.enum(['beginner', 'intermediate', 'advanced', 'expert']),
      skillsUnlocked: a.string(), // JSON string for array
      achievements: a.string(), // JSON string for array
      
      // User preferences and settings
      preferences: a.string(), // JSON string for user preferences
      metadata: a.string(), // JSON string for additional data
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update']),
    ]),
    
  // Assignment model for tracking user assignments
  Assignment: a
    .model({
      title: a.string().required(),
      description: a.string(),
      difficulty: a.enum(['beginner', 'intermediate', 'advanced']),
      maxScore: a.integer().required(),
      instructions: a.string(),
      diagramTemplate: a.string(), // JSON string for initial diagram state
      createdAt: a.datetime(),
      isActive: a.boolean(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),
    
  // User Assignment Progress model
  UserAssignment: a
    .model({
      userId: a.string().required(),
      assignmentId: a.string().required(),
      status: a.enum(['not_started', 'in_progress', 'completed', 'submitted']),
      score: a.float(),
      maxScore: a.integer().required(),
      startedAt: a.datetime(),
      completedAt: a.datetime(),
      timeSpent: a.integer(), // in seconds
      attempts: a.integer(),
      feedback: a.string(),
      diagramData: a.string(), // JSON string for user's diagram
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update']),
    ]),
    
  // User Activity Session model for detailed tracking
  UserActivitySession: a
    .model({
      userId: a.string().required(),
      sessionId: a.string().required(),
      startTime: a.datetime().required(),
      endTime: a.datetime(),
      totalActiveTime: a.integer(), // in seconds
      totalIdleTime: a.integer(), // in seconds
      actions: a.string(), // JSON string for array of action types performed
      diagramsWorkedOn: a.string(), // JSON string for array of diagram IDs
      simulationsRun: a.integer(),
      loopsIdentified: a.integer(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});



/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>

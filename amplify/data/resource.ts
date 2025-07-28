import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  CLDExample: a
    .model({
      name: a.string().required(),
      description: a.string(),
      category: a.string().required(),
      difficulty: a.string().required(),
      filePath: a.string().required(),
      tags: a.string(),
      author: a.string(),
      version: a.string().default('1.0'),
      isPublic: a.boolean().default(true),
      isFeatured: a.boolean().default(false),
      nodeCount: a.integer(),
      edgeCount: a.integer(),
      loopCount: a.integer(),
      problemStatement: a.string(),
      learningObjectives: a.string(),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});

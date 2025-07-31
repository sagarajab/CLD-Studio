import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'cldStudioStorage',
  access: (allow) => ({
    // Base public folder access
    'public/*': [
      allow.authenticated.to(['get', 'write', 'list', 'delete']),
    ],
    // Examples folder under public
    'public/examples/*': [
      allow.authenticated.to(['get', 'write', 'list', 'delete']),
    ],
  }),
});

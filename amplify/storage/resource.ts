import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'cldExamplesStorage',
  access: (allow) => ({
    'public/*': [
      allow.authenticated.to(['read', 'write']),
      allow.guest.to(['read'])
    ],
  })
});
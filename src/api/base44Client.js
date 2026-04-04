// Base44 client stub - kept for compatibility during migration
// All actual API calls now go through heruClient.js
export const base44 = {
  integrations: {
    Core: {
      UploadFile: async () => {
        throw new Error('Base44 upload removed. Use Supabase Storage instead.');
      }
    }
  },
  appLogs: {
    logUserInApp: async () => {} // no-op
  }
};

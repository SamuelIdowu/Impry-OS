import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './supabase/migrations', // or neon migrations folder
  dialect: 'postgresql',
  dbCredentials: {
    url: postgresql://neondb_owner:npg_Wlf2h5kzvyrM@ep-little-voice-atuwik3i-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode,
  },
});

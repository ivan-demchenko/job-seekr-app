import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string(),
  ENV: z.union([z.literal('dev'), z.literal('prod')]),
  PORT: z.number().optional().default(3000),
  HOSTING_MODE: z.union([z.literal('selfhost'), z.literal('cloud')]),

  // Auth stuff
  KINDE_ISSUER_URL: z.string().url(),
  KINDE_CLIENT_ID: z.string(),
  KINDE_CLIENT_SECRET: z.string(),
  KINDE_SITE_URL: z.string().url(),
  KINDE_LOGOUT_REDIRECT_URI: z.string().url(),
  KINDE_DOMAIN: z.string().url(),
  KINDE_REDIRECT_URI: z.string().url(),
});

export const EnvConfig = EnvSchema.parse(Bun.env);
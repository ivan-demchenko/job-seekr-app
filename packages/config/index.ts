import { z } from 'zod';

const BaseScheme = z.object({
  DATABASE_URL: z.string(),
  ENV: z.union([z.literal('dev'), z.literal('prod')]),
  PORT: z.number().optional().default(3000),
});

const CloudEnv = BaseScheme.extend({
  HOSTING_MODE: z.literal('cloud'),
  KINDE_ISSUER_URL: z.string().url(),
  KINDE_CLIENT_ID: z.string(),
  KINDE_CLIENT_SECRET: z.string(),
  KINDE_SITE_URL: z.string().url(),
  KINDE_LOGOUT_REDIRECT_URI: z.string().url(),
  KINDE_DOMAIN: z.string().url(),
  KINDE_REDIRECT_URI: z.string().url(),
});

export type CloudEnvConf = z.infer<typeof CloudEnv>;

const LocalEnv = BaseScheme.extend({
  HOSTING_MODE: z.literal('local'),
});

export type LocalEnvConf = z.infer<typeof LocalEnv>;

const EnvSchema = z.discriminatedUnion(
  'HOSTING_MODE',
  [CloudEnv, LocalEnv]
);

export type EnvType = z.infer<typeof EnvSchema>;

export const EnvConfig = EnvSchema.parse(Bun.env);
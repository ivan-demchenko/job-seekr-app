import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string(),
  ENV: z.union([z.literal('dev'), z.literal('prod')]),
  PORT: z.number().optional().default(3000)
});

export const EnvConfig = EnvSchema.parse(Bun.env);
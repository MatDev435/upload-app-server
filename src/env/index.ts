import 'dotenv/config'

import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .optional()
    .default('development'),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_USER: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PASSWORD: z.string(),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number(),
  API_URL: z.string(),
  APP_URL: z.string(),
  R2_ACCOUNT_ID: z.string(),
  R2_TOKEN: z.string(),
  R2_BUCKET: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_ENDPOINT: z.string().url(),
  JWT_SECRET: z.string(),
  PASSWORD_SALT_ROUNDS: z.coerce.number().default(10),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('✖️ Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables')
}

export const env = _env.data

import z from 'zod'

const envSchema = z.object({
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_USER: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PASSWORD: z.string(),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('✖️ Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables')
}

export const env = _env.data

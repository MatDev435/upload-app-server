import { beforeAll, beforeEach, afterAll } from 'vitest'
import { app } from '../src/server'
import { prisma } from '../src/lib/prisma'
import { cleanDatabase } from './helpers/cleanDatabase'

beforeAll(async () => {
  process.env.APP_URL ??= 'http://localhost:3000'
  process.env.JWT_SECRET ??= 'test-secret'
  process.env.NODE_ENV = 'test'

  await app.ready()
})

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await cleanDatabase()
  await app.close()
  await prisma.$disconnect()
})

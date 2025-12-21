import { prisma } from '../../src/lib/prisma'

export async function cleanDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "files", "invite_tokens", "users" RESTART IDENTITY CASCADE;'
  )
}

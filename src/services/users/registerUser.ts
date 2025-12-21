import { createHash, randomUUID } from 'node:crypto'
import { env } from '../../env'
import { prisma } from '../../lib/prisma'
import { UserAlreadyExistsError } from './errors/userAlreadyExists'

interface RegisterUserRequest {
  username: string
  isAdmin?: boolean
}

interface RegisterUserResponse {
  inviteUrl: string
  inviteToken: string
  expiresAt: Date
  userId: string
}

const INVITE_TOKEN_EXPIRATION_HOURS = 24

export async function registerUser({
  username,
  isAdmin = false,
}: RegisterUserRequest): Promise<RegisterUserResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  })

  if (existingUser) {
    throw new UserAlreadyExistsError()
  }

  const inviteToken = randomUUID()
  const inviteTokenHash = createHash('sha256').update(inviteToken).digest('hex')
  const expiresAt = new Date(
    Date.now() + INVITE_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
  )

  const [user] = await prisma.$transaction([
    prisma.user.create({
      data: {
        username,
        isAdmin,
      },
    }),
    prisma.inviteToken.create({
      data: {
        token: inviteTokenHash,
        username,
        expiresAt,
      },
    }),
  ])

  const inviteUrl = `${env.APP_URL}/invite?token=${inviteToken}`

  return {
    inviteUrl,
    inviteToken,
    expiresAt,
    userId: user.id,
  }
}

import { createHash } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { InvalidInviteTokenError } from './errors/invalidInviteToken'
import { InviteTokenAlreadyUsedError } from './errors/inviteTokenAlreadyUsed'
import { InviteTokenExpiredError } from './errors/inviteTokenExpired'
import { env } from '../../env'

interface AcceptInviteRequest {
  inviteToken: string
  password: string
}

interface AcceptInviteResponse {
  userId: string
}

export async function acceptInvite({
  inviteToken,
  password,
}: AcceptInviteRequest): Promise<AcceptInviteResponse> {
  const inviteTokenHash = createHash('sha256').update(inviteToken).digest('hex')

  const invite = await prisma.inviteToken.findUnique({
    where: { token: inviteTokenHash },
  })

  if (!invite) {
    throw new InvalidInviteTokenError()
  }

  if (invite.isUsed) {
    throw new InviteTokenAlreadyUsedError()
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new InviteTokenExpiredError()
  }

  const user = await prisma.user.findUnique({
    where: { username: invite.username },
    select: { id: true },
  })

  if (!user) {
    throw new InvalidInviteTokenError()
  }

  const hashedPassword = await bcrypt.hash(password, env.PASSWORD_SALT_ROUNDS)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
      },
    }),
    prisma.inviteToken.update({
      where: { id: invite.id },
      data: { isUsed: true },
    }),
  ])

  return { userId: user.id }
}

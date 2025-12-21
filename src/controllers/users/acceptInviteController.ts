import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { env } from '../../env'
import { acceptInvite } from '../../services/users/acceptInvite'
import { InviteTokenExpiredError } from '../../services/users/errors/inviteTokenExpired'
import { InviteTokenAlreadyUsedError } from '../../services/users/errors/inviteTokenAlreadyUsed'
import { InvalidInviteTokenError } from '../../services/users/errors/invalidInviteToken'

export async function acceptInviteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const schema = z.object({
    inviteToken: z.string(),
    password: z.string().min(8),
  })

  const { inviteToken, password } = schema.parse(request.body)

  try {
    const { userId } = await acceptInvite({ inviteToken, password })

    const token = await reply.jwtSign({ sub: userId })

    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return reply.status(200).send({ redirectTo: '/' })
  } catch (error) {
    if (error instanceof InvalidInviteTokenError) {
      return reply.status(400).send({ error: 'Invalid invite token' })
    }

    if (error instanceof InviteTokenAlreadyUsedError) {
      return reply.status(409).send({ error: 'Invite token already used' })
    }

    if (error instanceof InviteTokenExpiredError) {
      return reply.status(410).send({ error: 'Invite token expired' })
    }

    throw error
  }
}

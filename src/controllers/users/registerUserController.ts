import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { registerUser } from '../../services/users/registerUser'
import { UserAlreadyExistsError } from '../../services/users/errors/userAlreadyExists'

export async function registerUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const schema = z.object({
    username: z.string(),
    isAdmin: z.boolean().optional().default(false),
  })

  const { username, isAdmin } = schema.parse(request.body)

  try {
    const { userId, inviteUrl, inviteToken, expiresAt } = await registerUser({
      username,
      isAdmin,
    })

    return reply.status(201).send({ userId, inviteUrl, inviteToken, expiresAt })
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ error: 'User already exists' })
    }

    throw error
  }
}

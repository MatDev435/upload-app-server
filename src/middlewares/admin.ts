import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma'

export async function adminMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      await request.jwtVerify({ onlyCookie: true })
    }
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const userId = request.user.sub

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    return reply.status(403).send({ error: 'Forbidden' })
  }
}

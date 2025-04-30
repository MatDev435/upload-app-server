import { FastifyReply, FastifyRequest } from 'fastify'
import { ResolveFastifyReplyReturnType } from 'fastify/types/type-provider'
import { prisma } from '../lib/prisma'

export async function fetchFilesRoute(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const files = await prisma.file.findMany()

  return reply.send({ files })
}

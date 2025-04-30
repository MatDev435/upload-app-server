import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { prisma } from '../lib/prisma'

export async function downloadRoute(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    fileId: z.string().uuid(),
  })

  const { fileId } = paramsSchema.parse(request.params)

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  })

  if (!file) {
    return reply.status(404).send({ message: 'File not found.' })
  }

  return reply.download(file.savedName, file.originalName)
}

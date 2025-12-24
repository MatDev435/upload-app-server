import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { upload } from '../../services/files/upload'

export async function uploadController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const schema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
  })

  const { fileName, fileType, fileSize } = schema.parse(request.body)

  const userId = request.user.sub

  const { putUrl, fileId } = await upload({
    userId,
    fileName,
    fileType,
    fileSize,
  })

  reply.status(201).send({ putUrl, fileId })
}

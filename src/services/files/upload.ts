import { FastifyReply, FastifyRequest } from 'fastify'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3 } from '../../lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../../env'
import { prisma } from '../../lib/prisma'
import { randomUUID } from 'node:crypto'

interface UploadRequest {
  userId: string
  fileName: string
  fileType: string
  fileSize: number
}

interface UploadResponse {
  putUrl: string
  fileId: string
}

export async function upload({
  userId,
  fileName,
  fileType,
  fileSize,
}: UploadRequest): Promise<UploadResponse> {
  const savedName = `${randomUUID()}-${fileName}`

  const file = await prisma.file.create({
    data: {
      userId,
      originalName: fileName,
      savedName,
      mimetype: fileType,
      size: fileSize,
    },
  })

  const fileId = file.id

  const putUrl = await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: 'test',
    }),
    { expiresIn: 180 }
  )

  return { putUrl, fileId }
}

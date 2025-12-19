import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { PassThrough } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma'
import { env } from '../env'

export async function uploadRoute(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = await request.file()

  if (!data) {
    return reply.status(400).send({ message: 'Please provide a file' })
  }

  const fileName = `${randomUUID()}-${data.filename}`
  const uploadPath = path.resolve('uploads', fileName)

  let totalBytes = 0
  const counter = new PassThrough()
  counter.on('data', chunk => {
    totalBytes += chunk.length
  })

  await pipeline(data.file, counter, fs.createWriteStream(uploadPath))

  const file = await prisma.file.create({
    data: {
      originalName: data.filename,
      savedName: fileName,
      size: totalBytes,
      mimetype: data.mimetype,
    },
  })

  return reply
    .status(201)
    .send({ downloadUrl: `${env.APP_URL}/download/${file.id}` })
}

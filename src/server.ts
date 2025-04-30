import path from 'node:path'
import { env } from './env'
import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { uploadRoute } from './routes/upload'

export const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})
app.register(fastifyMultipart, {
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2 GB
  },
})
app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'uploads'),
  prefix: '/uploads',
})

app.post('/upload', uploadRoute)

app.listen({ port: env.PORT }).then(() => {
  console.log('🔥 HTTP Server Running!')
})

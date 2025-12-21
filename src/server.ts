import path from 'node:path'
import { env } from './env'
import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import { uploadController } from './controllers/files/uploadController'
import { authMiddleware } from './middlewares/auth'
import { adminMiddleware } from './middlewares/admin'
import { registerUserController } from './controllers/users/registerUserController'
import { acceptInviteController } from './controllers/users/acceptInviteController'

export const app = fastify()

app.register(fastifyCors, {
  origin: '*',
  exposedHeaders: ['Content-Disposition'],
})
app.register(fastifyMultipart, {
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2 GB
  },
})
app.register(fastifyStatic, {
  root: path.resolve('uploads'),
  prefix: '/uploads',
})
app.register(cookie)
app.register(jwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: false,
  },
  sign: { expiresIn: '7d' },
})

app.post('/uploads', { preHandler: [authMiddleware] }, uploadController)
app.post(
  '/users/register',
  { preHandler: [authMiddleware, adminMiddleware] },
  registerUserController
)
app.post('/users', acceptInviteController)

if (process.env.NODE_ENV !== 'test') {
  app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
    console.log('🔥 HTTP Server Running!')
  })
}

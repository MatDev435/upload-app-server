import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string } // o que você coloca no token
    user: { sub: string } // o que vai aparecer em request.user
  }
}

import { createHash, randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import request from 'supertest'
import { prisma } from '../../src/lib/prisma'
import { app } from '../../src/server'
import { cleanDatabase } from '../helpers/cleanDatabase'

describe('Users controllers', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  it('should allow an admin to register a user and return invite details', async () => {
    const adminUsername = `admin-${randomUUID()}`
    const newUsername = `user-${randomUUID()}`

    const admin = await prisma.user.create({
      data: {
        username: adminUsername,
        password: 'hashed-password',
        isAdmin: true,
      },
    })

    const adminToken = app.jwt.sign({ sub: admin.id })

    const response = await request(app.server)
      .post('/users/register')
      .set('Cookie', [`token=${adminToken}`])
      .send({
        username: newUsername,
      })
      .expect(201)

    const { inviteToken, inviteUrl, expiresAt, userId } = response.body

    expect(inviteToken).toBeDefined()
    expect(inviteUrl).toContain(inviteToken)
    expect(expiresAt).toBeDefined()
    expect(userId).toBeDefined()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    expect(user?.username).toBe(newUsername)

    const inviteTokenHash = createHash('sha256')
      .update(inviteToken)
      .digest('hex')

    const invite = await prisma.inviteToken.findUnique({
      where: { token: inviteTokenHash },
    })

    expect(invite).not.toBeNull()
    expect(invite?.isUsed).toBe(false)
  })

  it('should activate user, hash password, and mark invite as used', async () => {
    const adminUsername = `admin-${randomUUID()}`
    const invitedUsername = `invited-${randomUUID()}`

    const admin = await prisma.user.create({
      data: {
        username: adminUsername,
        password: 'hashed-password',
        isAdmin: true,
      },
    })

    const adminToken = app.jwt.sign({ sub: admin.id })

    const registerResponse = await request(app.server)
      .post('/users/register')
      .set('Cookie', [`token=${adminToken}`])
      .send({
        username: invitedUsername,
      })
      .expect(201)

    const { inviteToken, userId } = registerResponse.body

    const inviteTokenHash = createHash('sha256')
      .update(inviteToken)
      .digest('hex')

    const storedInvite = await prisma.inviteToken.findUnique({
      where: { token: inviteTokenHash },
      select: { id: true },
    })

    expect(storedInvite).not.toBeNull()

    const acceptResponse = await request(app.server)
      .post('/users')
      .send({
        inviteToken,
        password: 'strong-password',
      })
      .expect(200)

    expect(acceptResponse.body.redirectTo).toBe('/')
    const setCookieHeader = acceptResponse.get('Set-Cookie')?.join(';') ?? ''
    expect(setCookieHeader).toContain('token=')

    const invite = await prisma.inviteToken.findFirst({
      where: { username: invitedUsername },
    })
    expect(invite?.isUsed).toBe(true)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    expect(user?.status).toBe('ACTIVE')
    expect(user?.password).toBeDefined()
    expect(await bcrypt.compare('strong-password', user?.password ?? '')).toBe(
      true
    )
  })
})

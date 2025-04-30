import request from 'supertest'
import { app } from '../server'
import path from 'node:path'

describe('Upload file', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to upload a file', async () => {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'tests',
      'files',
      'upload-test.txt'
    )

    const response = await request(app.server)
      .post('/upload')
      .attach('file', filePath)
      .expect(201)

    expect(response.body).toBeDefined()
  })
})

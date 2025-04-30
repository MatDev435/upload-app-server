import { app } from '../server'
import request from 'supertest'

describe('Fetch files', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to fetch files', async () => {
    const response = await request(app.server).get('/files').expect(200)
  })
})

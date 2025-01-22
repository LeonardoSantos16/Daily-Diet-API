import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('users route', () => {
  let cookies: string[]

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npx knex migrate:rollback --all')
    execSync('npx knex migrate:latest')
  })

  beforeAll(async () => {
    await app.ready()

    await request(app.server)
      .post('/user')
      .send({ name: 'leo', senha: 'leo123', email: 'test@gmail.com' })
      .expect(201)

    const response = await request(app.server)
      .post('/login')
      .send({ email: 'test@gmail.com', senha: 'leo123' })

    cookies = response.get('set-cookie')
  })

  it('should be able to create a new meal ', async () => {
    await request(app.server)
      .post('/meal')
      .send({ name: 'test', description: 'haha', diet: false })
      .set('Cookie', cookies)
      .expect(201)
  })

  it('get', async () => {
    await request(app.server).get('/meal').set('Cookie', cookies).expect(200)
  })
})

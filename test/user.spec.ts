import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('users route', () => {
  let cookies: string[]
  let mealId: string

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
    const response = await request(app.server)
      .post('/meal')
      .send({ name: 'test', description: 'haha', diet: false })
      .set('Cookie', cookies)
      .expect(201)

    expect(response.body.message).toBe('Meal created')
    expect(response.body.id).toBeDefined()

    mealId = response.body.id
  })

  it('should be able to list all meals', async () => {
    await request(app.server)
      .get('/meal')
      .set('Cookie', cookies)
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true)
      })
  })

  it('should be able to update a meal', async () => {
    await request(app.server)
      .put(`/meal/${mealId}`)
      .send({ name: 'memphis', email: 'revodad', senha: 'ada' })
      .set('Cookie', cookies)
      .expect(200)
      .then((response) => {
        expect(response.body.message).toBe('Meal updated')
      })
  })

  it('should be able to delete a meal', async () => {
    await request(app.server)
      .delete(`/meal/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)
      .then((response) => {
        expect(response.body.message).toBe('Meal deleted')
      })
  })
})

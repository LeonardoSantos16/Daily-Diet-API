import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

interface MealRequest {
  name: string
  description: string
  diet: boolean
}

export async function mealRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const meal = await knex('meal').select()
    return meal
  })

  app.post(
    '/',
    async (request: FastifyRequest<{ Body: MealRequest }>, response) => {
      const { name, description, diet } = request.body
      await knex('meal').insert({
        id: randomUUID(),
        name,
        description,
        diet,
      })
      response.code(201)
    },
  )
}

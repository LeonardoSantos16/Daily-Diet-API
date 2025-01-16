import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function mealRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const meal = await knex('meal').select()
    return meal
  })

  app.post('/', async (request) => {
    const { title, description, diet } = request.body
    const meal = await knex('meal').insert({
      title,
      description,
      diet,
    })
  })
}

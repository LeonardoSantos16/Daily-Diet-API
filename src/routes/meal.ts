import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID, UUID } from 'node:crypto'

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
    async (request: FastifyRequest<{ Body: MealRequest }>, reply) => {
      const { name, description, diet } = request.body
      await knex('meal').insert({
        id: randomUUID(),
        name,
        description,
        diet,
      })
      reply.code(201)
    },
  )

  app.put(
    '/:id',
    async (
      request: FastifyRequest<{ Body: MealRequest; Params: { id: UUID } }>,
    ) => {
      const { id } = request.params

      const { name, description, diet } = request.body
      await knex('meal').where('id', id).update({
        name,
        description,
        diet,
      })
    },
  )

  app.delete(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: UUID } }>) => {
      const { id } = request.params
      console.log(typeof id)
      await knex('meal').where('id', id).delete()
    },
  )

  app.get('/:id', async (request: FastifyRequest<{ Params: { id: UUID } }>) => {
    const { id } = request.params
    const [meal] = await knex('meal').where('id', id).select()
    return meal
  })
}

import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID, UUID } from 'node:crypto'

interface MealRequest {
  name: string
  description: string
  diet: boolean
}

export async function mealRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const userId = request.cookies.idUser
    console.log(userId)
    const meal = await knex('meal').where('user_id', userId).select()
    return meal
  })

  app.post(
    '/',
    async (request: FastifyRequest<{ Body: MealRequest }>, reply) => {
      const userId = request.cookies.idUser
      const { name, description, diet } = request.body
      await knex('meal').insert({
        id: randomUUID(),
        name,
        description,
        diet,
        user_id: userId,
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
      const userId = request.cookies.idUser
      const { name, description, diet } = request.body
      await knex('meal').where({ id, user_id: userId }).update({
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
      const userId = request.cookies.idUser
      console.log(typeof id)
      await knex('meal').where({ id, user_id: userId }).delete()
    },
  )

  app.get('/:id', async (request: FastifyRequest<{ Params: { id: UUID } }>) => {
    const { id } = request.params
    const userId = request.cookies.idUser
    const [meal] = await knex('meal').where({ id, user_id: userId }).select()
    return meal
  })
}

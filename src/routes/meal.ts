import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

interface MealRequest {
  name: string
  description: string
  diet: boolean
}

export async function mealRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const userId = request.cookies.idUser
    const meal = await knex('meal').where('user_id', userId).select()
    return meal
  })

  app.post(
    '/',
    async (request: FastifyRequest<{ Body: MealRequest }>, reply) => {
      const userId = request.cookies.idUser
      const { name, description, diet } = request.body
      const id = randomUUID()
      await knex('meal').insert({
        id,
        name,
        description,
        diet,
        user_id: userId,
      })
      reply.code(201).send({ message: 'Meal created', id })
    },
  )
  app.put(
    '/:id',
    async (
      request: FastifyRequest<{ Body: MealRequest; Params: { id: string } }>,
      reply,
    ) => {
      const { id } = request.params
      const userId = request.cookies.idUser
      const { name, description, diet } = request.body
      await knex('meal').where({ id, user_id: userId }).update({
        name,
        description,
        diet,
      })

      reply.code(200).send({ message: 'Meal updated' })
    },
  )

  app.delete(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params
      const userId = request.cookies.idUser
      await knex('meal').where({ id, user_id: userId }).delete()
      reply.code(200).send({ message: 'Meal deleted' })
    },
  )

  app.get(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id } = request.params
      const userId = request.cookies.idUser
      const [meal] = await knex('meal').where({ id, user_id: userId }).select()
      if (!meal) {
        return reply.code(404).send({ message: 'Meal not found' })
      }
      return meal
    },
  )
}

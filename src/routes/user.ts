import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

interface UserRequest {
  name: string
  email: string
  senha: string
  created_at: string
}

interface LoginRequest {
  email: string
  senha: string
}

export async function userRoutes(app: FastifyInstance) {
  app.post(
    '/user',
    async (request: FastifyRequest<{ Body: UserRequest }>, reply) => {
      const { name, email, senha } = request.body
      const idUser = randomUUID()

      await knex('user').insert({
        id: idUser,
        name,
        email,
        senha,
      })

      reply.code(201)
    },
  )
  app.post(
    '/login',
    async (request: FastifyRequest<{ Body: LoginRequest }>, reply) => {
      const { email, senha } = request.body
      const [idUser] = await knex('user').where({ email, senha }).select('id')
      console.log(idUser.id)
      reply.setCookie('idUser', idUser.id, {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60,
      })
      reply.code(200)
    },
  )
  app.get('/user', async (request, reply) => {
    try {
      let currentSequence = 0
      let maxSequence = 0
      const userId = request.cookies.idUser

      if (!userId) {
        return reply.code(400).send({ message: 'User not authenticated' })
      }

      const [metrics] = await knex('meal')
        .where('user_id', userId)
        .select(
          knex.raw('count(*) as totalMeals'),
          knex.raw('sum(diet = 1) as withinDiet'),
          knex.raw('sum(diet = 0) as offDiet'),
        )

      const mealsUser = await knex('meal')
        .where('user_id', userId)
        .orderBy('created_at')
        .select('created_at', 'diet')

      mealsUser.forEach((meal) => {
        if (meal.diet === 1) {
          currentSequence++
          if (currentSequence > maxSequence) {
            maxSequence = currentSequence
          }
        } else {
          currentSequence = 0
        }
      })

      const metricsUser = {
        quantityMeal: metrics.totalMeals,
        withinDiet: metrics.withinDiet,
        offDiet: metrics.offDiet,
        bestStreak: maxSequence,
      }

      return reply.code(200).send(metricsUser)
    } catch (error) {
      console.error(error)

      return reply.code(500).send({ message: 'Internal server error' })
    }
  })
}

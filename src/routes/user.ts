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
    let count = 0
    let valueMax = 0
    const userId = request.cookies.idUser

    if (!userId) {
      return reply.code(400).send({ message: 'User not authenticated' })
    }

    const [quantityMeal] = await knex('meal').where('user_id', userId).count()
    const [withinDiet] = await knex('meal')
      .where({ user_id: userId, diet: 1 })
      .count()
    const [offDiet] = await knex('meal')
      .where({ user_id: userId, diet: 0 })
      .count()

    const mealsUser = await knex('meal')
      .where('user_id', userId)
      .select('created_at', 'diet')

    mealsUser.forEach((meal) => {
      if (meal.diet === 1) {
        count++
        if (count > valueMax) {
          valueMax = count
        }
      } else {
        count = 0
      }
    })

    const metricsUser = {
      quantityMeal: quantityMeal['count(*)'],
      withinDiet: withinDiet['count(*)'],
      offDiet: offDiet['count(*)'],
      valueMax,
    }
    return metricsUser
  })
}

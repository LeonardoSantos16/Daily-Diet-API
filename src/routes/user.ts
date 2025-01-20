import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcrypt'

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

      const hashedPassword = await bcrypt.hash(senha, 10)

      await knex('user').insert({
        id: idUser,
        name,
        email,
        senha: hashedPassword,
      })

      reply.code(201).send({ message: 'User created successfully' })
    },
  )
  app.post(
    '/login',
    async (request: FastifyRequest<{ Body: LoginRequest }>, reply) => {
      const { email, senha } = request.body

      if (!email || !senha) {
        return reply
          .code(400)
          .send({ error: true, message: 'Email and password are required' })
      }

      const [user] = await knex('user').where('email', email)

      const isValidPassword = await bcrypt.compare(senha, user.senha)

      if (!isValidPassword) {
        return reply
          .code(400)
          .send({ error: true, message: 'Invalid email or password' })
      }

      reply.setCookie('idUser', user.id, {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60,
      })
      reply.code(200).send({ message: 'Login sucessful' })
    },
  )

  app.post('/logout', async (request, reply) => {
    reply.clearCookie('idUser')
  })

  app.get('/user', async (request, reply) => {
    try {
      let currentSequence = 0
      let maxSequence = 0
      const userId = request.cookies.idUser

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

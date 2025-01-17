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
}

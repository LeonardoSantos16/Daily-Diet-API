import { FastifyInstance, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

interface UserRequest {
  name: string
  email: string
  senha: string
  created_at: string
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
      reply.setCookie('idUser', idUser, {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 60 * 60,
      })

      reply.code(201)
    },
  )
}

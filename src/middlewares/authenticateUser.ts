import { FastifyRequest } from 'fastify'

export const authenticateUser = async (request: FastifyRequest, reply: any) => {
  if (request.routeOptions.url !== '/login') {
    const userId = request.cookies.idUser

    if (!userId) {
      return reply.code(400).send({ message: 'User not authenticated' })
    }
  }
}

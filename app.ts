import fastify from 'fastify'
import { mealRoutes } from './src/routes/meal'
import { userRoutes } from './src/routes/user'
import cookie from '@fastify/cookie'
import { authenticateUser } from './src/middlewares/authenticateUser'
export const app = fastify()

app.addHook('preHandler', authenticateUser)

app.register(cookie)

app.register(mealRoutes, {
  prefix: 'meal',
})

app.register(userRoutes, {
  preflix: 'user',
})

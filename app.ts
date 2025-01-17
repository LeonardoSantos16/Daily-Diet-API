import fastify from 'fastify'
import { mealRoutes } from './src/routes/meal'
import { userRoutes } from './src/routes/user'
import cookie from '@fastify/cookie'
export const app = fastify()

app.register(cookie)

app.register(mealRoutes, {
  prefix: 'meal',
})

app.register(userRoutes, {
  preflix: 'user',
})

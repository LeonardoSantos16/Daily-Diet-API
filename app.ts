import fastify from 'fastify'
import { mealRoutes } from './src/routes/meal'

export const app = fastify()

app.register(mealRoutes, {
  prefix: 'meal',
})

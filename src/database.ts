import { Knex, knex as setup } from 'knex'
import 'dotenv/config'
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.endsWith('.db')) {
  throw new Error('Not found')
}

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: process.env.DATABASE_URL,
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
  useNullAsDefault: true,

}

export const knex = setup(config)

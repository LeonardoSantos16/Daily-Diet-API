import { Knex, knex as setup } from 'knex'
import 'dotenv/config'
;(async () => {
  try {
    if (
      !process.env.DATABASE_URL ||
      !process.env.DATABASE_URL.endsWith('.db')
    ) {
      throw new Error('DATABASE_URL não encontrada ou não termina com ".db"')
    }
    console.log('URL do banco de dados está configurada corretamente!')
  } catch (error) {
    console.error('Erro:', error.message)
  }
})()

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: process.env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: 'migrations',
  },
}

export const knex = setup(config)

import {getPrisma} from './lib/prisma'

export const log = async (
  system: string,
  message: string,
  actor: string = 'system'
) => {
  const prisma = getPrisma()

  console.log(`[${system}] ${message}`)

  return prisma.logEntry.create({data: {system, message, actor}})
}

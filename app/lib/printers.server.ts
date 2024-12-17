import {SECOND_IN_MS, asyncForEach} from '@arcath/utils'

import {getPrisma} from './prisma'
import {getRedis} from './redis.server.mjs'
import {addJob} from './queues.server'

export type PrinterData = {
  name: string
  black: number
  cyan: number
  magenta: number
  yellow: number
  staffOnly: boolean
}

declare global {
  var __printersCache: {time: Date; data: PrinterData[]} | undefined
}

const Cache =
  global.__printersCache ??
  (global.__printersCache = {
    time: new Date(1970),
    data: []
  })

export const resetCache = () => {
  Cache.time = new Date(1970)
}

export const getSupplyLevels = async () => {
  const redis = getRedis()

  const lastUpdate = await redis.get('printer:last')

  const prisma = getPrisma()

  const printers = await prisma.printer.findMany({orderBy: {name: 'asc'}})

  if (
    lastUpdate === null ||
    parseInt(lastUpdate) < Date.now() - SECOND_IN_MS * 600
  ) {
    await asyncForEach(
      printers,
      async ({id, blackOID, cyanOID, yellowOID, magentaOID}) => {
        await addJob('updatePrintLevels', {
          printer: id,
          consumable: 'black',
          oid: blackOID
        })
        await addJob('updatePrintLevels', {
          printer: id,
          consumable: 'cyan',
          oid: cyanOID
        })
        await addJob('updatePrintLevels', {
          printer: id,
          consumable: 'yellow',
          oid: yellowOID
        })
        await addJob('updatePrintLevels', {
          printer: id,
          consumable: 'magenta',
          oid: magentaOID
        })
      }
    )
  }

  const data: PrinterData[] = []

  await asyncForEach(printers, async ({id, name, staffOnly}) => {
    const redisData = await redis.mget(
      `printer:${id}:black`,
      `printer:${id}:cyan`,
      `printer:${id}:yellow`,
      `printer:${id}:magenta`
    )

    data.push({
      name,
      staffOnly,
      black: parseInt(redisData[0]!),
      cyan: parseInt(redisData[1]!),
      yellow: parseInt(redisData[2]!),
      magenta: parseInt(redisData[3]!)
    })
  })

  return data
}

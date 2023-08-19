import {createSession} from 'net-snmp'
import {SECOND_IN_MS, asyncForEach, asyncMap, isDev} from '@arcath/utils'
import {isAfter, subMinutes} from 'date-fns'

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
  // eslint-disable-next-line
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
    lastUpdate !== null &&
    parseInt(lastUpdate) < Date.now() - SECOND_IN_MS * 600
  ) {
    asyncForEach(
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

  /*
  if (!isDev && isAfter(Cache.time, subMinutes(new Date(), 5))) {
    return Cache.data
  }

  const prisma = getPrisma()

  const printers = await prisma.printer.findMany({orderBy: {name: 'asc'}})

  const data = await asyncMap(
    printers,
    ({
      name,
      ip,
      snmpCommunity,
      staffOnly,
      blackOID,
      cyanOID,
      magentaOID,
      yellowOID
    }) => {
      return new Promise<PrinterData>(resolve => {
        const session = createSession(ip, snmpCommunity)

        session.get(
          [blackOID, cyanOID, magentaOID, yellowOID],
          (err, varBinds) => {
            if (err) {
              resolve({
                name,
                staffOnly,
                black: 0,
                cyan: 0,
                magenta: 0,
                yellow: 0
              })

              return
            }

            resolve({
              name,
              staffOnly,
              black: varBinds[0].value,
              cyan: varBinds[1].value,
              magenta: varBinds[2].value,
              yellow: varBinds[3].value
            })
          }
        )
      })
    }
  )

  Cache.data = data
  Cache.time = new Date()

  return data
  */
}

import {createSession} from 'net-snmp'
import {asyncMap, isDev} from '@arcath/utils'
import {isAfter, subMinutes} from 'date-fns'

import {getPrisma} from './prisma'

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
}

import {Worker, Queue} from 'bullmq'
import {subHours} from 'date-fns'
import {PrismaClient} from '@prisma/client'
import {createSession} from 'net-snmp'
import cron from 'node-cron'

import {getRedis} from '../app/lib/redis.server.mjs'

const prisma = new PrismaClient()
const connection = getRedis()

const handlers = {}

const queue = new Queue('main', {connection})

cron.schedule('0 0 0 * * *', async () => {
  // Clear old incidents at midnight
  await queue.add('clearIncidents', {})
})

/**
 * Creates a typed handle using the types from the queues file in the remix app.
 *
 * @template {import('../app/lib/queues.server').JobName} JobName
 * @param {JobName} job
 * @param {import('bullmq').Processor<import('../app/lib/queues.server').Jobs[JobName]>} processor
 * @returns
 */
const createHandler = (job, processor) => {
  handlers[job] = processor
}

const worker = new Worker(
  'main',
  async ({name, data}) => {
    if (handlers[name]) {
      handlers[name]({data})
    } else {
      await log(
        'Background Jobs',
        `Recevied job ${name} with no handler`,
        'Background Worker'
      )
    }
  },
  {connection}
)

/**
 * Log a message to the database
 *
 * @param {string} system
 * @param {string} message
 * @param {string} actor
 * @returns
 */
const log = async (system, message, actor = 'system') => {
  console.log(`[${system}] ${message}`)

  return prisma.logEntry.create({data: {system, message, actor}})
}

//
//
// clearIncidents
//
//
createHandler('clearIncidents', async () => {
  const {count} = await prisma.incident.deleteMany({
    where: {open: false, updatedAt: {lte: subHours(new Date(), 24)}}
  })

  if (count > 0) {
    await log(
      'Incidents',
      `Cleared old incidents (${count})`,
      'Background Worker'
    )
  }
})

//
//
// updatePrintLevels
//
//
createHandler('updatePrintLevels', async ({data}) => {
  const printer = await prisma.printer.findFirstOrThrow({
    where: {id: data.printer}
  })

  const session = createSession(printer.ip, printer.snmpCommunity)

  session.get([data.oid], (err, varBinds) => {
    const redis = getRedis()

    const value = err ? 0 : varBinds[0]

    redis.set(`printer:${data.printer}:${data.consumable}`, value, () => {
      log(
        'Printers',
        `Updated ${data.consumable} for printer #${data.printer}`,
        'Background Worker'
      )

      redis.set(`printer:last`, Date.now())
    })
  })
})

//
//
// createBackup
//
//
/*const {unlink, readdir, rename, rm} = fs.promises

const BACKUPS_DIR = path.join(process.cwd(), 'public', 'backups')
const ASSETS_PATH = path.join(process.cwd(), 'public', 'assets')
const ADVERTS_PATH = path.join(process.cwd(), 'public', 'adverts')
const ICONS_PATH = path.join(process.cwd(), 'public', 'icons')

createHandler('createBackup', async () => {})*/

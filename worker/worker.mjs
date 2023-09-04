import {Worker, Queue} from 'bullmq'
import {subHours, format, subDays} from 'date-fns'
import {PrismaClient} from '@prisma/client'
import {createSession} from 'net-snmp'
import cron from 'node-cron'
import fs from 'fs'
import path from 'path'
import {mkdirp} from 'mkdirp'
import AdmZip from 'adm-zip'
import {exec} from 'node:child_process'
import {asyncForEach} from '@arcath/utils/lib/functions/async-for-each.js'

import {getRedis} from '../app/lib/redis.server.mjs'

const prisma = new PrismaClient()
const connection = getRedis()

const handlers = {}

const queue = new Queue('main', {connection})

cron.schedule('0 0 0 * * *', async () => {
  // Clear old incidents at midnight
  await queue.add('clearIncidents', {})
  await queue.add('clearMessages', {})
})

cron.schedule('0 0 0 * * 7', async () => {
  // Run backups every sunday
  await queue.add('createBackup', {})
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
// clearMessages
//
//
createHandler('clearMessages', async () => {
  const {count} = await prisma.infoMessage.deleteMany({
    where: {endDate: {lte: subDays(new Date(), 30)}}
  })

  if (count > 0) {
    await log(
      'Messages',
      `Cleared old messages (${count})`,
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

    const value = err ? 0 : varBinds[0].value

    redis.set(`printer:${data.printer}:${data.consumable}`, value, () => {
      redis.set(`printer:last`, Date.now())
    })
  })
})

//
//
// createBackup
//
//
const {unlink, readdir, rename, rm} = fs.promises

const BACKUPS_DIR = path.join(process.cwd(), 'public', 'backups')
const ASSETS_PATH = path.join(process.cwd(), 'public', 'assets')
const ADVERTS_PATH = path.join(process.cwd(), 'public', 'adverts')
const ICONS_PATH = path.join(process.cwd(), 'public', 'icons')

createHandler('createBackup', async () => {
  await mkdirp(BACKUPS_DIR)

  const matches = RegExp(
    /^postgresql:\/\/(?<username>.*?):(?<password>.*?)@(?<host>.*?):(?<port>[0-9]*?)\/(?<db>[a-z-_]*)/g
  ).exec(process.env.DATABASE_URL)

  const {username, password, host, port, db} = matches.groups

  await new Promise((resolve, reject) => {
    exec(
      `pg_dump -Fc -U ${username} -d ${db} -h ${host} -p ${port} > "${BACKUPS_DIR}/db.dump"`,
      {env: {PGPASSWORD: password, NODE_ENV: process.env.NODE_ENV}},
      (error, stdout) => {
        console.dir([error, stdout])
        resolve(true)
      }
    )
  })

  const zip = new AdmZip()

  zip.addLocalFile(path.join(BACKUPS_DIR, 'db.dump'))
  await asyncForEach(
    [
      {filePath: ASSETS_PATH, zipPath: 'assets'},
      {filePath: ADVERTS_PATH, zipPath: 'adverts'},
      {filePath: ICONS_PATH, zipPath: 'icons'}
    ],
    ({filePath, zipPath}) => {
      console.dir([filePath, zipPath])
      return new Promise((resolve, reject) => {
        zip.addLocalFolderAsync(
          filePath,
          (s, e) => {
            resolve()
          },
          zipPath
        )
      })
    }
  )

  const fileDate = format(new Date(), 'yyyy-MM-dd-HH-mm')

  await zip.writeZipPromise(path.join(BACKUPS_DIR, `backup-${fileDate}.zip`))
  await unlink(path.join(BACKUPS_DIR, 'db.dump'))
})

createHandler('restoreBackup', async ({data}) => {
  const {filePath} = data

  await mkdirp(BACKUPS_DIR)

  const zip = new AdmZip(filePath)

  zip.extractAllTo(path.join(BACKUPS_DIR, 'restore'))

  await asyncForEach(
    [
      {
        targetPath: ASSETS_PATH,
        sourcePath: path.join(BACKUPS_DIR, 'restore', 'assets')
      },
      {
        targetPath: ADVERTS_PATH,
        sourcePath: path.join(BACKUPS_DIR, 'restore', 'adverts')
      },
      {
        targetPath: ICONS_PATH,
        sourcePath: path.join(BACKUPS_DIR, 'restore', 'icons')
      }
    ],
    async ({targetPath, sourcePath}) => {
      const targetFiles = await readdir(targetPath)

      await asyncForEach(targetFiles, fileName =>
        unlink(path.join(targetPath, fileName))
      )

      const sourceFiles = await readdir(sourcePath)

      await asyncForEach(sourceFiles, fileName =>
        rename(path.join(sourcePath, fileName), path.join(targetPath, fileName))
      )
    }
  )

  const matches = RegExp(
    /^postgresql:\/\/(?<username>.*?):(?<password>.*?)@(?<host>.*?):(?<port>[0-9]*?)\/(?<db>.*?)$/g
  ).exec(process.env.DATABASE_URL)

  const {username, password, host, port, db} = matches.groups

  await new Promise((resolve, reject) => {
    exec(
      `pg_restore -C -U ${username} -d ${db} -h ${host} -p ${port} < "${path.join(
        BACKUPS_DIR,
        'restore',
        'db.dump'
      )}"`,
      {env: {PGPASSWORD: password, NODE_ENV: process.env.NODE_ENV}},
      (error, stdout) => {
        console.dir([error, stdout])
        resolve(true)
      }
    )
  })

  await rm(path.join(BACKUPS_DIR, 'restore'), {recursive: true, force: true})

  return
})

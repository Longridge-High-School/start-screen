import {exec} from 'node:child_process'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'
import {asyncForEach} from '@arcath/utils'
import {mkdirp} from 'mkdirp'

const {unlink, readdir, rename, rm} = fs.promises

const BACKUPS_DIR = path.join(process.cwd(), 'public', 'backups')
const ASSETS_PATH = path.join(process.cwd(), 'public', 'assets')
const ADVERTS_PATH = path.join(process.cwd(), 'public', 'adverts')
const ICONS_PATH = path.join(process.cwd(), 'public', 'icons')

export const backup = async () => {
  await mkdirp(BACKUPS_DIR)

  const matches = RegExp(
    /^postgresql:\/\/(?<username>.*?):(?<password>.*?)@(?<host>.*?):(?<port>[0-9]*?)\/(?<db>[a-z-_]*)/g
  ).exec(process.env.DATABASE_URL!)

  const {username, password, host, port, db} = matches!.groups!

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

  await zip.writeZipPromise(path.join(BACKUPS_DIR, 'backup.zip'))
  await unlink(path.join(BACKUPS_DIR, 'db.dump'))
}

export const restore = async (filePath: string) => {
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
  ).exec(process.env.DATABASE_URL!)

  const {username, password, host, port, db} = matches!.groups!

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
}

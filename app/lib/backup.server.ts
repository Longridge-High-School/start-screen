import {exec} from 'node:child_process'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'

const {unlink} = fs.promises

const BACKUPS_DIR = path.join(process.cwd(), 'public', 'backups')
const ASSETS_PATH = path.join(process.cwd(), 'public', 'assets')
const ADVERTS_PATH = path.join(process.cwd(), 'public', 'adverts')
const ICONS_PATH = path.join(process.cwd(), 'public', 'icons')

export const backup = async () => {
  const matches = RegExp(
    /^postgresql:\/\/(?<username>.*?):(?<password>.*?)@(?<host>.*?):(?<port>[0-9]*?)\/(?<db>.*?)$/g
  ).exec(process.env.DATABASE_URL!)

  const {username, password, host, port, db} = matches!.groups!

  await new Promise((resolve, reject) => {
    exec(
      `"C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe" -U ${username} -d ${db} -h ${host} -p ${port} > "${BACKUPS_DIR}/db.sql"`,
      {env: {PGPASSWORD: password, NODE_ENV: process.env.NODE_ENV}},
      (error, stdout) => {
        console.dir([error, stdout])
        resolve(true)
      }
    )
  })

  const zip = new AdmZip()

  zip.addLocalFile(path.join(BACKUPS_DIR, 'db.sql'))
  await zip.addLocalFolderPromise(ASSETS_PATH, {zipPath: 'assets'})
  await zip.addLocalFolderPromise(ADVERTS_PATH, {zipPath: 'adverts'})
  await zip.addLocalFolderPromise(ICONS_PATH, {zipPath: 'icons'})

  await zip.writeZipPromise(path.join(BACKUPS_DIR, 'backup.zip'))
  await unlink(path.join(BACKUPS_DIR, 'db.sql'))
}

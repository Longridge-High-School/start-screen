import {XMLParser} from 'fast-xml-parser'
import fs from 'fs'
import path from 'path'
import {asyncForEach} from '@arcath/utils'

import {PrismaClient} from '@prisma/client'

const {readFile} = fs.promises

const DATA_DIR = path.join(process.cwd(), 'data')

const prisma = new PrismaClient()

const run = async () => {
  const STAFF_FILE_PATH = path.join(DATA_DIR, 'staff.xml')

  const STAFF_FILE = await readFile(STAFF_FILE_PATH)

  const xmlParser = new XMLParser()

  const xmlStaff = xmlParser.parse(STAFF_FILE)

  asyncForEach<{Title: string; Surname: string; StaffCode: string}>(
    xmlStaff.SuperStarReport.Record,
    async staff => {
      const user = await prisma.user.findFirst({
        where: {username: staff.StaffCode.toLowerCase()}
      })

      if (user) {
        user.username = staff.StaffCode.toLowerCase()
        user.name = `${staff.Title ? staff.Title : ''} ${staff.Surname}`
        user.type = 'STAFF'

        await prisma.user.update({where: {id: user.id}, data: user})

        return
      }

      const newUser = {
        username: staff.StaffCode.toLowerCase(),
        name: `${staff.Title ? staff.Title : ''} ${staff.Surname}`,
        type: 'STAFF' as const
      }

      await prisma.user.create({data: newUser})
    }
  )
}

run()

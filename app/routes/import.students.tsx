import type {ActionFunction} from '@remix-run/node'

import {json} from '@remix-run/node'
import {XMLParser} from 'fast-xml-parser'
import {asyncForEach} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma'
import {getConfigValue} from '~/lib/config.server'
import {log} from '~/log.server'

export const action: ActionFunction = async ({request}) => {
  const token = request.headers.get('Import-Token')
  const importKey = await getConfigValue('importKey')

  await log('Imports', 'Starting student import')

  if (!token || token !== importKey) {
    await log('Imports', 'Invalid token on student import')
    return json({error: 'invalid Token'}, 403)
  }

  if (!request.body) {
    return json({error: 'No XML provided'}, 406)
  }

  const reader = request.body.getReader()

  if (!reader) {
    return json({error: 'Could not get reader'}, 500)
  }

  let read = await reader.read()
  let xml = ''

  while (!read.done) {
    xml += read.value.toString()
    read = await reader.read()
  }

  const xmlParser = new XMLParser()

  const xmlStudents = xmlParser.parse(xml)

  const prisma = getPrisma()

  await asyncForEach<{
    UPN: string
    Forename: string
    Surname: string
    Primary_x0020_Email: string
    Year: string
    Reg: string
  }>(xmlStudents.SuperStarReport.Record, async student => {
    const [username] = student.Primary_x0020_Email.split('@').map(s =>
      s.toLowerCase()
    )

    const user = await prisma.user.findFirst({where: {username}})

    if (user) {
      user.username = username
      user.name = `${student.Forename} ${student.Surname}`
      user.upn = student.UPN
      user.type = 'STUDENT'
      user.yearGroup = student.Year.toLowerCase().replace('  ', ' ')
      user.formGroup = student.Reg.toLowerCase()

      await prisma.user.update({where: {id: user.id}, data: user})

      return
    }

    const newUser = {
      username: username,
      name: `${student.Forename} ${student.Surname}`,
      upn: student.UPN,
      type: 'STUDENT' as const,
      yearGroup: student.Year.toLowerCase().replace('  ', ' '),
      formGroup: student.Reg.toLowerCase()
    }

    await prisma.user.create({data: newUser})
    await log('Imports', `Added new student ${newUser.username}`)
  })

  return json({message: 'Success'}, 200)
}

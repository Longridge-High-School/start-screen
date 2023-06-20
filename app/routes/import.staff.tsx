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

  await log('Imports', 'Starting staff import')

  if (!token || token !== importKey) {
    await log('Imports', 'Invalid token on staff import')
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

  const xmlStaff = xmlParser.parse(xml)

  const prisma = getPrisma()

  asyncForEach<{
    Title: string
    Preferred_x0020_Surname: string
    Staff_x0020_Code: string
  }>(xmlStaff.SuperStarReport.Record, async staff => {
    const user = await prisma.user.findFirst({
      where: {username: staff.Staff_x0020_Code.toLowerCase()}
    })

    if (user) {
      user.username = staff.Staff_x0020_Code.toLowerCase()
      user.name = `${staff.Title ? staff.Title : ''} ${
        staff.Preferred_x0020_Surname
      }`
      user.type = 'STAFF'

      await prisma.user.update({where: {id: user.id}, data: user})

      return
    }

    const newUser = {
      username: staff.Staff_x0020_Code.toLowerCase(),
      name: `${staff.Title ? staff.Title : ''} ${
        staff.Preferred_x0020_Surname
      }`,
      type: 'STAFF' as const
    }

    await prisma.user.create({data: newUser})
    await log(
      'Imports',
      `Added new staff member ${staff.Staff_x0020_Code.toLowerCase()}`
    )
  })

  return json({message: 'Success'}, 200)
}

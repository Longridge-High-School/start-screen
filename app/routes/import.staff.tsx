import {json, type ActionFunction} from '@remix-run/node'

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
  let jsonData = ''

  while (!read.done) {
    jsonData += read.value.toString()
    read = await reader.read()
  }

  const staffMembers = JSON.parse(jsonData) as {
    name: string
    username: string
  }[]

  const prisma = getPrisma()

  await asyncForEach(staffMembers, async ({name, username}) => {
    const user = await prisma.user.findFirst({
      where: {username}
    })

    if (user) {
      user.username = username
      user.name = name
      user.type = 'STAFF'

      await prisma.user.update({where: {id: user.id}, data: user})

      return
    }

    const newUser = {
      username,
      name,
      type: 'STAFF' as const
    }

    await prisma.user.create({data: newUser})
    await log('Imports', `Added new staff member ${username}`)
  })

  return json({message: 'Success'}, 200)
}

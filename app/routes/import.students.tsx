import type {ActionFunction} from '@remix-run/node'

import {json} from '@remix-run/node'

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
  let jsonData = ''

  while (!read.done) {
    jsonData += read.value.toString()
    read = await reader.read()
  }

  const students = JSON.parse(jsonData) as {
    name: string
    username: string
    upn: string | null
    yearGroup: string
    regGroup: string
  }[]

  const prisma = getPrisma()

  const promises = students.map(
    ({username, upn, yearGroup, regGroup, name}) => {
      return new Promise(async () => {
        const user = await prisma.user.findFirst({where: {username}})

        if (user) {
          user.username = username
          user.name = name
          user.upn = upn ? upn : user.upn
          user.type = 'STUDENT'
          user.yearGroup = yearGroup
          user.formGroup = regGroup

          await prisma.user.update({where: {id: user.id}, data: user})

          return
        }

        const newUser = {
          username,
          name,
          upn: upn ? upn : '',
          type: 'STUDENT' as const,
          yearGroup,
          formGroup: regGroup
        }

        await prisma.user.create({data: newUser})
        await log('Imports', `Added new student ${newUser.username}`)
      }).catch(async reason => {
        await log('Imports', `Could not import ${username}`)
      })
    }
  )

  await Promise.all(promises)

  const usernames = students.reduce((names, {username}) => {
    return [...names, username]
  }, [] as string[])

  const deletable = await prisma.user.count({
    where: {type: 'STUDENT', manual: false, username: {notIn: usernames}}
  })

  await prisma.user.deleteMany({
    where: {type: 'STUDENT', manual: false, username: {notIn: usernames}}
  })

  await log('Imports', `Deleted ${deletable} users`)

  return json({message: 'Success'}, 200)
}

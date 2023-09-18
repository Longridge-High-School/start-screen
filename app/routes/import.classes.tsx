import {type ActionFunctionArgs, json} from '@remix-run/node'
import {asyncForEach, indexedBy, keys} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma'
import {getConfigValue} from '~/lib/config.server'
import {log} from '~/log.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const token = request.headers.get('Import-Token')
  const importKey = await getConfigValue('importKey')

  await log('Imports', 'Starting class import')

  if (!token || token !== importKey) {
    await log('Imports', 'Invalid token on timetable import')
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

  const prisma = getPrisma()

  const classes = JSON.parse(jsonData) as {
    [className: string]: {
      name: string
      teacherUsername: string
      students: string[]
    }
  }

  const dbTeachers = await prisma.user.findMany({
    where: {type: 'STAFF'},
    select: {id: true, username: true}
  })
  const teachersByUsername = indexedBy('username', dbTeachers)

  const dbStudents = await prisma.user.findMany({
    where: {type: 'STUDENT'},
    select: {id: true, upn: true}
  })
  const studentsByUPN = indexedBy('upn', dbStudents)

  await asyncForEach(keys(classes), async key => {
    const {name, students, teacherUsername} = classes[key]

    if (!teachersByUsername[teacherUsername]) {
      await log(
        'Imports',
        `Could not find account for teacher ${teacherUsername}`
      )

      return
    }

    const teacherId = teachersByUsername[teacherUsername].id

    const dbClass = await prisma.class.upsert({
      where: {name},
      create: {name, teacherId},
      update: {teacherId}
    })

    await asyncForEach(students, async upn => {
      if (upn === null) {
        return
      }

      if (!studentsByUPN[upn]) {
        await log('Imports', `Could not find account for student ${upn}`)

        return
      }

      const studentId = studentsByUPN[upn].id

      const count = await prisma.classMembership.count({
        where: {memberId: studentId, classId: dbClass.id}
      })

      if (count === 0) {
        await prisma.classMembership.create({
          data: {memberId: studentId, classId: dbClass.id}
        })
      }
    })
  })

  return json({})
}

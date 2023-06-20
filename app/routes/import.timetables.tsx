import type {ActionFunction} from '@remix-run/node'

import {json} from '@remix-run/node'
import {XMLParser} from 'fast-xml-parser'
import {asyncForEach, diffArray, indexedBy} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma'
import {getConfigValue} from '~/lib/config.server'
import {log} from '~/log.server'

type TimetableEntry = {
  multiple_id: string
  Period: string
  Start_x0020_Time: string
  End_x0020_Time: string
  TimeTableModel: string
  Class: string
  Staff_x0020_Code: string
  UPN: string
  Room: string
}

export const action: ActionFunction = async ({request}) => {
  const token = request.headers.get('Import-Token')
  const importKey = await getConfigValue('importKey')

  await log('Imports', 'Starting timetable import')

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
  let xml = ''

  while (!read.done) {
    xml += read.value.toString()
    read = await reader.read()
  }

  const xmlParser = new XMLParser()

  const xmlLessons = xmlParser.parse(xml)

  const prisma = getPrisma()

  const messages: string[] = []

  const classes: {
    [name: string]: {
      name: string
      teacher: string
      students: string[]
      periods: {
        [name: string]: {
          name: string
          startTime: string
          endTime: string
          room: string
        }
      }
    }
  } = {}

  xmlLessons.SuperStarReport.Record.forEach((record: TimetableEntry) => {
    if (!record.Staff_x0020_Code || !record.Room) {
      return
    }

    if (!classes[record.Class]) {
      classes[record.Class] = {
        name: record.Class,
        teacher: record.Staff_x0020_Code.toLowerCase(),
        periods: {},
        students: []
      }
    }

    classes[record.Class].students.push(record.UPN)
    if (!classes[record.Class].periods[record.Period]) {
      classes[record.Class].periods[record.Period] = {
        name: record.Period,
        startTime: record.Start_x0020_Time,
        endTime: record.End_x0020_Time,
        room: record.Room.toString()
      }
    }
  })

  const teachers = await prisma.user.findMany({
    select: {id: true, username: true},
    where: {type: 'STAFF'}
  })

  const teachersByCode = indexedBy('username', teachers)

  const students = await prisma.user.findMany({
    select: {id: true, upn: true},
    where: {type: 'STUDENT'}
  })

  const studentsByUPN = indexedBy('upn', students)

  const knownGroups = (await prisma.class.findMany({select: {name: true}})).map(
    ({name}) => name
  )

  const {missing: toDelete} = diffArray(knownGroups, Object.keys(classes))

  await prisma.class.deleteMany({where: {name: {in: toDelete}}})
  await prisma.studentSession.deleteMany({where: {}})

  await asyncForEach(Object.values(classes), async lesson => {
    if (!teachersByCode[lesson.teacher]) {
      messages.push(`Class ${lesson.name} requires teacher ${lesson.teacher}`)

      return
    }

    const prismaClass = await prisma.class.upsert({
      where: {name: lesson.name},
      update: {teacherId: teachersByCode[lesson.teacher].id},
      create: {
        name: lesson.name,
        teacherId: teachersByCode[lesson.teacher].id
      },
      include: {sessions: true}
    })

    const {
      missing: toDelete,
      additional: toAdd,
      common
    } = diffArray(
      prismaClass.sessions.map(({name}) => name),
      Object.keys(lesson.periods)
    )

    await prisma.session.deleteMany({
      where: {name: {in: toDelete}, classId: prismaClass.id}
    })

    await prisma.session.createMany({
      data: toAdd.map(period => {
        const {name, startTime, endTime, room} = lesson.periods[period]

        return {name, classId: prismaClass.id, startTime, endTime, room}
      })
    })

    await asyncForEach(common, async period => {
      const {name, startTime, endTime, room} = lesson.periods[period]

      const {id} = await prisma.session.findFirstOrThrow({
        where: {name, classId: prismaClass.id}
      })

      await prisma.session.update({
        where: {id},
        data: {startTime, endTime, room}
      })
    })

    const sessions = await prisma.session.findMany({
      select: {id: true},
      where: {classId: prismaClass.id}
    })

    await asyncForEach(sessions, async ({id: sessionId}) => {
      const data = lesson.students.reduce((data, upn) => {
        if (!upn || !studentsByUPN[upn]) {
          return data
        }

        data.push({sessionId, studentId: studentsByUPN[upn].id})

        return data
      }, [] as {sessionId: number; studentId: number}[])

      await prisma.studentSession.createMany({
        data
      })
    })
  })

  return json({message: 'Success', messages}, 200)
}

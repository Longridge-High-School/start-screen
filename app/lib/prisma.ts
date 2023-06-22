import {PrismaClient, type User} from '@prisma/client'
import {diffArray} from '@arcath/utils'

import {getConfigValue} from './config.server'

declare global {
  // This prevents us from making multiple connections to the db when the
  // require cache is cleared.
  // eslint-disable-next-line
  var __prisma: PrismaClient | undefined
}

const prisma = global.__prisma ?? (global.__prisma = new PrismaClient())

export const getPrisma = () => prisma

export const getUser = async (username: string) => {
  const prisma = getPrisma()

  const user = await prisma.user.findFirst({where: {username}})

  if (user) {
    return user
  }

  return undefined
}

export const getShortcutsForUser = async (
  user: User,
  request: Request,
  maximumPriority: number = 10,
  prioritySort: boolean = true
) => {
  const scopes = ['all']

  const ip = request.headers.get('x-forwarded-for')

  const localIp = await getConfigValue('localIp')

  if (ip) {
    if (ip === localIp) {
      scopes.push('local')
      scopes.push(`local-${user.type.toLowerCase()}`)
    } else {
      scopes.push('remote')
      scopes.push(`remote-${user.type.toLowerCase()}`)
    }
  }

  if (user) {
    scopes.push(user.username)

    switch (user.type) {
      case 'STAFF':
        const classIds = await prisma.class.findMany({
          select: {id: true, name: true},
          where: {teacherId: user.id}
        })

        scopes.push('staff')

        classIds.forEach(({name}) => {
          if (!scopes.includes(name.toLowerCase())) {
            scopes.push(name.toLowerCase())
          }
        })
        break
      case 'STUDENT':
        const studentClassIds = (
          await prisma.classMembership.findMany({
            select: {classId: true},
            where: {memberId: user.id}
          })
        ).map(({classId}) => classId)

        scopes.push('student')
        scopes.push(user.yearGroup)
        scopes.push(user.formGroup)

        const allClasses = await prisma.class.findMany({
          select: {id: true, name: true},
          where: {id: {in: studentClassIds}}
        })

        allClasses.forEach(({name}) => {
          if (!scopes.includes(name.toLowerCase())) {
            scopes.push(name.toLowerCase())
          }
        })
      default:
        break
    }
  }

  const shortcutIdsAndScopes = await prisma.shortcut.findMany({
    select: {id: true, scopes: true}
  })

  const shortcutIds = shortcutIdsAndScopes.reduce<number[]>(
    (ids, {id, scopes: shortcutScopes}) => {
      const {common} = diffArray(scopes, shortcutScopes)

      if (common.length > 0) {
        ids.push(id)
      } else {
        // If we already have a match no point wating time checking for patterns

        shortcutScopes.forEach(scope => {
          if (scope[0] === '/') {
            scopes.forEach(s => {
              if (s === user?.username) {
                return
              }

              const regex = new RegExp(scope.slice(1, -1))

              const matches = regex.exec(s)

              if (matches && !ids.includes(id)) {
                ids.push(id)
              }
            })
          }
        })
      }

      return ids
    },
    []
  )

  let orderBy: {[key: string]: 'asc' | 'desc'}[] = []

  if (prioritySort) {
    orderBy.push({priority: 'asc'})
  }
  orderBy.push({title: 'asc'})

  const allShortcuts = await prisma.shortcut.findMany({
    where: {id: {in: shortcutIds}},
    orderBy
  })

  const shortcuts = allShortcuts.filter(({priority}) => {
    return priority <= maximumPriority
  })

  return {
    shortcuts,
    hasOverflow: shortcuts.length !== allShortcuts.length,
    scopes
  }
}

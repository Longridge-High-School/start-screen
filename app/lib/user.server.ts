import {isDev} from '@arcath/utils'
import {type User} from '@prisma/client'

import {getPrisma} from './prisma'

export const getUPNFromHeaders = (request: Request) => {
  const upn = request.headers.get('azure-upn')

  if (isDev) {
    const url = new URL(request.url)
    const impersonate = url.searchParams.get('impersonate')

    if (impersonate !== null) {
      return `${impersonate}@impersonate.tld`
    }
  }

  if (upn === null) {
    throw new Response('No Azure UPN Provided (Are you using AAP)', {
      status: 401
    })
  }

  return upn.toLowerCase()
}

export const getUserFromUPN = async (upn: string) => {
  const [username] = upn.split('@')

  const prisma = getPrisma()

  const user = await prisma.user.findFirst({where: {username}})
  const userCount = await prisma.user.count()

  if (userCount === 0) {
    const defaultUser: User = {
      id: 0,
      name: 'Create First User',
      admin: true,
      username,
      type: 'STAFF',
      upn: '',
      yearGroup: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      formGroup: '',
      manual: true,
      aupAccepted: true
    }

    return defaultUser
  }

  if (user === null) {
    throw new Response(`Could not find user ${upn}`, {
      status: 401
    })
  }

  return user
}

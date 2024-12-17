import {type LoaderFunction, redirect} from '@remix-run/node'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'

export const loader: LoaderFunction = async ({request, params}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  await prisma.shortcut.deleteMany({
    where: {id: parseInt(params.id!), ownerId: user.id}
  })
  await log('Shortcuts', `Deleted shortcut ${params.id}`, user.username)

  return redirect('/shortcuts/manage')
}

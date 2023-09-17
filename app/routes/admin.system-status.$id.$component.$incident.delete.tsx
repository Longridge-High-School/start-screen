import {
  type LoaderFunctionArgs,
  type HeadersArgs,
  redirect
} from '@remix-run/node'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'
import {createTimings} from '~/utils/timings.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )
  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  await time('deleteIncident', 'Delete Incident', () =>
    prisma.incident.delete({where: {id: parseInt(params.incident!)}})
  )
  await log(
    'System Status',
    `Deleted Incident #${params.incident}`,
    user.username
  )

  return redirect(`/admin/system-status/${params.id}/${params.component}`, {
    headers: {'Server-Timing': getHeader()}
  })
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

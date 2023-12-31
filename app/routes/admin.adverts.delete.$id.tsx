import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  await prisma.advert.delete({where: {id: parseInt(params.id!)}})
  await log('Adverts', `Deleted Ad #${params.id}`, user.username)

  return redirect('/admin/adverts')
}

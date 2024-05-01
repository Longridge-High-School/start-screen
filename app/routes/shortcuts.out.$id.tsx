import {type LoaderFunction, redirect} from '@remix-run/node'

import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'

import {getPrisma} from '~/lib/prisma'

export const loader: LoaderFunction = async ({request, params}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  const prisma = getPrisma()

  const shortcut = await prisma.shortcut.findFirstOrThrow({
    where: {id: parseInt(params.id!)}
  })

  await prisma.click.create({data: {userId: user.id, shortcutId: shortcut.id}})

  return redirect(shortcut.target)
}

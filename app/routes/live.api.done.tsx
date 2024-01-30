import {type ActionFunctionArgs, json} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'

export const action = async ({request}: ActionFunctionArgs) => {
  console.log('API Request')

  const prisma = getPrisma()

  const formData = await request.formData()

  const streamKey = formData.get('name') as string | undefined

  invariant(streamKey)

  await log('Streams', `Checking Stream Key ${streamKey}`)

  const stream = await prisma.liveStream.findFirst({
    where: {key: streamKey}
  })

  if (stream === null) {
    await log('Stream', 'Invalid stream key')
    return json({error: 'stream key not found'}, {status: 403})
  }

  await prisma.liveStream.update({where: {id: stream.id}, data: {live: false}})

  return json({})
}

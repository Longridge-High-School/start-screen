import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {formatDistance} from 'date-fns'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getConfigValue} from '~/lib/config.server'
import {getPrisma} from '~/lib/prisma'
import {buttonClasses} from '~/lib/classes'
import {getMDXComponent} from '~/lib/mdx'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const streamUrl = await getConfigValue('streamURL')

  const prisma = getPrisma()

  const streams = await prisma.liveStream.findMany({
    where: {
      live: true
    }
  })

  return json(
    {streamUrl, streams, user},
    {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}

const Live = () => {
  const {streams} = useLoaderData<typeof loader>()

  return (
    <div className="mx-96 bg-white rounded-xl p-2 shadow-xl mt-12 grid grid-cols-2 gap-4">
      <h3 className="text-xl col-span-3">Live Streams</h3>
      {streams.length === 0 ? (
        <div className="col-span-3 text-center">
          <i>There are no streams currently running.</i>
        </div>
      ) : (
        ''
      )}
      {streams.map(stream => {
        const Description = getMDXComponent(stream.descriptionCache)

        return (
          <div key={stream.id} className="text-center my-2">
            <h4 className="text-lg mb-2">{stream.title}</h4>
            <div className="mb-4">
              <Description />
            </div>
            <a className={buttonClasses()} href={`/live/${stream.id}`}>
              Join Stream
            </a>
            <br />
            <i className="mt-2">
              Started {formatDistance(new Date(stream.updatedAt), new Date())}{' '}
              ago
            </i>
          </div>
        )
      })}
    </div>
  )
}

export default Live

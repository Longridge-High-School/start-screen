import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState, useEffect, useRef} from 'react'
import dashjs from '~/lib/dash.client'
import {type LiveStream} from '@prisma/client'
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
    {streamUrl, streams},
    {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}

const Live = () => {
  const {streamUrl, streams} = useLoaderData<typeof loader>()

  const [start, setStart] = useState<boolean>(false)
  const [selectedStream, setSelectedStream] = useState<
    Pick<LiveStream, 'id' | 'key'> | undefined
  >()

  const videoRef = useRef(null)
  const playerRef = useRef<dashjs.MediaPlayerClass | null>(null)

  useEffect(() => {
    if (start && selectedStream && videoRef.current) {
      const video = videoRef.current

      playerRef.current = dashjs.MediaPlayer().create()

      playerRef.current.initialize(
        video,
        `${streamUrl}${selectedStream.key}.mpd`,
        true
      )
      playerRef.current.attachView(video)
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  })

  if (!start) {
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
              <button
                className={buttonClasses()}
                onClick={() => {
                  setSelectedStream(stream)
                  setStart(true)
                }}
              >
                Join Stream
              </button>
              <br />
              <i>
                Started {formatDistance(new Date(stream.updatedAt), new Date())}{' '}
                ago
              </i>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mx-12 2xl:mx-48 bg-white rounded-xl p-2 shadow-xl mt-12 prose">
      <video
        slot="media"
        controls={true}
        ref={videoRef}
        style={{width: '100%'}}
        preload="auto"
        autoPlay={true}
        className="rounded-xl"
      />
    </div>
  )
}

export default Live

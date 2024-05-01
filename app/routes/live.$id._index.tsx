import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState, useEffect, useRef} from 'react'
import dashjs from '~/lib/dash.client'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getConfigValue} from '~/lib/config.server'
import {getPrisma} from '~/lib/prisma'
import {buttonClasses} from '~/lib/classes'
import {getMDXComponent} from '~/lib/mdx'

import {socket} from '~/lib/socket.client'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const streamUrl = await getConfigValue('streamURL')
  const streamReactions = await getConfigValue('streamReactions')

  const prisma = getPrisma()

  const stream = await prisma.liveStream.findFirstOrThrow({
    where: {
      id: parseInt(params.id!)
    }
  })

  return json(
    {streamUrl, stream, user, streamReactions},
    {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}

const Live = () => {
  const {streamUrl, stream, user, streamReactions} =
    useLoaderData<typeof loader>()
  const [start, setStart] = useState<boolean>(false)

  const videoRef = useRef(null)
  const playerRef = useRef<dashjs.MediaPlayerClass | null>(null)

  useEffect(() => {
    if (start && videoRef.current) {
      const video = videoRef.current

      playerRef.current = dashjs.MediaPlayer().create()

      playerRef.current.initialize(video, `${streamUrl}${stream.key}.mpd`, true)
      playerRef.current.attachView(video)

      socket.emit('join-live-stream', stream.id, user.name)
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  })

  const Description = getMDXComponent(stream.descriptionCache)

  if (!start) {
    return (
      <div className="mx-96 bg-white rounded-xl p-2 shadow-xl mt-12 gap-4">
        <h3 className="text-xl mb-4">{stream.title}</h3>
        <div>
          <Description />
        </div>
        <div className="text-center">
          {stream.live ? (
            <button className={buttonClasses()} onClick={() => setStart(true)}>
              Start Stream!
            </button>
          ) : (
            <p>
              <b>Stream is not running.</b>
              <br />
              <br />
              <a className={buttonClasses()} href={`/live/${stream.id}`}>
                Check Again
              </a>
            </p>
          )}
        </div>
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
      <div className="flex justify-center">
        {streamReactions.split(',').map((emoji, i) => {
          return (
            <button
              key={i}
              onClick={() => {
                socket.emit('emoji', emoji)
              }}
              className="text-3xl"
            >
              {emoji}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Live

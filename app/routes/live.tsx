import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState, useEffect, useRef} from 'react'
import dashjs from '~/lib/dash.client'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getConfigValue} from '~/lib/config.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const streamUrl = await getConfigValue('streamURL')

  return json(
    {streamUrl},
    {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}

const Live = () => {
  const {streamUrl} = useLoaderData<typeof loader>()

  const [start, setStart] = useState<boolean>(false)

  const videoRef = useRef(null)
  const playerRef = useRef<dashjs.MediaPlayerClass | null>(null)

  useEffect(() => {
    if (start && videoRef.current) {
      const video = videoRef.current

      playerRef.current = dashjs.MediaPlayer().create()

      playerRef.current.initialize(video, streamUrl, true)
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
      <div className="mx-96 bg-white rounded-xl p-2 shadow-xl mt-12 prose">
        <button
          className="mx-auto my-4 px-12 py-4 bg-green-300 rounded-xl block"
          onClick={() => {
            setStart(true)
          }}
        >
          Join Stream!
        </button>
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

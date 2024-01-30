import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useEffect, useState} from 'react'

import {getPrisma} from '~/lib/prisma'
import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'
import {getMDXComponent} from '~/lib/mdx'

import {socket} from '~/lib/socket.client'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const stream = await prisma.liveStream.findFirstOrThrow({
    where: {id: parseInt(params.id!)}
  })

  return json({user, stream})
}

const LiveDashboard = () => {
  const {stream} = useLoaderData<typeof loader>()
  const [users, setUsers] = useState<
    {id: string; username: string; emoji: string}[]
  >([])

  useEffect(() => {
    socket.emit('join-live-stream-dashboard', stream.id)

    socket.on(
      'user-connect',
      ({
        id,
        username,
        emoji
      }: {
        id: string
        username: string
        emoji: string
      }) => {
        setUsers(
          [...users, {id, username, emoji}].reduce(
            (us, user) => {
              if (us.ids.includes(user.id)) {
                return us
              }

              us.ids.push(user.id)
              us.arr.push(user)

              return us
            },
            {ids: [], arr: []} as {
              ids: string[]
              arr: {id: string; username: string; emoji: string}[]
            }
          ).arr
        )
      }
    )

    socket.on('user-disconnect', (id: string) => {
      setUsers(
        users.filter(user => {
          return user.id !== id
        })
      )
    })

    socket.on('emoji', (id: string, emoji: string) => {
      setUsers(
        users.map(user => {
          if (user.id === id) {
            console.log('set emoji')
            return {...user, emoji}
          }

          return user
        })
      )
    })

    return () => {
      socket.off('user-connect')
      socket.off('user-disconnect')
    }
  })

  const Description = getMDXComponent(stream.descriptionCache)

  return (
    <div className="grid-cols-3 grid gap-2 m-4">
      <div>
        <div className="bg-white rounded-xl p-2 shadow-xl">
          <h2 className="text-2xl mb-2">{stream.title}</h2>
          <div className="grid-cols-3 grid gap-2 mb-4">
            <div className="rounded bg-green-300 text-center p-2">
              {users.length} Viewers
            </div>
            <div
              className={`rounded text-center p-2 ${stream.live ? 'bg-green-300' : 'bg-red-300'}`}
            >
              {stream.live ? 'Live' : 'Offline'}
            </div>
          </div>
          <Description />
        </div>
      </div>
      <div className="col-span-2">
        <div className="grid grid-cols-5 gap-2">
          {users.map(({id, username, emoji}) => {
            return (
              <div key={id} className="bg-white rounded-xl shadow p-2">
                {username} {emoji}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LiveDashboard

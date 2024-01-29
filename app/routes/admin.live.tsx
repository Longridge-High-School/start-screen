import {type LoaderFunctionArgs, json, type HeadersArgs} from '@remix-run/node'
import {useLoaderData, Outlet} from '@remix-run/react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {createTimings, combineServerTimingHeaders} from '~/utils/timings.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const liveStreams = await time('getLive', 'Get Live Streams', () =>
    prisma.liveStream.findMany({orderBy: {title: 'asc'}})
  )

  return json(
    {liveStreams, user},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const headers = ({loaderHeaders, actionHeaders}: HeadersArgs) => {
  return combineServerTimingHeaders(loaderHeaders, actionHeaders)
}

const AdminLive = () => {
  const {liveStreams} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2">
      <div className="bg-white shadow rounded-xl m-4 p-2">
        <h1 className="text-3xl mb-2">Live Streams</h1>
        <table className="w-full">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Key
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {liveStreams.map(({id, title, key, live}) => {
              return (
                <tr key={id}>
                  <td>{title}</td>
                  <td>{key}</td>
                  <td className="text-center">{live ? '🟢' : '🔴'}</td>
                  <td>
                    <a href={`/admin/live/edit/${id}`}>✏️</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Outlet />
    </div>
  )
}

export default AdminLive

import {json, type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const logEntries = await prisma.logEntry.findMany({
    orderBy: {time: 'desc'},
    take: 50
  })

  return json({logEntries})
}

const AdminLogs = () => {
  const {logEntries} = useLoaderData<typeof loader>()

  return (
    <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
      <h1 className="text-3xl">Logs</h1>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3">
              Time
            </th>
            <th scope="col" className="px-6 py-3">
              System
            </th>
            <th scope="col" className="px-6 py-3">
              Message
            </th>
            <th scope="col" className="px-6 py-3">
              Actor
            </th>
          </tr>
        </thead>
        <tbody>
          {logEntries.map(({id, time, message, system, actor}) => {
            return (
              <tr key={id}>
                <td>{time}</td>
                <td>{system}</td>
                <td>{message}</td>
                <td>{actor}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AdminLogs

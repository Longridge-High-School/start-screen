import {json, type LoaderArgs, type HeadersArgs} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'
import {format} from 'date-fns'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {createTimings} from '~/utils/timings.server'
import {buttonClasses} from '~/lib/classes'

import {getPrisma} from '~/lib/prisma'

export const loader = async ({request}: LoaderArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const messages = await time('getMessages', 'Get messages', () => {
    return prisma.infoMessage.findMany({orderBy: {endDate: 'asc'}})
  })

  return json({messages, user}, {headers: {'Server-Timing': getHeader()}})
}

export const headers = ({loaderHeaders}: HeadersArgs) => {
  return loaderHeaders
}

const AdminMessages = () => {
  const {messages} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2">
      <div className="bg-white shadow rounded-xl m-4 p-2">
        <h1 className="text-3xl mb-4">Messages</h1>
        <a href="/admin/messages/add" className={buttonClasses()}>
          Add Message
        </a>
        <table>
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Start Date
              </th>
              <th scope="col" className="px-6 py-3">
                End Date
              </th>
              <th scope="col" className="px-6 py-3">
                Type
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {messages.map(({id, title, startDate, endDate, type}) => {
              return (
                <tr key={id}>
                  <td>{title}</td>
                  <td>{format(new Date(startDate), 'dd-MM-yyyy')}</td>
                  <td>{format(new Date(endDate), 'dd-MM-yyyy')}</td>
                  <td>{type}</td>
                  <td>
                    <a href={`/admin/messages/edit/${id}`}>✏️</a>
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

export default AdminMessages

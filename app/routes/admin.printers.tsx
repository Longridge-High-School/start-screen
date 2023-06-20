import {type LoaderArgs, json} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

export const loader = async ({request}: LoaderArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const printers = await prisma.printer.findMany({orderBy: {name: 'asc'}})

  return json({printers})
}

const PrinterPage = () => {
  const {printers} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2">
      <div className="bg-white shadow rounded-xl m-4 p-2">
        <h1 className="text-3xl mb-2">Printers</h1>
        <a
          href="/admin/printers/add"
          className="m-4 rounded bg-green-300 text-white p-2 shadow"
        >
          Add Printer
        </a>
        <table>
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                IP
              </th>
              <th scope="col" className="px-6 py-3">
                SNMP Community
              </th>
              <th scope="col" className="px-6 py-3">
                Staff Only?
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {printers.map(({id, name, ip, snmpCommunity, staffOnly}, i) => {
              return (
                <tr key={i}>
                  <td>{name}</td>
                  <td>{ip}</td>
                  <td>{snmpCommunity}</td>
                  <td>{staffOnly ? 'Yes' : 'No'}</td>
                  <td>
                    <a href={`/admin/printers/edit/${id}`}>✏</a>
                    <br />
                    <a href={`/admin/printers/delete/${id}`}>🗑</a>
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

export default PrinterPage

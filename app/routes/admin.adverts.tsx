import {Outlet, useLoaderData} from '@remix-run/react'
import {type LoaderFunctionArgs, json} from '@remix-run/node'
import {format, isAfter} from 'date-fns'

import {getUserFromUPN, getUPNFromHeaders} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const adverts = await prisma.advert.findMany({orderBy: {name: 'asc'}})

  return json({user, adverts})
}

const AdminAdverts = () => {
  const {adverts} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2">
      <div className="bg-white shadow rounded-xl m-4 p-2">
        <h1 className="text-3xl mb-2">Adverts</h1>
        <a
          href="/admin/adverts/add"
          className="m-4 rounded bg-green-300 text-white p-2 shadow"
        >
          Add Advert
        </a>
        <table className="w-full">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Image
              </th>
              <th scope="col" className="px-6 py-3">
                Start Date
              </th>
              <th scope="col" className="px-6 py-3">
                End Date
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {adverts.map(({id, name, startDate, endDate, image}) => {
              return (
                <tr
                  key={id}
                  className={
                    isAfter(new Date(), new Date(endDate)) ? 'bg-red-100' : ''
                  }
                >
                  <td className="px-2">{name}</td>
                  <td>
                    <img
                      src={`/adverts/${image}`}
                      className="aspect-video h-24 m-auto"
                      alt={name}
                    />
                  </td>
                  <td>{format(new Date(startDate), 'dd/LL/yy')}</td>
                  <td>{format(new Date(endDate), 'dd/LL/yy')}</td>
                  <td>
                    <a href={`/admin/adverts/edit/${id}`}>✏</a>
                    <br />
                    <a href={`/admin/adverts/delete/${id}`}>🗑</a>
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

export default AdminAdverts

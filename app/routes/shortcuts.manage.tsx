import type {LoaderFunction} from '@remix-run/node'
import type {User, Shortcut} from '@prisma/client'

import {json} from '@remix-run/node'
import {useLoaderData, Outlet} from '@remix-run/react'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const shortcuts = await prisma.shortcut.findMany({
    where: user.admin ? {} : {ownerId: user.id},
    orderBy: [{priority: 'asc'}, {title: 'asc'}]
  })

  return json({user, shortcuts})
}

const ManageShortcuts = () => {
  const {shortcuts} = useLoaderData() as {
    user: Omit<User, 'createdAt' | 'updatedAt'>
    shortcuts: Shortcut[]
  }

  return (
    <div className="grid grid-cols-2 gap-4 mx-4">
      <div className="bg-white rounded-xl my-4">
        <h1 className="text-3xl mb-4 mx-2">Manage Shortcuts</h1>
        <a
          href="/shortcuts/manage/add"
          className="mx-4 rounded bg-green-300 text-white p-2 shadow"
        >
          Add Shortcut
        </a>
        &nbsp;
        <a
          href="/start"
          className="mx-4 rounded bg-gray-200 text-white p-2 shadow"
        >
          Back
        </a>
        <table className="w-full text-left">
          <thead>
            <th scope="col" className="px-6 py-3">
              Icon
            </th>
            <th scope="col" className="px-6 py-3">
              Title
            </th>
            <th scope="col" className="px-6 py-3">
              Target
            </th>
            <th scope="col" className="px-6 py-3">
              Scope
            </th>
            <th scope="col" className="px-6 py-3">
              Priority
            </th>
            <th scope="col" className="px-6 py-3" />
          </thead>
          <tbody>
            {shortcuts.map(({id, title, icon, scopes, priority, target}, i) => {
              let className = ''

              if (i % 2 === 0) {
                className += 'bg-gray-50'
              }

              return (
                <tr key={id} className={className}>
                  <td>
                    <img
                      src={`/icons/${icon}`}
                      className="w-16 p-2"
                      alt={title}
                    />
                  </td>
                  <td>{title}</td>
                  <td>
                    {target.slice(0, 35)}
                    {target.length > 35 ? '...' : ''}
                  </td>
                  <td>{scopes.join(', ')}</td>
                  <td className="text-center">{priority}</td>
                  <td>
                    <a href={`/shortcuts/manage/edit/${id}`}>✏</a>
                    <br />
                    <a href={`/shortcuts/manage/delete/${id}`}>🗑</a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}

export default ManageShortcuts

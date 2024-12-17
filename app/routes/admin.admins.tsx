import {
  json,
  redirect,
  type LoaderFunction,
  type ActionFunctionArgs
} from '@remix-run/node'
import {useLoaderData, useRouteLoaderData} from '@remix-run/react'
import {type User} from '@prisma/client'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'
import {log} from '~/log.server'

import {
  labelClasses,
  inputClasses,
  fieldsetClasses,
  buttonClasses,
  labelSpanClasses
} from '~/lib/classes'

import {type RootLoaderData} from '~/root'

export const loader: LoaderFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const url = new URL(request.url)
  const id = url.searchParams.get('delete')
  if (id) {
    await prisma.user.update({where: {id: parseInt(id)}, data: {admin: false}})
    await log('Admins', `Removed Admin from user #${id}`, user.username)
  }

  const admins = await prisma.user.findMany({
    where: {admin: {equals: true}},
    orderBy: {name: 'desc'}
  })

  return json({admins})
}

export const action = async ({request}: ActionFunctionArgs) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const username = formData.get('username') as string | undefined

  invariant(username)

  const prisma = getPrisma()

  await prisma.user.updateMany({where: {username}, data: {admin: true}})
  await log('Admins', `Added ADMIN to ${username}`, user.username)

  return redirect('/admin/admins')
}

const AdminsPage = () => {
  const {admins} = useLoaderData() as {
    admins: Omit<User, 'createdAt' | 'updatedAt'>[]
  }

  const {currentUser} = useRouteLoaderData('root') as RootLoaderData

  return (
    <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
      <h1 className="text-3xl">Admins</h1>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3">
              Name
            </th>
            <th scope="col" className="px-6 py-3">
              Username
            </th>
            <th scope="col" className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {admins.map(({name, username, id}, i) => {
            let className = ''

            if (i % 2 === 0) {
              className += 'bg-gray-50'
            }

            return (
              <tr key={id} className={className}>
                <td>
                  {name}
                  {currentUser.id === id ? ' (You)' : ''}
                </td>
                <td>{username}</td>
                <td>
                  {currentUser.id !== id ? (
                    <a href={`?delete=${id}`}>🗑</a>
                  ) : (
                    ''
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <h2 className="text-xl my-4">Add Admin</h2>

      <form method="POST">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Username</span>
            <input
              name="username"
              type="text"
              className={inputClasses()}
              placeholder="mru"
            />
          </label>
          <div className="grid grid-cols-3 gap-2 my-2">
            <button className={buttonClasses()}>Add Admin</button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default AdminsPage

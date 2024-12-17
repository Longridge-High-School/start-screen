import {
  json,
  redirect,
  type ActionFunction,
  type LoaderFunction
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {type User} from '@prisma/client'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

import {log} from '~/log.server'

import {
  labelClasses,
  inputClasses,
  fieldsetClasses,
  labelSpanClasses,
  buttonClasses
} from '~/lib/classes'

export const loader: LoaderFunction = async ({request}) => {
  const prisma = getPrisma()

  const url = new URL(request.url)
  const id = url.searchParams.get('delete')
  if (id) {
    await prisma.user.delete({where: {id: parseInt(id)}})
  }

  const users = await prisma.user.findMany({
    select: {name: true, username: true, id: true},
    where: {manual: {equals: true}}
  })

  return json({users})
}

export const action: ActionFunction = async ({request}) => {
  const user = await getUserFromUPN(getUPNFromHeaders(request))

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const username = formData.get('username') as string | undefined

  invariant(name)
  invariant(username)

  const prisma = getPrisma()

  await prisma.user.create({data: {name, username, manual: true}})
  await log('Users', `Created Manual User ${name}`, user.username)

  return redirect('/admin/manual-users')
}

const ManualUsersPage = () => {
  const {users} = useLoaderData() as {
    users: Pick<User, 'id' | 'name' | 'username'>[]
  }

  return (
    <div className="bg-white w-1/2 rounded-xl shadow p-2 m-auto mt-4">
      <h1 className="text-3xl">Manual Users</h1>
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
          {users.map(({name, username, id}, i) => {
            let className = ''

            if (i % 2 === 0) {
              className += 'bg-gray-50'
            }

            return (
              <tr key={id} className={className}>
                <td>{name}</td>
                <td>{username}</td>
                <td>
                  <a href={`?delete=${id}`}>🗑</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <h2 className="text-xl my-4">Add User</h2>

      <form method="POST">
        <fieldset className={fieldsetClasses()}>
          <label className={labelClasses()}>
            <span className={labelSpanClasses()}>Name</span>
            <input
              name="name"
              type="text"
              className={inputClasses()}
              placeholder="Mr User"
              autoComplete="off"
            />
          </label>
          <label className={labelClasses()}>
            <span>Username</span>
            <input
              name="username"
              type="text"
              className={inputClasses()}
              placeholder="mru"
              autoComplete="off"
            />
          </label>
          <div className={labelClasses('my-2')}>
            <button className={buttonClasses()}>Add User</button>
          </div>
        </fieldset>
      </form>
    </div>
  )
}

export default ManualUsersPage

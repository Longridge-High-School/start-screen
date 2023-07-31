import {type LoaderArgs, json, type ActionArgs, redirect} from '@remix-run/node'
import {Outlet, useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getUPNFromHeaders, getUserFromUPN} from '~/lib/user.server'
import {getPrisma} from '~/lib/prisma'

import {createTimings} from '~/utils/timings.server'

import {
  fieldsetClasses,
  labelClasses,
  inputClasses,
  buttonClasses,
  labelSpanClasses
} from '~/lib/classes'

export const loader = async ({request}: LoaderArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || !user.admin) {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const componentGroups = await time(
    'getComponentGroups',
    'Get Component Groups',
    () =>
      prisma.componentGroup.findMany({
        orderBy: {order: 'asc'},
        include: {_count: {select: {components: true}}}
      })
  )

  return json(
    {componentGroups, user},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}

export const action = async ({request}: ActionArgs) => {
  const {time, getHeader} = createTimings()

  const user = await time('getUser', 'Get User from header', () =>
    getUserFromUPN(getUPNFromHeaders(request))
  )

  if (!user || user.type !== 'STAFF') {
    throw new Response('Access Denied', {status: 403})
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const order = formData.get('order') as string | undefined
  const defaultExpanded = formData.get('defaultExpanded') as string | undefined

  invariant(name)
  invariant(order)

  await prisma.componentGroup.create({
    data: {
      name,
      order: parseInt(order),
      defaultExpanded: defaultExpanded !== null
    }
  })

  return redirect('/admin/system-status', {
    headers: {'Server-Timing': getHeader()}
  })
}

const AdminSystemStatus = () => {
  const {componentGroups} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      <div className="bg-white rounded-xl shadow-xl col-span-4 p-2">
        <h1 className="text-3xl">System Status</h1>
      </div>
      <div className="bg-white rounded-xl shadow-xl p-2">
        <h2 className="text-xl">Component Groups</h2>
        <table>
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Order
              </th>
              <th scope="col" className="px-6 py-3">
                Expanded by Default
              </th>
              <th scope="col" className="px-6 py-3">
                Components
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {componentGroups.map(
              ({id, name, order, defaultExpanded, _count}) => {
                return (
                  <tr key={id}>
                    <td>
                      <a href={`/admin/system-status/${id}`}>{name}</a>
                    </td>
                    <td>{order}</td>
                    <td>{defaultExpanded ? 'Yes' : 'No'}</td>
                    <td>{_count.components}</td>
                    <td></td>
                  </tr>
                )
              }
            )}
          </tbody>
        </table>
        <form method="post" action="/admin/system-status">
          <fieldset className={fieldsetClasses()}>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Name</span>
              <input name="name" type="text" className={inputClasses()} />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Order</span>
              <input name="order" type="number" className={inputClasses()} />
            </label>
            <label className={labelClasses()}>
              <span className={labelSpanClasses()}>Expanded by Default?</span>
              <input
                type="checkbox"
                name="defaultExpanded"
                className={inputClasses()}
              />
            </label>
            <div className={labelClasses()}>
              <button className={buttonClasses()}>Add Component Group</button>
            </div>
          </fieldset>
        </form>
      </div>
      <div className="col-span-3">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminSystemStatus
